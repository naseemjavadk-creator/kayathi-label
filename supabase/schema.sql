-- =====================================================================
-- KAYATHI LABEL - database schema, security rules and starter data
-- Run this whole file once in: Supabase > SQL Editor > New query > Run
-- Safe to re-run: it will not duplicate or wipe existing data.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1. ADMIN USERS  (only people listed here have owner access)
-- ---------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------
-- 2. CATEGORIES AND SUBCATEGORIES
-- attribute_group decides which extra fields the owner sees on a product:
--   saree | jewellery | bangle | ring | general
-- ---------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  attribute_group text not null default 'general'
    check (attribute_group in ('saree','jewellery','bangle','ring','general')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  slug text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. PRODUCTS AND PRODUCT IMAGES
-- ---------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  slug text not null unique,
  description text not null default '',
  price numeric(10,2) not null check (price >= 0),
  original_price numeric(10,2),
  discount_percent int not null default 0,
  category_id uuid references public.categories(id) on delete set null,
  subcategory_id uuid references public.subcategories(id) on delete set null,
  colours text[] not null default '{}',
  sizes text[] not null default '{}',
  stock int not null default 0 check (stock >= 0),
  is_available boolean not null default true,
  is_new boolean not null default false,
  is_featured boolean not null default false,
  is_best_seller boolean not null default false,
  is_published boolean not null default true,
  attributes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint original_not_below_price check (original_price is null or original_price >= price)
);
create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_created_idx on public.products(created_at desc);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  path text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists product_images_product_idx on public.product_images(product_id);

-- Automatic rules: discount %, updated time, and stock <-> availability.
create or replace function public.products_before_write()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  if new.original_price is not null and new.original_price > new.price then
    new.discount_percent := round((new.original_price - new.price) / new.original_price * 100);
  else
    new.discount_percent := 0;
  end if;
  if new.stock <= 0 then
    new.is_available := false;                       -- zero stock = unavailable
  elsif tg_op = 'UPDATE' and old.stock <= 0 and new.stock > 0 then
    new.is_available := true;                        -- restocked
  end if;
  return new;
end;
$$;

drop trigger if exists products_before_write on public.products;
create trigger products_before_write
  before insert or update on public.products
  for each row execute function public.products_before_write();

-- ---------------------------------------------------------------------
-- 4. SITE SETTINGS (one row), BANNERS, INSTAGRAM POSTS
-- ---------------------------------------------------------------------
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  whatsapp text not null default '+917907139297',
  email text not null default 'kayathilabel@gmail.com',
  phone text not null default '+917907139297',
  address text not null default '',
  maps_url text not null default '',
  instagram_url text not null default 'https://www.instagram.com/kayathilabel/',
  instagram_handle text not null default '@kayathilabel',
  opening_hours text not null default '',
  home_intro text not null default 'KAYATHI LABEL is a premium Indian ethnic fashion and accessories boutique. Explore sarees, jewellery, bangles, rings and accessories, and order directly on WhatsApp.',
  about_story text not null default 'KAYATHI LABEL is a premium Indian ethnic fashion and accessories boutique. We bring together sarees, jewellery, bangles, rings and accessories for people who love traditional elegance.',
  about_vision text not null default 'To make ethnic elegance a part of everyday and festive dressing, with pieces chosen for their beauty and how well they wear.',
  about_style text not null default 'Our tagline, The Art of Ethnic Elegance, guides what we select: refined traditional design, rich colour and careful detail.',
  about_collections text not null default 'Sarees in silk, cotton, designer, party wear and festive styles. Jewellery and traditional ornaments. Bangles and bracelets. Rings. Hair and fashion accessories.',
  about_commitment text not null default 'We describe every piece as accurately as we can, show clear photographs, and confirm availability and delivery details with you on WhatsApp before an order is finalised.',
  logo_url text not null default '',
  logo_light_url text not null default '',
  low_stock_threshold int not null default 3 check (low_stock_threshold >= 0),
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  path text not null,
  title text not null default '',
  subtitle text not null default '',
  link_url text not null default '/shop',
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.instagram_posts (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  path text not null,
  link_url text not null default 'https://www.instagram.com/kayathilabel/',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY
-- Customers (anonymous visitors): read-only, published products only.
-- Owner (listed in admin_users): full access. Enforced by the database.
-- ---------------------------------------------------------------------
alter table public.admin_users      enable row level security;
alter table public.categories       enable row level security;
alter table public.subcategories    enable row level security;
alter table public.products         enable row level security;
alter table public.product_images   enable row level security;
alter table public.site_settings    enable row level security;
alter table public.banners          enable row level security;
alter table public.instagram_posts  enable row level security;

-- admin_users: a signed-in user may only see their own row. Nobody can write via the API.
drop policy if exists "admin sees own row" on public.admin_users;
create policy "admin sees own row" on public.admin_users
  for select to authenticated using (user_id = auth.uid());

-- Public read
drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories for select using (true);
drop policy if exists "public read subcategories" on public.subcategories;
create policy "public read subcategories" on public.subcategories for select using (true);
drop policy if exists "public read settings" on public.site_settings;
create policy "public read settings" on public.site_settings for select using (true);
drop policy if exists "public read banners" on public.banners;
create policy "public read banners" on public.banners for select using (true);
drop policy if exists "public read instagram" on public.instagram_posts;
create policy "public read instagram" on public.instagram_posts for select using (true);

drop policy if exists "public read published products" on public.products;
create policy "public read published products" on public.products
  for select using (is_published = true or public.is_admin());

drop policy if exists "public read images of published products" on public.product_images;
create policy "public read images of published products" on public.product_images
  for select using (
    public.is_admin()
    or exists (select 1 from public.products p where p.id = product_id and p.is_published = true)
  );

-- Owner write (insert / update / delete)
do $$
declare t text;
begin
  foreach t in array array['categories','subcategories','products','product_images','site_settings','banners','instagram_posts']
  loop
    execute format('drop policy if exists "admin write %1$s" on public.%1$s', t);
    execute format(
      'create policy "admin write %1$s" on public.%1$s for all to authenticated using (public.is_admin()) with check (public.is_admin())',
      t);
  end loop;
end $$;

-- Defence in depth: anonymous visitors have no write privileges at all.
revoke insert, update, delete, truncate on all tables in schema public from anon;
revoke all on public.admin_users from anon;
revoke insert, update, delete, truncate on public.admin_users from authenticated;

-- ---------------------------------------------------------------------
-- 6. IMAGE STORAGE  (bucket "media": jpg/png/webp only, max 5 MB each)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "admin select media" on storage.objects;
create policy "admin select media" on storage.objects
  for select to authenticated using (bucket_id = 'media' and public.is_admin());
drop policy if exists "admin insert media" on storage.objects;
create policy "admin insert media" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "admin update media" on storage.objects;
create policy "admin update media" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_admin());
drop policy if exists "admin delete media" on storage.objects;
create policy "admin delete media" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());

