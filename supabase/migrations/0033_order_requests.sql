-- 0033_order_requests.sql
-- Phase 3: client product-selection + reorder REQUESTS (not paid orders — the
-- dormant orders/create_order_with_items path stays untouched). A client picks
-- peptides (by research-code alias); Clariven reviews + brokers/fulfills.

create table if not exists public.order_requests (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by      uuid references public.profiles(id) on delete set null,
  kind            text not null default 'reorder' check (kind in ('initial','reorder')),
  status          text not null default 'submitted'
                    check (status in ('submitted','in_review','sourced','fulfilled','cancelled')),
  note            text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index order_requests_org_idx    on public.order_requests (organization_id, created_at desc);
create index order_requests_status_idx on public.order_requests (status);

create table if not exists public.order_request_items (
  id             uuid primary key default gen_random_uuid(),
  request_id     uuid not null references public.order_requests(id) on delete cascade,
  product_slug   text not null,
  strength_label text not null,
  quantity       integer not null check (quantity > 0 and quantity <= 999),
  created_at     timestamptz not null default now()
);
create index order_request_items_request_idx on public.order_request_items (request_id);

create trigger order_requests_touch before update on public.order_requests
  for each row execute function public.touch_updated_at();

alter table public.order_requests      enable row level security;
alter table public.order_request_items enable row level security;

-- Reads: org members see their org's requests; admin all. Inserts only via the
-- definer RPC below (with check false blocks direct DML). Admin updates status.
create policy oreq_read on public.order_requests for select
  using (organization_id = (select public.user_org_id()) or (select public.is_admin()));
create policy oreq_no_direct_insert on public.order_requests for insert with check (false);
create policy oreq_admin_update on public.order_requests for update
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy oreq_items_read on public.order_request_items for select
  using (exists (
    select 1 from public.order_requests r
     where r.id = request_id
       and (r.organization_id = (select public.user_org_id()) or (select public.is_admin()))
  ));
create policy oreq_items_no_direct_insert on public.order_request_items for insert with check (false);

comment on table public.order_requests is
  'Client product-selection / reorder requests (broker model, no payment). Inserted via submit_order_request(); admin manages status.';

-- ── Catalog (slug + strength only, NO price/cogs) — definer so the picker works
--    regardless of product_prices RLS and never exposes cost data. ────────────
create or replace function public.list_product_catalog()
returns table(product_slug text, strength_label text)
language sql security definer set search_path = public stable as $$
  select product_slug, strength_label
    from public.product_prices
   where active
   order by product_slug, strength_label;
$$;
revoke all on function public.list_product_catalog() from public, anon;
grant execute on function public.list_product_catalog() to authenticated;

-- ── Atomic request creation (resolves caller org, validates SKUs, no price) ───
create or replace function public.submit_order_request(
  p_items jsonb,
  p_kind  text default 'reorder',
  p_note  text default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_uid   uuid := auth.uid();
  v_org   uuid;
  v_req   uuid;
  v_line  record;
  v_count int := 0;
begin
  if v_uid is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  select organization_id into v_org from public.profiles where id = v_uid;
  if v_org is null then raise exception 'no organization' using errcode = '42501'; end if;
  if p_kind is null or p_kind not in ('initial','reorder') then p_kind := 'reorder'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'items required' using errcode = '22023';
  end if;
  if jsonb_array_length(p_items) > 100 then raise exception 'too many items' using errcode = '22023'; end if;

  insert into public.order_requests (organization_id, created_by, kind, note)
    values (v_org, v_uid, p_kind, nullif(trim(coalesce(p_note, '')), ''))
    returning id into v_req;

  for v_line in
    select (i->>'product_slug')::text   as slug,
           (i->>'strength_label')::text as strength,
           coalesce((i->>'quantity')::int, 0) as qty
      from jsonb_array_elements(p_items) as i
  loop
    if v_line.qty < 1 or v_line.qty > 999 then
      raise exception 'bad quantity for %', v_line.slug using errcode = '22023';
    end if;
    if not exists (
      select 1 from public.product_prices pr
       where pr.product_slug = v_line.slug and pr.strength_label = v_line.strength and pr.active
    ) then
      raise exception 'unknown product % %', v_line.slug, v_line.strength using errcode = '22023';
    end if;
    insert into public.order_request_items (request_id, product_slug, strength_label, quantity)
      values (v_req, v_line.slug, v_line.strength, v_line.qty);
    v_count := v_count + 1;
  end loop;

  if v_count = 0 then raise exception 'no valid items' using errcode = '22023'; end if;
  return v_req;
end $$;
revoke all on function public.submit_order_request(jsonb, text, text) from public, anon;
grant execute on function public.submit_order_request(jsonb, text, text) to authenticated;
