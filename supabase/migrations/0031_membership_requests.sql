-- 0031_membership_requests.sql
-- Public "apply to become a client" intake. Mirrors the invitation_requests
-- pattern (0013): the table is admin-only for direct DML; a SECURITY DEFINER RPC
-- is the sanctioned anon writer for the public /apply form. Admin manages the
-- status lifecycle from /admin/memberships.

create table if not exists public.membership_requests (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  status          text not null default 'new'
                    check (status in ('new','contacted','agreement_sent','signed','active','declined')),
  full_name       text not null,
  email           text not null,
  phone           text,
  proposed_brand  text,
  message         text,
  source          text,
  notes           text
);

alter table public.membership_requests enable row level security;

-- Admin-only direct access. Anon submissions flow through submit_membership_request().
create policy membership_requests_admin_select on public.membership_requests
  for select using ((select public.is_admin()) = true);
create policy membership_requests_admin_update on public.membership_requests
  for update using ((select public.is_admin()) = true)
  with check ((select public.is_admin()) = true);
create policy membership_requests_admin_delete on public.membership_requests
  for delete using ((select public.is_admin()) = true);

create index if not exists membership_requests_status_created_idx
  on public.membership_requests (status, created_at desc);

comment on table public.membership_requests is
  'Public client-application intake from /apply. Admin-only DML; anon writes via submit_membership_request(). System of record for new client leads.';

-- Sanctioned anon writer for the public /apply form.
create or replace function public.submit_membership_request(
  p_full_name      text,
  p_email          text,
  p_phone          text default null,
  p_proposed_brand text default null,
  p_message        text default null,
  p_source         text default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if p_email is null or position('@' in p_email) = 0 then
    raise exception 'valid email required' using errcode = '22023';
  end if;
  if p_full_name is null or length(trim(p_full_name)) < 2 then
    raise exception 'full name required' using errcode = '22023';
  end if;
  insert into public.membership_requests (full_name, email, phone, proposed_brand, message, source)
    values (trim(p_full_name), lower(trim(p_email)),
            nullif(trim(coalesce(p_phone, '')), ''),
            nullif(trim(coalesce(p_proposed_brand, '')), ''),
            nullif(trim(coalesce(p_message, '')), ''),
            nullif(trim(coalesce(p_source, '')), ''))
    returning id into v_id;
  return v_id;
end $$;

revoke all on function public.submit_membership_request(text, text, text, text, text, text) from public;
grant execute on function public.submit_membership_request(text, text, text, text, text, text) to anon, authenticated;
