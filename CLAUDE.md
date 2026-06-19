@AGENTS.md

# Clariven Labs · agent context

> **Synthesized 2026-06-03** from `HANDOFF.md` + verified repo facts + the cross-project family
> standards, to give this repo the framework file it previously lacked. Treat as authoritative going
> forward, but review/adjust where it disagrees with how Sam actually runs Clariven. `HANDOFF.md`
> remains the live source of truth for status.

**Read [`HANDOFF.md`](HANDOFF.md) first** for the current phase, what works, and what's in flight.
**Cross-project map** (Clariven ↔ Bioveris ↔ Purity — shared framework, differences, where each
stands, the wrong-project footgun): [`CROSS_PROJECT.md`](CROSS_PROJECT.md). Read it before any
cross-repo work or when unsure which sibling owns a feature/ref.

## Quick facts

- **Posture: RUO (Research Use Only).** Never clinical/human use. **As of 2026-06-19 the product is an
  RUO consulting client-onboarding portal — the e-commerce storefront was removed (see HANDOFF
  "2026-06-19 — phase 2").** Store routes/libs were deleted; the DB + some libs are kept dormant (not
  deleted), so the pivot is reversible.
- Stack: Next.js 16 (App Router, Turbopack, **`src/` layout**, `src/proxy.ts` not `middleware.ts`) ·
  React 19 · TS 5.9 · Tailwind v4 · Supabase Postgres 17 · Resend (email) · Twilio (ops SMS) ·
  Green.Money (payment) · Google Business Profile (future) · Upstash Redis (rate-limit). Sentry deferred.
- Supabase project ref: **`nkefzhgleymxhifpgfcn`**. GitHub repo: `ZeroPercentSam/clariven-labs`.
  Vercel project: `prj_Y81sT27IjQhSAqDmPM3UQRzPrv5R` (name `clariven-labs`, team `team_UzmBeQLz4ciE24ALWGwgkYhF`).
  Prod domain: `https://clarivenlabs.com`. Email sender: `updates.clarivenlabs.com` (from
  `noreply@updates.clarivenlabs.com`, reply-to `support@clarivenlabs.com`).
- **Commands use npm** (lockfile is `package-lock.json`, NOT pnpm — that's a Bioveris/Purity thing):
  `npm run dev` · `npm run build` · `npm run typecheck` · `npm run lint` · `npm run test:e2e` (Playwright).
  There is **no vitest** suite — E2E (Playwright) is the test surface (98/98 green as of 2026-06-03).
  **Lint carries 12 accepted baseline errors — do not regress the count.**
- Migration numbering is **4-digit** `NNNN_name.sql` (`0001_init` … current), its own lineage.

## Architecture invariants — don't break

> **2026-06-19 — storefront removed (consulting pivot).** Invariants #4–#7 (order RPC, scalar defaults,
> mock integrations, side-effect emails) describe the e-commerce/commission flow, now **DORMANT**: the
> store routes/libs are deleted; the DB + some libs are kept dormant. #2 no longer applies to live crons
> (poll-invoices/pull-notifications/lot-expiration were removed; `vercel.json` has no crons). #1 is now
> **tighter** — the cron service-role importers are gone, so `src/lib/clients/provision.ts` is the SOLE
> importer of `createAdminClient()`. #3 (RLS) and #8 (env-resilience) stand. Live surfaces = the
> consulting onboarding portal (`src/lib/clients/*`, `/admin/clients`, `/portal/onboarding`) + the
> `/admin` client pipeline overview.

1. **Service-role key is CRON-ONLY — with ONE deliberate, admin-gated exception.**
   `SUPABASE_SERVICE_ROLE_KEY` / `src/lib/supabase/admin.ts` is imported only by the cron routes
   (`poll-invoices`, `pull-notifications`) **and `src/lib/clients/provision.ts`** (the consulting
   client-account provisioner — the Admin API is the only way to mint a login with a generated
   password). `provision.ts` is the sole non-cron importer; it is called exclusively by
   `createClientAccount` (`src/lib/clients/actions.ts`) AFTER `requireAdmin()`, and never from a
   `"use client"` file or shared client lib. Every other user-facing route uses the SSR
   `createClient()` + RLS; admin gating is `requireAdmin()` (loads profile, checks `role='admin'`).
   Do NOT import the admin client into any other user-facing path.
