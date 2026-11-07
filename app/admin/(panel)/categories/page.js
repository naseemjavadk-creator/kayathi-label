'use client';
import { useCallback, useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { slugify } from '@/lib/format';
import { GROUPS } from '@/lib/attributes';
import { useToast } from '@/components/admin/Toast';

const rand = () => Math.random().toString(36).slice(2, 6);

export default function Categories() {
  const sb = supabaseBrowser();
  const [cats, setCats] = useState(null);
  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState('general');
  const [subDraft, setSubDraft] = useState({});
  const [toast, notify] = useToast();

  const load = useCallback(async () => {
    const { data, error } = await sb.from('categories').select('*, subcategories(*)').order('sort_order').order('name');
    if (error) notify(error.message, 'error');
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
    notify('Category added');
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
    notify('Subcategory added');
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

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-4xl">Categories</h1>

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

      {cats === null ? <p>Loading…</p> : cats.map((c) => (
        <CategoryCard key={c.id} c={c} draft={subDraft[c.id] || ''} setDraft={(v) => setSubDraft((d) => ({ ...d, [c.id]: v }))}
          onSave={saveCategory} onDelete={deleteCategory} onAddSub={addSub} onRenameSub={renameSub} onDeleteSub={deleteSub} />
      ))}
      {toast}
    </div>
  );
}

function CategoryCard({ c, draft, setDraft, onSave, onDelete, onAddSub, onRenameSub, onDeleteSub }) {
  const [name, setName] = useState(c.name);
  const [group, setGroup] = useState(c.attribute_group);
  return (
    <section className="space-y-4 border border-espresso/15 bg-white p-5">
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
        <h2 className="mb-2 text-xl">Subcategories</h2>
        <ul className="space-y-2">
          {[...(c.subcategories || [])].sort((a, b) => a.sort_order - b.sort_order).map((s) => (
            <SubRow key={s.id} s={s} onRename={onRenameSub} onDelete={onDeleteSub} />
          ))}
        </ul>
        <div className="mt-3 flex gap-2">
          <input className="field" placeholder="New subcategory name" aria-label={`New subcategory for ${c.name}`} value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAddSub(c); } }} />
          <button type="button" className="btn btn-outline" onClick={() => onAddSub(c)}>Add</button>
        </div>
      </div>
    </section>
  );
}

function SubRow({ s, onRename, onDelete }) {
  const [name, setName] = useState(s.name);
  return (
    <li className="flex gap-2">
      <input className="field" value={name} aria-label="Subcategory name" onChange={(e) => setName(e.target.value)} />
      <button type="button" className="btn btn-outline !px-4" onClick={() => onRename(s, name)}>Save</button>
      <button type="button" className="px-2 text-sm text-red-800 underline" onClick={() => onDelete(s)}>Delete</button>
    </li>
  );
}
