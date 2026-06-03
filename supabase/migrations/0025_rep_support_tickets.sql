-- Phase 7 fast-follow — rep support tickets.
-- Wire /rep/support into the support engine. A sales rep (sales_reps.id =
-- profiles.id) has no org, so the org-scoped 0022 policies excluded them. This
-- broadens the four support policies with an AUTHOR path (created_by =
-- auth.uid()) + an ACTIVE-REP org-null insert branch, and makes organization_id
-- nullable so rep tickets (org = null) are valid. Additive: customer guarantees
-- (cross-org 404, internal notes admin-only) are unchanged. tkt_upd stays
-- admin-only; the ticket_reopen_on_reply trigger is untouched.

alter table public.support_tickets alter column organization_id drop not null;

drop policy tkt_read on public.support_tickets;
create policy tkt_read on public.support_tickets for select
  using (
    organization_id = (select public.user_org_id())
    or (select public.is_admin())
    or created_by = (select auth.uid())
  );

drop policy tkt_ins on public.support_tickets;
create policy tkt_ins on public.support_tickets for insert
  with check (
    created_by = (select auth.uid())
    and (
      organization_id = (select public.user_org_id())
      or (organization_id is null and (select public.is_active_rep()))
    )
  );

drop policy tmsg_read on public.ticket_messages;
create policy tmsg_read on public.ticket_messages for select
  using (
    (is_internal = false or (select public.is_admin()))
    and exists (
      select 1 from public.support_tickets t
      where t.id = ticket_messages.ticket_id
        and (
          t.organization_id = (select public.user_org_id())
          or (select public.is_admin())
          or t.created_by = (select auth.uid())
        )
    )
  );

drop policy tmsg_ins on public.ticket_messages;
create policy tmsg_ins on public.ticket_messages for insert
  with check (
    author_id = (select auth.uid())
    and (is_internal = false or (select public.is_admin()))
    and exists (
      select 1 from public.support_tickets t
      where t.id = ticket_messages.ticket_id
        and (
          t.organization_id = (select public.user_org_id())
          or (select public.is_admin())
          or t.created_by = (select auth.uid())
        )
    )
  );