2. **Cron auth = `CRON_SECRET` Bearer token** (`isAuthorized()`), wired in `vercel.json`.
3. **RLS is the security boundary.** Policies call security-definer helpers `is_admin()`,
   `user_org_id()`, `user_org_role()`, `is_org_admin()`, `is_active_rep()` (impersonation-aware —
   see #7). Don't refactor auth onto `auth.jwt()` claims.
4. **Atomic order creation via `create_order_with_items()` RPC** — the only order INSERT path. It
   validates the affiliate/rep code, snapshots prices + COGS, computes totals, returns `order_id`.
   Never raw-INSERT an order. (PL/pgSQL: give record-assignment conditionals explicit scalar defaults
   — an earlier bug came from skipping that.)
5. **Integrations are mock-aware.** `GBP_MOCK` / `TWILIO_MOCK` (true → write to `.gbp-log.jsonl` /
   `.twilio-log.jsonl`, return stubs); CI/dev always mocked, prod toggles via Vercel env. Upstash
   rate-limiter is a **null/no-op limiter** until `UPSTASH_REDIS_REST_URL`/`_TOKEN` are set.
6. **Side-effect failures don't roll back orders.** SMS/email sends are best-effort (try/catch, ~5s
   timeout, log) — never re-thrown. The order persists even if Twilio/Resend is down.
7. **Effective-user RLS (impersonation).** Admin-as-customer runs through a custom impersonation table;
   the RLS helpers resolve the *effective* user. Any NEW gate that must reflect the REAL admin
   mid-session must read `profiles` on `auth.uid()` directly (see the `start_impersonation` pattern).
8. **RUO — no clinical language anywhere.** No "therapy / patient / prescribe / 503A / 503B" copy in
   product, marketing, legal, or emails. CI guard `site-no-clinical.spec.ts` fails the build on
   violations. Products use research-code aliases ("single-regulator", "triple-regulator", …).
9. **Next 16 uses `src/proxy.ts`, not `middleware.ts`.** `next.config.ts` does **not** set
   `cacheComponents` here (unlike Bioveris) — don't assume that constraint applies.
10. **Git author = `Sam Ovington <198869586+ZeroPercentSam@users.noreply.github.com>`** (local
    per-repo, never `--global`). Any other author → Vercel blocks the deploy.
11. **Apply DB migrations via the Supabase MCP** `apply_migration` with **`project_id =
    nkefzhgleymxhifpgfcn`**, commit the same SQL to `supabase/migrations/NNNN_name.sql` (4-digit),
    and regenerate types after.
12. **Env-resilience:** routes needing Supabase guard with `supabaseEnvConfigured()`
    (`src/lib/supabase/env.ts`) and degrade gracefully when unconfigured.

Surface conventions: CSV exports at `/admin/<section>/export`; mutating endpoints at `/api/admin/…`;
index-page filters (status/search) are server-side, not client-side.

## Design system

- Direction: clinical-premium (the family look). Palette tokens in `src/app/globals.css`:
  navy `#0A1628` (`--cl-navy`), blue `#1E40AF` (`--cl-blue`), teal `#0D9488` (`--cl-teal`),
  gold `#D4A843` (`--cl-gold`), white bg `#FFFFFF`, slate gray scale (`--cl-gray-50…900`),
  success `#22C55E`, error `#EF4444`.
- Fonts are configured via `next/font` in `src/app/layout.tsx` — confirm there before assuming families.

## End-of-milestone protocol

1. `npm run typecheck && npm run lint && npm run build && npm run test:e2e` — typecheck/build/E2E
   clean; lint not worse than the 12-error baseline.
2. `get_advisors` (security) on `nkefzhgleymxhifpgfcn` — no new criticals.
3. Update [`HANDOFF.md`](HANDOFF.md) with what shipped + what's next; refresh `CROSS_PROJECT.md` §3 if status moved.
4. Commit + push (author auto-set to ZeroPercentSam noreply). Confirm the Vercel deploy reaches READY.
