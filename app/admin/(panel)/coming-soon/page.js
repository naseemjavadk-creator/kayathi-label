'use client';
import { useCallback, useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { validateImage, uploadImage, removeFiles } from '@/lib/upload';
import { useToast } from '@/components/admin/Toast';

export default function ComingSoonAdmin() {
  const sb = supabaseBrowser();
  const [rows, setRows] = useState(null);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, notify] = useToast();

  const load = useCallback(async () => {
    const { data, error } = await sb.from('coming_soon').select('*').order('sort_order').order('created_at');
    if (error) notify(error.message, 'error');
    setRows(data || []);
  }, [sb, notify]);
  useEffect(() => { load(); }, [load]);

  async function add(e) {
    e.preventDefault();
    if (!title.trim()) return notify('Enter a name.', 'error');
    if (file) {
      const msg = validateImage(file);
      if (msg) return notify(msg, 'error');
    }
    setBusy(true);
    try {
      let img = { url: '', path: '' };
      if (file) img = await uploadImage(sb, file, 'site/soon');
      const { error } = await sb.from('coming_soon').insert({
        title: title.trim(), note: note.trim(), image_url: img.url, path: img.path, sort_order: (rows?.length || 0) + 1,
      });
      if (error) { await removeFiles(sb, [img.path]); throw error; }
      setTitle(''); setNote(''); setFile(null); e.target.reset();
      notify('Added. It is now running on the website.');
      load();
    } catch (err) { notify(err.message || 'Could not add.', 'error'); }
    setBusy(false);
  }

  async function toggle(r) {
    const { error } = await sb.from('coming_soon').update({ is_active: !r.is_active }).eq('id', r.id);
    if (error) return notify(error.message, 'error');
    notify(r.is_active ? 'Hidden from the website' : 'Now showing');
    load();
  }

  async function remove(r) {
    if (!confirm(`Delete "${r.title}"?`)) return;
    const { error } = await sb.from('coming_soon').delete().eq('id', r.id);
    if (error) return notify(error.message, 'error');
    await removeFiles(sb, [r.path]);
    notify('Deleted');
    load();
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-4xl">Coming soon</h1>
      <p className="-mt-2 max-w-xl text-sm text-espresso/70">
        Items here run across the top of your website and as a row on the homepage, so customers know what is arriving.
        Customers can tap Notify me to message you on WhatsApp. When you add the real product, hide or delete the entry here.
      </p>

      <form onSubmit={add} className="space-y-4 border border-espresso/15 bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label" htmlFor="t">Name</label>
            <input id="t" className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Nose Pins" />
          </div>
          <div>
            <label className="label" htmlFor="n">Short note (optional)</label>
            <input id="n" className="field" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Arriving this month" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="f">Photo (optional)</label>
          <input id="f" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm file:mr-3 file:border-0 file:bg-burgundy file:px-4 file:py-2 file:text-ivory" />
        </div>
        <button type="submit" disabled={busy} className="btn btn-primary">{busy ? 'Adding…' : 'Add'}</button>
      </form>

      {rows === null ? <p>Loading…</p> : rows.length === 0 ? (
        <p className="border border-espresso/15 bg-white p-6">Nothing here yet.</p>
      ) : (
        <ul className="divide-y divide-espresso/10 border border-espresso/15 bg-white">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center gap-3 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {r.image_url ? <img src={r.image_url} alt="" className="h-16 w-12 shrink-0 object-cover" /> : <div className="h-16 w-12 shrink-0 bg-gold/30" />}
              <div className="min-w-0 flex-1 text-sm">
                <p className="truncate font-medium">{r.title}</p>
                <p className="text-xs text-espresso/60">{r.note || 'No note'} · {r.is_active ? 'Showing' : 'Hidden'}</p>
              </div>
              <button type="button" onClick={() => toggle(r)} className="text-sm text-burgundy underline">{r.is_active ? 'Hide' : 'Show'}</button>
              <button type="button" onClick={() => remove(r)} className="text-sm text-red-800 underline">Delete</button>
            </li>
          ))}
        </ul>
      )}
      {toast}
    </div>
  );
}
