-- 0006_email_log.sql
-- Phase 1 — write-through telemetry for every transactional email send.
--
-- Captures sent / error / suppressed status so admins can debug the send path
-- and confirm notification gates fire. Ported from the sibling Purity Science
-- schema (033 + 034), with the read/write predicate swapped to Clariven's
-- public.is_admin() (Clariven has no separate "staff" role — admin is staff).
--
-- Invariant 7 (side-effects never roll back the order): callers
-- (lib/email/log.ts -> logEmailEvent) MUST swallow any insert error so the
-- originating mutation (order placement, status transition, cron) commits
-- regardless of the log-row outcome.
--
-- RLS:
--   * INSERT: authenticated OR service_role (customer checkout writes its own
--     order emails; cron writes via service_role which bypasses RLS anyway).
--     Anon sessions cannot pollute the log. Avoids the advisor
--     rls_policy_always_true flag that a bare `with check (true)` trips.
--   * SELECT/UPDATE/DELETE: admin-only (to_address is customer PII; the log is
--     append-only evidence).

create table if not exists public.email_log (
  id                uuid primary key default gen_random_uuid(),
  to_address        text not null,
  kind              text not null,
  status            text not null check (status in ('sent', 'error', 'suppressed')),
  subject           text,
  resend_message_id text,
  error             text,
  created_at        timestamptz not null default now()
);

create index if not exists idx_email_log_created_at on public.email_log(created_at desc);
create index if not exists idx_email_log_kind_status on public.email_log(kind, status);
create index if not exists idx_email_log_to_address on public.email_log(to_address);

alter table public.email_log enable row level security;

create policy email_log_authenticated_insert on public.email_log
  for insert
  with check (
    auth.role() = 'authenticated'
    or auth.role() = 'service_role'
  );

create policy email_log_admin_select on public.email_log
  for select
  using ((select public.is_admin()) = true);

create policy email_log_admin_update on public.email_log
  for update
  using ((select public.is_admin()) = true)
  with check ((select public.is_admin()) = true);

create policy email_log_admin_delete on public.email_log
  for delete
  using ((select public.is_admin()) = true);

comment on table public.email_log is
  'Phase 1 — write-through telemetry for every transactional email send. INSERT authenticated/service_role; SELECT/UPDATE/DELETE admin-only.';
