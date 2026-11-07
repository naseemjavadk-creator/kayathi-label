'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabase/client';
import { useToast } from '@/components/admin/Toast';

export default function Inventory() {
  const sb = supabaseBrowser();
  const [rows, setRows] = useState(null);
  const [threshold, setThreshold] = useState(3);
  const [tab, setTab] = useState('all');
  const [toast, notify] = useToast();

  const load = useCallback(async () => {
    const { data: s } = await sb.from('site_settings').select('low_stock_threshold').eq('id', 1).maybeSingle();
    setThreshold(s?.low_stock_threshold ?? 3);
    const { data, error } = await sb.from('products').select('id,name,sku,stock,is_available').order('name');
    if (error) notify(error.message, 'error');
    setRows(data || []);
  }, [sb, notify]);
  useEffect(() => { load(); }, [load]);

  const replace = (row) => setRows((rs) => rs.map((r) => (r.id === row.id ? row : r)));

  async function update(p, patch, okMsg) {
    const { data, error } = await sb.from('products').update(patch).eq('id', p.id).select('id,name,sku,stock,is_available').single();
    if (error) return notify(error.message, 'error');
    replace(data);
    notify(okMsg(data));
  }

  const filters = {
    all: () => true,
    available: (p) => p.is_available,
    low: (p) => p.stock > 0 && p.stock <= threshold,
    out: (p) => !p.is_available,
  };
  const shown = (rows || []).filter(filters[tab]);
  const count = (k) => (rows || []).filter(filters[k]).length;
  const tabs = [['all', 'All'], ['available', 'Available'], ['low', 'Low stock'], ['out', 'Out of stock']];

  return (
    <div className="max-w-4xl">
      <h1 className="mb-5 text-4xl">Inventory</h1>
      <div className="mb-4 flex flex-wrap gap-2" role="tablist">
        {tabs.map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={`border px-4 py-2 text-sm ${tab === k ? 'border-burgundy bg-burgundy text-ivory' : 'border-espresso/25 bg-white'}`}>
            {label} ({count(k)})
          </button>
        ))}
      </div>

      {rows === null ? <p>Loading…</p> : shown.length === 0 ? (
        <p className="border border-espresso/15 bg-white p-6">No products in this list.</p>
      ) : (
        <ul className="divide-y divide-espresso/10 border border-espresso/15 bg-white">
          {shown.map((p) => <Row key={p.id} p={p} onStock={(n) => update(p, { stock: n }, (d) => `Stock updated to ${d.stock}${d.stock === 0 ? ' and marked out of stock' : ''}`)}
            onToggle={() => update(p, { is_available: !p.is_available }, (d) => (d.is_available ? 'Marked available' : 'Marked out of stock'))} />)}
        </ul>
      )}
      <p className="mt-4 text-xs text-espresso/60">Low stock means {threshold} or fewer left. <Link href="/admin/settings" className="underline">Change this</Link></p>
      {toast}
    </div>
  );
}

function Row({ p, onStock, onToggle }) {
  const [n, setN] = useState(String(p.stock));
  useEffect(() => setN(String(p.stock)), [p.stock]);
  const valid = /^\d+$/.test(n);
  return (
    <li className="flex flex-wrap items-center gap-3 p-3 md:gap-5">
      <div className="min-w-0 flex-1 basis-48">
        <Link href={`/admin/products/${p.id}`} className="block truncate font-medium hover:text-burgundy">{p.name}</Link>
        <p className="text-xs text-espresso/60">{p.sku} · <span className={p.is_available ? '' : 'text-burgundy'}>{p.is_available ? 'Available' : 'Out of stock'}</span></p>
      </div>
      <label className="flex items-center gap-2 text-sm">
        Stock
        <input type="number" min="0" step="1" inputMode="numeric" className="field !w-24" value={n} onChange={(e) => setN(e.target.value)} />
      </label>
      <button type="button" disabled={!valid || Number(n) === p.stock} onClick={() => onStock(Number(n))} className="btn btn-primary !px-4 !py-2">Update</button>
      <button type="button" onClick={onToggle} className="text-sm text-burgundy underline">{p.is_available ? 'Mark out of stock' : 'Mark available'}</button>
    </li>
  );
}
