-- =====================================================================
-- RUNWAY LOOKBOOK: one slide per category (Rings, Chains, Earrings, each saree type…)
-- Stores the owner's choices for each slide: model photo, order, and show/hide.
-- Every product in the category is listed on its slide automatically.
-- Safe to run more than once. Run it in Supabase > SQL Editor.
-- =====================================================================
create table if not exists public.lookbook_looks (
  id uuid primary key default gen_random_uuid(),
  group_key text not null unique,       -- 'sub:<subcategory id>' or 'cat:<category id>'
  image_url text not null default '',   -- model photo; empty = use the first product's photo
  path text not null default '',        -- storage path in the "media" bucket, for clean-up
  alt text not null default '',
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.lookbook_looks enable row level security;
drop policy if exists "public read lookbook" on public.lookbook_looks;
create policy "public read lookbook" on public.lookbook_looks for select using (true);
drop policy if exists "admin insert lookbook_looks" on public.lookbook_looks;
create policy "admin insert lookbook_looks" on public.lookbook_looks for insert to authenticated with check (public.is_admin());
drop policy if exists "admin update lookbook_looks" on public.lookbook_looks;
create policy "admin update lookbook_looks" on public.lookbook_looks for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin delete lookbook_looks" on public.lookbook_looks;
create policy "admin delete lookbook_looks" on public.lookbook_looks for delete to authenticated using (public.is_admin());
revoke insert, update, delete, truncate on public.lookbook_looks from anon;
