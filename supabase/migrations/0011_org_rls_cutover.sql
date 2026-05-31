-- 0011_org_rls_cutover.sql
-- Phase 3, Commit 2 — BEHAVIORAL cutover. Two coupled changes; ORDER MATTERS:
--   1. Teach create_order_with_items to stamp orders.organization_id from the
--      caller's profile AND enforce the approval gate (raise 42501 unless the
--      caller's org approval_status = 'approved').
--   2. THEN flip orders / order_items / order_messages SELECT RLS from
--      user_id-scoped to org-scoped: org OR user OR admin. The user_id OR is
--      kept one release as defense-in-depth (dropped when
--      orders.organization_id is tightened to NOT NULL in a later migration).
--
-- The RPC is taught to SET organization_id in the SAME migration that makes RLS
-- depend on it — so there is never a window where the column is required but
-- unset. orders INSERT RLS stays `with check (false)`: the SECURITY DEFINER RPC
-- remains the only writer (stronger than the siblings; preserve it).
--
-- Tighten-to-NOT-NULL on orders.organization_id is DEFERRED to its own later
-- migration, run only after this one is verified live (precheck: 0 NULL-org
-- orders). Never in this cutover migration — it would race the 0010 backfill.

-- ─────────────────────────────────────────────────────────────────────────
-- 1. RPC: stamp organization_id + approval gate.
--    MUST be created before the RLS flip below (statement order).
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
  -- (orders INSERT RLS = with check(false)), so an unapproved org cannot order
  -- by any route. Resolve the caller's org + its status in one read.
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

  -- Resolve affiliate code (if any)
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

    -- Prevent self-referral
    if exists (
      select 1 from public.affiliates a
      join public.profiles p on p.email = a.email
      where a.id = v_aff_id and p.id = v_uid
    ) then
      raise exception 'self-referral not allowed' using errcode = '42501';
    end if;
  end if;

  -- Create order shell (now org-stamped)
  insert into public.orders (user_id, organization_id, shipping_address, applied_code_id, affiliate_id)
    values (v_uid, v_org_id, p_shipping, v_code_id, v_aff_id)
    returning id into v_order_id;

  -- Insert items with snapshotted price + name
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
                                    quantity, unit_price_cents, line_total_cents)
    select v_order_id, pr.product_slug, v_line.name, pr.strength_label,
           v_line.qty, pr.price_cents, pr.price_cents * v_line.qty
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
-- 2. RLS cutover — org-scoped SELECT (org OR user OR admin).
--    All volatile/stable calls wrapped in (select ...) for the initplan advisor.
-- ─────────────────────────────────────────────────────────────────────────

-- orders: read own-org OR own-row OR staff.
drop policy if exists ord_read on public.orders;
create policy ord_read on public.orders for select
  using (
    organization_id = (select public.user_org_id())
    or user_id = (select auth.uid())
    or (select public.is_admin())
  );
-- ord_no_direct_ins (with check false) / ord_admin_upd / ord_admin_del unchanged.

-- order_items: read via parent order (org-aware).
drop policy if exists item_read on public.order_items;
create policy item_read on public.order_items for select
  using (exists (
    select 1 from public.orders o
     where o.id = order_id
       and (
         o.organization_id = (select public.user_org_id())
         or o.user_id = (select auth.uid())
         or (select public.is_admin())
       )
  ));

-- order_messages: read via parent order (org-aware).
drop policy if exists msg_read on public.order_messages;
create policy msg_read on public.order_messages for select
  using (exists (
    select 1 from public.orders o
     where o.id = order_id
       and (
         o.organization_id = (select public.user_org_id())
         or o.user_id = (select auth.uid())
         or (select public.is_admin())
       )
  ));

-- order_messages INSERT: a customer may post on any order in their org (or
-- their own row); admin on any. author_id must be the caller.
drop policy if exists msg_ins on public.order_messages;
create policy msg_ins on public.order_messages for insert with check (
  (author_role = 'customer' and author_id = (select auth.uid())
     and exists (
       select 1 from public.orders o
        where o.id = order_id
          and (o.organization_id = (select public.user_org_id())
               or o.user_id = (select auth.uid()))
     ))
  or
  (author_role = 'admin' and (select public.is_admin()) and author_id = (select auth.uid()))
);
