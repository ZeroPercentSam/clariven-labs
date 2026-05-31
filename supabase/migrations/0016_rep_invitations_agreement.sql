-- 0016_rep_invitations_agreement.sql
-- Phase 4, c2 — Rep invitations + ICA agreement versioning + onboarding support.
-- Ported + RUO-adapted from Purity 056/057.
--
-- 1. rep_invitations — admin-minted invite tokens (14d expiry). Read/written by
--    the anon get_rep_invitation_preview + authenticated accept_rep_invitation
--    SECURITY DEFINER RPCs (table RLS is admin-only; the definer RPCs are the
--    sanctioned anon/rep paths).
-- 2. accept_rep_invitation — RUO-adapted: Clariven has no user_roles /
--    user_profiles / is_staff. Acceptance just creates the sales_reps shell
--    (status pending_invite) after guarding: authenticated, email match, caller
--    is NOT a customer (no org / no org_members), caller is NOT an admin, and is
--    not already a rep. The definer RPC bypasses the admin-only sales_reps INSERT
--    RLS — it is the one sanctioned writer of the pending_invite shell.
-- 3. rep_agreement_versions (single-current, retire-prior trigger) +
--    rep_agreement_consents (one per rep+version). ICA v1.0 seeded =
--    Clariven Labs LLC, Wyoming (Cheyenne venue), E-SIGN, RUO. Counsel-review
--    draft (flagged in the body, like the Phase-2 legal pages).

-- ─────────────────────────────────────────────────────────────────────────
-- 1. rep_invitations
-- ─────────────────────────────────────────────────────────────────────────
create table public.rep_invitations (
  id                  uuid primary key default gen_random_uuid(),
  email               text not null,
  token               text not null unique default replace(gen_random_uuid()::text, '-', ''),
  status              text not null default 'pending'
    check (status in ('pending', 'accepted', 'revoked', 'expired')),
  expires_at          timestamptz not null default (now() + interval '14 days'),
  invited_by_admin_id uuid references auth.users(id) on delete set null,
  invitation_note     text,
  created_at          timestamptz not null default now(),
  accepted_at         timestamptz,
  accepted_user_id    uuid references auth.users(id) on delete set null,
  revoked_at          timestamptz,
  revoked_reason      text
);

comment on table public.rep_invitations is
  'Admin-minted rep invitation tokens (14d). Read via get_rep_invitation_preview (anon); consumed via accept_rep_invitation (authenticated). Table RLS is admin-only.';

create index rep_invitations_email_idx on public.rep_invitations(lower(email));
create index rep_invitations_invited_by_idx on public.rep_invitations(invited_by_admin_id);
create index rep_invitations_accepted_user_idx on public.rep_invitations(accepted_user_id);

alter table public.rep_invitations enable row level security;

create policy rep_invitations_admin_all on public.rep_invitations for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ─────────────────────────────────────────────────────────────────────────
-- 2a. get_rep_invitation_preview — anon-callable sanitized preview.
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.get_rep_invitation_preview(p_token text)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inv record;
begin
  select email, status, expires_at, invitation_note
  into v_inv
  from public.rep_invitations
  where token = p_token;

  if not found then
    return null;
  end if;

  return json_build_object(
    'email', v_inv.email,
    'status', v_inv.status,
    'expires_at', v_inv.expires_at,
    'invitation_note', v_inv.invitation_note,
    'is_expired', v_inv.expires_at < now()
  );
end;
$$;

revoke all on function public.get_rep_invitation_preview(text) from public;
grant execute on function public.get_rep_invitation_preview(text) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- 2b. accept_rep_invitation — authenticated; creates the sales_reps shell.
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.accept_rep_invitation(p_token text)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inv record;
  v_user_id uuid := (select auth.uid());
  v_user_email text;
  v_profile record;
