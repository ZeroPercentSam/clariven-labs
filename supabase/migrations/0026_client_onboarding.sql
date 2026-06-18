-- 0026_client_onboarding.sql
-- Consulting pivot — client onboarding tracker.
--
-- Layers a fixed 9-phase / 21-step / ~120-item onboarding program on top of the
-- existing organizations model. A "client company" = an organizations row; its
-- people = profiles + org_members. TEMPLATE tables hold the canonical guide
-- (seeded in 0027, admin-editable); thin per-org INSTANCE tables hold only
-- status — step completion is DERIVED from items (no stored/derived drift).
--
-- RLS rides the effective-user definer helpers from 0021 (is_admin(),
-- user_org_id()), so any org member can tick their own org's items and admins
-- triage everything; impersonation is inherited for free. No service-role, no
-- JWT hook — same posture as the rest of the app. Account provisioning (admin
-- mints a client login with a generated password) is an app-layer concern; the
-- DB side is provision_client_member() below.

-- ───────────────────────────────────────────────────────────────────────────
-- 1. Template tables (blueprint — seeded once in 0027, admin-editable)
-- ───────────────────────────────────────────────────────────────────────────
create table public.onboarding_phases (
  id          smallint primary key,            -- hand-assigned 1..9 (stable FK target)
  title       text not null,
  subtitle    text,
  sort_order  smallint not null,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (sort_order)
);

create table public.onboarding_steps (
  id          smallint primary key,            -- hand-assigned 1..21
  phase_id    smallint not null references public.onboarding_phases(id) on delete restrict,
  title       text not null,
  description text,
  owner_role  text not null
                check (owner_role in ('client','clariven','web_dev','legal','marketing','threepl')),
  sort_order  smallint not null,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (phase_id, sort_order)
);
create index onboarding_steps_phase_idx on public.onboarding_steps (phase_id, sort_order);

create table public.onboarding_items (
  id          integer generated always as identity primary key,
  step_id     smallint not null references public.onboarding_steps(id) on delete restrict,
  label       text not null,
  help_text   text,
  category    text,                            -- Phase-9 launch grouping; null elsewhere
  sort_order  smallint not null,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (step_id, sort_order)
);
create index onboarding_items_step_idx on public.onboarding_items (step_id, sort_order);

