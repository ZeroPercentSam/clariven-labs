-- Phase 7 fast-follow — public lot-level COA exposure for the customer PDP.
-- product_lots base RLS stays admin-only (migration 0023). This adds one
-- anon-callable SECURITY DEFINER projection (mirrors list_public_prices) that
-- returns ONLY safe public columns for ACTIVE lots that have a COA — never
-- notes / received_at / uploaded_by / internal ids / file_bytes. The COA file
-- already lives in the public product-coas bucket, so this exposes only the
-- catalog of per-lot certificates, nothing about inventory.

create or replace function public.list_public_lot_coas(p_slug text)
returns table(
  lot_number text,
  strength_label text,
  expiration_date date,
  coa_file_path text,
  coa_file_name text
)
language sql
stable
security definer
set search_path to ''
as $function$
  select pl.lot_number, pl.strength_label, pl.expiration_date,
         pl.coa_file_path, pl.coa_file_name
  from public.product_lots pl
  where pl.active = true
    and pl.coa_file_path is not null
    and pl.product_slug = p_slug
  order by pl.strength_label asc, pl.expiration_date desc
$function$;

grant execute on function public.list_public_lot_coas(text) to anon, authenticated;