begin
  if v_user_id is null then
    raise exception 'UNAUTHENTICATED' using errcode = 'P0001';
  end if;

  select id, email, status, expires_at
  into v_inv
  from public.rep_invitations
  where token = p_token
  for update;

  if not found then
    raise exception 'REP_INVITATION_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_inv.status = 'accepted' then
    raise exception 'REP_INVITATION_ALREADY_ACCEPTED' using errcode = 'P0001';
  end if;
  if v_inv.status = 'revoked' then
    raise exception 'REP_INVITATION_REVOKED' using errcode = 'P0001';
  end if;
  if v_inv.expires_at < now() then
    update public.rep_invitations set status = 'expired' where id = v_inv.id;
    raise exception 'REP_INVITATION_EXPIRED' using errcode = 'P0001';
  end if;

  select email into v_user_email from auth.users where id = v_user_id;
  if v_user_email is null or lower(v_user_email) <> lower(v_inv.email) then
    raise exception 'REP_INVITATION_EMAIL_MISMATCH' using errcode = 'P0001';
  end if;

  -- A rep is NOT a customer and NOT an admin. Block if the caller is linked to
  -- a customer org (denormalized pointer OR a membership row) or is an admin.
  select role, organization_id into v_profile
  from public.profiles where id = v_user_id;
  if v_profile.organization_id is not null
     or exists (select 1 from public.org_members where user_id = v_user_id) then
    raise exception 'REP_USER_ALREADY_IN_ORG' using errcode = 'P0001';
  end if;
  if v_profile.role = 'admin' then
    raise exception 'REP_USER_IS_ADMIN' using errcode = 'P0001';
  end if;

  -- Create the rep shell (status defaults to pending_invite). Idempotent: a
  -- re-accept after a prior shell exists is a no-op insert + still marks the
  -- invitation accepted.
  insert into public.sales_reps (id) values (v_user_id)
  on conflict (id) do nothing;

  update public.rep_invitations
  set status = 'accepted', accepted_at = now(), accepted_user_id = v_user_id
  where id = v_inv.id;

  return json_build_object('ok', true, 'user_id', v_user_id);
end;
$$;

-- authenticated-only (the body also raises UNAUTHENTICATED on a null uid). Supabase
-- default privileges auto-grant EXECUTE to anon+authenticated on every function, so
-- revoke anon explicitly to drop the unintended anon affordance.
revoke all on function public.accept_rep_invitation(text) from public, anon;
grant execute on function public.accept_rep_invitation(text) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- 3. rep_agreement_versions (single-current) + retire-prior trigger.
-- ─────────────────────────────────────────────────────────────────────────
create table public.rep_agreement_versions (
  id           uuid primary key default gen_random_uuid(),
  label        text not null,
  body_md      text not null,
  effective_at timestamptz not null default now(),
  retired_at   timestamptz,
  created_by   uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  constraint rep_agreement_versions_label_nonempty check (length(trim(label)) > 0),
  constraint rep_agreement_versions_body_nonempty  check (length(trim(body_md)) > 0)
);

comment on table public.rep_agreement_versions is
  'Versioned rep ICA (Independent Contractor Agreement). Exactly one current row (retired_at is null), enforced by the retire-prior trigger + partial-unique index.';

create index rep_agreement_versions_created_by_idx on public.rep_agreement_versions(created_by);

-- New current version retires all prior ones.
create or replace function public.rep_agreement_versions_retire_prior()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if NEW.retired_at is null then
    update public.rep_agreement_versions
    set retired_at = now()
    where id <> NEW.id and retired_at is null;
  end if;
  return NEW;
end;
$$;

-- Trigger-only function — never RPC-callable. Revoke from all client roles
-- (Supabase default privileges otherwise auto-grant anon+authenticated EXECUTE).
revoke all on function public.rep_agreement_versions_retire_prior() from public, anon, authenticated;

create trigger trg_rep_agreement_versions_retire_prior
  before insert on public.rep_agreement_versions
  for each row execute function public.rep_agreement_versions_retire_prior();

create unique index idx_rep_agreement_versions_current
  on public.rep_agreement_versions((1))
  where retired_at is null;

alter table public.rep_agreement_versions enable row level security;

-- Public read (it is a contract template, not sensitive); admin-only write.
create policy rep_agreement_versions_read on public.rep_agreement_versions for select
  using (true);
create policy rep_agreement_versions_admin_insert on public.rep_agreement_versions for insert
  with check ((select public.is_admin()));
create policy rep_agreement_versions_admin_update on public.rep_agreement_versions for update
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ─────────────────────────────────────────────────────────────────────────
-- 4. rep_agreement_consents — one signed consent per rep + version.
-- ─────────────────────────────────────────────────────────────────────────
create table public.rep_agreement_consents (
  id                uuid primary key default gen_random_uuid(),
  rep_user_id       uuid not null references public.profiles(id) on delete cascade,
  version_id        uuid not null references public.rep_agreement_versions(id) on delete restrict,
  signed_legal_name text not null,
  signed_at         timestamptz not null default now(),
  ip                text,
  user_agent        text,
  created_at        timestamptz not null default now(),
  constraint rep_agreement_consents_signed_name_nonempty check (length(trim(signed_legal_name)) > 0),
  constraint rep_agreement_consents_one_per_version unique (rep_user_id, version_id)
);