-- ───────────────────────────────────────────────────────────────────────────
-- 2. Instance tables (thin, per-org status)
-- ───────────────────────────────────────────────────────────────────────────
create table public.client_onboarding (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  status          text not null default 'onboarding'
                    check (status in ('onboarding','launch_ready','live','paused')),
  started_at      timestamptz not null default now(),
  launched_at     timestamptz,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index client_onboarding_status_idx on public.client_onboarding (status);

-- Source of truth for completion. One row per (org, template item), seeded by
-- start_client_onboarding(). Step/phase progress is aggregated from here.
create table public.client_item_status (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  item_id         integer not null references public.onboarding_items(id) on delete cascade,
  status          text not null default 'pending'
                    check (status in ('pending','in_progress','done','blocked','na')),
  label_override  text,                        -- per-client customization; null = template label
  notes           text,
  done_by         uuid references public.profiles(id) on delete set null,  -- stamped by trigger
  done_at         timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  primary key (organization_id, item_id)
);
create index client_item_status_org_idx        on public.client_item_status (organization_id);
create index client_item_status_org_status_idx on public.client_item_status (organization_id, status);
create index client_item_status_item_idx       on public.client_item_status (item_id);

-- Per-client step annotations only (notes / owner override / manual block flag).
-- NO stored completion bool — a step's progress is derived from its items.
create table public.client_step_status (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  step_id         smallint not null references public.onboarding_steps(id) on delete cascade,
  notes           text,
  owner_override  text
                    check (owner_override is null or owner_override in ('client','clariven','web_dev','legal','marketing','threepl')),
  flag            text check (flag is null or flag in ('blocked','na')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  primary key (organization_id, step_id)
);
create index client_step_status_org_idx on public.client_step_status (organization_id);

-- ───────────────────────────────────────────────────────────────────────────
-- 3. updated_at triggers (reuse the search_path-locked touch_updated_at, 0010)
-- ───────────────────────────────────────────────────────────────────────────
create trigger onboarding_phases_touch  before update on public.onboarding_phases
  for each row execute function public.touch_updated_at();
create trigger onboarding_steps_touch   before update on public.onboarding_steps
  for each row execute function public.touch_updated_at();
create trigger onboarding_items_touch   before update on public.onboarding_items
  for each row execute function public.touch_updated_at();
create trigger client_onboarding_touch  before update on public.client_onboarding
  for each row execute function public.touch_updated_at();
create trigger client_step_status_touch before update on public.client_step_status
  for each row execute function public.touch_updated_at();
-- client_item_status updated_at is handled inside stamp_item_done() (§5).

-- ───────────────────────────────────────────────────────────────────────────
-- 4. RLS
-- ───────────────────────────────────────────────────────────────────────────
-- Template: authenticated read (active rows; admin sees all), admin write.
alter table public.onboarding_phases enable row level security;
alter table public.onboarding_steps  enable row level security;
alter table public.onboarding_items  enable row level security;

create policy onb_phases_read on public.onboarding_phases for select
  to authenticated using (active or (select public.is_admin()));
create policy onb_phases_admin on public.onboarding_phases for all
  to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy onb_steps_read on public.onboarding_steps for select
  to authenticated using (active or (select public.is_admin()));
create policy onb_steps_admin on public.onboarding_steps for all
  to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy onb_items_read on public.onboarding_items for select
  to authenticated using (active or (select public.is_admin()));
create policy onb_items_admin on public.onboarding_items for all
  to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- Instance: member reads/writes OWN org, admin everything.
alter table public.client_onboarding  enable row level security;
alter table public.client_item_status enable row level security;
alter table public.client_step_status enable row level security;

-- Header: member reads own org; only admin mutates (seed via definer RPC).
create policy client_onb_read on public.client_onboarding for select
  using (organization_id = (select public.user_org_id()) or (select public.is_admin()));
create policy client_onb_admin_write on public.client_onboarding for all
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Item status: any org member may read AND update their own org's items
-- ("clients can check anything"); admin all. INSERT/DELETE admin-only — rows
-- are pre-seeded by start_client_onboarding (definer, bypasses RLS).
create policy cis_read on public.client_item_status for select
  using (organization_id = (select public.user_org_id()) or (select public.is_admin()));
create policy cis_update on public.client_item_status for update
  using (organization_id = (select public.user_org_id()) or (select public.is_admin()))
  with check (organization_id = (select public.user_org_id()) or (select public.is_admin()));
create policy cis_admin_insert on public.client_item_status for insert
  with check ((select public.is_admin()));
create policy cis_admin_delete on public.client_item_status for delete
  using ((select public.is_admin()));

-- Step status: member reads own org; only admin annotates (notes/flag/override).
create policy css_read on public.client_step_status for select
  using (organization_id = (select public.user_org_id()) or (select public.is_admin()));
create policy css_admin_write on public.client_step_status for all
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ───────────────────────────────────────────────────────────────────────────
-- 5. Audit-stamp trigger on item status (authoritative done_by/done_at)
-- ───────────────────────────────────────────────────────────────────────────
-- done_by/done_at are never hand-set by clients. On a transition INTO 'done'
-- they're stamped from the effective user (impersonation-aware, 0021); on a
-- transition OUT of 'done' they're cleared. Also rolls updated_at so the queue
-- re-sorts by recency. search_path locked.
create or replace function public.stamp_item_done() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
  if new.status = 'done' and old.status is distinct from 'done' then
    new.done_by := public.effective_user_id();
    new.done_at := now();
  elsif new.status <> 'done' and old.status = 'done' then
    new.done_by := null;
    new.done_at := null;
  end if;
  return new;
end $$;
revoke execute on function public.stamp_item_done() from anon, authenticated, public;

create trigger trg_client_item_status_stamp before update on public.client_item_status
  for each row execute function public.stamp_item_done();

-- ───────────────────────────────────────────────────────────────────────────
-- 6. RPCs (SECURITY DEFINER, real-admin gated via DIRECT auth.uid() read —
--    is_admin() is impersonation-overridden, so we gate on the REAL admin like
--    start_impersonation does in 0021).
-- ───────────────────────────────────────────────────────────────────────────

-- Provision the DB side of a client login. The auth.users row (with a generated
-- password) is created by the app via the admin API BEFORE calling this; here
-- we create the client org (when p_org_id is null), link the new user's profile
-- to it, add the membership, and audit. Idempotent on membership.
create or replace function public.provision_client_member(
  p_user_id    uuid,
  p_org_id     uuid,         -- null → create a new client org from p_name
  p_name       text,
  p_legal_name text,
  p_full_name  text,
  p_org_role   text          -- owner | admin | buyer | viewer
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

  -- Link profile to the org (role stays 'customer'; guard_profile_role allows
  -- this since role is unchanged).
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
revoke all on function public.provision_client_member(uuid, uuid, text, text, text, text) from public, anon;
grant execute on function public.provision_client_member(uuid, uuid, text, text, text, text) to authenticated;

-- Seed (or back-fill) the onboarding checklist for an org. Idempotent: safe to
-- re-run, and re-running after new template items are added back-fills them for
-- already-onboarding clients (the key win of the thin-instance model).
create or replace function public.start_client_onboarding(p_org_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_admin uuid := auth.uid();
begin
  if not exists (select 1 from public.profiles where id = v_admin and role = 'admin') then
    raise exception 'FORBIDDEN_NOT_ADMIN' using errcode = '42501';
  end if;
  if not exists (select 1 from public.organizations where id = p_org_id) then
    raise exception 'ORG_NOT_FOUND' using errcode = '22023';
  end if;

  insert into public.client_onboarding (organization_id)
    values (p_org_id)
    on conflict (organization_id) do nothing;

  insert into public.client_item_status (organization_id, item_id)
    select p_org_id, i.id
      from public.onboarding_items i
      join public.onboarding_steps s on s.id = i.step_id
     where i.active and s.active
    on conflict (organization_id, item_id) do nothing;

  insert into public.client_step_status (organization_id, step_id)
    select p_org_id, s.id
      from public.onboarding_steps s
     where s.active
    on conflict (organization_id, step_id) do nothing;
end $$;
revoke all on function public.start_client_onboarding(uuid) from public, anon;
grant execute on function public.start_client_onboarding(uuid) to authenticated;

-- ───────────────────────────────────────────────────────────────────────────
-- 7. Progress view — per-org rollup. security_invoker → caller RLS applies, so
--    the admin list sees every org and a member sees only their own.
-- ───────────────────────────────────────────────────────────────────────────
create or replace view public.client_onboarding_progress
with (security_invoker = true) as
select
  co.organization_id,
  org.name                                          as organization_name,
  org.slug                                          as organization_slug,
  co.status,
  co.started_at,
  co.launched_at,
  count(cis.*)                                       as items_total,
  count(*) filter (where cis.status = 'done')        as items_done,
  count(*) filter (where cis.status = 'blocked')     as items_blocked,
  count(*) filter (where cis.status = 'na')          as items_na,
  coalesce(round(
    100.0 * count(*) filter (where cis.status = 'done')
    / nullif(count(*) filter (where cis.status <> 'na'), 0)
  , 0), 0)                                           as pct_complete,
  (select p.title
     from public.client_item_status x
     join public.onboarding_items  i2 on i2.id = x.item_id
     join public.onboarding_steps  s2 on s2.id = i2.step_id
     join public.onboarding_phases p  on p.id  = s2.phase_id
    where x.organization_id = co.organization_id
      and x.status not in ('done', 'na')
    order by p.sort_order, s2.sort_order
    limit 1)                                         as current_phase_title
from public.client_onboarding co
join public.organizations org on org.id = co.organization_id
left join public.client_item_status cis on cis.organization_id = co.organization_id
group by co.organization_id, org.name, org.slug, co.status, co.started_at, co.launched_at;

grant select on public.client_onboarding_progress to authenticated;
