-- 0012_onboarding.sql
-- Phase 3, Commit 4 — self-service RUO onboarding.
--
-- bootstrap_organization RPC (atomic: create org pending + link profile + owner
-- membership) + private `org-attestations` storage bucket + storage RLS.
-- RUO-adapted from Purity 008 (wholesale_status -> approval_status;
-- user_profiles/user_roles -> profiles/org_members). No clinical fields — the
-- research-use attestation row (org_attestations, from 0010) carries the data.

-- ─────────────────────────────────────────────────────────────────────────
-- 1. bootstrap_organization — atomic post-signup wiring.
--    Refuses if the caller is already in an org; collision-safe slug; the new
--    org starts 'pending' (the approval gate). Returns the new org id.
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.bootstrap_organization(
  p_name          text,
  p_legal_name    text default null,
  p_billing_email text default null,
  p_phone         text default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_uid       uuid := auth.uid();
  v_existing  uuid;
  v_slug_base text;
  v_slug      text;
  v_org_id    uuid;
  v_attempt   int := 0;
begin
  if v_uid is null then raise exception 'not authenticated' using errcode = '28000'; end if;

  select organization_id into v_existing from public.profiles where id = v_uid;
  if v_existing is not null then
    raise exception 'already in an organization' using errcode = '42501';
  end if;

  if p_name is null or length(trim(p_name)) < 2 then
    raise exception 'organization name is required' using errcode = '22023';
  end if;

  -- slug = lowercase ASCII alnum + hyphens, max 60, random suffix on collision.
  v_slug_base := regexp_replace(lower(p_name), '[^a-z0-9]+', '-', 'g');
  v_slug_base := regexp_replace(v_slug_base, '^-+|-+$', '', 'g');
  v_slug_base := substr(v_slug_base, 1, 60);
  if length(v_slug_base) = 0 then v_slug_base := 'org'; end if;
  v_slug := v_slug_base;
  while v_attempt < 5 and exists (select 1 from public.organizations where slug = v_slug) loop
    v_attempt := v_attempt + 1;
    v_slug := v_slug_base || '-' || substr(md5(random()::text || clock_timestamp()::text), 1, 4);
  end loop;

  insert into public.organizations (name, slug, legal_name, billing_email, phone, approval_status)
    values (p_name, v_slug, p_legal_name, p_billing_email, p_phone, 'pending')
    returning id into v_org_id;

  update public.profiles set organization_id = v_org_id where id = v_uid;

  insert into public.org_members (organization_id, user_id, org_role)
    values (v_org_id, v_uid, 'owner')
    on conflict (organization_id, user_id) do nothing;

  return v_org_id;
end $$;
revoke all on function public.bootstrap_organization(text, text, text, text) from public, anon;
grant execute on function public.bootstrap_organization(text, text, text, text) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- 2. Private attestation bucket (mirror 0009 client-resources): 20MB, PDF only.
--    Path convention: org-attestations/{org_id}/{file}.
-- ─────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('org-attestations', 'org-attestations', false, 20971520, array['application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- One policy per action (no `for all`) so there are no overlapping permissive
-- policies on a single action. All helper calls (select ...)-wrapped.
drop policy if exists org_attestations_storage_select on storage.objects;
create policy org_attestations_storage_select
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'org-attestations'
    and (
      (select public.is_admin())
      or (storage.foldername(name))[1] = (select public.user_org_id())::text
    )
  );

drop policy if exists org_attestations_storage_insert on storage.objects;
create policy org_attestations_storage_insert
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'org-attestations'
    and (
      (select public.is_admin())
      or (
        (storage.foldername(name))[1] = (select public.user_org_id())::text
        and (select public.is_org_admin())
      )
    )
  );

drop policy if exists org_attestations_storage_update on storage.objects;
create policy org_attestations_storage_update
  on storage.objects for update
  to authenticated
  using (bucket_id = 'org-attestations' and (select public.is_admin()))
  with check (bucket_id = 'org-attestations' and (select public.is_admin()));

drop policy if exists org_attestations_storage_delete on storage.objects;
create policy org_attestations_storage_delete
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'org-attestations' and (select public.is_admin()));
