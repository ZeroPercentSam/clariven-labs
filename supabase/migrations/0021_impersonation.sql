-- Phase 5 (a) — Customer impersonation (admin-acts-as-customer for support).
-- DB-table-driven identity swap: no service-role in the request path, no JWT
-- hook. The admin keeps their own auth session; a row in impersonation_sessions
-- marks "admin X acting as Y"; the SECURITY DEFINER RLS helpers resolve an
-- EFFECTIVE user (the impersonated customer) from that row, so the existing
-- org-scoped policies transparently scope to the customer. Ported from the
-- Bioveris / Purity migration 054, adapted to Clariven's helper names.

-- ─────────────────────────────────────────────────────────────────────────
-- 1. impersonation_sessions
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.impersonation_sessions (
  id                   uuid primary key default gen_random_uuid(),
  admin_user_id        uuid not null references auth.users(id) on delete cascade,
  impersonated_user_id uuid not null references auth.users(id) on delete cascade,
  started_at           timestamptz not null default now(),
  expires_at           timestamptz not null,
  ended_at             timestamptz,
  ended_reason         text check (ended_reason in ('user_ended','expired','revoked')),
  justification        text not null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint impersonation_justification_len check (length(trim(justification)) between 10 and 500),
  constraint impersonation_window check (expires_at > started_at),
  constraint impersonation_not_self check (admin_user_id <> impersonated_user_id)
);

-- One active session per admin (partial unique). Plain FK indexes for advisors.
create unique index if not exists impersonation_active_per_admin
  on public.impersonation_sessions (admin_user_id) where ended_at is null;
create index if not exists impersonation_admin_idx
  on public.impersonation_sessions (admin_user_id);
create index if not exists impersonation_target_idx
  on public.impersonation_sessions (impersonated_user_id);

alter table public.impersonation_sessions enable row level security;

-- Admin-only SELECT via a DIRECT profiles read (NOT is_admin(), which is
-- impersonation-overridden below — the ledger is read by a real admin, and the
-- real identity must gate it even mid-session). No write policies: the
-- SECURITY DEFINER RPCs are the only mutators.
create policy impersonation_admin_select on public.impersonation_sessions for select
  using (exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin'));

-- ─────────────────────────────────────────────────────────────────────────
-- 2. effective_user_id() + helper rewrites (the identity swap)
-- ─────────────────────────────────────────────────────────────────────────
-- Reads impersonation_sessions DIRECTLY (never via an overridden helper → no
-- recursion). With no active session it returns auth.uid() → non-impersonation
-- behavior is byte-identical (the regression-safety hinge).
create or replace function public.effective_user_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select coalesce(
    (select s.impersonated_user_id
       from public.impersonation_sessions s
      where s.admin_user_id = (select auth.uid())
        and s.ended_at is null
        and now() < s.expires_at
      limit 1),
    (select auth.uid())
  )
$$;
grant execute on function public.effective_user_id() to anon, authenticated;

-- Rewrite the 5 helpers to resolve the effective user. CREATE OR REPLACE keeps
-- the existing grants. Each preserves its original search_path setting.
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = public.effective_user_id() and role = 'admin')
$$;

create or replace function public.user_org_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select organization_id from public.profiles where id = public.effective_user_id()
$$;

create or replace function public.user_org_role()
returns text language sql stable security definer set search_path = '' as $$
  select m.org_role
  from public.org_members m
  where m.user_id = public.effective_user_id()
    and m.organization_id = (select public.user_org_id())
$$;

create or replace function public.is_org_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.org_members m
    where m.user_id = public.effective_user_id()
      and m.organization_id = (select public.user_org_id())
      and m.org_role in ('owner','admin')
  )
$$;

create or replace function public.is_active_rep()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.sales_reps
    where id = public.effective_user_id() and status = 'active'
  )
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- 3. profiles self-policies → effective user (so /portal + /account follow
--    impersonation). Every other customer-data policy routes through
--    user_org_id()/is_admin() and inherits the swap with no edit.
--    Live names are prof_read / prof_upd (renamed by 0002_advisors_fix).
-- ─────────────────────────────────────────────────────────────────────────
alter policy prof_read on public.profiles
  using ((select public.effective_user_id()) = id or (select public.is_admin()));
alter policy prof_upd on public.profiles
  using ((select public.effective_user_id()) = id or (select public.is_admin()))
  with check ((select public.effective_user_id()) = id or (select public.is_admin()));

-- ─────────────────────────────────────────────────────────────────────────
-- 4. Audit: capture the impersonated customer on every admin_audit_log write
-- ─────────────────────────────────────────────────────────────────────────
alter table public.admin_audit_log
  add column if not exists impersonated_user_id uuid references public.profiles(id) on delete set null;
