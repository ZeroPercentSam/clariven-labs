-- Fix Supabase advisor findings from 0001_init.sql:
--  * set_updated_at function: add search_path
--  * add FK indexes for 5 columns
--  * rewrite RLS to use (select auth.fn()) caching pattern
--  * merge overlapping permissive policies on profiles + product_prices

-- Note: `citext` in public schema is accepted — moving it would require
-- altering every citext column. Low-risk warning.

-- ── 1. Fix mutable search_path ──────────────────────────
create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

-- ── 2. Add FK indexes ───────────────────────────────────
create index if not exists affiliate_codes_affiliate_idx
  on public.affiliate_codes(affiliate_id);
create index if not exists order_messages_author_idx
  on public.order_messages(author_id);
create index if not exists orders_applied_code_idx
  on public.orders(applied_code_id);
create index if not exists profiles_ref_affiliate_idx
  on public.profiles(referred_by_affiliate_id);
create index if not exists profiles_ref_code_idx
  on public.profiles(referred_by_code_id);

-- ── 3. Rewrite RLS: use (select ...) pattern + merge overlapping ────
-- profiles
drop policy if exists prof_self_read  on public.profiles;
drop policy if exists prof_self_upd   on public.profiles;
drop policy if exists prof_admin_all  on public.profiles;

create policy prof_read on public.profiles for select
  using ((select auth.uid()) = id or (select public.is_admin()));
create policy prof_upd on public.profiles for update
  using ((select auth.uid()) = id or (select public.is_admin()))
  with check ((select auth.uid()) = id or (select public.is_admin()));
create policy prof_admin_ins on public.profiles for insert
  with check ((select public.is_admin()));
create policy prof_admin_del on public.profiles for delete
  using ((select public.is_admin()));

-- product_prices
drop policy if exists price_public_read on public.product_prices;
drop policy if exists price_admin_all   on public.product_prices;

create policy price_read on public.product_prices for select
  using (active or (select public.is_admin()));
create policy price_admin_ins on public.product_prices for insert
  with check ((select public.is_admin()));
create policy price_admin_upd on public.product_prices for update
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy price_admin_del on public.product_prices for delete
  using ((select public.is_admin()));

-- affiliates
drop policy if exists aff_admin on public.affiliates;
create policy aff_admin_read on public.affiliates for select using ((select public.is_admin()));
create policy aff_admin_ins  on public.affiliates for insert with check ((select public.is_admin()));
create policy aff_admin_upd  on public.affiliates for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy aff_admin_del  on public.affiliates for delete using ((select public.is_admin()));

-- affiliate_codes
drop policy if exists aff_code_admin on public.affiliate_codes;
create policy aff_code_admin_read on public.affiliate_codes for select using ((select public.is_admin()));
create policy aff_code_admin_ins  on public.affiliate_codes for insert with check ((select public.is_admin()));
create policy aff_code_admin_upd  on public.affiliate_codes for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy aff_code_admin_del  on public.affiliate_codes for delete using ((select public.is_admin()));

-- orders
drop policy if exists ord_own_read       on public.orders;
drop policy if exists ord_no_direct_ins  on public.orders;
drop policy if exists ord_admin_upd      on public.orders;

create policy ord_read on public.orders for select
  using ((select auth.uid()) = user_id or (select public.is_admin()));
create policy ord_no_direct_ins on public.orders for insert with check (false);
create policy ord_admin_upd on public.orders for update
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy ord_admin_del on public.orders for delete
  using ((select public.is_admin()));

-- order_items
drop policy if exists item_read          on public.order_items;
drop policy if exists item_no_direct_ins on public.order_items;
drop policy if exists item_admin_upd     on public.order_items;

create policy item_read on public.order_items for select
  using (exists (select 1 from public.orders o
                 where o.id = order_id
                 and (o.user_id = (select auth.uid()) or (select public.is_admin()))));
create policy item_no_direct_ins on public.order_items for insert with check (false);
create policy item_admin_upd on public.order_items for update
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy item_admin_del on public.order_items for delete
  using ((select public.is_admin()));

-- order_messages
drop policy if exists msg_read on public.order_messages;
drop policy if exists msg_ins  on public.order_messages;

create policy msg_read on public.order_messages for select
  using (exists (select 1 from public.orders o
                 where o.id = order_id
                 and (o.user_id = (select auth.uid()) or (select public.is_admin()))));
create policy msg_ins on public.order_messages for insert with check (
  (author_role = 'customer' and author_id = (select auth.uid())
     and exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid())))
  or
  (author_role = 'admin' and (select public.is_admin()) and author_id = (select auth.uid()))
);

-- admin_audit_log
drop policy if exists audit_admin_read on public.admin_audit_log;
create policy audit_admin_read on public.admin_audit_log for select
  using ((select public.is_admin()));

-- gbp_notifications
drop policy if exists gbpn_admin_read on public.gbp_notifications;
create policy gbpn_admin_read on public.gbp_notifications for select
  using ((select public.is_admin()));
