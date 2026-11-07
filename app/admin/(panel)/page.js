'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabase/client';
import { inr } from '@/lib/format';

export default function Dashboard() {
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const sb = supabaseBrowser();
        const count = (q) => q.then((r) => { if (r.error) throw r.error; return r.count || 0; });
        const head = { count: 'exact', head: true };
        const { data: s } = await sb.from('site_settings').select('low_stock_threshold').eq('id', 1).maybeSingle();
        const threshold = s?.low_stock_threshold ?? 3;
        const [total, available, out, cats, recent, low] = await Promise.all([
          count(sb.from('products').select('id', head)),
          count(sb.from('products').select('id', head).eq('is_available', true)),
          count(sb.from('products').select('id', head).eq('is_available', false)),
          count(sb.from('categories').select('id', head)),
          sb.from('products').select('id,name,sku,price,created_at').order('created_at', { ascending: false }).limit(5),
          sb.from('products').select('id,name,sku,stock').gt('stock', 0).lte('stock', threshold).order('stock').limit(10),
        ]);
        setD({ total, available, out, cats, recent: recent.data || [], low: low.data || [], threshold });
      } catch (e) {
        setErr(e.message || 'Could not load the dashboard.');
      }
    })();
  }, []);

  if (err) return <p role="alert" className="text-red-800">{err}</p>;
  if (!d) return <p className="text-espresso/70">Loading…</p>;

  const stats = [
    ['Total products', d.total],
    ['Available', d.available],
    ['Out of stock', d.out],
    ['Categories', d.cats],
  ];

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl">Dashboard</h1>
        <Link href="/admin/products/new" className="btn btn-primary">Add product</Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(([label, n]) => (
          <div key={label} className="border border-espresso/15 bg-white p-4">
            <p className="font-serif text-4xl text-burgundy">{n}</p>
            <p className="text-sm text-espresso/70">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="border border-espresso/15 bg-white p-5">
          <h2 className="mb-3 text-2xl">Recently added</h2>
          {d.recent.length === 0 ? <p className="text-sm text-espresso/70">No products yet.</p> : (
            <ul className="divide-y divide-espresso/10">
              {d.recent.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <Link href={`/admin/products/${p.id}`} className="hover:text-burgundy">{p.name}<span className="block text-xs text-espresso/55">{p.sku}</span></Link>
                  <span>{inr(p.price)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="border border-espresso/15 bg-white p-5">
          <h2 className="mb-1 text-2xl">Low stock</h2>
          <p className="mb-3 text-xs text-espresso/60">{d.threshold} or fewer left. Change this in Website settings.</p>
          {d.low.length === 0 ? <p className="text-sm text-espresso/70">Nothing is running low.</p> : (
            <ul className="divide-y divide-espresso/10">
              {d.low.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <Link href={`/admin/products/${p.id}`} className="hover:text-burgundy">{p.name}</Link>
                  <span className="text-burgundy">{p.stock} left</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/inventory" className="mt-3 inline-block text-sm text-burgundy underline-offset-4 hover:underline">Manage inventory</Link>
        </section>
      </div>
    </div>
  );
}
