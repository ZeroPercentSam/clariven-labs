-- Idempotency log for onboarding drip emails: one row per (organization, drip
-- kind), so each staged follow-up fires at most once per client. Written only by
-- the service-role cron (/api/cron/drips); admins may read for visibility.

create table public.drip_sends (
  id              bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  drip_kind       text not null,
  sent_at         timestamptz not null default now(),
  unique (organization_id, drip_kind)
);

create index drip_sends_org_idx on public.drip_sends(organization_id);

alter table public.drip_sends enable row level security;

-- Admin-only read (the cron uses the service role, which bypasses RLS). No
-- insert/update/delete policy → only the service role can write.
create policy drip_sends_admin_read on public.drip_sends
  for select to authenticated
  using ((select public.is_admin()));

comment on table public.drip_sends is
  'Idempotency log for onboarding drip emails — one row per (organization_id, drip_kind). Service-role (cron) writes; admins read.';
