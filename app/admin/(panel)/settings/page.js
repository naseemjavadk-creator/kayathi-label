'use client';
import { useCallback, useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { validateImage, uploadImage, removeFiles } from '@/lib/upload';
import { useToast } from '@/components/admin/Toast';

const panel = 'space-y-4 border border-espresso/15 bg-white p-5';

export default function Settings() {
  const sb = supabaseBrowser();
  const [s, setS] = useState(null);
  const [banners, setBanners] = useState([]);
  const [posts, setPosts] = useState([]);
  const [looks, setLooks] = useState([]);
  const [products, setProducts] = useState([]);
  const [lookbookTableReady, setLookbookTableReady] = useState(true);
  const [toast, notify] = useToast();

  const load = useCallback(async () => {
    const [a, b, c, d, e] = await Promise.all([
      sb.from('site_settings').select('*').eq('id', 1).maybeSingle(),
      sb.from('banners').select('*').order('sort_order'),
      sb.from('instagram_posts').select('*').order('sort_order'),
      sb.from('lookbook_looks').select('*').order('sort_order').catch(() => ({ data: null, error: true })),
      sb.from('products').select('id, name, sku').eq('is_published', true).order('name').limit(200),
    ]);
    if (a.error) notify(a.error.message, 'error');
    setS(a.data || { id: 1 });
    setBanners(b.data || []);
    setPosts(c.data || []);
    if (d.error) {
      setLookbookTableReady(false);
      setLooks([]);
    } else {
      setLookbookTableReady(true);
      setLooks(d.data || []);
    }
    setProducts(e.data || []);
  }, [sb, notify]);
  useEffect(() => { load(); }, [load]);

  async function saveSettings(fields) {
    const { error } = await sb.from('site_settings').upsert({ id: 1, ...fields });
    if (error) return notify(error.message, 'error');
    setS((p) => ({ ...p, ...fields }));
    notify('Saved. The website is updated.');
  }

  if (!s) return <p>Loading…</p>;
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-4xl">Website settings</h1>
      <BusinessForm s={s} onSave={saveSettings} />
      <LogoForm s={s} sb={sb} onSave={saveSettings} notify={notify} />
      <AboutForm s={s} onSave={saveSettings} />
      <BannerManager sb={sb} banners={banners} reload={load} notify={notify} />
      <InstagramManager sb={sb} posts={posts} defaultLink={s.instagram_url} reload={load} notify={notify} />
      <LookbookManager
        sb={sb}
        looks={looks}
        products={products}
        tableReady={lookbookTableReady}
        reload={load}
        notify={notify}
      />
      {toast}
    </div>
  );
}

function useDraft(s, keys) {
  const [d, setD] = useState(() => Object.fromEntries(keys.map((k) => [k, s[k] ?? ''])));
  return [d, (k, v) => setD((p) => ({ ...p, [k]: v }))];
}

function Field({ label, id, value, onChange, type = 'text', rows, hint, placeholder }) {
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      {rows ? (
        <textarea id={id} rows={rows} className="field" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input id={id} type={type} className="field" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint && <p className="mt-1 text-xs text-espresso/60">{hint}</p>}
    </div>
  );
}

function BusinessForm({ s, onSave }) {
  const keys = ['whatsapp', 'email', 'phone', 'address', 'maps_url', 'instagram_url', 'instagram_handle', 'opening_hours', 'home_intro', 'low_stock_threshold'];
  const [d, set] = useDraft(s, keys);
  const submit = (e) => {
    e.preventDefault();
    onSave({ ...d, low_stock_threshold: Math.max(0, parseInt(d.low_stock_threshold, 10) || 0) });
  };
  return (
    <form onSubmit={submit} className={panel}>
      <h2 className="text-2xl">Business information</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Field id="wa" label="WhatsApp number" value={d.whatsapp} onChange={(v) => set('whatsapp', v)} hint="Include the country code, e.g. +917907139297. All order buttons use this number." />
        <Field id="ph" label="Call number" value={d.phone} onChange={(v) => set('phone', v)} />
        <Field id="em" label="Email address" type="email" value={d.email} onChange={(v) => set('email', v)} />
        <Field id="ig" label="Instagram profile link" type="url" value={d.instagram_url} onChange={(v) => set('instagram_url', v)} />
        <Field id="ih" label="Instagram username" value={d.instagram_handle} onChange={(v) => set('instagram_handle', v)} placeholder="@kayathilabel" />
        <Field id="ls" label="Low-stock warning at" type="number" value={d.low_stock_threshold} onChange={(v) => set('low_stock_threshold', v)} hint="Products with this many or fewer left are flagged as low stock." />
      </div>
      <Field id="ad" label="Shop address" rows={3} value={d.address} onChange={(v) => set('address', v)} hint="Leave empty until you have an address to show. A map and directions button appear on the Contact page once this is filled in." />
      <Field id="mu" label="Google Maps link (optional)" value={d.maps_url} onChange={(v) => set('maps_url', v)} hint="In Google Maps choose Share, then Copy link (or Embed a map, then copy the src address). Use this if the address alone does not find your shop." />
      <Field id="oh" label="Opening hours" rows={4} value={d.opening_hours} onChange={(v) => set('opening_hours', v)} placeholder={'Mon to Sat: 10 am to 8 pm\nSunday: closed'} />
      <Field id="hi" label="Homepage introduction" rows={3} value={d.home_intro} onChange={(v) => set('home_intro', v)} />
      <button type="submit" className="btn btn-primary">Save business information</button>
    </form>
  );
}

