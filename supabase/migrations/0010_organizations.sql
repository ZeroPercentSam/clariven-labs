-- 0010_organizations.sql
-- Phase 3, Commit 1 — ADDITIVE multi-tenant foundation (zero behavioral change).
--
-- Introduces organizations + membership + RUO research-use attestation +
-- invitations, EXTENDING the existing profiles/is_admin() model (profiles.role
-- ='admin' stays the staff signal; new org_members holds customer org-roles).
-- Adds nullable organization_id to profiles + orders and backfills every
-- existing customer into a personal, auto-approved org. RLS still keys on
-- user_id after this migration — the cutover to org-scoped RLS + the approval
-- gate land in 0011. Safe to deploy and pause here.
--
-- Helper functions are SECURITY DEFINER (read tables directly, NO JWT hook —
-- invariant #2) and bypass RLS to avoid recursion when used inside policies.

-- ─────────────────────────────────────────────────────────────────────────
-- 1. New tables
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  legal_name text,
  approval_status text not null default 'pending'
    check (approval_status in ('pending','approved','rejected','suspended')),
  billing_email text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_organizations_approval_status
  on public.organizations (approval_status);

create table if not exists public.org_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  org_role text not null check (org_role in ('owner','admin','buyer','viewer')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);
create index if not exists idx_org_members_user on public.org_members (user_id);

-- RUO research-use attestation (replaces Bioveris clinical `licenses`: no
-- license_type / NPI / license_number / state / expiry / 503A-503B).
create table if not exists public.org_attestations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  legal_entity_name text not null,
  research_context text not null,
  institutional_affiliation text,
  orcid_or_inst_id text,
  file_path text,
  file_name text,
  file_bytes integer,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  rejection_reason text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_org_attestations_org on public.org_attestations (organization_id);
create index if not exists idx_org_attestations_status on public.org_attestations (status);

create table if not exists public.org_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  org_role text not null check (org_role in ('admin','buyer','viewer')),
  token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  invited_by uuid references public.profiles(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','accepted','revoked','expired')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  accepted_by uuid references public.profiles(id) on delete set null
);
create index if not exists idx_org_invitations_org on public.org_invitations (organization_id);
create unique index if not exists idx_org_invitations_pending_email
  on public.org_invitations (organization_id, lower(email)) where status = 'pending';

create table if not exists public.invitation_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text not null,
  organization_name text,
  research_context text,
  reason text,
  status text not null default 'new' check (status in ('new','reviewed','invited','declined')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  admin_notes text,
  created_at timestamptz not null default now()
);
create index if not exists idx_invitation_requests_status on public.invitation_requests (status);

-- ─────────────────────────────────────────────────────────────────────────
-- 2. Columns on existing tables (nullable — populated by backfill below)
-- ─────────────────────────────────────────────────────────────────────────

alter table public.profiles
  add column if not exists organization_id uuid references public.organizations(id) on delete set null;
create index if not exists idx_profiles_org on public.profiles (organization_id);

alter table public.orders
  add column if not exists organization_id uuid references public.organizations(id) on delete restrict;
create index if not exists idx_orders_org on public.orders (organization_id);

-- ─────────────────────────────────────────────────────────────────────────
-- 3. Helper functions (SECURITY DEFINER, table-reading, no JWT hook)
-- ─────────────────────────────────────────────────────────────────────────

create or replace function public.user_org_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select organization_id from public.profiles where id = (select auth.uid())
$$;

create or replace function public.user_org_role()
returns text language sql stable security definer set search_path = '' as $$
  select m.org_role
  from public.org_members m
  where m.user_id = (select auth.uid())
    and m.organization_id = (select public.user_org_id())
$$;

create or replace function public.is_org_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.org_members m
    where m.user_id = (select auth.uid())
      and m.organization_id = (select public.user_org_id())
      and m.org_role in ('owner','admin')
  )
$$;

revoke all on function public.user_org_id() from public;
revoke all on function public.user_org_role() from public;
revoke all on function public.is_org_admin() from public;
grant execute on function public.user_org_id() to anon, authenticated;
grant execute on function public.user_org_role() to anon, authenticated;
grant execute on function public.is_org_admin() to anon, authenticated;

-- Generic updated_at touch (search_path locked for advisor hygiene).
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end;
$$;

drop trigger if exists organizations_touch_updated_at on public.organizations;
create trigger organizations_touch_updated_at before update on public.organizations
  for each row execute function public.touch_updated_at();
drop trigger if exists org_attestations_touch_updated_at on public.org_attestations;
create trigger org_attestations_touch_updated_at before update on public.org_attestations
  for each row execute function public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- 4. RLS — new tables (staff = is_admin(); customers gated by own org)
