-- 0007_product_prices_cost_hiding.sql
-- Cost-leak hardening (Phase 2B / M2B.4).
--
-- product_prices.cogs_cents is admin/finance-only and must NEVER reach a
-- customer payload. RLS is row-level, not column-level, and the prior
-- `price_read` policy exposed active rows (incl. cogs_cents) to anon +
-- authenticated. This migration:
--   1. Corrects the markup comment: retail = COGS * 4 (cost + 300%), per the
--      client pricing sheet. (Migration 0005 wrongly said /3.)
--   2. Restricts base-table SELECT to admins only; revokes anon SELECT.
--   3. Adds a SECURITY DEFINER function `list_public_prices()` exposing ONLY
--      the customer-safe columns (no cogs_cents) for active SKUs. Customer
--      catalog / PDP / reorder reads go through this function.

comment on column public.product_prices.cogs_cents is
  'Cost of goods sold per unit, in cents (Azoth Tier-1 wholesale). Listed price_cents = cogs_cents * 4 (cost + 300% markup) per the Clariven internal pricing sheet. Admin/finance only — NEVER exposed to customers (see list_public_prices()).';

-- Lock base-table reads to admins. Customers use list_public_prices().
drop policy if exists price_read on public.product_prices;
create policy price_admin_read on public.product_prices
  for select
  using ((select public.is_admin()));

-- Defense in depth: anon never touches the base table.
revoke select on public.product_prices from anon;

-- Customer-safe price reader. No cogs_cents in the projection. Bypasses the
-- admin-only RLS via SECURITY DEFINER so anon/authenticated can read retail.
create or replace function public.list_public_prices(p_slug text default null)
returns table (
  product_slug text,
  strength_label text,
  price_cents integer,
  currency text
)
language sql
stable
security definer
set search_path = ''
as $$
  select pp.product_slug, pp.strength_label, pp.price_cents, pp.currency
  from public.product_prices pp
  where pp.active = true
    and (p_slug is null or pp.product_slug = p_slug)
$$;

revoke all on function public.list_public_prices(text) from public;
grant execute on function public.list_public_prices(text) to anon, authenticated;

comment on function public.list_public_prices(text) is
  'Customer-facing retail price reader for active SKUs. Returns ONLY safe columns (no cogs_cents). Optional p_slug filters to one product. SECURITY DEFINER so it can read past the admin-only RLS on product_prices.';
