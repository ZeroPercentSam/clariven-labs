-- COA (Certificate of Analysis) uploads, per (product_slug, strength_label).
-- Admin uploads PDFs; customers download via public URLs (COAs are marketing
-- credibility, not customer-specific). One COA per (slug, strength); upserts
-- replace the prior row.

create table if not exists public.product_coas (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null,
  strength_label text not null default '',
  file_path text not null,
  file_name text,
  file_bytes integer,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_slug, strength_label)
);

create index if not exists product_coas_slug_idx on public.product_coas (product_slug);

alter table public.product_coas enable row level security;

-- Anyone (anon + authed) can read COA metadata. Files in storage are also public.
drop policy if exists product_coas_select_all on public.product_coas;
create policy product_coas_select_all
  on public.product_coas for select
  using (true);

-- Only admins can write.
drop policy if exists product_coas_admin_write on public.product_coas;
create policy product_coas_admin_write
  on public.product_coas for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Storage bucket for COA files. Public-read so direct URLs work without
-- signed-URL setup. Admin uploads only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-coas', 'product-coas', true, 20971520, array['application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists product_coas_storage_admin_write on storage.objects;
create policy product_coas_storage_admin_write
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'product-coas' and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    bucket_id = 'product-coas' and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists product_coas_storage_public_read on storage.objects;
create policy product_coas_storage_public_read
  on storage.objects for select
  to public
  using (bucket_id = 'product-coas');

-- Touch updated_at on changes.
create or replace function public.touch_product_coas_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists product_coas_touch_updated_at on public.product_coas;
create trigger product_coas_touch_updated_at
  before update on public.product_coas
  for each row execute function public.touch_product_coas_updated_at();