-- ---------------------------------------------------------------------
-- 7. STARTING CATEGORIES (from your brief) - owner can edit/add/delete later
-- ---------------------------------------------------------------------
insert into public.categories (name, slug, attribute_group, sort_order) values
  ('Sarees', 'sarees', 'saree', 1),
  ('Jewellery', 'jewellery', 'jewellery', 2),
  ('Bangles & Bracelets', 'bangles-bracelets', 'bangle', 3),
  ('Rings', 'rings', 'ring', 4),
  ('Other Accessories', 'accessories', 'general', 5)
on conflict (slug) do nothing;

insert into public.subcategories (category_id, name, slug, sort_order)
select c.id, s.name, s.slug, s.ord
from (values
  ('sarees','Silk Sarees','silk-sarees',1),
  ('sarees','Cotton Sarees','cotton-sarees',2),
  ('sarees','Designer Sarees','designer-sarees',3),
  ('sarees','Traditional Sarees','traditional-sarees',4),
  ('sarees','Party Wear Sarees','party-wear-sarees',5),
  ('sarees','Daily Wear Sarees','daily-wear-sarees',6),
  ('sarees','Festive Collection','festive-collection',7),
  ('sarees','New Saree Collection','new-saree-collection',8),
  ('jewellery','Chains','chains',1),
  ('jewellery','Necklaces','necklaces',2),
  ('jewellery','Earrings','earrings',3),
  ('jewellery','Pendants','pendants',4),
  ('jewellery','Jewellery Sets','jewellery-sets',5),
  ('jewellery','Traditional Ornaments','traditional-ornaments',6),
  ('jewellery','Nose Rings','nose-rings',7),
  ('jewellery','Nose Pins','nose-pins',8),
  ('jewellery','Anklets','anklets',9),
  ('bangles-bracelets','Traditional Bangles','traditional-bangles',1),
  ('bangles-bracelets','Designer Bangles','designer-bangles',2),
  ('bangles-bracelets','Stone Bangles','stone-bangles',3),
  ('bangles-bracelets','Bracelets','bracelets',4),
  ('rings','Fashion Rings','fashion-rings',1),
  ('rings','Adjustable Rings','adjustable-rings',2),
  ('rings','Traditional Rings','traditional-rings',3),
  ('accessories','Hair Accessories','hair-accessories',1),
  ('accessories','Fashion Accessories','fashion-accessories',2),
  ('accessories','Traditional Accessories','traditional-accessories',3),
  ('accessories','Gift Sets','gift-sets',4)
) as s(cat, name, slug, ord)
join public.categories c on c.slug = s.cat
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- 8. SAMPLE PRODUCTS FOR TESTING (no photos; SKUs start with SAMPLE-)
-- Delete these from the dashboard (Products) once you add real ones.
-- ---------------------------------------------------------------------
insert into public.products
  (sku, name, slug, description, price, original_price, category_id, subcategory_id, colours, sizes, stock, is_new, is_featured, is_best_seller, attributes)
