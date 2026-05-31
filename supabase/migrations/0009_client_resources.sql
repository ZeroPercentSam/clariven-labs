-- 0009_client_resources.sql
-- Client resource library (Phase 2B / M2B.5). Admin-uploaded onboarding docs
-- (the RUO Client Starter Kit, guides, reference sheets) surfaced on the
-- client login at /portal/resources. NOT public — logged-in customers only.
-- (The admin/rep margin "Sales Sheet" is a SEPARATE, admin-only surface and is
-- never a client resource — cost data stays out of this table/bucket.)

create table if not exists public.client_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null default 'document',
  file_path text not null,
  file_name text,
  file_bytes integer,
  sort_order integer not null default 0,
  active boolean not null default true,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_resources_active_idx
  on public.client_resources (active, sort_order);

alter table public.client_resources enable row level security;

-- Logged-in customers see active resources; admins see all. anon sees nothing.
drop policy if exists client_resources_read on public.client_resources;
create policy client_resources_read
  on public.client_resources for select
  to authenticated
  using (active or (select public.is_admin()));

-- Admin-only writes.
drop policy if exists client_resources_admin_write on public.client_resources;
create policy client_resources_admin_write
  on public.client_resources for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Private bucket — downloads via signed URLs from the authed portal page.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('client-resources', 'client-resources', false, 20971520, array['application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Logged-in users can read objects (so createSignedUrl works); admins write.
drop policy if exists client_resources_storage_read on storage.objects;
create policy client_resources_storage_read
  on storage.objects for select
  to authenticated
  using (bucket_id = 'client-resources');

drop policy if exists client_resources_storage_admin_write on storage.objects;
create policy client_resources_storage_admin_write
  on storage.objects for all
  to authenticated
  using (bucket_id = 'client-resources' and (select public.is_admin()))
  with check (bucket_id = 'client-resources' and (select public.is_admin()));

-- Touch updated_at (search_path locked to avoid the mutable-path advisor).
create or replace function public.touch_client_resources_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists client_resources_touch_updated_at on public.client_resources;
create trigger client_resources_touch_updated_at
  before update on public.client_resources
  for each row execute function public.touch_client_resources_updated_at();
