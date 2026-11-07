'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabase/client';
import { inr } from '@/lib/format';
import { removeFiles } from '@/lib/upload';
import { useToast } from '@/components/admin/Toast';

export default function ProductList() {
  const sb = supabaseBrowser();
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState('');
  const [toast, notify] = useToast();

  const load = useCallback(async () => {
    const { data, error } = await sb
      .from('products')
      .select('id,name,sku,price,stock,is_available,is_published,is_new,is_featured,categories(name),product_images(url,sort_order)')
      .order('created_at', { ascending: false });
    if (error) notify(error.message, 'error');
    setRows(data || []);
  }, [sb, notify]);

  useEffect(() => {
    load();
    const msg = sessionStorage.getItem('kl_notice');
    if (msg) { sessionStorage.removeItem('kl_notice'); notify(msg); }
  }, [load, notify]);

  async function remove(p) {
    if (!confirm(`Delete "${p.name}"? This also removes its photos and cannot be undone.`)) return;
    const { data: imgs } = await sb.from('product_images').select('path').eq('product_id', p.id);
    const { error } = await sb.from('products').delete().eq('id', p.id);
    if (error) return notify(error.message, 'error');
    await removeFiles(sb, (imgs || []).map((i) => i.path));
    notify('Product deleted');
    load();
  }

  const shown = (rows || []).filter((p) => `${p.name} ${p.sku}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="max-w-5xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl">Products</h1>
        <Link href="/admin/products/new" className="btn btn-primary">Add product</Link>
      </div>
      <input className="field mb-4 max-w-sm" type="search" placeholder="Search by name or product ID" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" />

      {rows === null ? <p>Loading…</p> : shown.length === 0 ? (
        <p className="border border-espresso/15 bg-white p-6">No products found. Add your first product to see it here.</p>
      ) : (
        <ul className="divide-y divide-espresso/10 border border-espresso/15 bg-white">
          {shown.map((p) => {
            const img = [...(p.product_images || [])].sort((a, b) => a.sort_order - b.sort_order)[0];
            return (
              <li key={p.id} className="flex items-center gap-3 p-3 md:gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {img ? <img src={img.url} alt="" className="h-16 w-14 shrink-0 object-cover" /> : <div className="h-16 w-14 shrink-0 bg-gold/30" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="text-xs text-espresso/60">{p.sku} · {p.categories?.name || 'No category'}</p>
                  <p className="mt-0.5 text-sm">
                    {inr(p.price)} · <span className={p.is_available ? '' : 'text-burgundy'}>{p.is_available ? `${p.stock} in stock` : 'Out of stock'}</span>
                    {!p.is_published && <span className="ml-2 text-espresso/60">Hidden</span>}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-1 text-sm md:flex-row md:gap-4">
                  <Link href={`/admin/products/${p.id}`} className="text-burgundy underline-offset-4 hover:underline">Edit</Link>
                  <button type="button" onClick={() => remove(p)} className="text-left text-red-800 underline-offset-4 hover:underline">Delete</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {toast}
    </div>
  );
}
