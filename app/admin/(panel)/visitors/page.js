'use client';
import { useCallback, useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

const SOURCE_LABELS = {
  Direct: 'Direct (typed the link / saved / app)',
  instagram: 'Instagram',
  facebook: 'Facebook',
  whatsapp: 'WhatsApp',
  google: 'Google',
  youtube: 'YouTube',
};

const PAGE_LABELS = { '/': 'Home page', '/shop': 'Shop', '/lookbook': 'Lookbook', '/new-arrivals': 'New arrivals', '/contact': 'Contact' };

function pageLabel(path) {
  if (PAGE_LABELS[path]) return PAGE_LABELS[path];
  const [, kind, slug] = path.split('/');
  if (slug && (kind === 'product' || kind === 'category')) {
    const name = decodeURIComponent(slug).replace(/-/g, ' ');
    return `${kind === 'product' ? 'Product' : 'Category'}: ${name}`;
  }
  return path;
}

const fmtDay = (d) =>
  new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

function BarList({ rows, labelOf, valueKey, unit }) {
  const max = Math.max(1, ...rows.map((r) => Number(r[valueKey]) || 0));
  if (rows.length === 0) return <p className="text-sm text-espresso/70">No visits yet.</p>;
  return (
    <ul className="space-y-2.5">
      {rows.map((r, i) => (
        <li key={i} className="text-sm">
          <div className="flex justify-between gap-3">
            <span className="min-w-0 truncate capitalize">{labelOf(r)}</span>
            <span className="shrink-0 tabular-nums text-espresso/75">{r[valueKey]} {unit}</span>
          </div>
          <div className="mt-1 h-1.5 bg-ivory-deep">
            <div className="h-full bg-burgundy" style={{ width: `${(Number(r[valueKey]) / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function Visitors() {
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr('');
    const { data, error } = await supabaseBrowser().rpc('visitor_stats', { days: 30 });
    setLoading(false);
    if (error) {
      setErr(
        /visitor_stats|page_views|schema cache/i.test(error.message)
          ? 'Visitor counting is not switched on yet. Run supabase/migrations/20261122_visitors.sql once in Supabase > SQL Editor.'
          : error.message || 'Could not load visitors.'
      );
      return;
    }
    setD(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (err) return <p role="alert" className="max-w-xl text-red-800">{err}</p>;
  if (!d) return <p className="text-espresso/70">Loading…</p>;

  const big = [
    ['Today', d.today_visitors, `${d.today_views} page views`],
    ['Yesterday', d.yesterday_visitors, ''],
    ['Last 7 days', d.week_visitors, ''],
    ['Last 30 days', d.month_visitors, ''],
  ];
  const daily = d.daily || [];
  const maxDay = Math.max(1, ...daily.map((x) => x.visitors));

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl">Visitors</h1>
          <p className="text-sm text-espresso/65">How many people opened your website. One person = one visitor, even if they open many pages.</p>
        </div>
        <button type="button" onClick={load} disabled={loading} className="btn btn-primary">{loading ? 'Refreshing…' : 'Refresh'}</button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {big.map(([label, n, sub]) => (
          <div key={label} className="border border-espresso/15 bg-white p-4">
            <p className="font-serif text-4xl text-burgundy tabular-nums">{n}</p>
            <p className="text-sm text-espresso/70">{label}</p>
            {sub ? <p className="text-xs text-espresso/55">{sub}</p> : null}
          </div>
        ))}
      </div>
      <p className="-mt-5 text-sm text-espresso/70">
        All time: <strong className="text-burgundy">{d.total_visitors}</strong> visitors, {d.total_views} page views
        {d.first_day ? ` (counting since ${fmtDay(d.first_day)})` : ''}.
      </p>

      <section className="border border-espresso/15 bg-white p-5">
        <h2 className="mb-4 text-2xl">Last 14 days</h2>
        <div className="flex h-40 items-end gap-1" role="img" aria-label="Visitors per day for the last 14 days">
          {daily.map((x) => (
            <div key={x.day} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1" title={`${fmtDay(x.day)}: ${x.visitors} visitors`}>
              <span className="text-[10px] tabular-nums text-espresso/70">{x.visitors || ''}</span>
              <div className="w-full bg-burgundy" style={{ height: `${(x.visitors / maxDay) * 100}%`, minHeight: x.visitors ? 2 : 0 }} />
            </div>
          ))}
        </div>
        <div className="mt-1 flex gap-1 border-t border-espresso/15 pt-1">
          {daily.map((x, i) => (
            <span key={x.day} className="min-w-0 flex-1 text-center text-[10px] text-espresso/60">
              {i % 2 === 1 || i === daily.length - 1 ? new Date(`${x.day}T00:00:00`).getDate() : ''}
            </span>
          ))}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="border border-espresso/15 bg-white p-5">
          <h2 className="mb-1 text-2xl">Where they came from</h2>
          <p className="mb-3 text-xs text-espresso/60">Last 30 days, visits</p>
          <BarList rows={d.sources || []} valueKey="visits" unit="" labelOf={(r) => SOURCE_LABELS[r.source] || r.source} />
        </section>
        <section className="border border-espresso/15 bg-white p-5">
          <h2 className="mb-1 text-2xl">Phone or computer</h2>
          <p className="mb-3 text-xs text-espresso/60">Last 30 days, visitors</p>
          <BarList rows={d.devices || []} valueKey="visitors" unit="" labelOf={(r) => r.device} />
        </section>
      </div>

      <section className="border border-espresso/15 bg-white p-5">
        <h2 className="mb-1 text-2xl">Most viewed pages</h2>
        <p className="mb-3 text-xs text-espresso/60">Last 30 days, page views</p>
        <BarList rows={d.top_pages || []} valueKey="views" unit="" labelOf={(r) => pageLabel(r.path)} />
      </section>
    </div>
  );
}
