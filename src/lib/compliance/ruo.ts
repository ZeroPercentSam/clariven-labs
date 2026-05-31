// Canonical RUO (Research Use Only) compliance copy for ClarivenLabs.
//
// ClarivenLabs sells research-use-only materials. FDA judges intended use by
// the totality of a site (21 CFR §201.128): clinical / human-use / "patient" /
// "therapy" / "prescribe" / "503A/503B compounding" language on an RUO storefront
// makes the RUO label pretextual and the products misbranded. Every customer-
// facing surface must read as a laboratory-research supplier, never a clinical
// or compounding supplier. The site-no-clinical.spec.ts CI guard enforces this.
//
// Client-safe constants (no server imports) so any component can use them.

/** One-line label for product cards, cart lines, footers. */
export const RUO_DISCLAIMER_SHORT =
  'For Research Use Only. Not for human consumption. Not a drug, food, or cosmetic.';

/** Full disclaimer for PDP, checkout acknowledgement, terms. */
export const RUO_DISCLAIMER_LONG =
  'All ClarivenLabs products are sold for laboratory research use only (RUO). ' +
  'They are not drugs, foods, cosmetics, dietary supplements, or medical devices, ' +
  'and are not intended to diagnose, treat, cure, or prevent any disease. They are ' +
  'not for human or veterinary use or consumption. By purchasing, the buyer affirms ' +
  'they are a qualified research professional or institution and will handle and use ' +
  'these materials in compliance with all applicable laws and institutional policies.';

/** Checkout acknowledgement the buyer must affirm. */
export const RUO_ACKNOWLEDGEMENT =
  'I confirm I am ordering these materials for laboratory research use only — not ' +
  'for human or animal consumption — and that I am authorized to do so.';

/** Legal entity (mirrors Bioveris LLC, Wyoming structure). */
export const CLARIVEN_LEGAL = {
  entity: 'Clariven Labs LLC',
  state: 'Wyoming',
  venue: 'Cheyenne, Wyoming',
} as const;
