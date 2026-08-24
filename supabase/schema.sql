-- Run this once in the Supabase SQL Editor.
-- Creates site_content table, RLS policies, and site-media storage bucket policies.

create table if not exists public.site_content (
  id integer primary key check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

drop policy if exists "Public can read site content" on public.site_content;
create policy "Public can read site content"
  on public.site_content
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Authenticated users can update site content" on public.site_content;
create policy "Authenticated users can update site content"
  on public.site_content
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can insert site content" on public.site_content;
create policy "Authenticated users can insert site content"
  on public.site_content
  for insert
  to authenticated
  with check (id = 1);

-- Public media bucket (create in Dashboard → Storage if insert fails)
insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read site media" on storage.objects;
create policy "Public can read site media"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'site-media');

drop policy if exists "Authenticated users can upload site media" on storage.objects;
create policy "Authenticated users can upload site media"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'site-media');

drop policy if exists "Authenticated users can update site media" on storage.objects;
create policy "Authenticated users can update site media"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'site-media')
  with check (bucket_id = 'site-media');

drop policy if exists "Authenticated users can delete site media" on storage.objects;
create policy "Authenticated users can delete site media"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'site-media');