function AboutForm({ s, onSave }) {
  const keys = ['about_story', 'about_vision', 'about_style', 'about_collections', 'about_commitment'];
  const [d, set] = useDraft(s, keys);
  const labels = { about_story: 'Our story', about_vision: 'Our vision', about_style: 'Our style', about_collections: 'Our collections', about_commitment: 'Our commitment to quality' };
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(d); }} className={panel}>
      <h2 className="text-2xl">About us page</h2>
      <p className="text-sm text-espresso/70">Only write what is true for KAYATHI LABEL. A section left empty is hidden from the page.</p>
      {keys.map((k) => (<Field key={k} id={k} label={labels[k]} rows={4} value={d[k]} onChange={(v) => set(k, v)} />))}
      <button type="submit" className="btn btn-primary">Save About us</button>
    </form>
  );
}

function LogoForm({ s, sb, onSave, notify }) {
  const [busy, setBusy] = useState('');
  async function pick(e, field) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const msg = validateImage(file);
    if (msg) return notify(msg, 'error');
    setBusy(field);
    try {
      const up = await uploadImage(sb, file, 'site/logo');
      const old = s[field];
      await onSave({ [field]: up.url });
      if (old) await removeFiles(sb, [old.split('/storage/v1/object/public/media/')[1]]);
    } catch (err) { notify(err.message || 'Upload failed', 'error'); }
    setBusy('');
  }
  return (
    <section className={panel}>
      <h2 className="text-2xl">Logo</h2>
      <p className="text-sm text-espresso/70">
        Your original KAYATHI LABEL logo is already in place. Upload a new file only if you want to replace it.
        It is shown exactly as designed, only resized, on the burgundy header and footer.
      </p>
      <div className="flex h-32 items-center justify-center border border-espresso/15 bg-logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={s.logo_light_url || '/brand/logo-on-burgundy.png'} alt="Current logo" className="max-h-28 w-auto" />
      </div>
      <p className="text-xs text-espresso/60">Use a gold or light logo on a burgundy (#66142A) background, JPG, PNG or WebP, up to 5 MB.</p>
      <input type="file" accept="image/png,image/webp,image/jpeg" disabled={busy === 'logo_light_url'} onChange={(e) => pick(e, 'logo_light_url')} aria-label="Upload logo"
        className="block w-full text-sm file:mr-3 file:border-0 file:bg-burgundy file:px-4 file:py-2 file:text-ivory" />
      {s.logo_light_url && (
        <button type="button" className="text-sm text-burgundy underline" onClick={() => onSave({ logo_light_url: '' })}>Go back to the original logo</button>
      )}
    </section>
  );
}

function Uploader({ sb, table, folder, nextOrder, extra, reload, notify, children, fields }) {
  const [file, setFile] = useState(null);
  const [vals, setVals] = useState({});
  const [busy, setBusy] = useState(false);
  async function add(e) {
    e.preventDefault();
    if (!file) return notify('Choose an image first.', 'error');
    const msg = validateImage(file);
    if (msg) return notify(msg, 'error');
    setBusy(true);
    try {
      const up = await uploadImage(sb, file, folder);
      const { error } = await sb.from(table).insert({ image_url: up.url, path: up.path, sort_order: nextOrder, ...extra(vals) });
      if (error) { await removeFiles(sb, [up.path]); throw error; }
      setFile(null); setVals({}); e.target.reset();
      notify('Added. The website is updated.');
      reload();
    } catch (err) { notify(err.message || 'Upload failed', 'error'); }
    setBusy(false);
  }
  return (
    <form onSubmit={add} className="space-y-3 border-t border-espresso/10 pt-4">
      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] || null)} aria-label="Image"
        className="block w-full text-sm file:mr-3 file:border-0 file:bg-burgundy file:px-4 file:py-2 file:text-ivory" />
      {fields.map(([k, label, ph]) => (
        <Field key={k} id={`${table}-${k}`} label={label} placeholder={ph} value={vals[k] || ''} onChange={(v) => setVals((p) => ({ ...p, [k]: v }))} />
      ))}
      <button type="submit" disabled={busy} className="btn btn-primary">{busy ? 'Uploading…' : children}</button>
    </form>
  );
}

