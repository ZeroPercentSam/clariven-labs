-- 0018_rep_commissions.sql
-- Phase 4, c4 — Commission ledger + earn/reverse engine (THE MONEY CORE).
-- Ported + RUO-adapted from Purity 062/063/096/097. Built SOLO + penny-tested.
--
-- Design:
--   • Margin base = max(0, subtotal − discount − Σ(unit_cost_cents × quantity)).
--   • Rate = active assignment's commission_pct, else the platform default 0.20
--     (held as a constant — Clariven has no system_settings table).
--   • write_rep_commission_for_order(p_order_id): SECURITY DEFINER. org_assignment
--     path only in c4 (the affiliate-code path is added in c5 when affiliate_codes
--     gets rep columns). Idempotent — skips if a primary (parent_commission_id is
--     null) commission already exists for the order.
--   • orders AFTER UPDATE trigger: status→'paid' ⇒ write; status→'cancelled'/
--     'failed' ⇒ void active earned rows (full void; Clariven has no partial
--     refunds — keep parent_commission_id for forward-compat). Runs as a SECURITY
--     DEFINER trigger so it works inside the cron's service-role UPDATE and the
--     admin's authenticated UPDATE alike, without a service-role key in any
--     customer path (invariant #1).
--   • RLS: rep reads own, admin reads+updates all (mark-paid lands in c6). NO
--     client INSERT/DELETE — the definer engine is the only writer.

create table public.rep_commissions (
  id                   uuid primary key default gen_random_uuid(),
  rep_user_id          uuid not null references public.profiles(id) on delete cascade,
  order_id             uuid not null references public.orders(id) on delete cascade,
  organization_id      uuid not null references public.organizations(id) on delete cascade,
  source               text not null check (source in ('org_assignment', 'code')),
  assignment_id        uuid references public.rep_org_assignments(id) on delete set null,
  code_id              uuid references public.affiliate_codes(id) on delete set null,
  base_cents           integer not null check (base_cents >= 0),
  cogs_cents           integer not null default 0 check (cogs_cents >= 0),
  rate                 numeric(5,4) not null check (rate >= 0 and rate <= 1),
  commission_cents     integer not null,
  status               text not null default 'earned' check (status in ('earned', 'paid', 'void')),
  paid_at              timestamptz,
  paid_batch_id        text,
  paid_note            text,
  reversed_at          timestamptz,
  reversed_reason      text,
  parent_commission_id uuid references public.rep_commissions(id) on delete set null,
  earned_at            timestamptz not null default now(),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

comment on table public.rep_commissions is
  'Rep commission ledger. Written ONLY by write_rep_commission_for_order (earn) + the orders status trigger (void). Margin base = max(0, subtotal − discount − COGS); rate = assignment.commission_pct ?? 0.20. RLS: rep reads own, admin reads+updates.';

-- FK + filter indexes (every FK indexed; status/batch for the c6 ledger).
create index rep_commissions_rep_idx on public.rep_commissions(rep_user_id);
create index rep_commissions_order_idx on public.rep_commissions(order_id);
create index rep_commissions_org_idx on public.rep_commissions(organization_id);
create index rep_commissions_assignment_idx on public.rep_commissions(assignment_id);
create index rep_commissions_code_idx on public.rep_commissions(code_id);
create index rep_commissions_parent_idx on public.rep_commissions(parent_commission_id);
create index rep_commissions_status_idx on public.rep_commissions(status);
create index rep_commissions_batch_idx on public.rep_commissions(paid_batch_id);

drop trigger if exists rep_commissions_touch_updated_at on public.rep_commissions;
create trigger rep_commissions_touch_updated_at before update on public.rep_commissions
  for each row execute function public.touch_updated_at();

alter table public.rep_commissions enable row level security;

-- Rep reads own; admin reads+updates all. No INSERT/DELETE policy → the
-- SECURITY DEFINER engine is the only writer (clients cannot forge commissions).
create policy rep_commissions_select on public.rep_commissions for select
  using (rep_user_id = (select auth.uid()) or (select public.is_admin()));
create policy rep_commissions_admin_update on public.rep_commissions for update
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ─────────────────────────────────────────────────────────────────────────
-- write_rep_commission_for_order — earn path (org_assignment). Idempotent.
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.write_rep_commission_for_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order record;
  v_assignment record;
  v_rate numeric(5,4);
  v_base_cents integer;
  v_cogs_cents integer;
  v_commission_cents integer;
  c_default_rate constant numeric(5,4) := 0.20;
begin
  -- Idempotency: a primary (non-reversal) commission already exists → skip.
  if exists (
    select 1 from public.rep_commissions
    where order_id = p_order_id and parent_commission_id is null
  ) then
    return;
  end if;

  select id, organization_id, subtotal_cents, discount_cents
    into v_order
    from public.orders
   where id = p_order_id;
  if not found then return; end if;

  select coalesce(sum(unit_cost_cents * quantity), 0)::integer
    into v_cogs_cents
    from public.order_items
   where order_id = p_order_id;

  v_base_cents := greatest(
    0,
    coalesce(v_order.subtotal_cents, 0)
      - coalesce(v_order.discount_cents, 0)
      - coalesce(v_cogs_cents, 0)
  );

  -- org_assignment path: the single active, commission-enabled assignment.
  select id, rep_user_id, commission_pct
    into v_assignment
    from public.rep_org_assignments
   where organization_id = v_order.organization_id
     and ended_at is null
     and commission_enabled = true
   limit 1;
  if not found then return; end if;

  v_rate := coalesce(v_assignment.commission_pct, c_default_rate);
  v_commission_cents := floor(v_base_cents::numeric * v_rate);

  insert into public.rep_commissions (
    rep_user_id, order_id, organization_id, source, assignment_id,
    base_cents, cogs_cents, rate, commission_cents, status, earned_at
  ) values (
    v_assignment.rep_user_id, v_order.id, v_order.organization_id, 'org_assignment',
    v_assignment.id, v_base_cents, v_cogs_cents, v_rate, v_commission_cents, 'earned', now()
  );
end;
$$;

revoke all on function public.write_rep_commission_for_order(uuid) from public, anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- orders AFTER UPDATE trigger — earn on paid, void on cancelled/failed.
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.rep_commission_on_order_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status is distinct from new.status then
    if new.status = 'paid' then
      perform public.write_rep_commission_for_order(new.id);
    elsif new.status in ('cancelled', 'failed') then
      update public.rep_commissions
         set status = 'void',
             reversed_at = now(),
             reversed_reason = 'order_' || new.status,
             updated_at = now()
       where order_id = new.id
         and status = 'earned'
         and parent_commission_id is null;
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.rep_commission_on_order_status() from public, anon, authenticated;

drop trigger if exists trg_rep_commission_on_order_status on public.orders;
create trigger trg_rep_commission_on_order_status
  after update on public.orders
  for each row execute function public.rep_commission_on_order_status();
