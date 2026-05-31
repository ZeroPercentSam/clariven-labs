-- 0014_orders_org_not_null.sql
-- Phase 3 follow-up — tighten orders.organization_id to NOT NULL and drop the
-- transitional `user_id =` defense-in-depth from the org-scoped read policies.
--
-- 0011 kept the `user_id = auth.uid()` OR-clause "one release" while the column
-- was still nullable + the backfill settled. It is now redundant: every order
-- is org-stamped by create_order_with_items, and every order owner is a member
-- of that org (backfill + bootstrap + invite all guarantee membership). Steady
-- state is org-scoped + staff. Its own migration (never in the cutover) so it
-- can be reverted independently if a NULL-org order ever surfaces.

-- Guard: refuse to tighten if any order is still org-less (precheck = 0 live).
do $$
begin
  if exists (select 1 from public.orders where organization_id is null) then
    raise exception 'cannot set NOT NULL: % order(s) have a null organization_id',
      (select count(*) from public.orders where organization_id is null);
  end if;
end $$;

alter table public.orders alter column organization_id set not null;

-- Re-scope reads to org OR staff (drop the user_id OR).
drop policy if exists ord_read on public.orders;
create policy ord_read on public.orders for select
  using (
    organization_id = (select public.user_org_id())
    or (select public.is_admin())
  );

drop policy if exists item_read on public.order_items;
create policy item_read on public.order_items for select
  using (exists (
    select 1 from public.orders o
     where o.id = order_id
       and (o.organization_id = (select public.user_org_id()) or (select public.is_admin()))
  ));

drop policy if exists msg_read on public.order_messages;
create policy msg_read on public.order_messages for select
  using (exists (
    select 1 from public.orders o
     where o.id = order_id
       and (o.organization_id = (select public.user_org_id()) or (select public.is_admin()))
  ));

-- Message INSERT: customer posts on an order in their org; admin on any.
drop policy if exists msg_ins on public.order_messages;
create policy msg_ins on public.order_messages for insert with check (
  (author_role = 'customer' and author_id = (select auth.uid())
     and exists (
       select 1 from public.orders o
        where o.id = order_id and o.organization_id = (select public.user_org_id())
     ))
  or
  (author_role = 'admin' and (select public.is_admin()) and author_id = (select auth.uid()))
);
