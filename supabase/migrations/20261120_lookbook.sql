-- =====================================================================
-- RUNWAY LOOKBOOK (looks shown on the homepage and /lookbook)
-- Safe to run more than once. Run it in Supabase > SQL Editor.
-- =====================================================================
create table if not exists public.lookbook_looks (
  id uuid primary key default gen_random_uuid(),
  image_url text not null default '',   -- model photo; empty = use the first product's photo
  path text not null default '',        -- storage path in the "media" bucket, for clean-up
  alt text not null default '',
  product_ids uuid[] not null default '{}',
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint lookbook_max_three_products check (coalesce(array_length(product_ids, 1), 0) <= 3)
);

-- At most 10 looks.
create or replace function public.lookbook_limit_looks()
returns trigger language plpgsql as $$
begin
  if (select count(*) from public.lookbook_looks) >= 10 then
    raise exception 'The lookbook can hold up to 10 looks. Delete one first.';
  end if;
  return new;
end $$;
drop trigger if exists lookbook_limit_looks on public.lookbook_looks;
create trigger lookbook_limit_looks before insert on public.lookbook_looks
  for each row execute function public.lookbook_limit_looks();

alter table public.lookbook_looks enable row level security;
drop policy if exists "public read active looks" on public.lookbook_looks;
create policy "public read active looks" on public.lookbook_looks
  for select using (is_active = true or public.is_admin());
drop policy if exists "admin insert lookbook_looks" on public.lookbook_looks;
create policy "admin insert lookbook_looks" on public.lookbook_looks for insert to authenticated with check (public.is_admin());
drop policy if exists "admin update lookbook_looks" on public.lookbook_looks;
create policy "admin update lookbook_looks" on public.lookbook_looks for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin delete lookbook_looks" on public.lookbook_looks;
create policy "admin delete lookbook_looks" on public.lookbook_looks for delete to authenticated using (public.is_admin());
revoke insert, update, delete, truncate on public.lookbook_looks from anon;