-- ─────────────────────────────────────────────────────────────────────────

alter table public.organizations enable row level security;
create policy organizations_select on public.organizations for select
  using (id = (select public.user_org_id()) or (select public.is_admin()));
create policy organizations_admin_insert on public.organizations for insert
  with check ((select public.is_admin()));
create policy organizations_admin_update on public.organizations for update
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy organizations_admin_delete on public.organizations for delete
  using ((select public.is_admin()));

alter table public.org_members enable row level security;
create policy org_members_select on public.org_members for select
  using (
    user_id = (select auth.uid())
    or organization_id = (select public.user_org_id())
    or (select public.is_admin())
  );
create policy org_members_write_insert on public.org_members for insert
  with check (
    (select public.is_admin())
    or (organization_id = (select public.user_org_id()) and (select public.is_org_admin()))
  );
create policy org_members_write_update on public.org_members for update
  using (
    (select public.is_admin())
    or (organization_id = (select public.user_org_id()) and (select public.is_org_admin()))
  )
  with check (
    (select public.is_admin())
    or (organization_id = (select public.user_org_id()) and (select public.is_org_admin()))
  );
create policy org_members_write_delete on public.org_members for delete
  using (
    (select public.is_admin())
    or (organization_id = (select public.user_org_id()) and (select public.is_org_admin()))
  );

alter table public.org_attestations enable row level security;
create policy org_attestations_select on public.org_attestations for select
  using (organization_id = (select public.user_org_id()) or (select public.is_admin()));
create policy org_attestations_insert on public.org_attestations for insert
  with check (organization_id = (select public.user_org_id()) and (select public.is_org_admin()));
create policy org_attestations_admin_update on public.org_attestations for update
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy org_attestations_admin_delete on public.org_attestations for delete
  using ((select public.is_admin()));

alter table public.org_invitations enable row level security;
create policy org_invitations_select on public.org_invitations for select
  using (organization_id = (select public.user_org_id()) or (select public.is_admin()));
create policy org_invitations_write_insert on public.org_invitations for insert
  with check (
    (select public.is_admin())
    or (organization_id = (select public.user_org_id()) and (select public.is_org_admin()))
  );
create policy org_invitations_write_update on public.org_invitations for update
  using (
    (select public.is_admin())
    or (organization_id = (select public.user_org_id()) and (select public.is_org_admin()))
  )
  with check (
    (select public.is_admin())
    or (organization_id = (select public.user_org_id()) and (select public.is_org_admin()))
  );
create policy org_invitations_write_delete on public.org_invitations for delete
  using (
    (select public.is_admin())
    or (organization_id = (select public.user_org_id()) and (select public.is_org_admin()))
  );

alter table public.invitation_requests enable row level security;
-- Reads/writes are admin-only; public submissions go through a SECURITY DEFINER
-- RPC (added in 0013), so no anon INSERT policy here.
create policy invitation_requests_admin_select on public.invitation_requests for select
  using ((select public.is_admin()));
create policy invitation_requests_admin_update on public.invitation_requests for update
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy invitation_requests_admin_delete on public.invitation_requests for delete
  using ((select public.is_admin()));

-- ─────────────────────────────────────────────────────────────────────────
-- 5. Backfill — every existing customer → personal, auto-approved org.
--    Grandfathers pre-launch accounts; preserves today's per-user isolation
--    once org-scoped RLS lands in 0011. Idempotent (guards on NULL org).
--    Orders backfill is a no-op today (0 orders) but is correct for any.
-- ─────────────────────────────────────────────────────────────────────────

do $$
declare
  r record;
  v_org uuid;
  v_slug text;
begin
  for r in
    select id, email, full_name
    from public.profiles
    where role = 'customer' and organization_id is null
  loop
    v_slug := lower(regexp_replace(split_part(r.email, '@', 1), '[^a-z0-9]+', '-', 'g'))
              || '-' || substr(md5(r.id::text), 1, 6);
    insert into public.organizations (name, slug, legal_name, approval_status)
      values (coalesce(nullif(btrim(r.full_name), ''), split_part(r.email, '@', 1)),
              v_slug, null, 'approved')
      returning id into v_org;
    update public.profiles set organization_id = v_org where id = r.id;
    insert into public.org_members (organization_id, user_id, org_role)
      values (v_org, r.id, 'owner')
      on conflict (organization_id, user_id) do nothing;
  end loop;

  update public.orders o
    set organization_id = p.organization_id
    from public.profiles p
    where o.user_id = p.id and o.organization_id is null;
end $$;
