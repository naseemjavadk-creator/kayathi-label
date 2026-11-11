'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabase/client';
import { filterVisibleProducts } from '@/lib/data';
import { slugify } from '@/lib/format';
import { GROUPS } from '@/lib/attributes';
import { useToast } from '@/components/admin/Toast';

const rand = () => Math.random().toString(36).slice(2, 6);

export default function Categories() {
  const sb = supabaseBrowser();
  const [cats, setCats] = useState(null);
  const [catCounts, setCatCounts] = useState({});
  const [subCounts, setSubCounts] = useState({});
  const [hideEmpty, setHideEmpty] = useState(true);
  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState('general');
  const [subDraft, setSubDraft] = useState({});
  const [toast, notify] = useToast();

  const load = useCallback(async () => {
    const [{ data, error }, { data: prods, error: prodErr }] = await Promise.all([
      sb.from('categories').select('*, subcategories(*)').order('sort_order').order('name'),
      sb.from('products').select('id,name,sku,category_id,subcategory_id,is_published'),
    ]);
    if (error) notify(error.message, 'error');
    if (prodErr) notify(prodErr.message, 'error');

    const visibleProds = filterVisibleProducts((prods || []).filter((p) => p.is_published));
    const cMap = {};
    const sMap = {};
    for (const p of visibleProds) {
      if (p.category_id) cMap[p.category_id] = (cMap[p.category_id] || 0) + 1;
      if (p.subcategory_id) sMap[p.subcategory_id] = (sMap[p.subcategory_id] || 0) + 1;
    }
    setCatCounts(cMap);
    setSubCounts(sMap);
    setCats(data || []);
  }, [sb, notify]);

  useEffect(() => { load(); }, [load]);

  // Insert with a readable slug; retry once with a suffix if the slug is taken.
  async function insertWithSlug(table, row) {
    const base = slugify(row.name) || 'item';
    let res = await sb.from(table).insert({ ...row, slug: base });
    if (res.error?.code === '23505') res = await sb.from(table).insert({ ...row, slug: `${base}-${rand()}` });
    return res.error;
  }

  async function addCategory(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    const err = await insertWithSlug('categories', { name: newName.trim(), attribute_group: newGroup, sort_order: (cats?.length || 0) + 1 });
    if (err) return notify(err.message, 'error');
    setNewName('');
    setHideEmpty(false);
    notify('Category added (hidden on website until a product is added)');
    load();
  }

  async function saveCategory(c, name, group) {
    if (!name.trim()) return notify('Category name cannot be empty.', 'error');
    const { error } = await sb.from('categories').update({ name: name.trim(), attribute_group: group }).eq('id', c.id);
    if (error) return notify(error.message, 'error');
    notify('Category saved');
    load();
  }

  async function deleteCategory(c) {
    if (!confirm(`Delete "${c.name}" and its subcategories? Products in it will stay on the website but have no category until you reassign them.`)) return;
    const { error } = await sb.from('categories').delete().eq('id', c.id);
    if (error) return notify(error.message, 'error');
    notify('Category deleted');
    load();
  }

  async function addSub(c) {
    const name = (subDraft[c.id] || '').trim();
    if (!name) return;
    const err = await insertWithSlug('subcategories', { name, category_id: c.id, sort_order: (c.subcategories?.length || 0) + 1 });
    if (err) return notify(err.message, 'error');
    setSubDraft((d) => ({ ...d, [c.id]: '' }));
    setHideEmpty(false);
    notify('Subcategory added (hidden on website until a product is added)');
    load();
  }

  async function renameSub(s, name) {
    if (!name.trim()) return notify('Subcategory name cannot be empty.', 'error');
    const { error } = await sb.from('subcategories').update({ name: name.trim() }).eq('id', s.id);
    if (error) return notify(error.message, 'error');
    notify('Subcategory saved');
    load();
  }

  async function deleteSub(s) {
    if (!confirm(`Delete subcategory "${s.name}"?`)) return;
    const { error } = await sb.from('subcategories').delete().eq('id', s.id);
    if (error) return notify(error.message, 'error');
    notify('Subcategory deleted');
    load();
  }

  const allCats = cats || [];
  const visibleCats = hideEmpty ? allCats.filter((c) => (catCounts[c.id] || 0) > 0) : allCats;
  const hiddenCount = allCats.length - allCats.filter((c) => (catCounts[c.id] || 0) > 0).length;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl">Categories</h1>
        <label className="inline-flex cursor-pointer items-center gap-2 border border-espresso/20 bg-white px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={hideEmpty}
            onChange={(e) => setHideEmpty(e.target.checked)}
            className="h-4 w-4 accent-burgundy"
          />
          <span>
            Hide empty categories &amp; subcategories
            {hiddenCount > 0 ? ` (${hiddenCount} empty)` : ''}
          </span>
        </label>
      </div>

      <p className="text-sm text-espresso/75">
        Categories and subcategories with <strong>0 published products</strong> are automatically hidden from customers on the website.
      </p>

      <form onSubmit={addCategory} className="grid gap-3 border border-espresso/15 bg-white p-5 md:grid-cols-[1fr_14rem_auto] md:items-end">
        <div>
          <label className="label" htmlFor="nc">New category name</label>
          <input id="nc" className="field" value={newName} onChange={(e) => setNewName(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="ng">Product details to ask for</label>
          <select id="ng" className="field" value={newGroup} onChange={(e) => setNewGroup(e.target.value)}>
            {GROUPS.map((g) => (<option key={g.value} value={g.value}>{g.label}</option>))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Add category</button>
      </form>

      {cats === null ? (
        <p>Loading…</p>
      ) : visibleCats.length === 0 ? (
        <div className="space-y-3 border border-espresso/15 bg-white p-6">
          <p className="font-serif text-2xl">No categories with products yet</p>
          <p className="text-sm text-espresso/75">
            Empty categories and subcategories are hidden because there are no visible published products in them yet.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <button type="button" onClick={() => setHideEmpty(false)} className="btn btn-outline">
              Show empty categories ({allCats.length})
            </button>
            <Link href="/admin/quick-add" className="btn btn-primary">
              Add products
            </Link>
          </div>
        </div>
      ) : (
        visibleCats.map((c) => (
          <CategoryCard
            key={c.id}
            c={c}
            catCount={catCounts[c.id] || 0}
            subCounts={subCounts}
            hideEmpty={hideEmpty}
            draft={subDraft[c.id] || ''}
            setDraft={(v) => setSubDraft((d) => ({ ...d, [c.id]: v }))}
            onSave={saveCategory}
            onDelete={deleteCategory}
            onAddSub={addSub}
            onRenameSub={renameSub}
            onDeleteSub={deleteSub}
          />
        ))
      )}
      {toast}
    </div>
  );
}

function CategoryCard({
  c,
  catCount,
  subCounts,
  hideEmpty,
  draft,
  setDraft,
  onSave,
  onDelete,
  onAddSub,
  onRenameSub,
  onDeleteSub,
}) {
  const [name, setName] = useState(c.name);
  const [group, setGroup] = useState(c.attribute_group);
  const allSubs = [...(c.subcategories || [])].sort((a, b) => a.sort_order - b.sort_order);
  const visibleSubs = hideEmpty ? allSubs.filter((s) => (subCounts[s.id] || 0) > 0) : allSubs;
  const hiddenSubCount = allSubs.length - allSubs.filter((s) => (subCounts[s.id] || 0) > 0).length;

  return (
    <section className="space-y-4 border border-espresso/15 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-espresso/10 pb-3 text-xs">
        <span className="font-medium text-espresso/80">
          {catCount} {catCount === 1 ? 'product' : 'products'}
        </span>
        <span
          className={`px-2 py-0.5 font-medium ${
            catCount > 0 ? 'bg-[#1F7A4C]/10 text-[#1F7A4C]' : 'bg-espresso/10 text-espresso/70'
          }`}
        >
          {catCount > 0 ? 'Showing on website' : 'Hidden on website (0 products)'}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_14rem_auto_auto] md:items-end">
        <div>
          <label className="label" htmlFor={`n-${c.id}`}>Category name</label>
          <input id={`n-${c.id}`} className="field" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor={`g-${c.id}`}>Product details</label>
          <select id={`g-${c.id}`} className="field" value={group} onChange={(e) => setGroup(e.target.value)}>
            {GROUPS.map((g) => (<option key={g.value} value={g.value}>{g.label}</option>))}
          </select>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => onSave(c, name, group)}>Save</button>
        <button type="button" className="btn btn-outline !border-red-800 !text-red-800 hover:!bg-red-800 hover:!text-white" onClick={() => onDelete(c)}>Delete</button>
      </div>

      <div className="border-t border-espresso/10 pt-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-xl">Subcategories</h2>
          {hideEmpty && hiddenSubCount > 0 && (
            <span className="text-xs text-espresso/60">
              {hiddenSubCount} empty {hiddenSubCount === 1 ? 'subcategory' : 'subcategories'} hidden
            </span>
          )}
        </div>
        {visibleSubs.length === 0 ? (
          <p className="text-sm text-espresso/60">
            {allSubs.length === 0
              ? 'No subcategories yet.'
              : 'No subcategories with products yet (empty ones are hidden).'}
          </p>
        ) : (
          <ul className="space-y-2">
            {visibleSubs.map((s) => (
              <SubRow
                key={s.id}
                s={s}
                count={subCounts[s.id] || 0}
                onRename={onRenameSub}
                onDelete={onDeleteSub}
              />
            ))}
          </ul>
        )}
        <div className="mt-3 flex gap-2">
          <input className="field" placeholder="New subcategory name" aria-label={`New subcategory for ${c.name}`} value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAddSub(c); } }} />
          <button type="button" className="btn btn-outline" onClick={() => onAddSub(c)}>Add</button>
        </div>
      </div>
    </section>
  );
}

function SubRow({ s, count, onRename, onDelete }) {
  const [name, setName] = useState(s.name);
  return (
    <li className="flex flex-wrap items-center gap-2">
      <input className="field min-w-[12rem] flex-1" value={name} aria-label="Subcategory name" onChange={(e) => setName(e.target.value)} />
      <span
        className={`shrink-0 px-2 py-1 text-xs ${
          count > 0 ? 'bg-[#1F7A4C]/10 text-[#1F7A4C]' : 'bg-espresso/10 text-espresso/65'
        }`}
      >
        {count > 0 ? `${count} ${count === 1 ? 'product' : 'products'}` : 'Hidden (0)'}
      </span>
      <button type="button" className="btn btn-outline !px-4" onClick={() => onRename(s, name)}>Save</button>
      <button type="button" className="px-2 text-sm text-red-800 underline" onClick={() => onDelete(s)}>Delete</button>
    </li>
  );
}
