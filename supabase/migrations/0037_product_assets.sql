-- Curated product catalog + assets. Adds the 14 in-house products (Victor's
-- list) with 3D render + label PDF (in the product-assets Storage bucket), marks
-- them "offered", and makes list_product_catalog() return the curated set so the
-- client product picker shows exactly these. strength_label '' and price 0 are
-- placeholders until Victor's priced menu lands (orders are requests, not sales).
alter table public.product_prices
  add column if not exists render_path  text,
  add column if not exists label_path   text,
  add column if not exists display_name text,
  add column if not exists offered      boolean not null default false;

insert into public.product_prices
  (product_slug, strength_label, display_name, render_path, label_path, offered, active, price_cents, cogs_cents)
select v.* from (values
  ('puratrutide-10',        '', 'Puratrutide 10mg',        'renders/puratrutide-10.png',        'labels/puratrutide-10.pdf',        true, true, 0, 0),
  ('puratrutide-20',        '', 'Puratrutide 20mg',        'renders/puratrutide-20.png',        'labels/puratrutide-20.pdf',        true, true, 0, 0),
  ('bpc-157',               '', 'BPC-157',                 'renders/bpc-157.png',               'labels/bpc-157.pdf',               true, true, 0, 0),
  ('tesamorelin-10',        '', 'Tesamorelin 10mg',        'renders/tesamorelin-10.png',        'labels/tesamorelin-10.pdf',        true, true, 0, 0),
  ('ipamorelin-5',          '', 'Ipamorelin 5mg',          'renders/ipamorelin-5.png',          'labels/ipamorelin-5.pdf',          true, true, 0, 0),
  ('cjc-1295-no-dac-5',     '', 'CJC-1295 (no DAC) 5mg',   'renders/cjc-1295-no-dac-5.png',     'labels/cjc-1295-no-dac-5.pdf',     true, true, 0, 0),
  ('mots-c-10',             '', 'MOTS-C 10mg',             'renders/mots-c-10.png',             'labels/mots-c-10.pdf',             true, true, 0, 0),
  ('ghk-cu-50',             '', 'GHK-Cu 50mg',             'renders/ghk-cu-50.png',             'labels/ghk-cu-50.pdf',             true, true, 0, 0),
  ('nad-500',               '', 'NAD+ 500mg',              'renders/nad-500.png',               'labels/nad-500.pdf',               true, true, 0, 0),
  ('5-amino-1mq-20',        '', '5-Amino-1MQ 20mg',        'renders/5-amino-1mq-20.png',        'labels/5-amino-1mq-20.pdf',        true, true, 0, 0),
  ('glow-70',               '', 'GLOW 70',                 'renders/glow-70.png',               'labels/glow-70.pdf',               true, true, 0, 0),
  ('klow',                  '', 'KLOW',                    'renders/klow.png',                  'labels/klow.pdf',                  true, true, 0, 0),
  ('wolverine',             '', 'Wolverine',               'renders/wolverine.png',             'labels/wolverine.pdf',             true, true, 0, 0),
  ('reconstitution-solution','', 'Reconstitution Solution','renders/reconstitution-solution.png','labels/reconstitution-solution.pdf', true, true, 0, 0)
) as v(product_slug, strength_label, display_name, render_path, label_path, offered, active, price_cents, cogs_cents)
where not exists (
  select 1 from public.product_prices p
   where p.product_slug = v.product_slug and p.strength_label = v.strength_label
);

-- Catalog returns the curated (offered) set + assets when present; else all active
-- (back-compat). Drop+recreate because the return shape changes.
drop function if exists public.list_product_catalog();
create function public.list_product_catalog()
returns table(product_slug text, strength_label text, display_name text, render_path text, label_path text)
language sql security definer set search_path = public stable as $$
  select product_slug, strength_label, display_name, render_path, label_path
    from public.product_prices
   where active and (offered or not exists (select 1 from public.product_prices where offered))
   order by display_name nulls last, product_slug, strength_label;
$$;
revoke all on function public.list_product_catalog() from public, anon;
grant execute on function public.list_product_catalog() to authenticated;
