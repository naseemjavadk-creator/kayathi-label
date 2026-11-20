'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { validateImage, uploadImage, removeFiles } from '@/lib/upload';
import { sortedImages } from '@/lib/images';
import { useToast } from '@/components/admin/Toast';

const MAX_LOOKS = 10;
const MAX_PRODUCTS = 3;
const EMPTY = { id: null, alt: '', product_ids: [], image_url: '', path: '' };

const firstImage = (p) => (p ? sortedImages(p)[0]?.url || '' : '');

export default function LookbookAdmin() {
  const sb = supabaseBrowser();
  const [looks, setLooks] = useState(null);
  const [products, setProducts] = useState([]);
  const [missingTable, setMissingTable] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, notify] = useToast();

  const load = useCallback(async () => {
    const { data, error } = await sb.from('lookbook_looks').select('*').order('sort_order').order('created_at');
    if (error) {
      // 42P01 = table does not exist: the SQL migration has not been run yet.
      if (error.code === '42P01' || /lookbook_looks/.test(error.message || '')) setMissingTable(true);
      else notify(error.message, 'error');
      setLooks([]);
      return;
    }
    setMissingTable(false);
    setLooks(data || []);
  }, [sb, notify]);

  useEffect(() => {
    load();
    sb.from('products')
      .select('id, name, sku, slug, is_published, product_images(url,sort_order)')
      .order('created_at', { ascending: false })
      .limit(1000)
      .then(({ data }) => setProducts(data || []));
  }, [load, sb]);

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => !form.product_ids.includes(p.id))
      .filter((p) => `${p.name} ${p.sku || ''}`.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, products, form.product_ids]);

  const editing = Boolean(form.id);
  const full = !editing && (looks?.length || 0) >= MAX_LOOKS;

  function resetForm() {
    setForm(EMPTY);
    setFile(null);
    setQuery('');
    const input = document.getElementById('lb-photo');
    if (input) input.value = '';
  }

  function pick(p) {
    if (form.product_ids.length >= MAX_PRODUCTS) return notify(`Up to ${MAX_PRODUCTS} products per look.`, 'error');
    setForm((f) => ({ ...f, product_ids: [...f.product_ids, p.id] }));
    setQuery('');
  }
  function unpick(id) {
    setForm((f) => ({ ...f, product_ids: f.product_ids.filter((x) => x !== id) }));
  }
  function movePick(i, dir) {
    setForm((f) => {
      const ids = [...f.product_ids];
      const j = i + dir;
      if (j < 0 || j >= ids.length) return f;
      [ids[i], ids[j]] = [ids[j], ids[i]];
      return { ...f, product_ids: ids };
    });
  }

  async function save(e) {
    e.preventDefault();
    if (full) return notify(`The lookbook holds up to ${MAX_LOOKS} looks. Delete one first.`, 'error');
    if (!form.product_ids.length && !file && !form.image_url) {
      return notify('Add a model photo or pick at least one product.', 'error');
    }
    if (file) {
      const msg = validateImage(file);
      if (msg) return notify(msg, 'error');
    }
    setBusy(true);
    let uploaded = null;
    try {
      if (file) uploaded = await uploadImage(sb, file, 'site/lookbook');
      const row = {
        alt: form.alt.trim(),
        product_ids: form.product_ids,
        image_url: uploaded ? uploaded.url : form.image_url,
        path: uploaded ? uploaded.path : form.path,
      };
      if (editing) {
        const { error } = await sb.from('lookbook_looks').update(row).eq('id', form.id);
        if (error) throw error;
        const old = looks.find((l) => l.id === form.id);
        if (uploaded && old?.path) await removeFiles(sb, [old.path]);
        if (!uploaded && !form.image_url && old?.path) await removeFiles(sb, [old.path]);
        notify('Look saved. It is live on the website.');
      } else {
        const nextOrder = Math.max(0, ...(looks || []).map((l) => l.sort_order || 0)) + 1;
        const { error } = await sb.from('lookbook_looks').insert({ ...row, sort_order: nextOrder });
        if (error) throw error;
        notify('Look added. It is live on the website.');
      }
      resetForm();
      load();
    } catch (err) {
      if (uploaded) await removeFiles(sb, [uploaded.path]);
      notify(err.message || 'Could not save.', 'error');
    }
    setBusy(false);
  }

  function edit(l) {
    setForm({ id: l.id, alt: l.alt || '', product_ids: l.product_ids || [], image_url: l.image_url || '', path: l.path || '' });
    setFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function toggle(l) {
    const { error } = await sb.from('lookbook_looks').update({ is_active: !l.is_active }).eq('id', l.id);
    if (error) return notify(error.message, 'error');
    notify(l.is_active ? 'Hidden from the website' : 'Now showing');
    load();
  }

  async function remove(l, n) {
    if (!confirm(`Delete look ${n}?`)) return;
    const { error } = await sb.from('lookbook_looks').delete().eq('id', l.id);
    if (error) return notify(error.message, 'error');
    await removeFiles(sb, [l.path]);
    if (form.id === l.id) resetForm();
    notify('Deleted');
    load();
  }

  async function move(i, dir) {
    const list = [...looks];
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    setLooks(list);
    const results = await Promise.all(
      list.map((l, k) => sb.from('lookbook_looks').update({ sort_order: k + 1 }).eq('id', l.id))
    );
    const failed = results.find((r) => r.error);
    if (failed) notify(failed.error.message, 'error');
    load();
  }

  const fileUrl = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file]);
  useEffect(() => () => fileUrl && URL.revokeObjectURL(fileUrl), [fileUrl]);
  const previewSrc = fileUrl || form.image_url || firstImage(byId.get(form.product_ids[0]));

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-4xl">Lookbook</h1>
      <p className="-mt-2 max-w-2xl text-sm text-espresso/70">
        These looks walk down the runway on your homepage and on the Lookbook page. Each look has a model photo and up to{' '}
        {MAX_PRODUCTS} products customers can add to their bag. You can have up to {MAX_LOOKS} looks. When this list is empty,
        the website builds looks automatically from your sarees and jewellery.
      </p>

      {missingTable && (
        <div role="alert" className="border border-red-800/40 bg-red-50 p-4 text-sm text-red-900">
          The lookbook is not set up in your database yet. In Supabase, open SQL Editor, paste the file{' '}
          <code>supabase/migrations/20261120_lookbook.sql</code> and press Run. Then reload this page.
        </div>
      )}

      <form onSubmit={save} className="space-y-5 border border-espresso/15 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl">{editing ? 'Edit look' : 'Add a look'}</h2>
          {editing && <button type="button" onClick={resetForm} className="text-sm text-burgundy underline">Cancel</button>}
        </div>

        <div className="grid gap-5 md:grid-cols-[160px_1fr]">
          <div className="relative aspect-[2/3] w-40 overflow-hidden bg-gold/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {previewSrc ? <img src={previewSrc} alt="" className="h-full w-full object-contain" /> : (
              <span className="absolute inset-0 flex items-center justify-center p-3 text-center text-xs text-espresso/60">Model photo preview</span>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="lb-photo">Model photo</label>
              <input id="lb-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm file:mr-3 file:border-0 file:bg-burgundy file:px-4 file:py-2 file:text-ivory" />
              <p className="mt-1 text-xs text-espresso/60">
                Full-length, portrait photo. A PNG with a transparent background looks best. Leave empty to use the first product&apos;s photo.
              </p>
              {editing && form.image_url && !file && (
                <button type="button" onClick={() => setForm((f) => ({ ...f, image_url: '', path: '' }))} className="mt-1 text-xs text-red-800 underline">
                  Remove photo (use product photo instead)
                </button>
              )}
            </div>
            <div>
              <label className="label" htmlFor="lb-alt">Photo description (optional)</label>
              <input id="lb-alt" className="field" value={form.alt} onChange={(e) => setForm((f) => ({ ...f, alt: e.target.value }))}
                placeholder="e.g. Model in a red Kanjivaram saree with gold jhumkas" />
            </div>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="lb-q">Products in this look ({form.product_ids.length}/{MAX_PRODUCTS})</label>
          <ol className="mb-2 space-y-2">
            {form.product_ids.map((id, i) => {
              const p = byId.get(id);
              return (
                <li key={id} className="flex items-center gap-3 border border-espresso/15 p-2 text-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {firstImage(p) ? <img src={firstImage(p)} alt="" className="h-12 w-9 object-cover" /> : <span className="h-12 w-9 bg-gold/30" />}
                  <span className="min-w-0 flex-1 truncate">
                    {p ? p.name : 'Product no longer exists'}
                    {i === 0 && <span className="ml-2 text-xs text-espresso/60">(Shop the look link)</span>}
                    {p && !p.is_published && <span className="ml-2 text-xs text-red-800">(not published, hidden)</span>}
                  </span>
                  <button type="button" onClick={() => movePick(i, -1)} disabled={i === 0} className="px-1 disabled:opacity-30" aria-label="Move up">↑</button>
                  <button type="button" onClick={() => movePick(i, 1)} disabled={i === form.product_ids.length - 1} className="px-1 disabled:opacity-30" aria-label="Move down">↓</button>
                  <button type="button" onClick={() => unpick(id)} className="text-red-800 underline">Remove</button>
                </li>
              );
            })}
          </ol>
          {form.product_ids.length < MAX_PRODUCTS && (
            <div className="relative">
              <input id="lb-q" className="field" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products by name or SKU" autoComplete="off" />
              {matches.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-72 w-full overflow-auto border border-espresso/20 bg-white shadow-lg">
                  {matches.map((p) => (
                    <li key={p.id}>
                      <button type="button" onClick={() => pick(p)} className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-ivory">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {firstImage(p) ? <img src={firstImage(p)} alt="" className="h-10 w-8 object-cover" /> : <span className="h-10 w-8 bg-gold/30" />}
                        <span className="min-w-0 flex-1 truncate">{p.name}</span>
                        <span className="text-xs text-espresso/50">{p.sku}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <button type="submit" disabled={busy || full || missingTable} className="btn btn-primary">
          {busy ? 'Saving…' : editing ? 'Save look' : 'Add look'}
        </button>
        {full && <p className="text-sm text-red-800">You have {MAX_LOOKS} looks, the maximum. Delete one to add another.</p>}
      </form>

      <h2 className="text-2xl">Your looks ({looks?.length || 0}/{MAX_LOOKS})</h2>
      {looks === null ? <p>Loading…</p> : looks.length === 0 ? (
        <p className="border border-espresso/15 bg-white p-6 text-sm">
          No looks yet. Until you add one, the website shows automatic looks built from your products.
        </p>
      ) : (
        <ul className="divide-y divide-espresso/10 border border-espresso/15 bg-white">
          {looks.map((l, i) => {
            const items = (l.product_ids || []).map((id) => byId.get(id)).filter(Boolean);
            const img = l.image_url || firstImage(items[0]);
            return (
              <li key={l.id} className={`flex items-center gap-3 p-3 ${form.id === l.id ? 'bg-ivory' : ''}`}>
                <div className="flex flex-col">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="px-1 disabled:opacity-30" aria-label={`Move look ${i + 1} up`}>↑</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === looks.length - 1} className="px-1 disabled:opacity-30" aria-label={`Move look ${i + 1} down`}>↓</button>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {img ? <img src={img} alt="" className="h-20 w-14 shrink-0 bg-gold/20 object-contain" /> : <div className="h-20 w-14 shrink-0 bg-gold/30" />}
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-medium">Look {i + 1}</p>
                  <p className="truncate text-xs text-espresso/70">{items.map((p) => p.name).join(' · ') || 'No products'}</p>
                  <p className="text-xs text-espresso/60">{l.is_active ? 'Showing' : 'Hidden'}</p>
                </div>
                <button type="button" onClick={() => edit(l)} className="text-sm text-burgundy underline">Edit</button>
                <button type="button" onClick={() => toggle(l)} className="text-sm text-burgundy underline">{l.is_active ? 'Hide' : 'Show'}</button>
                <button type="button" onClick={() => remove(l, i + 1)} className="text-sm text-red-800 underline">Delete</button>
              </li>
            );
          })}
        </ul>
      )}
      {toast}
    </div>
  );
}
