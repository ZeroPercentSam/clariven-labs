-- Client agreements + in-app e-signature consents (mirrors the rep ICA pattern
-- in 0016_rep_invitations_agreement.sql, ported from Purity Science). Lets a
-- client sign Clariven's agreements in-portal (typed legal name = e-signature
-- under the E-SIGN Act) instead of DocuSign. Per-SLUG single-current so the
-- consulting + (future) brokering agreements can both be active at once.

-- 1. Versioned agreement text. One current row PER slug (retired_at is null).
create table public.client_agreements (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null,                 -- 'consulting' | 'brokering'
  label        text not null,                 -- e.g. 'Consulting Services Agreement v1'
  body_md      text not null,                 -- full legal text (markdown); placeholders filled at render
  effective_at timestamptz not null default now(),
  retired_at   timestamptz,
  created_by   uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  constraint client_agreements_slug_nonempty check (length(trim(slug)) > 0),
  constraint client_agreements_body_nonempty check (length(trim(body_md)) > 0)
);
comment on table public.client_agreements is
  'Versioned client agreements (consulting, brokering). Exactly one current row per slug (retired_at is null), enforced by the retire-prior trigger + partial-unique index.';

create index client_agreements_slug_idx on public.client_agreements(slug);

-- A new current version of a slug retires the prior current one of the SAME slug.
create or replace function public.client_agreements_retire_prior()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.retired_at is null then
    update public.client_agreements
    set retired_at = now()
    where slug = NEW.slug and id <> NEW.id and retired_at is null;
  end if;
  return NEW;
end;
$$;
revoke all on function public.client_agreements_retire_prior() from public, anon, authenticated;

create trigger trg_client_agreements_retire_prior
  before insert on public.client_agreements
  for each row execute function public.client_agreements_retire_prior();

create unique index idx_client_agreements_current
  on public.client_agreements(slug)
  where retired_at is null;

alter table public.client_agreements enable row level security;

-- Any authenticated user may read the agreement text (they must see it to sign).
create policy client_agreements_read on public.client_agreements for select
  to authenticated using (true);
create policy client_agreements_admin_insert on public.client_agreements for insert
  to authenticated with check ((select public.is_admin()));
create policy client_agreements_admin_update on public.client_agreements for update
  to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- 2. Signed consents — one per org + version. Immutable once written.
create table public.client_agreement_consents (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null references public.organizations(id) on delete cascade,
  user_id           uuid not null references auth.users(id) on delete restrict,
  version_id        uuid not null references public.client_agreements(id) on delete restrict,
  signed_legal_name text not null,
  signed_at         timestamptz not null default now(),
  ip                text,
  user_agent        text,
  created_at        timestamptz not null default now(),
  unique (organization_id, version_id)
);
comment on table public.client_agreement_consents is
  'E-signature record: which org signed which agreement version, the typed legal name, IP + user-agent. One per (organization_id, version_id) — doubles as the double-submit guard (23505).';

create index client_agreement_consents_org_idx on public.client_agreement_consents(organization_id);

alter table public.client_agreement_consents enable row level security;

-- Org members read their org's consents; admins read all.
create policy client_agreement_consents_read on public.client_agreement_consents for select
  to authenticated
  using (organization_id = (select public.user_org_id()) or (select public.is_admin()));

-- Only an actual org member can sign for their own org (the e-signature is their act).
create policy client_agreement_consents_member_insert on public.client_agreement_consents for insert
  to authenticated
  with check (organization_id = (select public.user_org_id()) and user_id = (select auth.uid()));
