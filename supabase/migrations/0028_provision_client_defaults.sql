-- 0028_provision_client_defaults.sql
-- Make provision_client_member's org/name params optional (default null) so the
-- generated TS RPC type marks them optional: the new-client path omits p_org_id
-- and the add-member path omits the org-name fields. The argument TYPES are
-- unchanged, so the existing grants/revokes from 0026 still apply. Body is
-- byte-identical to 0026 — defaults only.
create or replace function public.provision_client_member(
  p_user_id    uuid,
  p_org_id     uuid default null,
  p_name       text default null,
  p_legal_name text default null,
  p_full_name  text default null,
  p_org_role   text default 'owner'
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_admin uuid := auth.uid();
  v_org   uuid := p_org_id;
  v_slug  text;
begin
  if not exists (select 1 from public.profiles where id = v_admin and role = 'admin') then
    raise exception 'FORBIDDEN_NOT_ADMIN' using errcode = '42501';
  end if;
  if p_user_id is null or not exists (select 1 from public.profiles where id = p_user_id) then
    raise exception 'USER_NOT_FOUND' using errcode = '22023';
  end if;
  if p_org_role is null or p_org_role not in ('owner','admin','buyer','viewer') then
    raise exception 'BAD_ORG_ROLE' using errcode = '22023';
  end if;

  if v_org is null then
    if p_name is null or length(trim(p_name)) = 0 then
      raise exception 'ORG_NAME_REQUIRED' using errcode = '22023';
    end if;
    v_slug := trim(both '-' from
              lower(regexp_replace(trim(p_name), '[^a-zA-Z0-9]+', '-', 'g')));
    if length(v_slug) = 0 then v_slug := 'client'; end if;
    v_slug := v_slug || '-' || substr(md5(gen_random_uuid()::text), 1, 6);
    insert into public.organizations (name, slug, legal_name, approval_status)
      values (trim(p_name), v_slug, nullif(trim(coalesce(p_legal_name, '')), ''), 'approved')
      returning id into v_org;
  elsif not exists (select 1 from public.organizations where id = v_org) then
    raise exception 'ORG_NOT_FOUND' using errcode = '22023';
  end if;

  update public.profiles
     set organization_id = v_org,
         full_name = coalesce(nullif(trim(coalesce(p_full_name, '')), ''), full_name)
   where id = p_user_id;

  insert into public.org_members (organization_id, user_id, org_role)
    values (v_org, p_user_id, p_org_role)
    on conflict (organization_id, user_id) do update set org_role = excluded.org_role;

  insert into public.admin_audit_log (actor_id, action, target_type, target_id, payload)
    values (v_admin,
            case when p_org_id is null then 'client.created' else 'client.member_added' end,
            'organization', v_org::text,
            jsonb_build_object('user_id', p_user_id, 'org_role', p_org_role));

  return v_org;
end $$;
