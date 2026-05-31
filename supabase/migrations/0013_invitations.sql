-- 0013_invitations.sql
-- Phase 3, Commit 6 — team invitations + public invitation requests.
--
-- The org_invitations / invitation_requests TABLES already exist (0010). This
-- adds the SECURITY DEFINER RPCs that drive the flows (RUO-adapted from Purity
-- 017/083: user_profiles/user_roles/role -> profiles/org_members/org_role):
--   - get_invitation_preview(token)  → json  (anon + authenticated; read-only)
--   - accept_invitation(token)       → json  (authenticated; joins the org)
--   - submit_invitation_request(...) → uuid  (anon + authenticated; public intake)

-- ─────────────────────────────────────────────────────────────────────────
-- get_invitation_preview — sanitized info for the /invite/[token] page to
-- render before sign-in. anon-callable by design (read-only).
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.get_invitation_preview(p_token text)
returns json language plpgsql security definer set search_path = public as $$
declare v_inv record;
begin
  select i.email, i.org_role, i.status, i.expires_at, o.name as org_name
    into v_inv
    from public.org_invitations i
    join public.organizations o on o.id = i.organization_id
   where i.token = p_token;
  if not found then return null; end if;
  return json_build_object(
    'organization_name', v_inv.org_name,
    'email', v_inv.email,
    'org_role', v_inv.org_role,
    'status', v_inv.status,
    'is_expired', v_inv.expires_at < now()
  );
end $$;
grant execute on function public.get_invitation_preview(text) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- accept_invitation — authenticated user joins the inviting org. Gated by
-- email match + pending/unexpired + not already in a DIFFERENT org. The org
-- already exists (and may be approved or pending) — no attestation needed.
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.accept_invitation(p_token text)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_inv record;
  v_uid uuid := auth.uid();
  v_email text;
  v_existing uuid;
begin
  if v_uid is null then raise exception 'not authenticated' using errcode = '28000'; end if;

  select id, organization_id, email, org_role, status, expires_at
    into v_inv from public.org_invitations where token = p_token for update;
  if not found then raise exception 'invitation not found' using errcode = 'P0001'; end if;
  if v_inv.status = 'accepted' then raise exception 'invitation already accepted' using errcode = 'P0001'; end if;
  if v_inv.status = 'revoked' then raise exception 'invitation revoked' using errcode = 'P0001'; end if;
  if v_inv.expires_at < now() then
    update public.org_invitations set status = 'expired' where id = v_inv.id;
    raise exception 'invitation expired' using errcode = 'P0001';
  end if;

  select email into v_email from auth.users where id = v_uid;
  if v_email is null or lower(v_email) <> lower(v_inv.email) then
    raise exception 'invitation email mismatch' using errcode = 'P0001';
  end if;

  select organization_id into v_existing from public.profiles where id = v_uid;
  if v_existing is not null and v_existing <> v_inv.organization_id then
    raise exception 'already in an organization' using errcode = '42501';
  end if;

  update public.profiles set organization_id = v_inv.organization_id where id = v_uid;
  insert into public.org_members (organization_id, user_id, org_role)
    values (v_inv.organization_id, v_uid, v_inv.org_role)
    on conflict (organization_id, user_id) do nothing;
  update public.org_invitations
    set status = 'accepted', accepted_at = now(), accepted_by = v_uid
   where id = v_inv.id;

  return json_build_object('ok', true, 'organization_id', v_inv.organization_id, 'org_role', v_inv.org_role);
end $$;
revoke all on function public.accept_invitation(text) from public, anon;
grant execute on function public.accept_invitation(text) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- submit_invitation_request — public "request access" intake. The table is
-- admin-only for direct DML; this definer RPC is the sanctioned anon writer.
-- (Admin review UI is optional / later.)
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.submit_invitation_request(
  p_email             text,
  p_full_name         text,
  p_organization_name text default null,
  p_research_context  text default null,
  p_reason            text default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if p_email is null or position('@' in p_email) = 0 then
    raise exception 'valid email required' using errcode = '22023';
  end if;
  if p_full_name is null or length(trim(p_full_name)) < 2 then
    raise exception 'full name required' using errcode = '22023';
  end if;
  insert into public.invitation_requests (email, full_name, organization_name, research_context, reason)
    values (lower(trim(p_email)), trim(p_full_name),
            nullif(trim(coalesce(p_organization_name, '')), ''),
            nullif(trim(coalesce(p_research_context, '')), ''),
            nullif(trim(coalesce(p_reason, '')), ''))
    returning id into v_id;
  return v_id;
end $$;
grant execute on function public.submit_invitation_request(text, text, text, text, text) to anon, authenticated;
