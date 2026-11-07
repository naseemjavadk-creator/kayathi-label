'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import { ATTRIBUTE_FIELDS } from '@/lib/attributes';
import { slugify } from '@/lib/format';
import { validateImage, uploadImage, removeFiles } from '@/lib/upload';
import ChipInput from './ChipInput';
import { useToast } from './Toast';

const EMPTY = {
  name: '', sku: '', slug: '', description: '', price: '', original_price: '',
  category_id: '', subcategory_id: '', colours: [], sizes: [], stock: 0,
  is_available: true, is_new: false, is_featured: false, is_best_seller: false,
  is_published: true, attributes: {},
};

export default function ProductForm({ productId }) {
  const sb = useMemo(() => supabaseBrowser(), []);
  const router = useRouter();
  const [toast, notify] = useToast();
  const [cats, setCats] = useState([]);
  const [f, setF] = useState(EMPTY);
  const [items, setItems] = useState([]);      // photos in display order; first = cover
  const [removed, setRemoved] = useState([]);  // existing photos to delete on save
  const [slugTouched, setSlugTouched] = useState(Boolean(productId));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const load = useCallback(async () => {
    const { data: c } = await sb.from('categories').select('id,name,attribute_group,subcategories(id,name)').order('sort_order');
    setCats(c || []);
    if (productId) {
      const { data: p, error: err } = await sb.from('products').select('*, product_images(id,url,path,sort_order)').eq('id', productId).maybeSingle();
      if (err || !p) { setError('Product not found.'); setLoading(false); return; }
      setF({
        ...EMPTY, ...p,
        price: String(p.price), original_price: p.original_price == null ? '' : String(p.original_price),
        category_id: p.category_id || '', subcategory_id: p.subcategory_id || '',
        attributes: p.attributes || {},
      });
      setItems([...(p.product_images || [])].sort((a, b) => a.sort_order - b.sort_order));
      setRemoved([]);
    }
    setLoading(false);
  }, [sb, productId]);

  useEffect(() => { load(); }, [load]);

  const category = cats.find((c) => c.id === f.category_id);
  const group = category?.attribute_group || 'general';
  const fields = ATTRIBUTE_FIELDS[group] || ATTRIBUTE_FIELDS.general;

  function onFiles(e) {
    const added = [];
    const problems = [];
    for (const file of Array.from(e.target.files || [])) {
      const msg = validateImage(file);
      if (msg) problems.push(msg);
      else added.push({ key: crypto.randomUUID(), file, url: URL.createObjectURL(file) });
    }
    if (problems.length) notify(problems.join(' '), 'error');
    setItems((p) => [...p, ...added]);
    e.target.value = '';
  }

  const makeCover = (i) => setItems((p) => [p[i], ...p.filter((_, n) => n !== i)]);
  const dropImage = (i) => {
    const it = items[i];
    if (it.id) setRemoved((r) => [...r, it]);
    setItems((p) => p.filter((_, n) => n !== i));
  };

  async function save(e) {
    e.preventDefault();
    setError('');
    const price = Number(f.price);
    const original = f.original_price === '' ? null : Number(f.original_price);
    const stock = Number(f.stock);
    if (!f.name.trim()) return setError('Enter a product name.');
    if (!f.sku.trim()) return setError('Enter a unique product ID (SKU).');
    if (!f.slug.trim()) return setError('Enter a page address for this product.');
    if (!Number.isFinite(price) || price < 0 || f.price === '') return setError('Enter the selling price in rupees.');
    if (original !== null && (!Number.isFinite(original) || original < price)) return setError('Original price must be the same as or higher than the selling price.');
    if (!Number.isInteger(stock) || stock < 0) return setError('Stock must be a whole number, 0 or more.');
    if (!f.category_id) return setError('Choose a category.');

    setSaving(true);
    try {
      const attrs = Object.fromEntries(Object.entries(f.attributes).filter(([, v]) => String(v || '').trim()));
      const payload = {
        name: f.name.trim(), sku: f.sku.trim(), slug: slugify(f.slug),
        description: f.description.trim(), price, original_price: original,
        category_id: f.category_id, subcategory_id: f.subcategory_id || null,
        colours: f.colours, sizes: f.sizes, stock,
        is_available: f.is_available, is_new: f.is_new, is_featured: f.is_featured,
        is_best_seller: f.is_best_seller, is_published: f.is_published, attributes: attrs,
      };

      let id = productId;
      if (id) {
        const { error: err } = await sb.from('products').update(payload).eq('id', id);
        if (err) throw err;
      } else {
        const { data, error: err } = await sb.from('products').insert(payload).select('id').single();
        if (err) throw err;
        id = data.id;
      }

      for (const r of removed) await sb.from('product_images').delete().eq('id', r.id);
      await removeFiles(sb, removed.map((r) => r.path));

      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (it.file) {
          const up = await uploadImage(sb, it.file, `products/${id}`);
          const { error: err } = await sb.from('product_images').insert({ product_id: id, url: up.url, path: up.path, sort_order: i });
          if (err) throw err;
        } else if (it.id) {
          await sb.from('product_images').update({ sort_order: i }).eq('id', it.id);
        }
      }

      if (productId) {
        notify('Product saved');
        await load();
      } else {
        sessionStorage.setItem('kl_notice', 'Product added');
        router.push('/admin/products');
      }
    } catch (err) {
      const msg = err?.code === '23505'
        ? 'That product ID or page address is already used by another product. Change it and save again.'
        : err?.message || 'Could not save. Please try again.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading…</p>;
  if (error && productId && !f.name) return <p role="alert" className="text-red-800">{error}</p>;

  const Check = ({ k, label, hint }) => (
    <label className="flex items-start gap-3 text-sm">
      <input type="checkbox" className="mt-1 h-4 w-4 accent-[#64152D]" checked={f[k]} onChange={(e) => set(k, e.target.checked)} />
      <span>{label}{hint && <span className="block text-xs text-espresso/60">{hint}</span>}</span>
    </label>
  );
  const panel = 'space-y-4 border border-espresso/15 bg-white p-5';

  return (
    <form onSubmit={save} className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl">{productId ? 'Edit product' : 'Add product'}</h1>
        <Link href="/admin/products" className="text-sm text-burgundy underline-offset-4 hover:underline">Back to products</Link>
      </div>

      <section className={panel}>
        <h2 className="text-2xl">Basics</h2>
        <div>
          <label className="label" htmlFor="name">Product name</label>
          <input id="name" className="field" value={f.name} onChange={(e) => { set('name', e.target.value); if (!slugTouched) set('slug', slugify(e.target.value)); }} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label" htmlFor="sku">Product ID (SKU)</label>
            <input id="sku" className="field" value={f.sku} onChange={(e) => set('sku', e.target.value)} placeholder="e.g. KL-SAR-001" />
          </div>
          <div>
            <label className="label" htmlFor="slug">Page address</label>
            <input id="slug" className="field" value={f.slug} onChange={(e) => { setSlugTouched(true); set('slug', e.target.value); }} />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="desc">Description</label>
          <textarea id="desc" rows={5} className="field" value={f.description} onChange={(e) => set('description', e.target.value)} />
        </div>
      </section>

      <section className={panel}>
        <h2 className="text-2xl">Photos</h2>
        <p className="text-sm text-espresso/70">JPG, PNG or WebP, up to 5 MB each. The first photo is the cover shown in the shop.</p>
        {items.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {items.map((it, i) => (
              <li key={it.id || it.key} className="border border-espresso/15">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.url} alt={`Photo ${i + 1}`} className="aspect-[3/4] w-full object-cover" />
                <div className="flex items-center justify-between gap-1 p-2 text-xs">
                  {i === 0 ? <span className="text-burgundy">Cover</span> : <button type="button" onClick={() => makeCover(i)} className="text-burgundy underline">Make cover</button>}
                  <button type="button" onClick={() => dropImage(i)} className="text-red-800 underline">Remove</button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={onFiles} className="block w-full text-sm file:mr-3 file:border-0 file:bg-burgundy file:px-4 file:py-2.5 file:text-ivory" aria-label="Add photos" />
      </section>

      <section className={panel}>
        <h2 className="text-2xl">Price and stock</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="label" htmlFor="price">Selling price (₹)</label>
            <input id="price" type="number" min="0" step="1" inputMode="decimal" className="field" value={f.price} onChange={(e) => set('price', e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="orig">Original price (₹)</label>
            <input id="orig" type="number" min="0" step="1" inputMode="decimal" className="field" value={f.original_price} onChange={(e) => set('original_price', e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="stock">Stock quantity</label>
            <input id="stock" type="number" min="0" step="1" inputMode="numeric" className="field" value={f.stock} onChange={(e) => set('stock', e.target.value)} />
          </div>
        </div>
        <p className="text-xs text-espresso/60">
          {f.original_price !== '' && Number(f.original_price) > Number(f.price) && f.price !== ''
            ? `Discount shown to customers: ${Math.round(((Number(f.original_price) - Number(f.price)) / Number(f.original_price)) * 100)}% off. `
            : 'Add an original price higher than the selling price to show a discount. '}
          When stock reaches 0, the product is marked out of stock automatically.
        </p>
      </section>

      <section className={panel}>
        <h2 className="text-2xl">Category</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label" htmlFor="cat">Category</label>
            <select id="cat" className="field" value={f.category_id} onChange={(e) => setF((p) => ({ ...p, category_id: e.target.value, subcategory_id: '' }))}>
              <option value="">Choose…</option>
              {cats.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="sub">Subcategory</label>
            <select id="sub" className="field" value={f.subcategory_id} onChange={(e) => set('subcategory_id', e.target.value)} disabled={!category}>
              <option value="">None</option>
              {(category?.subcategories || []).map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
            </select>
          </div>
        </div>
      </section>

      <section className={panel}>
        <h2 className="text-2xl">Options and details</h2>
        <ChipInput label="Available colours" values={f.colours} onChange={(v) => set('colours', v)} placeholder="Type a colour and press Enter" />
        <ChipInput label="Available sizes" values={f.sizes} onChange={(v) => set('sizes', v)} placeholder={group === 'ring' ? 'e.g. 12' : group === 'bangle' ? 'e.g. 2.4' : 'e.g. M'} hint="Leave empty if sizes do not apply, such as for sarees." />
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map((fd) => (
            <div key={fd.key} className={fd.type === 'textarea' ? 'md:col-span-2' : ''}>
              <label className="label" htmlFor={`a-${fd.key}`}>{fd.label}</label>
              {fd.type === 'select' ? (
                <select id={`a-${fd.key}`} className="field" value={f.attributes[fd.key] || ''} onChange={(e) => set('attributes', { ...f.attributes, [fd.key]: e.target.value })}>
                  <option value="">Not set</option>
                  {fd.options.map((o) => (<option key={o} value={o}>{o}</option>))}
                </select>
              ) : fd.type === 'textarea' ? (
                <textarea id={`a-${fd.key}`} rows={3} className="field" value={f.attributes[fd.key] || ''} onChange={(e) => set('attributes', { ...f.attributes, [fd.key]: e.target.value })} />
              ) : (
                <input id={`a-${fd.key}`} className="field" placeholder={fd.placeholder} value={f.attributes[fd.key] || ''} onChange={(e) => set('attributes', { ...f.attributes, [fd.key]: e.target.value })} />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className={panel}>
        <h2 className="text-2xl">Labels and visibility</h2>
        <Check k="is_new" label="New arrival" />
        <Check k="is_featured" label="Featured product" />
        <Check k="is_best_seller" label="Best seller" />
        <Check k="is_available" label="Available to order" hint="Untick to mark as out of stock even when stock is above 0." />
        <Check k="is_published" label="Visible on the website" hint="Untick to hide this product from customers without deleting it." />
      </section>

      {error && <p role="alert" className="border border-red-800/40 bg-white p-3 text-sm text-red-800">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Saving…' : 'Save product'}</button>
        <Link href="/admin/products" className="btn btn-outline">Cancel</Link>
      </div>
      {toast}
    </form>
  );
}