function BannerManager({ sb, banners, reload, notify }) {
  async function toggle(b) {
    const { error } = await sb.from('banners').update({ is_active: !b.is_active }).eq('id', b.id);
    if (error) return notify(error.message, 'error');
    reload();
  }
  async function del(b) {
    if (!confirm('Delete this banner?')) return;
    const { error } = await sb.from('banners').delete().eq('id', b.id);
    if (error) return notify(error.message, 'error');
    await removeFiles(sb, [b.path]);
    notify('Banner deleted');
    reload();
  }
  return (
    <section className={panel}>
      <h2 className="text-2xl">Homepage banners</h2>
      <p className="text-sm text-espresso/70">Wide 16:9 images work best (for example 1920 × 1080). If your banner already has its own text and button, leave the headline and line below empty. With no banners, the homepage shows the text introduction instead.</p>
      <ul className="space-y-3">
        {banners.map((b) => (
          <li key={b.id} className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.image_url} alt="" className="h-16 w-28 shrink-0 object-cover" />
            <div className="min-w-0 flex-1 text-sm"><p className="truncate">{b.title || 'No headline'}</p><p className="text-xs text-espresso/60">{b.is_active ? 'Showing' : 'Hidden'}</p></div>
            <button type="button" onClick={() => toggle(b)} className="text-sm text-burgundy underline">{b.is_active ? 'Hide' : 'Show'}</button>
            <button type="button" onClick={() => del(b)} className="text-sm text-red-800 underline">Delete</button>
          </li>
        ))}
      </ul>
      <Uploader sb={sb} table="banners" folder="site/banners" nextOrder={banners.length + 1} reload={reload} notify={notify}
        extra={(v) => ({ title: v.title || '', subtitle: v.subtitle || '', link_url: v.link || '/shop' })}
        fields={[['title', 'Headline (optional)'], ['subtitle', 'Short line under the headline (optional)'], ['link', 'Button goes to', '/shop']]}>
        Add banner
      </Uploader>
    </section>
  );
}

function InstagramManager({ sb, posts, defaultLink, reload, notify }) {
  async function del(p) {
    if (!confirm('Remove this image?')) return;
    const { error } = await sb.from('instagram_posts').delete().eq('id', p.id);
    if (error) return notify(error.message, 'error');
    await removeFiles(sb, [p.path]);
    reload();
  }
  return (
    <section className={panel}>
      <h2 className="text-2xl">Instagram section images</h2>
      <p className="text-sm text-espresso/70">Add images from your Instagram posts. Each one links to the post, or to your profile if you leave the link empty. Up to 6 are shown.</p>
      <ul className="grid grid-cols-3 gap-2 md:grid-cols-6">
        {posts.map((p) => (
          <li key={p.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image_url} alt="" className="aspect-square w-full object-cover" />
            <button type="button" onClick={() => del(p)} className="mt-1 text-xs text-red-800 underline">Remove</button>
          </li>
        ))}
      </ul>
      <Uploader sb={sb} table="instagram_posts" folder="site/instagram" nextOrder={posts.length + 1} reload={reload} notify={notify}
        extra={(v) => ({ link_url: v.link || defaultLink })}
        fields={[['link', 'Link to the Instagram post (optional)', 'https://www.instagram.com/p/…']]}>
        Add image
      </Uploader>
    </section>
  );
}

