'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { validateImage, uploadImage, removeFiles } from '@/lib/upload';
import { sortedImages } from '@/lib/images';
import { lookbookGroupKey, lookbookGroupsFromTaxonomy } from '@/lib/lookbookGroups';
import { useToast } from '@/components/admin/Toast';

const firstImage = (p) => (p ? sortedImages(p)[0]?.url || '' : '');

export default function LookbookAdmin() {
  const sb = supabaseBrowser();
  const [settings, setSettings] = useState(null); // rows of lookbook_looks
  const [cats, setCats] = useState([]);
  const [products, setProducts] = useState([]);
  const [missingTable, setMissingTable] = useState(false);
  const [busyKey, setBusyKey] = useState(null);
  const [toast, notify] = useToast();

  const loadSettings = useCallback(async () => {
    const { data, error } = await sb.from('lookbook_looks').select('*');
    if (error) {
      if (error.code === '42P01' || /lookbook_looks/.test(error.message || '')) setMissingTable(true);
      else notify(error.message, 'error');
      setSettings([]);
      return;
    }
    setMissingTable(false);
    setSettings(data || []);
  }, [sb, notify]);

  useEffect(() => {
    loadSettings();
    sb.from('categories')
      .select('id, name, slug, sort_order, subcategories(id, name, slug, sort_order)')
      .then(({ data }) => setCats(data || []));
    sb.from('products')
      .select('id, name, is_published, category_id, subcategory_id, product_images(url,sort_order)')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(1000)
      .then(({ data }) => setProducts(data || []));
  }, [loadSettings, sb]);

  // One slide per category that has published products, in the order the website shows them.
  const slides = useMemo(() => {
    if (!settings) return [];
    const byGroup = new Map();
    products.forEach((p) => {
      const k = lookbookGroupKey(p);
      if (!k) return;
      if (!byGroup.has(k)) byGroup.set(k, []);
      byGroup.get(k).push(p);
    });
    const saved = new Map(settings.map((r) => [r.group_key, r]));
    const groups = lookbookGroupsFromTaxonomy(cats).filter((g) => byGroup.has(g.key));
    const natural = new Map(groups.map((g, i) => [g.key, i]));
    return groups
      .map((g) => ({ ...g, items: byGroup.get(g.key), row: saved.get(g.key) || null }))
      .sort((a, b) => {
        const sa = a.row?.sort_order || 0;
        const sb2 = b.row?.sort_order || 0;
        if (sa && sb2) return sa - sb2;
        if (sa || sb2) return sa ? -1 : 1;
        return natural.get(a.key) - natural.get(b.key);
      });
  }, [settings, products, cats]);

  // Create or update the settings row for one slide.
  async function upsert(key, patch) {
    const { error } = await sb.from('lookbook_looks').upsert({ group_key: key, ...patch }, { onConflict: 'group_key' });
    if (error) throw error;
  }

  async function setPhoto(slide, file) {
    if (!file) return;
    const msg = validateImage(file);
    if (msg) return notify(msg, 'error');
    setBusyKey(slide.key);
    let uploaded = null;
    try {
      uploaded = await uploadImage(sb, file, 'site/lookbook');
      await upsert(slide.key, { image_url: uploaded.url, path: uploaded.path });
      if (slide.row?.path) await removeFiles(sb, [slide.row.path]);
      notify(`Photo saved for ${slide.name}.`);
      loadSettings();
    } catch (err) {
      if (uploaded) await removeFiles(sb, [uploaded.path]);
      notify(err.message || 'Could not save the photo.', 'error');
    }
    setBusyKey(null);
  }

  async function clearPhoto(slide) {
    setBusyKey(slide.key);
    try {
      await upsert(slide.key, { image_url: '', path: '' });
      if (slide.row?.path) await removeFiles(sb, [slide.row.path]);
      notify(`${slide.name} now uses its first product photo.`);
      loadSettings();
    } catch (err) {
      notify(err.message || 'Could not remove the photo.', 'error');
    }
    setBusyKey(null);
  }

  async function toggle(slide) {
    const showing = slide.row?.is_active !== false;
    try {
      await upsert(slide.key, { is_active: !showing });
      notify(showing ? `${slide.name} is hidden from the lookbook` : `${slide.name} is showing`);
      loadSettings();
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  async function move(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= slides.length) return;
    const order = slides.map((s) => s.key);
    [order[i], order[j]] = [order[j], order[i]];
    try {
      await Promise.all(order.map((key, k) => upsert(key, { sort_order: k + 1 })));
      loadSettings();
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-4xl">Lookbook</h1>
      <p className="-mt-2 max-w-2xl text-sm text-espresso/70">
        The lookbook on your homepage and Lookbook page has one slide for each category, such as Rings, Chains, Earrings,
        Bracelets and each type of saree. Each slide lists every product in that category. A category appears here as soon
        as it has a published product. You can add a model photo for each slide, change the order, or hide a slide.
      </p>

      {missingTable && (
        <div role="alert" className="border border-red-800/40 bg-red-50 p-4 text-sm text-red-900">
          The lookbook is not set up in your database yet, so photos and order can&apos;t be saved. In Supabase, open SQL
          Editor, paste the file <code>supabase/migrations/20261120_lookbook.sql</code> and press Run. Then reload this page.
          The lookbook still shows on the website without it.
        </div>
      )}

      {settings === null ? <p>Loading…</p> : slides.length === 0 ? (
        <p className="border border-espresso/15 bg-white p-6 text-sm">No published products yet, so the lookbook is empty.</p>
      ) : (
        <ol className="divide-y divide-espresso/10 border border-espresso/15 bg-white">
          {slides.map((s, i) => {
            const showing = s.row?.is_active !== false;
            const photo = s.row?.image_url || firstImage(s.items[0]);
            const inputId = `lb-photo-${i}`;
            return (
              <li key={s.key} className={`flex flex-wrap items-center gap-4 p-4 ${showing ? '' : 'opacity-60'}`}>
                <div className="flex flex-col">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0 || missingTable} className="px-1 disabled:opacity-30" aria-label={`Move ${s.name} up`}>↑</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === slides.length - 1 || missingTable} className="px-1 disabled:opacity-30" aria-label={`Move ${s.name} down`}>↓</button>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {photo ? <img src={photo} alt="" className="h-24 w-16 shrink-0 bg-gold/20 object-contain" /> : <div className="h-24 w-16 shrink-0 bg-gold/30" />}
                <div className="min-w-0 flex-1 text-sm">
                  <p className="text-base font-medium">{i + 1}. {s.name}</p>
                  <p className="text-xs text-espresso/60">
                    {s.parent ? `${s.parent} · ` : ''}{s.items.length} product{s.items.length === 1 ? '' : 's'} · {showing ? 'Showing' : 'Hidden'}
                  </p>
                  <p className="text-xs text-espresso/60">{s.row?.image_url ? 'Your model photo' : 'Using the first product photo'}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <label htmlFor={inputId} className={`cursor-pointer text-sm text-burgundy underline ${missingTable ? 'pointer-events-none opacity-40' : ''}`}>
                    {busyKey === s.key ? 'Saving…' : s.row?.image_url ? 'Change photo' : 'Add model photo'}
                  </label>
                  <input id={inputId} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={missingTable || busyKey === s.key}
                    onChange={(e) => { setPhoto(s, e.target.files?.[0]); e.target.value = ''; }} />
                  {s.row?.image_url && (
                    <button type="button" onClick={() => clearPhoto(s)} className="text-sm text-red-800 underline">Remove photo</button>
                  )}
                  <button type="button" onClick={() => toggle(s)} disabled={missingTable} className="text-sm text-burgundy underline disabled:opacity-40">
                    {showing ? 'Hide' : 'Show'}
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
      <p className="text-xs text-espresso/60">
        Tip: a full-length portrait photo of a model wearing the pieces looks best. A PNG with a transparent background blends into the runway.
      </p>
      {toast}
    </div>
  );
}
