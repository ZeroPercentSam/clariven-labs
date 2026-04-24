-- User-auth RPCs so the order + signup flows don't depend on the service-
-- role key. Plus audit-log admin insert policy, and a bug fix to the order
-- RPC that crashed when no affiliate code was supplied.

-- ── 1. attach_invoice_to_order — user updates their own pending order
--       with the GBP invoice ids. Runs as SECURITY DEFINER and verifies the
--       caller owns the row.
create or replace function public.attach_invoice_to_order(
  p_order_id uuid,
  p_invoice_id text,
  p_check_id text,
  p_payment_result int
) returns void
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  update public.orders
     set gbp_invoice_id = p_invoice_id,
         gbp_check_id = p_check_id,
         gbp_payment_result = p_payment_result
   where id = p_order_id and user_id = v_uid and status = 'pending_payment';
  if not found then raise exception 'order not found or not pending' using errcode = '42501'; end if;
end $$;
revoke all on function public.attach_invoice_to_order(uuid, text, text, int) from public;
grant execute on function public.attach_invoice_to_order(uuid, text, text, int) to authenticated;

-- ── 2. stamp_referral — user stamps their own profile with the referral
--       fields. Reads the code by name and re-verifies it's active.
create or replace function public.stamp_referral(p_code text)
returns void language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_code_id uuid; v_aff_id uuid;
begin
  if v_uid is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  select id, affiliate_id into v_code_id, v_aff_id
    from public.affiliate_codes
   where upper(code) = upper(trim(p_code))
     and active and (expires_at is null or expires_at > now())
   limit 1;
  if v_code_id is null then return; end if;
  update public.profiles
     set referred_by_code_id = v_code_id,
         referred_by_affiliate_id = v_aff_id
   where id = v_uid
     and referred_by_code_id is null;
end $$;
revoke all on function public.stamp_referral(text) from public;
grant execute on function public.stamp_referral(text) to authenticated;

-- ── 3. admin_audit_log insert policy — admins can insert their own rows so
--       user-auth admin routes don't need the service-role key.
drop policy if exists audit_admin_insert on public.admin_audit_log;
create policy audit_admin_insert on public.admin_audit_log for insert
  with check ((select public.is_admin()) and actor_id = (select auth.uid()));

-- ── 4. Bug fix — create_order_with_items crashed with
--       'record "v_code_row" is not assigned yet' when called with no
--       affiliate code. Replaced the record variable with scalars that are
--       safely initialized.
create or replace function public.create_order_with_items(
  p_items jsonb,
  p_shipping jsonb,
  p_code text
) returns table(order_id uuid, subtotal_cents int, discount_cents int, total_cents int)
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
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

  insert into public.orders (user_id, shipping_address, applied_code_id, affiliate_id)
    values (v_uid, p_shipping, v_code_id, v_aff_id)
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
