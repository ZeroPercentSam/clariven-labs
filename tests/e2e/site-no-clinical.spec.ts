import { test, expect } from '@playwright/test';

/**
 * RUO compliance lockdown — the inverse of Bioveris's site-no-ruo guard.
 *
 * Crawl every customer-facing route and assert ZERO clinical / human-use /
 * compounding MARKETING language in the visible text. ClarivenLabs is Research
 * Use Only; the FDA judges intended use by the totality of a site
 * (21 CFR §201.128), and the Sept-2025 warning-letter wave targeted peptide
 * sellers using "research use only" labeling alongside human-use advertising.
 * A copy edit that re-introduces clinical language would put the RUO label at
 * risk — this test makes that regression CI-blocking.
 *
 * Negated / disclaimer sentences are EXEMPT: a sentence that contains a
 * negation marker ("...not for clinical or therapeutic use", "...not intended
 * to diagnose, treat...") may mention an otherwise-forbidden word, because that
 * is the RUO disclaimer doing its job. We scan sentence-by-sentence and skip any
 * sentence carrying a negation marker.
 */

const ROUTES = [
  '/',
  '/clinics',
  '/pharmacies',
  '/enterprise',
  '/research',
  '/terms',
  '/privacy',
  '/about',
  '/contact',
  '/quality',
  '/resources',
];

// Clinical-marketing words. Deliberately do NOT include disclaimer words
// (human consumption / diagnose / treat / cure / prevent / drug) — those only
// ever appear in the RUO negative disclaimer and are handled by the negation
// exemption. \b word boundaries avoid false positives (biomedical, preclinical).
const FORBIDDEN_PATTERNS = [
  /\bpatients?\b/i,
  /\bprescrib\w*/i,
  /\bdosing\b/i,
  /\bdosage\b/i,
  /\bclinical(?:ly)?\b/i,
  /\btherap(?:y|ies|eutic)\b/i,
  /\bhealthcare providers?\b/i,
  /\b503[AB]\b/i,
  /\bcompounding\b/i,
  /pharmaceutical-grade/i,
  /\bmed spa\b/i,
  /\btelemedicine\b/i,
  /\bwellness clinic/i,
  /\banti-aging clinic/i,
];

// A sentence containing any of these is a disclaimer/negation → exempt.
const NEGATION =
  /\b(?:no|nor|not|never|without|excludes?|prohibit\w*|disclaims?|disclaimer|neither)\b|n['’]t\b|research use only|for research use only|not intended|not for human/i;

function toSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?:])\s+|\n+|•|·|—/)
    .map((s) => s.trim())
    .filter(Boolean);
}

test.describe('RUO lockdown — no clinical / human-use language customer-visible', () => {
  for (const route of ROUTES) {
    test(`${route} contains no clinical / compounding phrases`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response?.status(), `${route} should respond 200`).toBe(200);

      const text = await page.locator('body').innerText();
      const sentences = toSentences(text);

      const violations: string[] = [];
      for (const sentence of sentences) {
        if (NEGATION.test(sentence)) continue; // disclaimer / negated — allowed
        for (const pattern of FORBIDDEN_PATTERNS) {
          if (pattern.test(sentence)) {
            violations.push(`${pattern} :: ${sentence.slice(0, 160)}`);
          }
        }
      }

      expect(
        violations,
        `route ${route} contains clinical / human-use language:\n${violations.join('\n')}`,
      ).toEqual([]);
    });
  }
});
