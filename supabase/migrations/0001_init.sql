-- ClarivenLabs — initial schema
-- Provides: profiles, affiliates/codes, product_prices, orders/items/messages,
-- admin_audit_log, gbp_notifications, plus RLS and order-creation RPC.

create extension if not exists pgcrypto;
create extension if not exists citext;

-- ── helpers ─────────────────────────────────────────────
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ── tables ──────────────────────────────────────────────

create table public.affiliates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email citext,
  commission_pct numeric(5,2),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger affiliates_updated_at before update on public.affiliates
  for each row execute function public.set_updated_at();

create table public.affiliate_codes (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  code text not null unique,
  discount_pct numeric(5,2) not null check (discount_pct between 0 and 100),
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
create index affiliate_codes_active_upper_code_idx
  on public.affiliate_codes (upper(code)) where active;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext not null unique,
  full_name text,
  phone text,
  shipping_address jsonb,
  role text not null default 'customer' check (role in ('customer','admin')),
  referred_by_affiliate_id uuid references public.affiliates(id),
  referred_by_code_id uuid references public.affiliate_codes(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Guard against customer self-promotion via direct profile update
create or replace function public.guard_profile_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' and new.role is distinct from old.role and auth.role() <> 'service_role' then
    raise exception 'role changes require service role';
  end if;
  return new;
end $$;
create trigger profiles_role_guard before update on public.profiles
  for each row execute function public.guard_profile_role();

-- Auto-create profile row on auth.users insert
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.product_prices (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null,
  strength_label text not null,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'USD',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_slug, strength_label)
);
create index product_prices_slug_active_idx on public.product_prices(product_slug) where active;
create trigger product_prices_updated_at before update on public.product_prices
  for each row execute function public.set_updated_at();

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number serial unique,
  user_id uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'pending_payment' check (status in
    ('pending_payment','processing','paid','preparing','shipped','delivered','cancelled','failed')),
  shipping_address jsonb not null,
  tracking_carrier text,
  tracking_number text,
  notes_internal text,
  subtotal_cents integer not null default 0,
  discount_cents integer not null default 0,
  total_cents integer not null default 0,
  applied_code_id uuid references public.affiliate_codes(id),
  affiliate_id uuid references public.affiliates(id),
  gbp_invoice_id text unique,
  gbp_check_id text,
  gbp_payment_result integer,
  gbp_last_polled_at timestamptz,
  gbp_paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_user_created_idx on public.orders(user_id, created_at desc);
create index orders_pending_idx on public.orders(status) where status in ('pending_payment','processing');
create index orders_affiliate_idx on public.orders(affiliate_id);
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_slug text not null,
  product_name text not null,
  strength_label text not null,
  quantity integer not null check (quantity > 0 and quantity <= 99),
  unit_price_cents integer not null,
  line_total_cents integer not null,
  created_at timestamptz not null default now()
);
create index order_items_order_idx on public.order_items(order_id);

create table public.order_messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  author_role text not null check (author_role in ('customer','admin')),
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now()
);
create index order_messages_order_idx on public.order_messages(order_id, created_at);

create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id),
  action text not null,
  target_type text not null,
  target_id text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);
create index admin_audit_actor_idx on public.admin_audit_log(actor_id, created_at desc);
create index admin_audit_target_idx on public.admin_audit_log(target_type, target_id, created_at desc);

create table public.gbp_notifications (
  id bigint primary key,
  message text not null,
  entry_client_id bigint,
  invoice_id text,
  time_created timestamptz,
  pulled_at timestamptz not null default now(),
  processed_at timestamptz
);

-- ── admin check helper ──────────────────────────────────
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')
$$;
grant execute on function public.is_admin() to anon, authenticated;

