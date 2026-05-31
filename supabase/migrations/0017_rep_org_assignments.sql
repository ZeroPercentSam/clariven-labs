-- 0017_rep_org_assignments.sql
-- Phase 4, c3 — Rep ↔ organization assignments. Ported + RUO-adapted from
-- Purity 059. One ACTIVE assignment per org (the commission engine in c4 reads
-- exactly one active assignment per order's org). Admin-managed.
--
-- Divergence from Purity: audit is written by the admin server actions (matching
-- this repo's organizations-actions.ts convention) rather than a DB trigger —
-- that keeps admin_audit_log.actor_id reliably the acting admin without an
-- auth.uid()-in-trigger dependency.

create table public.rep_org_assignments (
  id                  uuid primary key default gen_random_uuid(),
  rep_user_id         uuid not null references public.profiles(id) on delete cascade,
  organization_id     uuid not null references public.organizations(id) on delete cascade,
  -- Per-assignment commission override; NULL → the engine falls back to the
  -- platform default (0.20). numeric(5,4): 0.0000–1.0000.
  commission_pct      numeric(5,4) check (commission_pct is null or (commission_pct >= 0 and commission_pct <= 1)),
  commission_enabled  boolean not null default true,
  started_at          timestamptz not null default now(),
  ended_at            timestamptz,
  ended_reason        text,
  created_by_admin_id uuid references auth.users(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table public.rep_org_assignments is
  'Rep ↔ org assignment. At most one active (ended_at is null) per organization. commission_pct NULL → engine default (0.20). Admin-managed; audited in server actions.';

-- One ACTIVE assignment per org. (Multiple historical/ended rows allowed.)
create unique index rep_org_assignments_one_active_per_org
  on public.rep_org_assignments(organization_id)
  where ended_at is null;

-- FK + lookup indexes.
create index rep_org_assignments_rep_idx on public.rep_org_assignments(rep_user_id);
create index rep_org_assignments_org_idx on public.rep_org_assignments(organization_id);
create index rep_org_assignments_created_by_idx on public.rep_org_assignments(created_by_admin_id);

drop trigger if exists rep_org_assignments_touch_updated_at on public.rep_org_assignments;
create trigger rep_org_assignments_touch_updated_at before update on public.rep_org_assignments
  for each row execute function public.touch_updated_at();

alter table public.rep_org_assignments enable row level security;

-- Admin manages everything; a rep may read their own assignments (c5 portal).
-- Split per-action (not FOR ALL) so the rep+admin SELECT predicate is a single
-- policy — avoids the multiple-permissive-policy advisor WARN (mirrors the
-- sales_reps policy shape from 0015).
create policy rep_org_assignments_select on public.rep_org_assignments for select
  using (rep_user_id = (select auth.uid()) or (select public.is_admin()));
create policy rep_org_assignments_admin_insert on public.rep_org_assignments for insert
  with check ((select public.is_admin()));
create policy rep_org_assignments_admin_update on public.rep_org_assignments for update
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
create policy rep_org_assignments_admin_delete on public.rep_org_assignments for delete
  using ((select public.is_admin()));
