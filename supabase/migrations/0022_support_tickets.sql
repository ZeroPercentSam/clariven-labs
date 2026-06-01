-- Phase 5 (b) — Support tickets.
-- Org-scoped customer↔admin ticketing. RLS rides the effective-user definer
-- helpers from 0021 (is_admin()/user_org_id()), so an admin impersonating a
-- customer correctly acts AS that customer, and a real admin (not impersonating)
-- triages everything. No JWT hook, no service-role — same posture as the rest of
-- the app. Reopen-on-customer-reply is a definer trigger (customers cannot UPDATE
-- the ticket row); no new client-callable RPC.

-- ─────────────────────────────────────────────────────────────────────────
-- 1. Tables
-- ─────────────────────────────────────────────────────────────────────────
create table public.support_tickets (
  id              uuid primary key default gen_random_uuid(),
  ticket_number   bigint generated always as identity unique,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by      uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  order_id        uuid references public.orders(id) on delete set null,
  subject         text not null,
  body            text not null,
  status          text not null default 'open'
                    check (status in ('open','in_progress','waiting_customer','resolved','closed')),
  priority        text not null default 'normal'
                    check (priority in ('low','normal','high','critical')),
  category        text
                    check (category is null or category in ('general','order_issue','billing','product_quality','compliance')),
  assigned_to     uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  resolved_at     timestamptz
);

create index support_tickets_org_idx        on public.support_tickets (organization_id);
create index support_tickets_status_idx     on public.support_tickets (status);
create index support_tickets_created_idx    on public.support_tickets (created_at desc);
create index support_tickets_assigned_idx   on public.support_tickets (assigned_to);
create index support_tickets_order_idx      on public.support_tickets (order_id);
create index support_tickets_created_by_idx on public.support_tickets (created_by);

create trigger support_tickets_updated_at before update on public.support_tickets
  for each row execute function public.set_updated_at();

create table public.ticket_messages (
  id          uuid primary key default gen_random_uuid(),
  ticket_id   uuid not null references public.support_tickets(id) on delete cascade,
  author_id   uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  body        text not null,
  is_internal boolean not null default false,
  created_at  timestamptz not null default now()
);

create index ticket_messages_ticket_idx on public.ticket_messages (ticket_id, created_at);
create index ticket_messages_author_idx on public.ticket_messages (author_id);

-- ─────────────────────────────────────────────────────────────────────────
-- 2. RLS — effective-user-aware (rides 0021 helpers)
-- ─────────────────────────────────────────────────────────────────────────
alter table public.support_tickets enable row level security;
alter table public.ticket_messages enable row level security;

-- A member reads their org's tickets; admin reads all.
create policy tkt_read on public.support_tickets for select
  using (organization_id = (select public.user_org_id()) or (select public.is_admin()));

-- A member files a ticket for their own org, attributed to themselves. RLS is the
-- only writer here.
create policy tkt_ins on public.support_tickets for insert
  with check (
    organization_id = (select public.user_org_id())
    and created_by = (select auth.uid())
  );

-- Only a real admin mutates ticket rows (status / priority / assignment /
-- resolution). Customers never UPDATE the row — replies go to ticket_messages,
-- and reopen is handled by the trigger below.
create policy tkt_upd on public.support_tickets for update
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Messages: visible if the parent ticket is visible AND (public OR viewer is
-- admin). Internal notes are admin-only.
create policy tmsg_read on public.ticket_messages for select
  using (
    (is_internal = false or (select public.is_admin()))
    and exists (
      select 1 from public.support_tickets t
      where t.id = ticket_messages.ticket_id
        and (t.organization_id = (select public.user_org_id()) or (select public.is_admin()))
    )
  );

-- Insert a reply if the parent ticket is visible, authored by the caller, and
-- (non-internal OR caller is a real admin). Under impersonation is_admin() is
-- false, so an impersonating admin can only post customer-visible replies.
create policy tmsg_ins on public.ticket_messages for insert
  with check (
    author_id = (select auth.uid())
    and (is_internal = false or (select public.is_admin()))
    and exists (
      select 1 from public.support_tickets t
      where t.id = ticket_messages.ticket_id
        and (t.organization_id = (select public.user_org_id()) or (select public.is_admin()))
    )
  );

-- ─────────────────────────────────────────────────────────────────────────
-- 3. Reopen-on-customer-reply trigger
-- ─────────────────────────────────────────────────────────────────────────
-- A non-staff, non-internal reply on a resolved/waiting ticket flips it back to
-- 'open'. Runs SECURITY DEFINER so it can UPDATE the ticket despite the
-- admin-only tkt_upd policy. Keys on the AUTHOR's real role (a staff reply must
-- not reopen). Every reply unconditionally touches the parent row so the
-- BEFORE-UPDATE set_updated_at fires and the queue re-sorts by recency.
-- search_path locked. Trigger-only: EXECUTE revoked from client roles (the
-- trigger fires as the table owner regardless of grants).
create or replace function public.ticket_reopen_on_reply() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_reopen boolean;
begin
  v_reopen := new.is_internal = false
    and not exists (select 1 from public.profiles where id = new.author_id and role = 'admin');
  update public.support_tickets
     set status = case
           when v_reopen and status in ('resolved','waiting_customer') then 'open'
           else status end,
         resolved_at = case
           when v_reopen and status in ('resolved','waiting_customer') then null
           else resolved_at end
   where id = new.ticket_id;
  return null;
end $$;

revoke execute on function public.ticket_reopen_on_reply() from anon, authenticated, public;

create trigger trg_ticket_message_reopen
  after insert on public.ticket_messages
  for each row execute function public.ticket_reopen_on_reply();
