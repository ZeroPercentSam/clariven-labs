-- 0019_rep_affiliate_codes.sql
-- Phase 4, c5 — rep-minted affiliate codes + the commission code-path. Ported +
-- RUO-adapted from Purity 065/067/097.
--
--   • affiliate_codes gains rep ownership: affiliate_id becomes nullable, a code
--     is XOR partner (affiliate_id) vs rep (rep_user_id), plus an approval
--     workflow (pending → active/rejected). Existing partner codes default to
--     'active' so nothing changes for them.
--   • Only approval_status='active' codes validate / apply (validate_affiliate_code
--     + create_order_with_items both gain the guard) — a pending rep code can't
--     discount an order yet.
--   • write_rep_commission_for_order gains the code path (precedence: an active
--     org_assignment wins; else, if the order applied a rep-owned code whose rep
--     is active, credit that rep at the default rate).
--   • Rep RLS: a rep reads own codes + self-mints pending ones; a lock trigger
--     freezes approval/admin fields for non-admins.

-- ─────────────────────────────────────────────────────────────────────────
-- 1. Columns + XOR origin constraint.
-- ─────────────────────────────────────────────────────────────────────────
alter table public.affiliate_codes
  alter column affiliate_id drop not null,
  -- ON DELETE CASCADE (not SET NULL): the XOR check below forbids a row with
  -- both origins null, so a rep deletion must remove their codes, not null them
  -- out. Mirrors the partner side (affiliate_id → affiliates ON DELETE CASCADE).
  add column rep_user_id     uuid references public.profiles(id) on delete cascade,
  add column approval_status text not null default 'active'
    check (approval_status in ('pending', 'active', 'rejected')),
  add column rejected_reason text,
  add column approved_at     timestamptz,
  add column approved_by     uuid references auth.users(id) on delete set null,
  add column rejected_at     timestamptz,
  add column rejected_by     uuid references auth.users(id) on delete set null;

-- A code is owned by EITHER a partner (affiliate_id) OR a rep (rep_user_id).
-- Existing rows (affiliate_id set, rep_user_id null) satisfy this.
alter table public.affiliate_codes
  add constraint affiliate_codes_origin_xor check (
    (affiliate_id is not null and rep_user_id is null)
    or (affiliate_id is null and rep_user_id is not null)
  );

create index affiliate_codes_rep_idx on public.affiliate_codes(rep_user_id);
create index affiliate_codes_approved_by_idx on public.affiliate_codes(approved_by);
create index affiliate_codes_rejected_by_idx on public.affiliate_codes(rejected_by);

-- ─────────────────────────────────────────────────────────────────────────
-- 2. Lock trigger — a non-admin (the owning rep) may not touch approval/admin
--    fields. Admins bypass. (RLS already scopes a rep to their own pending row.)
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.affiliate_codes_enforce_rep_lock()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select public.is_admin()) then
    return new;
  end if;
  if new.approval_status is distinct from old.approval_status then
    raise exception 'CODE_FIELD_LOCKED:approval_status' using errcode = 'P0001';
  end if;
  if new.affiliate_id is distinct from old.affiliate_id
     or new.rep_user_id is distinct from old.rep_user_id
     or new.approved_at is distinct from old.approved_at
     or new.approved_by is distinct from old.approved_by
     or new.rejected_at is distinct from old.rejected_at
     or new.rejected_by is distinct from old.rejected_by
     or new.rejected_reason is distinct from old.rejected_reason then
    raise exception 'CODE_FIELD_LOCKED' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

revoke all on function public.affiliate_codes_enforce_rep_lock() from public, anon, authenticated;

drop trigger if exists affiliate_codes_rep_lock on public.affiliate_codes;
create trigger affiliate_codes_rep_lock before update on public.affiliate_codes
  for each row execute function public.affiliate_codes_enforce_rep_lock();

-- ─────────────────────────────────────────────────────────────────────────
-- 3. RLS — single policy per action (no multiple-permissive WARN). Replaces the
--    admin read/insert/update policies (0002) with admin-OR-rep variants; the
--    admin delete policy stays (reps never delete).
-- ─────────────────────────────────────────────────────────────────────────
drop policy if exists aff_code_admin_read on public.affiliate_codes;
drop policy if exists aff_code_admin_ins on public.affiliate_codes;
drop policy if exists aff_code_admin_upd on public.affiliate_codes;

create policy aff_code_select on public.affiliate_codes for select
  using (rep_user_id = (select auth.uid()) or (select public.is_admin()));

create policy aff_code_insert on public.affiliate_codes for insert
  with check (
    (select public.is_admin())
    or (
      rep_user_id = (select auth.uid())
      and affiliate_id is null
      and approval_status = 'pending'
      and (select public.is_active_rep())
    )
  );

