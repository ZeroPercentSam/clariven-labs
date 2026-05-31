-- 0015_rep_identity_cogs.sql
-- Phase 4, c1 — Rep identity + COGS snapshot (ADDITIVE; no behavioral change to
-- existing customer checkout beyond a new snapshot column defaulting to 0).
--
-- Adds the rep identity layer (ported + RUO-adapted from Purity 055) and the
-- COGS snapshot that the margin-base commission engine (c4) depends on:
--   1. sales_reps — staff-adjacent rep profile keyed on profiles.id. A rep is
--      NOT a customer (no org) and NOT profiles.role='admin'. Gate /rep/* on the
--      new is_active_rep() helper. Locked-columns trigger freezes tax/payout
--      fields once onboarding completes; sales_reps_safe masks tax_id +
--      payout_account_ref for general (admin-list) reads.
--   2. is_active_rep() SECURITY DEFINER helper (mirrors is_admin() grants).
--   3. order_items.unit_cost_cents — per-line COGS snapshot (default 0; legacy
--      rows stay 0 → those orders fall back to a revenue-base commission, like
--      Purity's pre-096 legacy rows).
--   4. create_order_with_items extended to snapshot product_prices.cogs_cents →
--      order_items.unit_cost_cents. Everything else in the RPC is unchanged.
--
-- RUO adaptation vs Purity: references profiles(id) (not user_profiles(user_id));
-- gates on public.is_admin() (not 'internal-admin' = any(user_app_roles())); rep
-- acceptance/role flows live in c2 (no user_app_roles / is_staff anywhere).

-- ─────────────────────────────────────────────────────────────────────────
-- 1. sales_reps — rep identity table.
-- ─────────────────────────────────────────────────────────────────────────
create table public.sales_reps (
  id                      uuid primary key references public.profiles(id) on delete cascade,
  status                  text not null default 'pending_invite'
    check (status in ('pending_invite', 'pending_review', 'active', 'suspended')),
  legal_name              text,
  tax_id                  text,
  tax_id_kind             text check (tax_id_kind in ('SSN', 'EIN')),
  business_type           text check (business_type in ('individual', 'sole_proprietor', 'llc', 'corporation', 'partnership', 'other')),
  payout_method           text check (payout_method in ('ACH', 'PayPal', 'Check')),
  payout_account_masked   text,
  payout_account_ref      text,
  address_line1           text,
  address_line2           text,
  address_city            text,
  address_state           text,
  address_postal_code     text,
  address_country         text default 'US',
  phone                   text,
  bio                     text,
  headshot_url            text,
  linkedin_url            text,
  territory_states        text[] not null default '{}'::text[],
  specialty_categories    text[] not null default '{}'::text[],
  suspended_reason        text,
  suspended_at            timestamptz,
  approved_at             timestamptz,
  approved_by             uuid references auth.users(id) on delete set null,
  onboarding_completed_at timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

comment on table public.sales_reps is
  'Rep identity (staff-adjacent). PK = profiles.id. A rep has no customer org; gate /rep/* on is_active_rep(). tax_id + payout_account_ref are sensitive — read via sales_reps_safe for general lists.';

-- FK index (advisor hygiene) + admin-filter index on status.
create index sales_reps_approved_by_idx on public.sales_reps(approved_by);
create index sales_reps_status_idx on public.sales_reps(status);

-- updated_at touch (reuse the generic trigger fn from 0010).
drop trigger if exists sales_reps_touch_updated_at on public.sales_reps;
create trigger sales_reps_touch_updated_at before update on public.sales_reps
  for each row execute function public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- 2. Locked-columns trigger — a rep may only flip status pending_invite →
--    pending_review (paired with stamping onboarding_completed_at); tax/payout/
--    legal fields freeze once onboarding completes; admin/approval/suspension
--    fields are admin-only always. Admins (is_admin()) bypass entirely.
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.sales_reps_enforce_locked_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_in_initial_onboarding boolean;
begin
  -- Admins may change anything (approve/suspend/reactivate, fix data).
  if (select public.is_admin()) then
    return new;
  end if;

  v_in_initial_onboarding := old.onboarding_completed_at is null;

  -- status: rep may only move pending_invite → pending_review.
  if new.status is distinct from old.status then
    if not (old.status = 'pending_invite' and new.status = 'pending_review') then
      raise exception 'REP_FIELD_LOCKED:status' using errcode = 'P0001';
    end if;
  end if;

  -- onboarding_completed_at: rep may only set it once (null → non-null).
  if new.onboarding_completed_at is distinct from old.onboarding_completed_at then
    if not (old.onboarding_completed_at is null and new.onboarding_completed_at is not null) then
      raise exception 'REP_FIELD_LOCKED:onboarding_completed_at' using errcode = 'P0001';
    end if;
  end if;

  -- Admin-only fields — never rep-writable.
  if new.approved_at is distinct from old.approved_at then
    raise exception 'REP_FIELD_LOCKED:approved_at' using errcode = 'P0001';
  end if;
  if new.approved_by is distinct from old.approved_by then
    raise exception 'REP_FIELD_LOCKED:approved_by' using errcode = 'P0001';
  end if;
  if new.suspended_at is distinct from old.suspended_at then
    raise exception 'REP_FIELD_LOCKED:suspended_at' using errcode = 'P0001';
  end if;
  if new.suspended_reason is distinct from old.suspended_reason then
    raise exception 'REP_FIELD_LOCKED:suspended_reason' using errcode = 'P0001';
  end if;

  -- Tax/payout/legal: editable only during initial onboarding, frozen after.
  if not v_in_initial_onboarding then
    if new.tax_id is distinct from old.tax_id then
      raise exception 'REP_FIELD_LOCKED:tax_id' using errcode = 'P0001';
    end if;
    if new.tax_id_kind is distinct from old.tax_id_kind then
      raise exception 'REP_FIELD_LOCKED:tax_id_kind' using errcode = 'P0001';
    end if;
    if new.legal_name is distinct from old.legal_name then
      raise exception 'REP_FIELD_LOCKED:legal_name' using errcode = 'P0001';
    end if;
    if new.business_type is distinct from old.business_type then
      raise exception 'REP_FIELD_LOCKED:business_type' using errcode = 'P0001';
    end if;
    if new.payout_method is distinct from old.payout_method then
      raise exception 'REP_FIELD_LOCKED:payout_method' using errcode = 'P0001';
    end if;
    if new.payout_account_masked is distinct from old.payout_account_masked then
      raise exception 'REP_FIELD_LOCKED:payout_account_masked' using errcode = 'P0001';
    end if;
    if new.payout_account_ref is distinct from old.payout_account_ref then
      raise exception 'REP_FIELD_LOCKED:payout_account_ref' using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists sales_reps_lock_columns on public.sales_reps;
create trigger sales_reps_lock_columns before update on public.sales_reps
  for each row execute function public.sales_reps_enforce_locked_columns();

-- ─────────────────────────────────────────────────────────────────────────
-- 3. RLS — rep reads/updates own row; admin full access. No anon. INSERT is
--    admin-only directly; the c2 accept_rep_invitation RPC (SECURITY DEFINER)
--    creates the pending_invite shell.
-- ─────────────────────────────────────────────────────────────────────────
alter table public.sales_reps enable row level security;

create policy sales_reps_self_select on public.sales_reps for select
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy sales_reps_self_update on public.sales_reps for update
  using (id = (select auth.uid()) or (select public.is_admin()))
  with check (id = (select auth.uid()) or (select public.is_admin()));
create policy sales_reps_admin_insert on public.sales_reps for insert
  with check ((select public.is_admin()));
create policy sales_reps_admin_delete on public.sales_reps for delete
  using ((select public.is_admin()));

-- ─────────────────────────────────────────────────────────────────────────
-- 4. sales_reps_safe — masking view for admin lists. security_invoker so the
--    querying user's RLS applies (avoids the security_definer_view ERROR
--    advisor). Drops the two sensitive raw values; keeps payout_account_masked.
-- ─────────────────────────────────────────────────────────────────────────
create view public.sales_reps_safe
with (security_invoker = true) as
  select
    id, status, legal_name, tax_id_kind, business_type,
    payout_method, payout_account_masked,
    address_line1, address_line2, address_city, address_state,
    address_postal_code, address_country, phone, bio, headshot_url,
    linkedin_url, territory_states, specialty_categories,
    suspended_reason, suspended_at, approved_at, approved_by,
    onboarding_completed_at, created_at, updated_at
  from public.sales_reps;

comment on view public.sales_reps_safe is
  'Tax/payout-masked projection of sales_reps (security_invoker). Use for admin lists; tax_id + payout_account_ref are NEVER exposed here.';

-- ─────────────────────────────────────────────────────────────────────────
-- 5. is_active_rep() — gate helper. Mirrors is_admin() (sql/stable/definer,
--    granted anon + authenticated so it is safe to call from any RLS policy).
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.is_active_rep()
returns boolean
language sql
stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.sales_reps
    where id = (select auth.uid()) and status = 'active'
  )
$$;

revoke all on function public.is_active_rep() from public;
grant execute on function public.is_active_rep() to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- 6. COGS snapshot column on order_items (additive; legacy rows = 0).
-- ─────────────────────────────────────────────────────────────────────────
alter table public.order_items
  add column unit_cost_cents integer not null default 0 check (unit_cost_cents >= 0);

comment on column public.order_items.unit_cost_cents is
  'Per-unit COGS snapshot at order time (product_prices.cogs_cents). Feeds the margin-base commission engine. Legacy rows = 0.';

-- ─────────────────────────────────────────────────────────────────────────
-- 7. Extend create_order_with_items to snapshot COGS into unit_cost_cents.
--    Body identical to 0011 except the order_items INSERT now also writes
--    coalesce(pr.cogs_cents, 0). create-or-replace = no signature change.
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.create_order_with_items(
  p_items jsonb,        -- [{product_slug, product_name, strength_label, quantity}]
  p_shipping jsonb,
  p_code text
) returns table(order_id uuid, subtotal_cents int, discount_cents int, total_cents int)
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_org_id uuid;
  v_org_status text;
  v_order_id uuid;
  v_subtotal int := 0;
  v_line record;
  v_discount int := 0;
  v_total int;
  v_aff_id uuid;
  v_code_id uuid;
  v_discount_pct numeric := 0;
  v_line_cost int;
begin
  if v_uid is null then raise exception 'not authenticated' using errcode = '28000'; end if;

  -- Approval gate (authoritative). The RPC is the ONLY insert path into orders
  -- (orders INSERT RLS = with check(false)), so an unapproved org cannot order.
  select p.organization_id, o.approval_status
    into v_org_id, v_org_status
    from public.profiles p
    left join public.organizations o on o.id = p.organization_id
   where p.id = v_uid;
  if v_org_id is null then
    raise exception 'no organization' using errcode = '42501';
  end if;
  if v_org_status is distinct from 'approved' then
    raise exception 'organization not approved' using errcode = '42501';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'items required' using errcode = '22023';
  end if;
  if jsonb_array_length(p_items) > 50 then
    raise exception 'too many items' using errcode = '22023';
  end if;
  if p_shipping is null or jsonb_typeof(p_shipping) <> 'object' then
    raise exception 'shipping address required' using errcode = '22023';
  end if;

  if p_code is not null and length(trim(p_code)) > 0 then
    select c.id, c.affiliate_id, c.discount_pct
      into v_code_id, v_aff_id, v_discount_pct
      from public.affiliate_codes c
     where upper(c.code) = upper(trim(p_code))
           and c.active
           and (c.expires_at is null or c.expires_at > now())
     limit 1;
    if v_code_id is null then
      raise exception 'invalid affiliate code' using errcode = '22023';
    end if;

    if exists (
      select 1 from public.affiliates a
      join public.profiles p on p.email = a.email
      where a.id = v_aff_id and p.id = v_uid
    ) then
      raise exception 'self-referral not allowed' using errcode = '42501';
    end if;
  end if;

  insert into public.orders (user_id, organization_id, shipping_address, applied_code_id, affiliate_id)
    values (v_uid, v_org_id, p_shipping, v_code_id, v_aff_id)
    returning id into v_order_id;

  for v_line in
    select (i->>'product_slug')::text  as slug,
           (i->>'product_name')::text  as name,
           (i->>'strength_label')::text as strength,
           coalesce((i->>'quantity')::int, 0) as qty
      from jsonb_array_elements(p_items) as i
  loop
    if v_line.qty < 1 or v_line.qty > 99 then
      raise exception 'bad quantity for %', v_line.slug using errcode = '22023';
    end if;
    if v_line.name is null or length(v_line.name) = 0 then
      raise exception 'product_name required for %', v_line.slug using errcode = '22023';
    end if;

    insert into public.order_items (order_id, product_slug, product_name, strength_label,
                                    quantity, unit_price_cents, unit_cost_cents, line_total_cents)
    select v_order_id, pr.product_slug, v_line.name, pr.strength_label,
           v_line.qty, pr.price_cents, coalesce(pr.cogs_cents, 0), pr.price_cents * v_line.qty
      from public.product_prices pr
     where pr.product_slug = v_line.slug
       and pr.strength_label = v_line.strength
       and pr.active
     returning line_total_cents into v_line_cost;

    if v_line_cost is null then
      raise exception 'no active price for % %', v_line.slug, v_line.strength using errcode = '22023';
    end if;
    v_subtotal := v_subtotal + v_line_cost;
  end loop;

  if v_discount_pct > 0 then
    v_discount := floor(v_subtotal * v_discount_pct / 100.0);
  end if;
  v_total := v_subtotal - v_discount;

  update public.orders
     set subtotal_cents = v_subtotal,
         discount_cents = v_discount,
         total_cents = v_total
   where id = v_order_id;

  return query select v_order_id, v_subtotal, v_discount, v_total;
end $$;