create index if not exists admin_audit_impersonated_idx
  on public.admin_audit_log (impersonated_user_id) where impersonated_user_id is not null;

create or replace function public.current_impersonated_user_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select s.impersonated_user_id
    from public.impersonation_sessions s
   where s.admin_user_id = (select auth.uid())
     and s.ended_at is null
     and now() < s.expires_at
   limit 1
$$;
grant execute on function public.current_impersonated_user_id() to authenticated;

create or replace function public.admin_audit_set_impersonation()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.impersonated_user_id is null then
    new.impersonated_user_id := public.current_impersonated_user_id();
  end if;
  return new;
end;
$$;
drop trigger if exists trg_admin_audit_impersonation on public.admin_audit_log;
create trigger trg_admin_audit_impersonation before insert on public.admin_audit_log
  for each row execute function public.admin_audit_set_impersonation();

-- ─────────────────────────────────────────────────────────────────────────
-- 5. start / end / context RPCs (SECURITY DEFINER)
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.start_impersonation(p_target uuid, p_justification text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_admin       uuid := auth.uid();
  v_is_admin    boolean;
  v_target_role text;
  v_session_id  uuid;
begin
  if v_admin is null then raise exception 'UNAUTHENTICATED' using errcode = '42501'; end if;
  -- Real-admin gate via a DIRECT read (is_admin() is impersonation-overridden).
  select exists(select 1 from public.profiles where id = v_admin and role = 'admin') into v_is_admin;
  if not v_is_admin then raise exception 'FORBIDDEN_NOT_ADMIN' using errcode = '42501'; end if;

  if p_target is null then raise exception 'TARGET_NOT_FOUND' using errcode = '22023'; end if;
  if p_target = v_admin then raise exception 'CANNOT_IMPERSONATE_SELF' using errcode = '22023'; end if;
  select role into v_target_role from public.profiles where id = p_target;
  if not found then raise exception 'TARGET_NOT_FOUND' using errcode = '22023'; end if;
  if v_target_role = 'admin' then raise exception 'CANNOT_IMPERSONATE_ADMIN' using errcode = '22023'; end if;
  if p_justification is null or length(trim(p_justification)) < 10 then
    raise exception 'JUSTIFICATION_TOO_SHORT' using errcode = '22023';
  end if;

  begin
    insert into public.impersonation_sessions (admin_user_id, impersonated_user_id, expires_at, justification)
    values (v_admin, p_target, now() + interval '15 minutes', trim(p_justification))
    returning id into v_session_id;
  exception when unique_violation then
    raise exception 'IMPERSONATION_ALREADY_ACTIVE' using errcode = '23505';
  end;

  insert into public.admin_audit_log (actor_id, action, target_type, target_id, payload)
  values (v_admin, 'impersonation.started', 'user', p_target::text,
          jsonb_build_object('session_id', v_session_id, 'justification', trim(p_justification)));

  return v_session_id;
end;
$$;
revoke all on function public.start_impersonation(uuid, text) from public;
grant execute on function public.start_impersonation(uuid, text) to authenticated;

create or replace function public.end_impersonation()
returns void language plpgsql security definer set search_path = public as $$
declare
  v_uid    uuid := auth.uid();
  v_sid    uuid;
  v_target uuid;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED' using errcode = '42501'; end if;
  update public.impersonation_sessions
     set ended_at = now(), ended_reason = 'user_ended', updated_at = now()
   where admin_user_id = v_uid and ended_at is null and now() < expires_at
   returning id, impersonated_user_id into v_sid, v_target;
  if v_sid is not null then
    insert into public.admin_audit_log (actor_id, action, target_type, target_id, payload)
    values (v_uid, 'impersonation.ended', 'user', v_target::text, jsonb_build_object('session_id', v_sid));
  end if;
end;
$$;
revoke all on function public.end_impersonation() from public;
grant execute on function public.end_impersonation() to authenticated;

create or replace function public.get_impersonation_context()
returns table(session_id uuid, impersonated_user_id uuid, email text, full_name text, expires_at timestamptz, started_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select s.id, s.impersonated_user_id, p.email::text, p.full_name, s.expires_at, s.started_at
  from public.impersonation_sessions s
  join public.profiles p on p.id = s.impersonated_user_id
  where s.admin_user_id = (select auth.uid()) and s.ended_at is null and now() < s.expires_at
  limit 1
$$;
revoke all on function public.get_impersonation_context() from public;
grant execute on function public.get_impersonation_context() to authenticated;