create policy aff_code_update on public.affiliate_codes for update
  using (
    (select public.is_admin())
    or (rep_user_id = (select auth.uid()) and approval_status = 'pending')
  )
  with check (
    (select public.is_admin())
    or (rep_user_id = (select auth.uid()) and approval_status = 'pending')
  );

-- ─────────────────────────────────────────────────────────────────────────
-- 4. Active-only guards on the public validation + the order RPC. A pending or
--    rejected (rep) code must not validate or apply.
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.validate_affiliate_code(p_code text)
returns table(valid boolean, discount_pct numeric)
language sql stable security definer set search_path = public as $$
  select true, c.discount_pct
    from public.affiliate_codes c
   where upper(c.code) = upper(trim(p_code))
     and c.active
     and c.approval_status = 'active'
     and (c.expires_at is null or c.expires_at > now())
   limit 1;
$$;

-- create_order_with_items: same body as 0015, with the code lookup additionally
-- requiring approval_status='active' (so pending rep codes don't apply).
create or replace function public.create_order_with_items(
  p_items jsonb,
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
           and c.approval_status = 'active'
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

-- ─────────────────────────────────────────────────────────────────────────
-- 5. write_rep_commission_for_order — add the code path. Precedence: an active
--    org_assignment wins; else credit the order's rep-owned code (active rep).
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.write_rep_commission_for_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order record;
  v_assignment record;
  v_code record;
  v_rate numeric(5,4);
  v_base_cents integer;
  v_cogs_cents integer;
  v_commission_cents integer;
  c_default_rate constant numeric(5,4) := 0.20;
begin
  if exists (
    select 1 from public.rep_commissions
    where order_id = p_order_id and parent_commission_id is null
  ) then
    return;
  end if;

  select id, organization_id, subtotal_cents, discount_cents, applied_code_id
    into v_order
    from public.orders
   where id = p_order_id;
  if not found then return; end if;

  select coalesce(sum(unit_cost_cents * quantity), 0)::integer
    into v_cogs_cents
    from public.order_items
   where order_id = p_order_id;

  v_base_cents := greatest(
    0,
    coalesce(v_order.subtotal_cents, 0)
      - coalesce(v_order.discount_cents, 0)
      - coalesce(v_cogs_cents, 0)
  );

  -- Path 1 — org_assignment (single active, commission-enabled).
  select id, rep_user_id, commission_pct
    into v_assignment
    from public.rep_org_assignments
   where organization_id = v_order.organization_id
     and ended_at is null
     and commission_enabled = true
   limit 1;
  if found then
    v_rate := coalesce(v_assignment.commission_pct, c_default_rate);
    v_commission_cents := floor(v_base_cents::numeric * v_rate);
    insert into public.rep_commissions (
      rep_user_id, order_id, organization_id, source, assignment_id,
      base_cents, cogs_cents, rate, commission_cents, status, earned_at
    ) values (
      v_assignment.rep_user_id, v_order.id, v_order.organization_id, 'org_assignment',
      v_assignment.id, v_base_cents, v_cogs_cents, v_rate, v_commission_cents, 'earned', now()
    );
    return;
  end if;

  -- Path 2 — affiliate-code fallback (rep-owned code + active rep).
  if v_order.applied_code_id is null then return; end if;
  select c.id as code_id, c.rep_user_id, sr.status as rep_status
    into v_code
    from public.affiliate_codes c
    left join public.sales_reps sr on sr.id = c.rep_user_id
   where c.id = v_order.applied_code_id
     and c.rep_user_id is not null;
  if not found or v_code.rep_status is distinct from 'active' then
    return;
  end if;

  v_rate := c_default_rate;
  v_commission_cents := floor(v_base_cents::numeric * v_rate);
  insert into public.rep_commissions (
    rep_user_id, order_id, organization_id, source, code_id,
    base_cents, cogs_cents, rate, commission_cents, status, earned_at
  ) values (
    v_code.rep_user_id, v_order.id, v_order.organization_id, 'code',
    v_code.code_id, v_base_cents, v_cogs_cents, v_rate, v_commission_cents, 'earned', now()
  );
end;
$$;

revoke all on function public.write_rep_commission_for_order(uuid) from public, anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- 6. rep_my_orgs() — the caller's actively-assigned orgs (id/name/slug). A rep
--    is not an org member, so org-scoped RLS hides organizations from them; this
--    definer helper exposes ONLY the orgs they're assigned to, for the rep
--    portal (names on the commissions/orgs pages). Authenticated-only; returns
--    empty for non-reps.
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.rep_my_orgs()
returns table(id uuid, name text, slug text)
language sql stable security definer set search_path = '' as $$
  select o.id, o.name, o.slug
  from public.organizations o
  join public.rep_org_assignments a on a.organization_id = o.id
  where a.rep_user_id = (select auth.uid()) and a.ended_at is null;
$$;
revoke all on function public.rep_my_orgs() from public, anon;
grant execute on function public.rep_my_orgs() to authenticated;
