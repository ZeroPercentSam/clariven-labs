-- 0032_client_intake_and_brand_research_step.sql
-- Phase 2 of the client-lifecycle program: capture structured client inputs
-- (brand name + domain + competitor check now; LLC + address in the order-
-- request flow) and add a "Brand Name & Market Research" onboarding step that
-- sits before "Establish Legal Entity" in Phase 1.

-- ── 1. Captured intake (one row per client org) ──────────────────────────────
create table if not exists public.client_intake (
  organization_id  uuid primary key references public.organizations(id) on delete cascade,
  -- Brand & market research
  proposed_name    text,
  desired_domain   text,
  competitor_checked boolean not null default false,
  competitor_notes text,
  -- Business / LLC + address (captured alongside the product picker)
  legal_name       text,
  llc_state        text,
  ein              text,
  registered_agent text,
  address_line1    text,
  address_line2    text,
  city             text,
  state            text,
  postal_code      text,
  country          text default 'US',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.client_intake enable row level security;

-- Member reads/writes their OWN org; admin everything (mirrors client_item_status).
create policy client_intake_select on public.client_intake for select
  using (organization_id = (select public.user_org_id()) or (select public.is_admin()));
create policy client_intake_insert on public.client_intake for insert
  with check (organization_id = (select public.user_org_id()) or (select public.is_admin()));
create policy client_intake_update on public.client_intake for update
  using (organization_id = (select public.user_org_id()) or (select public.is_admin()))
  with check (organization_id = (select public.user_org_id()) or (select public.is_admin()));

create trigger client_intake_touch before update on public.client_intake
  for each row execute function public.touch_updated_at();

comment on table public.client_intake is
  'Per-org onboarding intake: proposed brand name/domain + competitor check, and LLC/address details used to build the client site (privacy policy, etc.) and broker orders.';

-- ── 2. New Phase-1 step: "Brand Name & Market Research" (before Legal Entity) ──
-- Insert at sort_order 2 in phase 1. Bump existing phase-1 steps out of the way
-- via a +100 offset to avoid transient unique(phase_id, sort_order) collisions,
-- then bring them back down shifted by 1. Guarded so re-running is a no-op.
do $$
begin
  if not exists (select 1 from public.onboarding_steps where id = 22) then
    update public.onboarding_steps set sort_order = sort_order + 100
      where phase_id = 1 and sort_order >= 2;
    insert into public.onboarding_steps (id, phase_id, title, owner_role, sort_order, description)
      values (22, 1, 'Brand Name & Market Research', 'client', 2,
        'Choose your brand name and domain and confirm there are no competing entities before forming the legal entity.');
    update public.onboarding_steps set sort_order = sort_order - 99
      where phase_id = 1 and sort_order >= 102;
  end if;
end $$;

insert into public.onboarding_items (step_id, label, sort_order, help_text, category) values
  (22, 'Choose your brand name', 1, null, null),
  (22, 'Choose your domain / URL', 2, null, null),
  (22, 'Confirm no competing entity or trademark conflict', 3,
       'Clariven reviews name + domain availability before you form the entity.', null)
on conflict (step_id, sort_order) do update
  set label = excluded.label, help_text = excluded.help_text, active = true;

-- ── 3. Back-fill the new step's items for existing onboarding clients ─────────
insert into public.client_item_status (organization_id, item_id)
  select co.organization_id, i.id
    from public.client_onboarding co
    cross join public.onboarding_items i
    join public.onboarding_steps s on s.id = i.step_id
   where i.active and s.active and i.step_id = 22
on conflict (organization_id, item_id) do nothing;

insert into public.client_step_status (organization_id, step_id)
  select co.organization_id, 22 from public.client_onboarding co
on conflict (organization_id, step_id) do nothing;
