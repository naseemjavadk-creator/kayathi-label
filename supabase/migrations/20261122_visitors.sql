-- =====================================================================
-- VISITORS: counts how many people open the website.
-- Each page open stores: the page, where the visitor came from (Instagram,
-- Google, WhatsApp...), phone or computer, and a random visitor number kept
-- in that visitor's browser. No names, phone numbers or IP addresses.
-- Anyone can ADD a row (that is how the website records a visit).
-- Only the owner (admin_users) can READ the numbers.
-- Safe to run more than once. Run it in Supabase > SQL Editor.
-- =====================================================================
create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  visitor_id text not null,
  path text not null,
  referrer text not null default '',
  device text not null default '',
  is_entry boolean not null default false -- true on the first page of a visit
);
alter table public.page_views add column if not exists is_entry boolean not null default false;
create index if not exists page_views_created_at_idx on public.page_views (created_at desc);

alter table public.page_views enable row level security;

drop policy if exists "anyone records a visit" on public.page_views;
create policy "anyone records a visit" on public.page_views
  for insert to anon, authenticated
  with check (
    char_length(visitor_id) between 8 and 64
    and char_length(path) between 1 and 300
    and char_length(referrer) <= 300
    and device in ('mobile', 'desktop', 'tablet', '')
  );

drop policy if exists "admin reads visits" on public.page_views;
create policy "admin reads visits" on public.page_views
  for select to authenticated using (public.is_admin());

drop policy if exists "admin deletes visits" on public.page_views;
create policy "admin deletes visits" on public.page_views
  for delete to authenticated using (public.is_admin());

revoke all on public.page_views from anon;
grant insert (visitor_id, path, referrer, device, is_entry) on public.page_views to anon, authenticated;
grant select, delete on public.page_views to authenticated;

-- One call that returns every number the Visitors page shows.
-- Days are counted in India time. Only the owner gets numbers back.
create or replace function public.visitor_stats(days int default 30)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  tz constant text := 'Asia/Kolkata';
  today date := (now() at time zone tz)::date;
  since timestamptz := ((today - (greatest(least(days, 365), 1) - 1))::timestamp at time zone tz);
  result json;
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;

  with v as (
    select visitor_id, path, referrer, device,
           (created_at at time zone tz)::date as day
    from public.page_views
  )
  select json_build_object(
    'today_visitors',   (select count(distinct visitor_id) from v where day = today),
    'today_views',      (select count(*) from v where day = today),
    'yesterday_visitors', (select count(distinct visitor_id) from v where day = today - 1),
    'week_visitors',    (select count(distinct visitor_id) from v where day > today - 7),
    'month_visitors',   (select count(distinct visitor_id) from v where day > today - 30),
    'total_visitors',   (select count(distinct visitor_id) from v),
    'total_views',      (select count(*) from v),
    'first_day',        (select min(day) from v),
    'daily', coalesce((
      select json_agg(json_build_object('day', d.day::date, 'visitors', coalesce(x.visitors, 0), 'views', coalesce(x.views, 0)) order by d.day)
      from generate_series(today - 13, today, interval '1 day') as d(day)
      left join (
        select day, count(distinct visitor_id) as visitors, count(*) as views
        from v where day > today - 14 group by day
      ) x on x.day = d.day::date
    ), '[]'::json),
    'top_pages', coalesce((
      select json_agg(t) from (
        select path, count(*) as views, count(distinct visitor_id) as visitors
        from public.page_views where created_at >= since
        group by path order by views desc limit 10
      ) t
    ), '[]'::json),
    'sources', coalesce((
      select json_agg(t) from (
        select case when referrer = '' then 'Direct' else referrer end as source,
               count(*) as visits
        from public.page_views where created_at >= since and is_entry
        group by 1 order by visits desc limit 10
      ) t
    ), '[]'::json),
    'devices', coalesce((
      select json_agg(t) from (
        select case when device = '' then 'unknown' else device end as device,
               count(distinct visitor_id) as visitors
        from public.page_views where created_at >= since
        group by 1 order by visitors desc
      ) t
    ), '[]'::json)
  ) into result;

  return result;
end;
$$;

revoke all on function public.visitor_stats(int) from public, anon;
grant execute on function public.visitor_stats(int) to authenticated;