values
 ('SAMPLE-SAR-001','Sample Silk Saree - Maroon','sample-silk-saree-maroon',
  'Sample listing for testing. Replace with your own product details and photographs.',
  8500, 10000,
  (select id from public.categories where slug='sarees'),
  (select id from public.subcategories where slug='silk-sarees'),
  array['Maroon','Gold'], array[]::text[], 5, true, true, false,
  '{"fabric":"Silk","length":"5.5 m","blouse_piece":"Included","pattern":"Woven border","care":"Dry clean only"}'::jsonb),
 ('SAMPLE-SAR-002','Sample Cotton Saree - Ivory','sample-cotton-saree-ivory',
  'Sample listing for testing. Replace with your own product details and photographs.',
  2400, null,
  (select id from public.categories where slug='sarees'),
  (select id from public.subcategories where slug='cotton-sarees'),
  array['Ivory','Green'], array[]::text[], 2, true, false, true,
  '{"fabric":"Cotton","length":"5.5 m","blouse_piece":"Not included","pattern":"Plain with border","care":"Hand wash cold"}'::jsonb),
 ('SAMPLE-JWL-001','Sample Necklace Set','sample-necklace-set',
  'Sample listing for testing. Replace with your own product details and photographs.',
  1800, 2200,
  (select id from public.categories where slug='jewellery'),
  (select id from public.subcategories where slug='jewellery-sets'),
  array['Gold tone'], array[]::text[], 8, false, true, true,
  '{"material":"Alloy","finish":"Gold plated","dimensions":"Necklace 18 in","jewellery_type":"Necklace set"}'::jsonb),
 ('SAMPLE-JWL-002','Sample Jhumka Earrings','sample-jhumka-earrings',
  'Sample listing for testing. Replace with your own product details and photographs.',
  650, null,
  (select id from public.categories where slug='jewellery'),
  (select id from public.subcategories where slug='earrings'),
  array['Gold tone','Silver tone'], array[]::text[], 0, false, false, false,
  '{"material":"Alloy","finish":"Antique","dimensions":"4 cm drop","jewellery_type":"Earrings"}'::jsonb),
 ('SAMPLE-BNG-001','Sample Designer Bangle Set','sample-designer-bangle-set',
  'Sample listing for testing. Replace with your own product details and photographs.',
  900, 1100,
  (select id from public.categories where slug='bangles-bracelets'),
  (select id from public.subcategories where slug='designer-bangles'),
  array['Red','Green'], array['2.4','2.6','2.8'], 12, true, false, false,
  '{"material":"Metal","available_sets":"Set of 4"}'::jsonb),
 ('SAMPLE-RNG-001','Sample Adjustable Ring','sample-adjustable-ring',
  'Sample listing for testing. Replace with your own product details and photographs.',
  450, null,
  (select id from public.categories where slug='rings'),
  (select id from public.subcategories where slug='adjustable-rings'),
  array['Gold tone'], array[]::text[], 3, false, false, false,
  '{"ring_type":"Adjustable","material":"Alloy","finish":"Gold plated"}'::jsonb)
on conflict (sku) do nothing;

-- =====================================================================
-- AFTER the first owner signs up, run (replace the email):
--   insert into public.admin_users (user_id)
--   select id from auth.users where email = 'kayathilabel@gmail.com';
-- =====================================================================

-- =====================================================================
-- COMING SOON (items that run as a ticker and a homepage strip)
-- =====================================================================
create table if not exists public.coming_soon (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  note text not null default '',
  image_url text not null default '',
  path text not null default '',
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.coming_soon enable row level security;
drop policy if exists "public read active coming soon" on public.coming_soon;
create policy "public read active coming soon" on public.coming_soon
  for select using (is_active = true or public.is_admin());
drop policy if exists "admin insert coming_soon" on public.coming_soon;
create policy "admin insert coming_soon" on public.coming_soon for insert to authenticated with check (public.is_admin());
drop policy if exists "admin update coming_soon" on public.coming_soon;
create policy "admin update coming_soon" on public.coming_soon for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin delete coming_soon" on public.coming_soon;
create policy "admin delete coming_soon" on public.coming_soon for delete to authenticated using (public.is_admin());
revoke insert, update, delete, truncate on public.coming_soon from anon;
