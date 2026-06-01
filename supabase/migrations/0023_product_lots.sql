-- Phase 5 (c) — Lot / COA-lite.
-- Physical lots with an expiration date + an optional lot-level COA, plus an
-- idempotency table for the daily lot-expiration alert cron. "Lite": keyed on
-- (product_slug, strength_label) like product_coas — NO product_variants FK, NO
-- qty/inventory (Clariven has no stock model). Admin-only; lot COA files reuse
-- the existing public product-coas bucket.

create table public.product_lots (
  id              uuid primary key default gen_random_uuid(),
  product_slug    text not null,
  strength_label  text not null default '',
  lot_number      text not null,
  expiration_date date not null,
  coa_file_path   text,
  coa_file_name   text,
  coa_file_bytes  integer,
  coa_uploaded_at timestamptz,
  received_at     date,
  notes           text,
  active          boolean not null default true,
  uploaded_by     uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (product_slug, strength_label, lot_number)
);

create index product_lots_product_idx     on public.product_lots (product_slug, strength_label);
create index product_lots_expiration_idx  on public.product_lots (expiration_date);
create index product_lots_active_idx      on public.product_lots (active);
create index product_lots_uploaded_by_idx on public.product_lots (uploaded_by);

create trigger product_lots_updated_at before update on public.product_lots
  for each row execute function public.set_updated_at();

alter table public.product_lots enable row level security;

-- Admin-only everything. No customer/anon exposure this slice (lot COAs are
-- ops-facing; the customer PDP keeps the product-level product_coas).
create policy lots_admin_all on public.product_lots for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Idempotency for the lot-expiration cron: one row per (lot, threshold) already
-- alerted (port of Purity migration 042). The cron writes via the service-role
-- admin client (bypasses RLS); admins may read the history.
create table public.lot_alert_notifications (
  id            uuid primary key default gen_random_uuid(),
  lot_id        uuid not null references public.product_lots(id) on delete cascade,
  threshold_days integer not null check (threshold_days in (90, 60, 30, 14)),
  sent_at       timestamptz not null default now(),
  unique (lot_id, threshold_days)
);

create index lot_alert_notifications_lot_idx on public.lot_alert_notifications (lot_id);

alter table public.lot_alert_notifications enable row level security;

create policy lotalert_admin_all on public.lot_alert_notifications for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