-- ── atomic order creation RPC ───────────────────────────
create or replace function public.create_order_with_items(
  p_items jsonb,        -- [{product_slug, product_name, strength_label, quantity}]
  p_shipping jsonb,
  p_code text
) returns table(order_id uuid, subtotal_cents int, discount_cents int, total_cents int)
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_order_id uuid;
  v_subtotal int := 0;
  v_line record;
  v_code_row record;
  v_discount int := 0;
  v_total int;
  v_aff_id uuid;
  v_code_id uuid;
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

  -- Resolve affiliate code (if any)
  if p_code is not null and length(trim(p_code)) > 0 then
    select c.id as code_id, c.affiliate_id, c.discount_pct
      into v_code_row
      from public.affiliate_codes c
     where upper(c.code) = upper(trim(p_code))
           and c.active
           and (c.expires_at is null or c.expires_at > now())
     limit 1;
    if not found then raise exception 'invalid affiliate code' using errcode = '22023'; end if;

    -- Prevent self-referral
    if exists (
      select 1 from public.affiliates a
      join public.profiles p on p.email = a.email
      where a.id = v_code_row.affiliate_id and p.id = v_uid
    ) then
      raise exception 'self-referral not allowed' using errcode = '42501';
    end if;

    v_aff_id := v_code_row.affiliate_id;
    v_code_id := v_code_row.code_id;
  end if;

  -- Create order shell
  insert into public.orders (user_id, shipping_address, applied_code_id, affiliate_id)
    values (v_uid, p_shipping, v_code_id, v_aff_id)
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

  if v_code_row.discount_pct is not null then
    v_discount := floor(v_subtotal * v_code_row.discount_pct / 100.0);
  end if;
  v_total := v_subtotal - v_discount;

  update public.orders
     set subtotal_cents = v_subtotal,
         discount_cents = v_discount,
         total_cents = v_total
   where id = v_order_id;

  return query select v_order_id, v_subtotal, v_discount, v_total;
end $$;
revoke all on function public.create_order_with_items(jsonb, jsonb, text) from public;
grant execute on function public.create_order_with_items(jsonb, jsonb, text) to authenticated;

-- Public-callable RPC for validating an affiliate code at checkout
create or replace function public.validate_affiliate_code(p_code text)
returns table(valid boolean, discount_pct numeric)
language sql stable security definer set search_path = public as $$
  with hit as (
    select c.discount_pct from public.affiliate_codes c
     where upper(c.code) = upper(trim(p_code))
       and c.active
       and (c.expires_at is null or c.expires_at > now())
     limit 1
  )
  select exists(select 1 from hit) as valid,
         (select discount_pct from hit) as discount_pct
$$;
grant execute on function public.validate_affiliate_code(text) to anon, authenticated;

-- ── RLS ─────────────────────────────────────────────────
alter table public.profiles          enable row level security;
alter table public.affiliates        enable row level security;
alter table public.affiliate_codes   enable row level security;
alter table public.product_prices    enable row level security;
alter table public.orders            enable row level security;
alter table public.order_items       enable row level security;
alter table public.order_messages    enable row level security;
alter table public.admin_audit_log   enable row level security;
alter table public.gbp_notifications enable row level security;

-- profiles
create policy prof_self_read  on public.profiles for select
  using (auth.uid() = id or public.is_admin());
create policy prof_self_upd   on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
create policy prof_admin_all  on public.profiles for all
  using (public.is_admin()) with check (public.is_admin());

-- product_prices (public read when active; admin all)
create policy price_public_read on public.product_prices for select
  using (active or public.is_admin());
create policy price_admin_all   on public.product_prices for all
  using (public.is_admin()) with check (public.is_admin());

-- affiliates & codes (admin only; customers use validate_affiliate_code RPC)
create policy aff_admin       on public.affiliates      for all
  using (public.is_admin()) with check (public.is_admin());
create policy aff_code_admin  on public.affiliate_codes for all
  using (public.is_admin()) with check (public.is_admin());

-- orders
create policy ord_own_read   on public.orders for select
  using (auth.uid() = user_id or public.is_admin());
-- inserts only via create_order_with_items RPC (SECURITY DEFINER bypasses RLS)
create policy ord_no_direct_ins on public.orders for insert with check (false);
create policy ord_admin_upd  on public.orders for update
  using (public.is_admin()) with check (public.is_admin());

-- order_items: read via parent order; writes via RPC or admin
create policy item_read on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));
create policy item_no_direct_ins on public.order_items for insert with check (false);
create policy item_admin_upd on public.order_items for update
  using (public.is_admin()) with check (public.is_admin());

-- order_messages
create policy msg_read on public.order_messages for select
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));
create policy msg_ins on public.order_messages for insert with check (
  (author_role = 'customer' and author_id = auth.uid()
     and exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()))
  or
  (author_role = 'admin' and public.is_admin() and author_id = auth.uid())
);

-- admin_audit_log: admin read only (writes happen via service role which bypasses RLS)
create policy audit_admin_read on public.admin_audit_log for select
  using (public.is_admin());

-- gbp_notifications: admin read only (writes via service role)
create policy gbpn_admin_read on public.gbp_notifications for select
  using (public.is_admin());
