'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabase/client';
import { slugify } from '@/lib/format';
import { validateImage, uploadImage, removeFiles } from '@/lib/upload';
import { useToast } from '@/components/admin/Toast';

const list = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);
const code = () => `KL-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

export default function QuickAdd() {
  const sb = useMemo(() => supabaseBrowser(), []);
  const [cats, setCats] = useState([]);
  const [rows, setRows] = useState([]);
  const [all, setAll] = useState({ category_id: '', subcategory_id: '' });
  const [busy, setBusy] = useState(false);
  const [toast, notify] = useToast();

  useEffect(() => {
    sb.from('categories').select('id,name,subcategories(id,name)').order('sort_order').then(({ data }) => setCats(data || []));
  }, [sb]);

  const catOf = (id) => cats.find((c) => c.id === id);

  function pick(e) {
    const added = [];
    const problems = [];
    for (const file of Array.from(e.target.files || [])) {
      const msg = validateImage(file);
      if (msg) { problems.push(msg); continue; }
      added.push({
        key: crypto.randomUUID(), file, url: URL.createObjectURL(file),
        name: '', price: '', orig: '', stock: '1', colours: '', sizes: '',
        category_id: all.category_id, subcategory_id: all.subcategory_id, status: '', error: '',
      });
    }
    if (problems.length) notify(problems.join(' '), 'error');
    setRows((r) => [...r, ...added]);
    e.target.value = '';
  }

  const set = (key, patch) => setRows((r) => r.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  const drop = (key) => setRows((r) => r.filter((x) => x.key !== key));
  const applyAll = (patch) => {
    const next = { ...all, ...patch };
    setAll(next);
    setRows((r) => r.map((x) => (x.status === 'saved' ? x : { ...x, category_id: next.category_id, subcategory_id: next.subcategory_id })));
  };

  function problem(x) {
    if (!x.name.trim()) return 'Enter a name.';
    const price = Number(x.price);
    if (x.price === '' || !Number.isFinite(price) || price < 0) return 'Enter the price.';
    if (x.orig !== '' && !(Number(x.orig) >= price)) return 'Original price must be the same or higher than the price.';
    if (!/^\d+$/.test(String(x.stock))) return 'Stock must be a whole number.';
    if (!x.category_id) return 'Choose a category.';
    return '';
  }

  async function saveAll() {
    const todo = rows.filter((x) => x.status !== 'saved');
    if (!todo.length) return notify('Choose some photos first.', 'error');
    let bad = false;
    todo.forEach((x) => { const e = problem(x); if (e) { bad = true; set(x.key, { error: e }); } else set(x.key, { error: '' }); });
    if (bad) return notify('Fix the rows marked in red, then save again.', 'error');

    setBusy(true);
    let saved = 0;
    for (const x of todo) {
      set(x.key, { status: 'saving' });
      let up = null;
      try {
        const { data, error } = await sb.from('products').insert({
          sku: code(), name: x.name.trim(), slug: `${slugify(x.name)}-${Math.random().toString(36).slice(2, 6)}`,
          description: '', price: Number(x.price), original_price: x.orig === '' ? null : Number(x.orig),
          category_id: x.category_id, subcategory_id: x.subcategory_id || null,
          colours: list(x.colours), sizes: list(x.sizes), stock: Number(x.stock), is_new: true, is_published: true,
        }).select('id').single();
        if (error) throw error;
        try {
          up = await uploadImage(sb, x.file, `products/${data.id}`);
          const { error: ie } = await sb.from('product_images').insert({ product_id: data.id, url: up.url, path: up.path, sort_order: 0 });
          if (ie) throw ie;
        } catch (ie) {
          await sb.from('products').delete().eq('id', data.id);
          await removeFiles(sb, [up?.path]);
          throw ie;
        }
        set(x.key, { status: 'saved', error: '' });
        saved++;
      } catch (err) {
        set(x.key, { status: '', error: err.message || 'Could not save this one.' });
      }
    }
    setBusy(false);
    notify(saved ? `${saved} product${saved > 1 ? 's' : ''} added. They are live on the website.` : 'Nothing was saved.', saved ? 'ok' : 'error');
  }

  const pending = rows.filter((x) => x.status !== 'saved').length;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl">Quick add</h1>
        <Link href="/admin/products" className="text-sm text-burgundy underline-offset-4 hover:underline">All products</Link>
      </div>
      <p className="-mt-2 max-w-2xl text-sm text-espresso/70">
        Choose many photos at once. Each photo becomes one product: type its name and price, check the category, and tap Save all.
        Product codes are made for you. Add the description and extra photos later with Edit if you want.
      </p>

      <section className="space-y-4 border border-espresso/15 bg-white p-5">
        <div>
          <label className="label" htmlFor="files">1. Choose photos (one photo per product)</label>
          <input id="files" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={pick}
            className="block w-full text-sm file:mr-3 file:border-0 file:bg-burgundy file:px-4 file:py-2.5 file:text-ivory" />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="label" htmlFor="ac">2. Category for all new rows (you can change each one)</label>
            <select id="ac" className="field" value={all.category_id} onChange={(e) => applyAll({ category_id: e.target.value, subcategory_id: '' })}>
              <option value="">Choose…</option>
              {cats.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="as">Type</label>
            <select id="as" className="field" value={all.subcategory_id} disabled={!all.category_id} onChange={(e) => applyAll({ subcategory_id: e.target.value })}>
              <option value="">None</option>
              {(catOf(all.category_id)?.subcategories || []).map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
            </select>
          </div>
        </div>
      </section>

      {rows.length > 0 && (
        <ul className="space-y-4">
          {rows.map((x, i) => {
            const c = catOf(x.category_id);
            const saved = x.status === 'saved';
            return (
              <li key={x.key} className={`border bg-white p-4 ${x.error ? 'border-red-800/60' : 'border-espresso/15'} ${saved ? 'opacity-60' : ''}`}>
                <div className="flex gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={x.url} alt={`Photo ${i + 1}`} className="h-28 w-20 shrink-0 object-cover" />
                  <div className="min-w-0 flex-1 space-y-3">
                    {saved ? (
                      <p className="text-sm text-burgundy">Saved: {x.name}</p>
                    ) : (
                      <>
                        <input className="field" placeholder="Product name" aria-label="Product name" value={x.name} onChange={(e) => set(x.key, { name: e.target.value })} />
                        <div className="grid grid-cols-3 gap-2">
                          <input className="field" type="number" min="0" inputMode="decimal" placeholder="Price ₹" aria-label="Price" value={x.price} onChange={(e) => set(x.key, { price: e.target.value })} />
                          <input className="field" type="number" min="0" inputMode="decimal" placeholder="Was ₹" aria-label="Original price (optional)" value={x.orig} onChange={(e) => set(x.key, { orig: e.target.value })} />
                          <input className="field" type="number" min="0" inputMode="numeric" placeholder="Stock" aria-label="Stock" value={x.stock} onChange={(e) => set(x.key, { stock: e.target.value })} />
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <select className="field" aria-label="Category" value={x.category_id} onChange={(e) => set(x.key, { category_id: e.target.value, subcategory_id: '' })}>
                            <option value="">Category…</option>
                            {cats.map((cc) => (<option key={cc.id} value={cc.id}>{cc.name}</option>))}
                          </select>
                          <select className="field" aria-label="Type" value={x.subcategory_id} disabled={!c} onChange={(e) => set(x.key, { subcategory_id: e.target.value })}>
                            <option value="">Type (optional)</option>
                            {(c?.subcategories || []).map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
                          </select>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <input className="field" placeholder="Colours, comma separated (optional)" aria-label="Colours" value={x.colours} onChange={(e) => set(x.key, { colours: e.target.value })} />
                          <input className="field" placeholder="Sizes, comma separated (optional)" aria-label="Sizes" value={x.sizes} onChange={(e) => set(x.key, { sizes: e.target.value })} />
                        </div>
                        {x.error && <p role="alert" className="text-sm text-red-800">{x.error}</p>}
                        {x.status === 'saving' && <p className="text-sm text-espresso/70">Saving…</p>}
                        <button type="button" onClick={() => drop(x.key)} className="text-sm text-red-800 underline">Remove this photo</button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {rows.length > 0 && (
        <div className="sticky bottom-3 flex items-center gap-3 border border-espresso/15 bg-ivory p-3 shadow">
          <button type="button" onClick={saveAll} disabled={busy || pending === 0} className="btn btn-primary">
            {busy ? 'Saving…' : `Save all (${pending})`}
          </button>
          <span className="text-sm text-espresso/70">Products go live on the website as soon as they are saved.</span>
        </div>
      )}
      {toast}
    </div>
  );
}