comment on table public.rep_agreement_consents is
  'Rep e-signature consent to a specific ICA version (typed legal name + IP + UA). Unique per (rep_user_id, version_id) — also the onboarding idempotency guard.';

create index rep_agreement_consents_version_idx on public.rep_agreement_consents(version_id);

alter table public.rep_agreement_consents enable row level security;

create policy rep_agreement_consents_self_select on public.rep_agreement_consents for select
  using (rep_user_id = (select auth.uid()) or (select public.is_admin()));
create policy rep_agreement_consents_self_insert on public.rep_agreement_consents for insert
  with check (rep_user_id = (select auth.uid()));
create policy rep_agreement_consents_admin_delete on public.rep_agreement_consents for delete
  using ((select public.is_admin()));

-- ─────────────────────────────────────────────────────────────────────────
-- 5. Seed ICA v1.0 — Clariven Labs LLC, Wyoming. DRAFT pending counsel review.
-- ─────────────────────────────────────────────────────────────────────────
insert into public.rep_agreement_versions (label, body_md) values (
  'v1.0',
  '# Clariven Labs · Sales Representative Agreement

**Version v1.0 — DRAFT, pending legal review.**

This Independent Sales Representative Agreement (this "Agreement") is entered into between **Clariven Labs LLC**, a Wyoming limited liability company ("Company"), and the individual accepting below (the "Representative").

## 1. Independent contractor

Representative is an independent contractor, not an employee, agent, partner, or joint venturer of Company. Representative is solely responsible for all self-employment, income, and other taxes on commissions earned. Company will issue an IRS Form 1099 for commissions paid in any calendar year at or above the applicable IRS reporting threshold. Representative has no authority to bind Company or to make representations on its behalf beyond those expressly authorized in writing.

## 2. Research-use-only conduct

Company sells materials **for research use only (RUO)** — not for human or animal consumption, and not as drugs, foods, cosmetics, or medical devices. Representative shall market and describe Company products **only** in research-use terms and shall make **no** clinical, therapeutic, diagnostic, dosing, or human-use claims of any kind. Representative shall not market to, or knowingly facilitate sales for, human or animal use. Any violation is grounds for immediate termination and forfeiture of unpaid commissions.

## 3. Commissions

Commissions accrue on paid orders attributed to Representative under the precedence rules of the Clariven Labs platform (organization assignment, then attributed code). The commission base is the order **margin** — subtotal less discounts less cost of goods — and the default commission rate is set by Company and may be overridden per assigned organization at Company''s discretion. Cancelled or failed orders reverse (void) the associated commission as recorded in the platform commission ledger.

## 4. Payment terms

Commissions are paid on a schedule set by Company, in arrears, via the method Representative elects during onboarding (ACH, PayPal, or mailed check). Representative is responsible for keeping payout and tax details current and accurate. Company may withhold payment pending resolution of any suspected fraud, chargeback, or compliance violation.

## 5. Confidentiality

Representative shall keep confidential all non-public Company information, including customer and organization details, order and pricing data, cost of goods, and commission terms, during and after the term of this Agreement.

## 6. Compliance with law

Representative shall comply with all applicable federal, state, and local laws and regulations, including those governing the marketing of research chemicals and research-use-only materials, and shall not make any statement that would cause Company products to be misbranded or to be deemed intended for human use.

## 7. Term and termination

Either party may terminate this Agreement at any time, with or without cause, on written notice. Commissions earned and not reversed prior to termination remain payable on the normal schedule. Sections 2, 5, 6, 8, and 9 survive termination.

## 8. No warranty; limitation of liability

Company products are provided "as is" for research use. To the maximum extent permitted by law, Company disclaims all warranties and shall not be liable for any indirect, incidental, special, or consequential damages arising out of this Agreement or Representative''s activities.

## 9. Governing law and venue

This Agreement is governed by the laws of the State of Wyoming, without regard to its conflict-of-laws rules. The exclusive venue for any dispute is the state and federal courts located in **Cheyenne, Wyoming**, and the parties consent to personal jurisdiction there.

## 10. Electronic signature (E-SIGN)

By typing your legal name and submitting the onboarding form, you agree under the federal E-SIGN Act and applicable state law that your typed name is your binding electronic signature on this Agreement, and that you intend to be legally bound by it. Company records the signing name, timestamp, IP address, and user agent as evidence of consent.

_This is a draft template pending review by Company''s legal counsel. Final terms may change._'
);