function LookbookManager({ sb, looks, products, tableReady, reload, notify }) {
  const [file, setFile] = useState(null);
  const [alt, setAlt] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [busy, setBusy] = useState(false);

  async function toggle(look) {
    const { error } = await sb.from('lookbook_looks').update({ is_active: !look.is_active }).eq('id', look.id);
    if (error) return notify(error.message, 'error');
    reload();
  }

  async function del(look) {
    if (!confirm('Delete this look?')) return;
    const { error } = await sb.from('lookbook_looks').delete().eq('id', look.id);
    if (error) return notify(error.message, 'error');
    if (look.path) await removeFiles(sb, [look.path]);
    notify('Look deleted');
    reload();
  }

  function toggleProduct(id) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) {
        notify('Each look can link up to 3 products.', 'error');
        return prev;
      }
      return [...prev, id];
    });
  }

  async function addLook(e) {
    e.preventDefault();
    if (!file && selectedIds.length === 0) {
      return notify('Upload a model photo or select at least one product.', 'error');
    }
    setBusy(true);
    try {
      let up = { url: '', path: '' };
      if (file) {
        const msg = validateImage(file);
        if (msg) {
          setBusy(false);
          return notify(msg, 'error');
        }
        up = await uploadImage(sb, file, 'site/lookbook');
      }
      const { error } = await sb.from('lookbook_looks').insert({
        image_url: up.url,
        path: up.path,
        alt: alt.trim(),
        product_ids: selectedIds.slice(0, 3),
        sort_order: looks.length + 1,
        is_active: true,
      });
      if (error) {
        if (up.path) await removeFiles(sb, [up.path]);
        throw error;
      }
      setFile(null);
      setAlt('');
      setSelectedIds([]);
      e.target.reset();
      notify('Look added. The lookbook is updated.');
      reload();
    } catch (err) {
      notify(err.message || 'Upload failed', 'error');
    }
    setBusy(false);
  }

  return (
    <section className={panel}>
      <h2 className="text-2xl">Runway lookbook (up to 10 looks)</h2>
      <p className="text-sm text-espresso/70">
        Curate styled looks for the Runway Lookbook on the homepage and <a href="/lookbook" target="_blank" className="underline text-burgundy">/lookbook</a>.
        Each look pairs a full-length model photo with up to 3 products.
      </p>

      {!tableReady ? (
        <div className="border border-gold/40 bg-gold/15 p-4 text-xs leading-relaxed text-espresso/80">
          <p className="font-medium text-burgundy">To curate custom looks:</p>
          <p className="mt-1">
            Run <code className="bg-white px-1.5 py-0.5 font-mono">supabase/lookbook-migration.sql</code> in your Supabase SQL Editor.
            Until then, looks are generated automatically from your published sarees &amp; jewellery.
          </p>
        </div>
      ) : (
        <>
          {looks.length > 0 ? (
            <ul className="space-y-3">
              {looks.map((l) => (
                <li key={l.id} className="flex items-center gap-3 border border-espresso/10 p-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {l.image_url ? (
                    <img src={l.image_url} alt="" className="h-20 w-14 shrink-0 object-cover" />
                  ) : (
                    <div className="flex h-20 w-14 shrink-0 items-center justify-center bg-burgundy text-[10px] text-ivory">Auto Photo</div>
                  )}
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="truncate font-medium">{l.alt || 'Look'}</p>
                    <p className="text-xs text-espresso/60">
                      {l.product_ids?.length || 0} {(l.product_ids?.length || 0) === 1 ? 'product' : 'products'} · {l.is_active ? 'Showing' : 'Hidden'}
                    </p>
                  </div>
                  <button type="button" onClick={() => toggle(l)} className="text-sm text-burgundy underline">
                    {l.is_active ? 'Hide' : 'Show'}
                  </button>
                  <button type="button" onClick={() => del(l)} className="text-sm text-red-800 underline">
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-espresso/70">
              No custom looks added yet. The lookbook is currently building automatic looks from your published pieces.
            </p>
          )}

          {looks.length < 10 && (
            <form onSubmit={addLook} className="space-y-3 border-t border-espresso/10 pt-4">
              <div>
                <label className="label" htmlFor="lb-photo">Model photo (optional — leaves blank to use the first product’s photo)</label>
                <input
                  id="lb-photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm file:mr-3 file:border-0 file:bg-burgundy file:px-4 file:py-2 file:text-ivory"
                />
              </div>

              <Field
                id="lb-alt"
                label="Look title / description (optional)"
                placeholder="e.g. Maroon Silk Saree with Temple Kemp Set"
                value={alt}
                onChange={setAlt}
              />

              <div>
                <label className="label">Select up to 3 products worn in this look</label>
                <div className="max-h-48 space-y-1.5 overflow-y-auto border border-espresso/20 bg-ivory p-3 text-xs">
                  {products.map((p) => {
                    const checked = selectedIds.includes(p.id);
                    return (
                      <label key={p.id} className="flex cursor-pointer items-center gap-2 hover:text-burgundy">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleProduct(p.id)}
                          className="h-3.5 w-3.5 accent-burgundy"
                        />
                        <span className="truncate">{p.name} ({p.sku})</span>
                      </label>
                    );
                  })}
                </div>
                <p className="mt-1 text-xs text-espresso/60">{selectedIds.length} of 3 selected</p>
              </div>

              <button type="submit" disabled={busy} className="btn btn-primary">
                {busy ? 'Saving…' : 'Add look'}
              </button>
            </form>
          )}
        </>
      )}
    </section>
  );
}
