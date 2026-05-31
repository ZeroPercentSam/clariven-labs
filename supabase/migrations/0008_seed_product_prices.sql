-- 0008_seed_product_prices.sql
-- Seed the full ~60-SKU catalog (Phase 2B / M2B.1) from the Clariven internal
-- pricing sheet. cogs_cents = Azoth Tier-1 wholesale (cents); retail
-- price_cents = cogs_cents * 4 (cost + 300% markup) computed in-SQL so the rule
-- is enforced, not transcribed. strength_label matches src/lib/products.ts
-- exactly so prices attach to the right SKU. Idempotent: re-running refreshes
-- cogs/price and re-activates.

insert into public.product_prices (product_slug, strength_label, cogs_cents, price_cents, active)
select s.slug, s.strength, s.cogs, s.cogs * 4, true
from (values
  -- Metabolic / Weight Management
  ('single-regulator','10 mg',810),
  ('triple-regulator','10 mg',1485),
  ('triple-regulator','20 mg',2295),
  ('triple-regulator','30 mg',2768),
  ('dual-regulator','10 mg',878),
  ('dual-regulator','20 mg',1350),
  ('dual-regulator','30 mg',1688),
  ('aod-9604','5 mg',1053),
  ('5-amino-1mq','10 mg',1350),
  ('5-amino-1mq','50 mg',1350),
  -- Growth Hormone / Endocrine
  ('ipamorelin','10 mg',770),
  ('ghrp-6','5 mg',1080),
  ('sermorelin','10 mg',1283),
  ('tesamorelin','10 mg',2160),
  ('tesamorelin','20 mg',4050),
  ('igf-1-lr3','1 mg',2565),
  ('hcg','10000 IU',1350),
  -- Healing & Recovery
  ('bpc-157','5 mg',552),
  ('bpc-157','10 mg',1013),
  ('bpc-157','20 mg',1755),
  ('tb-500','5 mg',906),
  ('tb-500','10 mg',1566),
  ('ll-37','5 mg',1080),
  ('ss-31','10 mg',1080),
  ('ss-31','30 mg',3119),
  ('ss-31','50 mg',4995),
  ('kpv','10 mg',1350),
  ('kpv','30 mg',2970),
  ('vip','10 mg',1890),
  -- Anti-Aging & Longevity
  ('epitalon','10 mg',815),
  ('epitalon','50 mg',1890),
  ('mots-c','10 mg',801),
  ('mots-c','20 mg',2025),
  ('mots-c','40 mg',2430),
  ('dsip','5 mg',591),
  ('dsip','15 mg',1215),
  ('glutathione','1500 mg',1283),
  ('nad-plus','500 mg',1337),
  ('nad-plus','1000 mg',2430),
  -- Cognitive
  ('n-acetyl-semax','10 mg',810),
  ('n-acetyl-selank','10 mg',810),
  ('pinealon','20 mg',1418),
  -- Immune Support
  ('thymosin-alpha-1','5 mg',1025),
  ('thymosin-alpha-1','10 mg',1809),
  -- Sexual Health
  ('pt-141','10 mg',675),
  ('kisspeptin-10','5 mg',675),
  ('kisspeptin-10','10 mg',837),
  -- Skin & Hair
  ('ghk-cu','50 mg',473),
  ('ghk-cu','100 mg',878),
  ('melanotan-1','10 mg',581),
  ('melanotan-2','10 mg',581),
  -- Premium Blends
  ('bpc-157-tb-500-blend','20 mg (10mg/10mg)',2228),
  ('bpc-157-tb-500-blend','60 mg (30mg/30mg)',6480),
  ('cjc-ipamorelin-blend','10 mg (5mg/5mg)',1161),
  ('cjc-ipamorelin-blend','20 mg (10mg/10mg)',1215),
  ('tesamorelin-ipamorelin-blend','10/3 mg',3038),
  ('glow-blend','GHK-Cu 50mg + TB-500 10mg + BPC-157 10mg',2633),
  ('super-glow-blend','GHK-Cu 50mg + TB-500 10mg + BPC-157 10mg + KPV 10mg',3038),
  -- Accessories
  ('bacteriostatic-water','10 mL',225),
  ('bacteriostatic-water','30 mL',300)
) as s(slug, strength, cogs)
on conflict (product_slug, strength_label) do update
  set cogs_cents = excluded.cogs_cents,
      price_cents = excluded.price_cents,
      active = true,
      updated_at = now();
