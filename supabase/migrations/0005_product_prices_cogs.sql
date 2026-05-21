-- 0005_product_prices_cogs.sql
-- Adds cogs_cents to product_prices for COGS tracking (admin/finance use).
-- COGS = wholesale cost of goods sold per unit. Listed website price reflects
-- a 300% markup applied to COGS (i.e. cogs_cents = price_cents / 3).
-- Column is nullable so existing rows are unaffected.

alter table public.product_prices
  add column if not exists cogs_cents integer
    check (cogs_cents is null or cogs_cents >= 0);

comment on column public.product_prices.cogs_cents is
  'Cost of goods sold per unit, in cents. Listed price_cents is the website price (300% markup applied to COGS, i.e. cogs_cents = price_cents / 3). Not exposed to customers; admin/finance use only.';
