# ClarivenLabs · Session handoff

**Read this first when picking up a new session.** Updated at the end of every milestone.

---

## Where we are

**Snapshot as of 2026-05-31 — "Bioveris-grade" production sprint · Phases 0–2B + Phase 3 (orgs) + Phase 4 (rep / commission engine, c1–c6) complete. Phase 5 STARTED: admin power tools (c1 audit viewer · c2 orders bulk/inline/CSV · c3 sales dashboard) COMPLETE — all deployed READY on clarivenlabs.com. c7 (team-leader splits) deferred by design.**

ClarivenLabs (RUO / research-use-only) is being raised to the backend-completeness bar of its sibling **Bioveris**, RUO-adapted. Full plan (Tier B, RUO-adapted, with the INCLUDE/ADAPT/DROP scope table + pricing analysis): **`~/.claude/plans/i-am-going-to-validated-prism.md`** — read it. Sibling refs: Bioveris `/Users/samovington/Bioveris` (gold standard, 141 migrations), Purity Science `/Users/samovington/Purityscience` (pattern library, 109 migrations). Portable fixes: `/Users/samovington/Bioveris/docs/portable-fixes-2026-05-26.md`.

**Done this sprint — 6 commits `fff9d56` → `7723831`, all deployed READY on clarivenlabs.com:**
- **Phase 0** `fff9d56` — `src/middleware.ts` → `src/proxy.ts` (Next-16 convention); `src/lib/supabase/env.ts` (`supabaseEnvConfigured()`, invariant #8); `src/lib/format-datetime.ts` (America/Chicago) + DRY'd 11 server-rendered timestamp sites (fixed a live UTC-mislabel bug).
- **Phase 1** `0d9b3a3` `babc221` `580f24b` — transactional email layer `src/lib/email/{client,send,log,log-constants,templates/}` + migration `0006_email_log` (live; advisors clean); RUO order emails (placed/paid/shipped) wired into `api/orders`, `poll-invoices` cron (service-role `logClient`), admin order PATCH; PKCE callback hardened (portable-fix #10) + new `/forgot-password` + `/reset-password`; `/admin/email-log` viewer; `scripts/configure-supabase-auth.mjs` (ready to run).
- **Phase 2** `473a7ed` `7723831` — RUO compliance: purged 62 clinical lines across 12 files (4 parallel agents), retargeted audience pages to research, rewrote `/terms` + `/privacy` for **Clariven Labs LLC (Wyoming, Cheyenne venue)**, RUO labeling on PDP/cart/checkout/footer + a **required checkout acknowledgement** checkbox, and `tests/e2e/site-no-clinical.spec.ts` CI guard (12/12 routes green). Canonical RUO copy: `src/lib/compliance/ruo.ts` + `src/components/RuoDisclaimer.tsx`.
- **Phase 2B** `05b1e1d` `f8cfa9b` `8411316` `6b7de90` — pricing, cost-visibility & client/rep resources:
  - **GLP-1 research-alias rename** (Sam-confirmed): `semaglutide→single-regulator` (Single Regulator SIA-31-C18), `retatrutide→triple-regulator` (Triple Regulator TIA-39-C20), `survodutide→dual-regulator` (Dual Regulator DIA-39-C20). 308 redirects in `next.config.ts`; fixed 3 broken/clinical product links (`tirzepatide`, `cjc-1295-dac`, `cjc-1295-ipamorelin`) in Footer/clinics; sanitized clinical metadata in `layout.tsx` (`<head>` slipped past site-no-clinical, which only scans body text).
  - **Pricing (4× markup, Sam-confirmed)** — migration `0008` seeds all **60 SKUs** with `cogs_cents` (Azoth Tier-1) + `price_cents = cogs_cents × 4` (cost + 300%; corrects 0005's wrong 3× note). `RUO_MARKUP_MULTIPLIER=4` in `src/lib/pricing.ts`.
  - **Cost-hiding (M2B.4, security)** — migration `0007`: base-table SELECT locked to admins, anon SELECT revoked, public reads via SECURITY DEFINER `list_public_prices(p_slug)` (retail only, no cogs). 3 customer reads repointed to the RPC. `tests/e2e/price-cost-leak.spec.ts` CI lock. **Verified live**: anon base cogs read → 42501; RPC → 60 rows, no cogs key.
  - **Admin pricing UI** — `/admin/pricing` now Cost | Retail | Margin($/%) + per-row "×4" + "Recompute all at 4× cost" bulk + "Save changed". `/admin/sales-sheet` = read-only cost/retail/profit by category w/ totals ("my eyes only").
  - **Client resources (M2B.5)** — migration `0009`: `client_resources` table + PRIVATE `client-resources` bucket. `/portal/resources` (RUO-sanitized Client Starter Kit + signed-URL doc downloads), `/admin/resources` (upload/list/delete). `src/lib/resources/{queries,actions}.ts`.
- **Phase 3 — Organizations / multi-tenant (COMPLETE, 6 commits `2715a5c` → `c352349`, all deployed READY).** Plan: `~/.claude/plans/indexed-sparking-adleman.md`. Extends the existing `profiles`/`is_admin` model — `org_members` join table for customer org-roles; `is_admin()`/`role='admin'` stays the staff signal. No JWT hook (table-reading SECURITY DEFINER helpers).
  - **c1** `2715a5c` (`0010`) — ADDITIVE foundation: `organizations`(`approval_status`), `org_members`(owner/admin/buyer/viewer), `org_attestations`(RUO research-use, no clinical fields), `org_invitations`, `invitation_requests` (all RLS); helpers `user_org_id()`/`user_org_role()`/`is_org_admin()`; nullable `profiles.organization_id`+`orders.organization_id`; backfilled 9 existing customers → personal **auto-approved** orgs + owner membership (0 null-org orders).
  - **c2** `37cccd1` (`0011`) — RLS cutover (behavioral): `create_order_with_items` now stamps `organization_id` + **raises 42501 unless the org is `approved`** (the approval gate — RPC is the only INSERT path); orders/order_items/order_messages SELECT flipped to `organization_id=(select user_org_id()) OR user_id=(select auth.uid()) OR (select is_admin())` (user_id-OR kept one release). `orders.organization_id` **NOT NULL still deferred** (its own later migration; precheck 0 null-org orders). Gate lock: `tests/e2e/org-isolation.spec.ts`.
  - **c3** `f8a6d8b` — proxy onboarding gate: no-org/pending customer hitting `/cart` or `/checkout` → `/onboarding/attest` or `/onboarding/pending`; admins exempt; `/portal`+`/onboarding` reachable. `roles.ts` `getOrg()`. Lock: `onboarding-gate.spec.ts`.
  - **c4** `c87dcc0` (`0012`) — self-service onboarding: `bootstrap_organization` RPC + private `org-attestations` bucket (per-action storage RLS); `/onboarding/attest` (research-use attestation form + optional PDF, RUO-clean copy) + `/onboarding/pending`; portal bounces no-org customers in. Lock: `onboarding.spec.ts`.
  - **c5** `21ad060` — admin org review: `/admin/organizations[/id]` approve/reject (signed-URL PDF view), `admin_audit_log`, opens the gate on approve / records reviewer note on reject. Lock: `admin-org-review.spec.ts`.
  - **c6** `c352349` (`0013`) — team invitations: `get_invitation_preview`/`accept_invitation`/`submit_invitation_request` RPCs; `/portal/team` (org-admin invite/revoke + shareable `/invite/<token>` link) + `/invite/[token]` (anon preview → accept, joins existing org, no attestation). Lock: `team-invite.spec.ts`.

**Phase 4 — Rep / affiliate / commission engine (COMPLETE through c6, commits `403964f` → `a071214`, migrations `0015`–`0019`, all deployed READY).** Plan: `~/.claude/plans/clariven-phase4-rep-commissions.md`. RUO-adapted from Purity 055–097. Defaults locked: rate **20%**, margin base = subtotal−discount−COGS, payout ACH/PayPal/Check + tax SSN/EIN.
  - **c1** `403964f` (`0015`) — `sales_reps` identity (PK=profiles.id; status pending_invite|pending_review|active|suspended; tax/payout/business cols) + locked-columns trigger (freeze tax/payout after onboarding; admin bypass) + `sales_reps_safe` masking view (security_invoker) + `is_active_rep()` helper. `order_items.unit_cost_cents` COGS snapshot + `create_order_with_items` writes it. Active reps exempted from the org-onboarding bounce (proxy + portal).
  - **c2** `82a0251` (`0016`) — `rep_invitations` + `get_rep_invitation_preview`(anon)/`accept_rep_invitation`(authed → creates pending_invite shell; guards email-match + not-customer + not-admin). `rep_agreement_versions` (single-current, retire-prior trigger) + `rep_agreement_consents`; **ICA v1.0 seeded = Clariven Labs LLC, Wyoming** (Cheyenne, E-SIGN, RUO; counsel-review DRAFT). `/rep-invite/[token]` direct-password signup → `/rep/onboarding` (W-9 + payout + signature) → `/rep/onboarding/pending`. lib/rep/{constants,queries,actions}.
  - **c3** `d39a168` (`0017`) — `rep_org_assignments` (one active/org partial-unique; commission_pct override). `/admin/reps` (KPI strip + invitations + invite/revoke), `/admin/reps/[id]` (approve/decline/suspend/reactivate + assignment CRUD), `/admin/reps/invite`. Audit in server actions. Admin nav += Reps.
  - **c4** `4b17c7f` (`0018`) — **MONEY CORE.** `rep_commissions` ledger + `write_rep_commission_for_order` (margin base, rate=assignment??0.20, floor, idempotent) + orders AFTER UPDATE trigger (earn-on-paid, void-on-cancel/failed). Engine fns SECURITY DEFINER + REVOKEd from anon/authenticated (trigger-only). RLS: rep reads own, admin reads+updates, no client write. Gate `rep-commission.spec` 6/6.
  - **c5** `99eab36` (`0019`) — `affiliate_codes` rep columns (nullable affiliate_id, XOR partner-vs-rep, approval workflow, rep_user_id ON DELETE CASCADE + lock trigger) + active-only guards on validate/order RPC + commission **code-path** (precedence org_assignment > code) + `rep_my_orgs()` helper. Rep portal `/rep/{dashboard,commissions,orders,orgs,codes,support}` (gated by is_active_rep). `/admin/affiliates` filters to partner codes.
  - **c6** `a071214` (no migration) — `/admin/commissions` (totals, status filter, ledger, **mark-all-earned-paid batch**, per-row void, CSV export) + `/admin/commissions/payouts` (batch totals). Admin nav += Commissions.
  - **c7 — DEFERRED by design** (team-leader splits). Purity has no splits; needs a Bioveris rep-engine mapping pass + Sam's explicit opt-in. `parent_commission_id` is already on `rep_commissions` for forward-compat. Available on request.

**State:** **20 migrations (`0001`–`0020`).** `npm run typecheck` + `npm run build` green. Lint = **12 errors** (baseline; none from this work, do NOT regress). Full E2E suite = **66 pass / 4 reds** (the 4 reds = the documented pre-existing flakes only — no regression). Org-scoped RLS + approval gate + the full rep/commission engine + the Phase-5 admin power tools are LIVE on prod. `product_prices` = 60 SKUs (4× retail); 9 backfilled orgs. `graphify-out/` current (393 nodes). Git clean, pushed; latest prod deploy `a071214` READY on clarivenlabs.com. Supabase advisors WARN-only (definer-RPC functions anon/authenticated-executable by design; the commission engine fns `write_rep_commission_for_order` + the order/lock trigger fns are REVOKEd from client roles → trigger-only, absent from the advisor list; every policy `(select ...)`-wrapped, every fn `search_path`-locked, every FK indexed).

**Rep engine quick map (Phase 4):** a rep = a `sales_reps` row (NOT a customer org, NOT `role='admin'`); gate `/rep/*` on `is_active_rep()`. Commission flow: admin invites (`/admin/reps/invite`) → rep accepts + onboards (`/rep-invite/[token]` → `/rep/onboarding`) → admin approves + assigns an org (`/admin/reps/[id]`) → on a **paid** order the orders trigger writes one `rep_commissions` row (margin base × rate, floor) → admin pays a batch (`/admin/commissions`). Rep-minted codes (`/rep/codes`, pending → admin-approve) earn via the code-path when no org assignment exists. Commission CI lock: `tests/e2e/rep-commission.spec.ts`.

**Phase 5 — Admin parity + impersonation + support (STARTED). Slice 1 = admin power tools, COMPLETE (commits `22a350d` → `fb853ff`, migration `0020`, all deployed READY).** Plan: `~/.claude/plans/i-am-going-to-validated-prism.md` § Phase 5. Sam chose admin-power-tools as the Phase-5 entry point.
  - **c1** `22a350d` (`0020`) — **`/admin/audit` log viewer.** `lib/audit/{queries,constants}.ts` — `listAuditEvents`/`countAuditEvents` (head+exact) + bulk actor-profile hydrate; client-safe `AUDIT_TARGET_TYPES` vocabulary + labels. Server page: target-type filter chips, exact-count header, CDT timestamps, jsonb payload rendered key:value. `/admin/audit/export` admin-gated CSV (honors `?target=`). Migration `0020` = `admin_audit_created_idx (created_at desc)` (index-only, additive — the two existing audit indexes lead with actor_id / target_type so neither serves the viewer's `created_at DESC`/date-window reads). Admin nav += "Audit log". Lock `admin-audit.spec.ts` (4/4).
  - **c2** `5aacec9` (no migration) — **`/admin/orders` power tools.** `AdminOrdersTable` client island over the server-fetched (≤200, still status/q-filtered **server-side** — finds any order) rows: multi-select + bulk status change, and an inline "Ship" popover (carrier+tracking). One parent state object + a **single parent-managed popover** — no per-row hooks (avoids the Next-16 RSC freeze class). `/api/admin/orders/bulk` (PATCH, `adminOrderBulkSchema` ids≤200 + status, one `order.bulk_patch` audit row, no email side-effects). Inline Ship reuses the single PATCH `/api/admin/orders/[id]` (fires the branded shipped email + per-order audit already wired). `/admin/orders/export` admin-gated CSV (honors `?status=&q=`). `schemas/admin.ts` extracted `ORDER_STATUSES` + `adminOrderBulkSchema`. Lock `admin-orders-tools.spec.ts` (3/3). **Convention:** CSV downloads live under `/admin/<section>/export`; mutating endpoints under `/api/admin/orders/`.
  - **c3** `fb853ff` (no migration) — **`/admin/sales-dashboard`.** `lib/admin/sales-analytics.ts` `getSalesDashboard(range)` = one bounded orders query (placed in last N days, `.limit(5000)`) JS-reduced into a summary (paid revenue, paid-order count, AOV, discounts, total placed) + a continuous daily paid-revenue series (buckets keyed in **America/Chicago**). Revenue = `paid|preparing|shipped|delivered`. `sales-analytics-constants.ts` (client-safe `RangeDays 7|30|90` + `parseRange`, sibling split). `SalesRangeChips` ("use client", `useTransition` + `router.push({scroll:false})` — server re-aggregates per window, so chips dim instead of moving client-side). 4 KPI cards + dependency-free CSS daily bar chart. Admin nav += "Sales dashboard". Lock `admin-sales-dashboard.spec.ts` (3/3).
  - **Not needed this slice:** `use-chip-filter` was NOT ported — orders keeps the authoritative **server-side** status filter + order# search (no "find any order" regression), and the sales chips need server re-aggregation (`useTransition`, not `history.replaceState`). Port it when a surface genuinely filters a fully-loaded client-side set.
  - **Phase 5 remaining (next up):** customer **impersonation** (admin-acts-as + audit `impersonator_user_id`/`request_id`, `current_actor_user_id()` in RLS — build SOLO, it touches the RLS security boundary); **support tickets** (`account` + `admin/support`); **lot/COA-lite**. Then Phase 6 (ops/perf) + Phase 7 (cutover).

**Decisions locked (from Sam):** scope = **Tier B** (full Bioveris parity, RUO-adapted); legal entity = **Clariven Labs LLC, Wyoming**; signup email-verification ON (`mailer_autoconfirm=false`); clinical-audience pages retargeted to research.

**Blocked on Sam — creds (deferred to cutover):** create a Resend project + `updates.clarivenlabs.com` DNS (SPF/DKIM/DMARC), set `RESEND_API_KEY` / `RESEND_FROM_EMAIL` (`ClarivenLabs <noreply@updates.clarivenlabs.com>`) / `RESEND_REPLY_TO` (`support@clarivenlabs.com`) on Vercel prod+preview+dev + `.env.local`, and provide a `SUPABASE_ACCESS_TOKEN` (sbp_…, rotate after) to run `scripts/configure-supabase-auth.mjs`. The email layer no-ops cleanly until the key lands — nothing breaks.

**✅ RESOLVED — pricing markup (Sam confirmed 2026-05-31):** retail = **4×** COGS (cost + 300%), matching the client sheet exactly on all 60 SKUs. Migration `0008` seeds it; `0007` corrects the old 3× comment; `RUO_MARKUP_MULTIPLIER=4` in `src/lib/pricing.ts`. Sam also confirmed the GLP-1 **slug + display + redirect** rename (not display-only).

**⚠️ Legal pages = counsel-review draft** — flagged in-page ("Draft — pending legal review"). Lawyer must finalize: real Wyoming registered address (placeholder in place), arbitration clause, applicable privacy regimes (CCPA/GDPR). RUO research-use framing + buyer obligations + warranty/liability disclaimers are drafted.

**Pre-existing test issues (do not "fix" by mistake — slated for Phase 7):**
- `auth.spec.ts` × 2 + `admin-pricing.spec.ts`: sign-in redirect races `page.goto('/admin')` — cookie not always set in time. Long-standing flake (the sign-in race itself is unfixed; Phase 2B only made admin-pricing's data assertions deterministic + non-destructive).
- `cart-and-order.spec.ts` "expired code is rejected": affiliate input is gated behind `cart.lines.length > 0`; test assumes otherwise. Pre-existing test bug.
- ~~`cart-and-order.spec.ts` "add to cart" 5 mg~~ **FIXED in Phase 2B** — now `/products/single-regulator` + "10 mg" (real seeded price).

**Up next: Phase 5 — remaining slices** (`~/.claude/plans/i-am-going-to-validated-prism.md` § Phase 5). Admin power tools (audit viewer + orders bulk/inline/CSV + sales dashboard) are DONE (above). Remaining: **(a) customer impersonation** — admin-acts-as + audit `impersonator_user_id`/`request_id`; `current_actor_user_id()` in RLS. **Build SOLO** — it touches the RLS security boundary (do not fan out). **(b) support tickets** — port `lib/support/` + `app/{account,admin}/support` (standalone, clean). **(c) lot/COA-lite** — extend `product_coas` to lot-level + a lot-expiration cron. Then Phase 6 (ops/perf: healthz, rate-limit, Sentry, Cache Components, chip-filter islands, nav guards) and Phase 7 (stabilize the 4 known flakes + prod cutover: run `configure-supabase-auth.mjs`, flip GBP/Twilio mocks, live order round-trip).

**Phase 4 c7 (team-leader splits) is intentionally NOT built** — defer default confirmed; do it only when Sam opts in (needs a Bioveris rep-engine mapping pass; `parent_commission_id` already present for forward-compat).

**New Phase-4 E2E specs (all green; permanent CI locks):** `rep-invite`, `admin-rep-mgmt`, `rep-commission` (money-core: penny/idempotency/void/RLS), `rep-codes` (code-path + precedence + active-only), `admin-commissions` (batch-pay/void/CSV). `truncateTestData` extended FK-safe for the rep tables + the `e2e-repasgn-` org prefix; rep-test users use `e2e-rep*-`/`e2e-repcomm-`/`e2e-repcode-`/`e2e-repc6-` prefixes.

**New Phase-5 E2E specs (all green; permanent CI locks):** `admin-audit` (render + actor/payload hydrate, target-type filter, CSV, non-admin proxy bounce — 4/4), `admin-orders-tools` (bulk status on selected only, inline shipped + tracking, CSV — 3/3), `admin-sales-dashboard` (KPI cards + non-empty chart, range-chip re-nav + active state, non-admin bounce — 3/3). `truncateTestData` org prefixes += `e2e-ordtools-` + `e2e-sales-`; these specs seed their own approved org + customer and self-clean.

**Deferred from Phase 3 (do before/with a later phase):**
- ~~**`orders.organization_id` → NOT NULL**~~ **DONE** — migration `0014` (`cd56332`): column NOT NULL + dropped the transitional `user_id =` OR from `ord_read`/`item_read`/`msg_read`/`msg_ins` (steady state = org OR staff). Verified 11/11 order-read specs; `cron-poll.spec` now stamps the test order's org.
- **Optional c7**: `invitation_requests` public "request access" intake page + `/admin/invitation-requests` review UI (the `submit_invitation_request` RPC already exists from 0013).

**Phase 2B leftovers / notes for later:**
- **E2E test lifecycle changed** — `product_prices` is now the real catalog (migration-seeded), so `truncateTestData()` no longer deletes it and `global-setup` no longer seeds it (would have wiped production pricing every run). Specs read real prices; `admin-pricing.spec` captures & restores the SKU it edits. The suite still shares the one prod Supabase project — a dedicated test project is the real Phase-7 fix.
- **`list_public_prices` / all RPCs** show under the `*_security_definer_function_executable` advisor (WARN) — expected for the RLS-via-definer-RPC architecture; `list_public_prices` is intentionally anon-callable. Using a definer *function* (not a view) avoided the ERROR-level `security_definer_view` lint.
- Client Starter Kit on `/portal/resources` is **static RUO content**; the source `Client_Facing_Starter_Kit.pdf` (clinical voice) was NOT used verbatim. Admin can upload supplementary PDFs via `/admin/resources`.

---

## Resume protocol when picking up

1. **Read this file** (you're here).
2. `cd /Users/samovington/ClarivenLabs/clariven-labs && git status && git log --oneline -10` — confirm tree clean, identify last commit.
3. `npm run typecheck && npm run build` — should both be green before you change anything substantial.
4. Optional: `npm run test:e2e` after `set -a && source .env.local && set +a` — expect 5/9 (or better). Known flakes documented above.
5. Skim [§ Architectural invariants](#architectural-invariants) — non-negotiable.
6. Skim [§ What's live today](#whats-live-today) so you don't rebuild.
7. Read `graphify-out/GRAPH_REPORT.md` before answering architecture/cross-cutting questions; prefer `graphify query "<question>"` over `grep` for "how does X relate to Y".

---

## Architectural invariants

Eight rules that survived this codebase becoming non-trivial. Don't break them by accident.

### 1. Service-role key is cron-only

`SUPABASE_SERVICE_ROLE_KEY` is referenced from **exactly one place**: `src/lib/supabase/admin.ts` (via `createAdminClient()`). It is consumed **only by**:
- `src/app/api/cron/poll-invoices/route.ts`
- `src/app/api/cron/pull-notifications/route.ts`

Every other server route uses the **authenticated SSR client** (`src/lib/supabase/server.ts`) and lets RLS do the gating. If you need to break this rule, you're probably doing something else wrong — escalate before importing `admin.ts` from a user-facing path.

### 2. Cron auth via `CRON_SECRET` bearer token

Both cron routes call `isAuthorized(request)` which compares `Authorization: Bearer ${CRON_SECRET}`. Vercel Cron sets this header automatically per `vercel.json`. Returns 403 unauthed, 200 with the right secret.

### 3. RLS is the security boundary

Every customer-facing route runs through `createClient` (server) which authenticates the user via cookies, and queries are gated by RLS policies in the migrations. Direct admin writes go through `requireAdmin()` (`src/lib/auth/roles.ts`) which loads the profile and checks `role = 'admin'`.

### 4. Atomic order creation via RPC

Order placement is **never** a raw INSERT. It goes through `create_order_with_items(p_items, p_shipping, p_code)` (SECURITY DEFINER) which:
- Validates the affiliate code if any
- Refuses self-referral (user can't apply their own affiliate's code)
- Snapshots product names + prices at insert time
- Computes subtotal/discount/total server-side
- Returns the new `order_id` + totals

Extend this RPC for new order semantics — don't bypass.

### 5. RPC scalar variables need explicit defaults

`create_order_with_items` uses **scalar variables with safe defaults** instead of `record`-typed variables, because PL/pgSQL's record assignment is conditional on the query returning rows. A `record` left unassigned (no affiliate code applied) blew up an earlier version. If you extend the RPC, default the scalars at declaration time.

### 6. Integrations are mock-aware

`GBP_MOCK=true` and `TWILIO_MOCK=true` short-circuit the Green.Money + Twilio clients to write to `.gbp-log.jsonl` / `.twilio-log.jsonl` and return deterministic stub IDs. CI + dev should always have these set. Production flips them off via Vercel env. **If you add a new external integration, follow the same pattern** — a mock-aware client at `src/lib/<service>.ts` that logs to a `.<service>-log.jsonl` file when the env flag is on.

### 7. Side-effect failures don't roll back the order

SMS to ops + payment-email send are **best-effort with a 5-second timeout** at the order-creation API boundary. If Twilio or Green.Money is down, the order still persists and the customer sees a success page. New mutations that fire emails/SMS must follow the same shape — catch + log, never re-throw into the order flow.

### 8. Env-resilience contract

If you add a new server action or RSC that uses `createClient()`, gate it with an env check (see [§ Adopt next session](#adopt-next-session-the-env-resilience-helper) — there's a helper to consolidate). Right now `src/lib/coas/actions.ts` has an inline `envConfigured()` check; the rest of the codebase has the env check only at the proxy/middleware layer. Mismatched env in prod returns a friendly inline error instead of a styled 500 once this is uniform.

---

## Tech stack

- **Next.js 16.2.4** App Router · React 19 · TypeScript strict
- **Supabase** (Postgres + Auth + RLS) — `@supabase/ssr` for cookie-based auth; `@supabase/supabase-js` for browser + service-role usage
- **Tailwind CSS 4** + **lucide-react** icons + **framer-motion** for hero/header animations
- **Zod 4** for input validation on every API route + server action
- **Playwright** E2E (Chromium only) · **GitHub Actions** CI
- **Vercel** deploy + **Vercel Cron** for `/api/cron/*`
- **`fast-xml-parser`** for Green.Money's XML form-POST responses
- **Twilio SDK** for ops SMS

Package manager: **npm** (not pnpm — that's Purity Science). `package-lock.json` is the source of truth.

---

## Schema reference

All tables in `public` schema, all with RLS enabled. Source of truth is `supabase/migrations/`; TypeScript types live in `src/lib/database.types.ts` (regenerate after every migration via Supabase MCP `generate_typescript_types`).

### Tables

| Table | Key columns | Notes |
|---|---|---|
| **`profiles`** | `id PK = auth.users.id`, `email citext unique`, `role ('customer' \| 'admin')`, `full_name`, `phone`, `shipping_address jsonb`, `referred_by_affiliate_id`, `referred_by_code_id` | Auto-created on `auth.users` insert via `handle_new_user()` trigger. Role-change trigger blocks self-promotion. |
| **`affiliates`** | `name`, `email citext`, `commission_pct numeric(5,2)`, `active` | Admin-managed referral partners. |
| **`affiliate_codes`** | `affiliate_id FK`, `code text unique`, `discount_pct numeric(5,2)`, `active`, `expires_at` | Functional index on `upper(code) where active` for case-insensitive lookups. |
| **`product_prices`** | `(product_slug, strength_label) unique`, `price_cents`, `cogs_cents`, `active`, `currency` | Catalog metadata is static in `src/lib/products.ts`; prices live here. `cogs_cents` is admin-only (Azoth Tier-1 cost); retail `price_cents = cogs_cents × 4`. **Base SELECT is admin-only** (migration 0007) — customers read retail via `list_public_prices()`. 60 SKUs seeded (0008). |
| **`client_resources`** | `title`, `description`, `category`, `file_path`, `file_name`, `file_bytes`, `sort_order`, `active`, `uploaded_by` | Admin-uploaded onboarding docs for `/portal/resources`. RLS: logged-in customers read `active` (anon none); admin writes. Files in PRIVATE `client-resources` bucket → signed-URL downloads. |
| **`product_coas`** | `(product_slug, strength_label) unique`, `file_path`, `file_name`, `file_bytes`, `uploaded_by` | strength_label='' is the product-level default. Bucket `product-coas` is public-read. |
| **`orders`** | `order_number serial`, `user_id FK`, `status enum`, `subtotal_cents`, `discount_cents`, `total_cents`, `shipping_address jsonb`, `applied_code_id`, `affiliate_id`, `tracking_carrier`, `tracking_number`, `notes_internal`, `gbp_invoice_id`, `gbp_check_id`, `gbp_payment_result`, `gbp_last_polled_at`, `gbp_paid_at` | Status flow: `pending_payment → processing → paid → preparing → shipped → delivered`, plus `cancelled` / `failed` off-path. |
| **`order_items`** | `order_id FK`, `product_slug`, `product_name`, `strength_label`, `quantity`, `unit_price_cents`, `line_total_cents` | All product/price columns are snapshots at order time. |
| **`order_messages`** | `order_id FK`, `author_id`, `author_role`, `body` | Two-way thread between customer + admin. |
| **`admin_audit_log`** | `actor_id`, `action`, `target_type`, `target_id`, `payload jsonb` | Every admin mutation should insert here. |
| **`gbp_notifications`** | `id`, `invoice_id`, `message`, `entry_client_id`, `pulled_at`, `processed_at`, `time_created` | Cache for Green.Money's pull-queue (no webhooks). |
| **`organizations`** | `name`, `slug unique`, `legal_name`, **`approval_status`** (`pending\|approved\|rejected\|suspended`), `billing_email`, `phone`, `notes` | Phase 3. Customer accounts. Only `approved` orgs can order (gate in the order RPC). 9 backfilled personal orgs are auto-approved. RLS: member reads own (`id=user_org_id()`), admin all. |
| **`org_members`** | `(organization_id, user_id) PK`, `org_role` (`owner\|admin\|buyer\|viewer`) | Phase 3. Authoritative customer org-membership (join table). `profiles.organization_id` is the denormalized default-org pointer. |
| **`org_attestations`** | `organization_id`, `legal_entity_name`, `research_context`, `institutional_affiliation`, `orcid_or_inst_id`, `file_path`, `status`, `rejection_reason`, `reviewed_by/at` | Phase 3. RUO research-use attestation (replaces clinical license — no NPI/503A/state/expiry). PDF in private `org-attestations` bucket. |
| **`org_invitations`** | `organization_id`, `email`, `org_role` (`admin\|buyer\|viewer`), `token unique`, `status`, `expires_at` (7d), `invited_by`, `accepted_*` | Phase 3. Team invites. Partial-unique `(org, lower(email)) where pending`. |
| **`invitation_requests`** | `email`, `full_name`, `organization_name`, `research_context`, `reason`, `status` (`new\|reviewed\|invited\|declined`), `reviewed_by/at`, `admin_notes` | Phase 3. Public "request access" intake (written via `submit_invitation_request`; admin-only read). Review UI is optional/deferred. |

### RPCs (all SECURITY DEFINER)

| Function | Args | Returns | Auth |
|---|---|---|---|
| `is_admin()` | — | boolean | uses `auth.uid()` |
| `validate_affiliate_code(p_code)` | text | `(valid bool, discount_pct numeric)` | **anon-callable** |
| `list_public_prices(p_slug text default null)` | — | `(product_slug, strength_label, price_cents, currency)` | **anon-callable**; retail-only projection (NO cogs_cents). Cost-hiding boundary — all customer price reads go through this. |
| `create_order_with_items(p_items jsonb, p_shipping jsonb, p_code text)` | — | `(order_id uuid, subtotal_cents, discount_cents, total_cents)` | requires session; self-referral guard |
| `attach_invoice_to_order(p_order_id, p_invoice_id, p_check_id, p_payment_result)` | — | void | verifies `auth.uid() = order.user_id` |
| `stamp_referral(p_code)` | text | void | stamps the caller's profile from the referral cookie |
| `user_org_id()` / `user_org_role()` / `is_org_admin()` | — | uuid / text / bool | Phase 3 org helpers (SECURITY DEFINER, table-reading, no JWT hook). Used in org-scoped RLS + app gating. |
| `bootstrap_organization(name, legal_name, billing_email, phone)` | — | uuid | Phase 3. Atomic create-org-`pending` + link profile + owner membership; refuses a second org; collision-safe slug. authenticated only. |
| `get_invitation_preview(p_token)` | text | json | Phase 3. **anon-callable** sanitized invite preview for `/invite/[token]`. |
| `accept_invitation(p_token)` | text | json | Phase 3. Email-match + pending/unexpired + not-already-in-another-org; links caller into the org (no attestation). |
| `submit_invitation_request(email, full_name, …)` | — | uuid | Phase 3. **anon-callable** public intake into `invitation_requests`. |

### Extensions

- `pgcrypto` (UUIDs)
- `citext` (case-insensitive email + code lookups). **Installed in `extensions` schema**, NOT public.

### Storage buckets

- **`product-coas`** — public-read, admin-write, 20 MB cap, PDF only. RLS in migration `0004_product_coas.sql`.
- **`client-resources`** — **PRIVATE** (signed-URL downloads), authenticated-read + admin-write, 20 MB cap, PDF only. RLS in migration `0009_client_resources.sql`.
- **`org-attestations`** — **PRIVATE**, 20 MB cap, PDF only. Path `org-attestations/{org_id}/{file}`. Per-action storage RLS (`0012`): a member reads their own org's folder, the org-admin uploads to it, staff full access, deletes staff-only. Signed-URL view in `/admin/organizations/[id]`.

---

## What's live today

### Marketing (anon)
- `/` — home with animated molecular hero, trust bar, value props, category cards, testimonials, CTA
- `/about`, `/quality`, `/resources`, `/contact`, `/privacy`, `/terms`
- Audience-segment pages: `/clinics`, `/pharmacies`, `/research`, `/enterprise`
- `/products` — filterable, searchable catalog. **Each card shows "From $X"** when a price is set (Checkpoint 2).
- `/products/[slug]` — strength selector defaults to the cheapest priced strength (G2), Add-to-Cart with quantity, **COA download link** when uploaded (Checkpoint 3), spec table, related products, breadcrumb.

### Cart + checkout
- **`/cart`** — client-only, backed by `localStorage[cl_cart_v1]`, hydration-guarded. Affiliate code input calls `validate_affiliate_code` RPC. Renders a **reorder toast** when redirected from a Reorder button.
- **`/checkout`** — collects shipping address, POSTs to `/api/orders`, redirects to `/portal/orders/{id}?placed=1`.

### Customer portal (`/portal`)
- `/portal` — order list with status badges. **Each row has a Reorder button** (Checkpoint 4).
- `/portal/orders/[id]` — line items, totals, shipping, **6-step horizontal status timeline** (Checkpoint 5), **clickable tracking link** to UPS/FedEx/USPS/DHL (G4), two-way message thread, Resend payment email button, wide Reorder card.
- `/portal/account` — server-action form to update name, phone, shipping default.
- `/portal/resources` — **NEW** — RUO-sanitized Client Starter Kit (research-voice onboarding) + signed-URL downloads of admin-published docs.

### Admin console (`/admin`)
- `/admin` — **hero metrics**: Outstanding $, Oldest pending (red at 3+ days), Paid this week $, New orders (7d). Plus recent paid orders table (Checkpoint 6).
- `/admin/orders` — list filterable by 8 statuses, search by order #.
- `/admin/orders/[id]` — full order: customer info, items, payment metadata, affiliate referral, message thread, **OrderEditor** (status dropdown, tracking carrier/number, internal notes).
- `/admin/pricing` — every product × strength SKU with **Cost | Retail | Margin ($/%)** columns, per-row "×4" + "Recompute all at 4× cost" bulk + "Save changed". Cost is admin-only.
- `/admin/sales-sheet` — **NEW** — read-only cost/retail/profit by category w/ category + grand totals ("my eyes only" margin reference; the RUO Starter Pack tool).
- `/admin/resources` — **NEW** — upload/list/delete client onboarding docs (private bucket) surfaced on `/portal/resources`.
- `/admin/coas` — **NEW** — products grouped by category with per-product COA upload (PDF → public bucket → DB row). Coverage stat (count uploaded / total products). Replace + delete actions (Checkpoint 3).
- `/admin/affiliates` — two sections:
  1. Per-affiliate aggregates (codes / orders / gross / commission)
  2. Per-code performance (% off / status / paid orders / gross / discount given)
- `/admin/affiliates/[id]` — per-affiliate detail, code CRUD, referred orders.

### Cross-cutting
- **Header** (`src/components/Header.tsx`) — auth-state-aware CTAs (Sign in/Sign up ↔ Client Portal/Sign out), cart count badge, Request a Quote (Checkpoint 1).
- **PromoBanner** below the header — renders when `cl_ref` cookie is set AND the code validates. Dismissible per session (Checkpoint 7).
- **Footer** — value props, regulatory note, contact.
- **Security headers** applied by middleware to every response: HSTS, X-Frame-Options DENY, X-Content-Type-Options, restrictive Permissions-Policy, strict Referrer-Policy.

### Backend
- `/api/orders` (POST) — calls `create_order_with_items` RPC; triggers Green.Money invoice + ops SMS.
- `/api/orders/[id]` (GET), `.../messages` (POST), `.../resend-invoice` (POST).
- `/api/admin/orders/[id]` (PATCH) — admin status/tracking/notes.
- `/api/admin/prices` · `/api/admin/affiliates` · `/api/admin/affiliate-codes`.
- `/api/cron/poll-invoices` (every 15 min) — pulls invoice status, maps `PaymentResult` codes → order status.
- `/api/cron/pull-notifications` (daily 09:00) — pulls Green.Money notification queue into `gbp_notifications`.

### Integrations (mock-aware)
- **Green.Money** (`src/lib/gbp/`) — eCheck.asmx form-POST/XML. `GBP_MOCK=true` writes to `.gbp-log.jsonl`.
- **Twilio** (`src/lib/twilio.ts`) — single-recipient ops SMS on every new order. `TWILIO_MOCK=true` writes to `.twilio-log.jsonl`. 5-second timeout, never throws.

---

## Repo layout

```
clariven-labs/
├── HANDOFF.md                          ← you are here
├── README.md                           ← Next.js boilerplate, mostly
├── package.json                        ← npm-based; pnpm is the sibling project
├── playwright.config.ts                ← port 3100, single chromium project
├── vercel.json                         ← 2 cron entries
├── next.config.ts · tsconfig.json · eslint.config.mjs · postcss.config.mjs
├── .env.local.example                  ← all env vars annotated
├── graphify-out/                       ← knowledge graph (gitignored)
├── supabase/
│   └── migrations/
│       ├── 0001_init.sql               ← profiles, affiliates, prices, orders, RPCs
│       ├── 0002_advisors_fix.sql       ← citext schema move, advisor fixes
│       ├── 0003_user_rpcs_and_fixes.sql ← attach_invoice_to_order, stamp_referral
│       └── 0004_product_coas.sql       ← COA table + bucket + RLS
├── tests/e2e/
│   ├── helpers.ts                      ← TEST_EMAIL_DOMAIN, ADMIN_EMAIL, TEST_PASSWORD
│   ├── global-setup.ts / global-teardown.ts
│   ├── auth.spec.ts · cart-and-order.spec.ts · admin-pricing.spec.ts
│   └── rls-isolation.spec.ts · cron-poll.spec.ts
└── src/
    ├── middleware.ts                   ← auth refresh + ?ref= cookie + security headers + route gating
    ├── lib/
    │   ├── database.types.ts           ← Supabase MCP-generated; regenerate after migrations
    │   ├── products.ts                 ← static catalog (id, slug, strengths, etc.)
    │   ├── utils.ts                    ← cn() helper
    │   ├── auth/roles.ts               ← getSessionUser, getProfile, requireAdmin
    │   ├── cart/
    │   │   ├── types.ts                ← Cart, CartLine, cartLineKey, cartSubtotalCents, cartCount
    │   │   └── store.ts                ← useCart() hook; localStorage[cl_cart_v1]; queueMicrotask dispatch
    │   ├── coas/                       ← NEW (Checkpoint 3)
    │   │   ├── queries.ts              ← getCoasForProduct, getBestCoa (with publicUrl)
    │   │   └── actions.ts              ← uploadCoa, deleteCoa (admin-only server actions)
    │   ├── gbp/                        ← Green.Money client
    │   │   ├── client.ts · invoices.ts · types.ts
    │   ├── schemas/                    ← Zod schemas per resource
    │   │   ├── admin.ts · affiliate.ts · order.ts · price.ts
    │   ├── supabase/
    │   │   ├── client.ts               ← browser client
    │   │   ├── server.ts               ← RSC + server-action client
    │   │   ├── admin.ts                ← service-role client (CRON ONLY)
    │   │   └── middleware.ts           ← updateSession + cookie persistence
    │   ├── tracking.ts                 ← NEW carrier URL map (UPS/FedEx/USPS/DHL)
    │   └── twilio.ts                   ← ops SMS, mock-aware
    ├── components/
    │   ├── Header.tsx                  ← auth-state-aware, cart badge
    │   ├── Footer.tsx
    │   ├── admin/
    │   │   ├── AffiliateCreate.tsx · AffiliateDetail.tsx
    │   │   ├── OrderEditor.tsx · PricingEditor.tsx
    │   │   └── CoaUpload.tsx           ← NEW (Checkpoint 3)
    │   ├── portal/
    │   │   ├── MessageThread.tsx
    │   │   ├── OrderStatusBadge.tsx
    │   │   ├── OrderStatusTimeline.tsx ← NEW (Checkpoint 5)
    │   │   ├── ResendInvoiceButton.tsx
    │   │   └── ReorderButton.tsx       ← NEW (Checkpoint 4)
    │   └── products/
    │       ├── AddToCartControl.tsx
    │       └── PromoBanner.tsx         ← NEW (Checkpoint 7)
    └── app/
        ├── layout.tsx                  ← Header + PromoBanner + main + Footer
        ├── page.tsx                    ← home
        ├── icon.tsx · opengraph-image.tsx · globals.css
        ├── about/, clinics/, contact/, enterprise/, pharmacies/, privacy/,
        │   quality/, research/, resources/, terms/
        ├── login/, signup/, logout/, auth/callback/
        ├── cart/, checkout/
        ├── portal/
        │   ├── layout.tsx · page.tsx · account/page.tsx
        │   └── orders/[id]/page.tsx
        ├── admin/
        │   ├── layout.tsx · page.tsx
        │   ├── orders/page.tsx · orders/[id]/page.tsx
        │   ├── pricing/page.tsx
        │   ├── coas/page.tsx           ← NEW (Checkpoint 3)
        │   └── affiliates/page.tsx · affiliates/[id]/page.tsx
        └── api/
            ├── orders/route.ts · orders/[id]/route.ts · …/messages · …/resend-invoice
            ├── admin/orders/[id]/route.ts · admin/prices · admin/affiliates · admin/affiliate-codes
            └── cron/poll-invoices/route.ts · cron/pull-notifications/route.ts
```

---

## Migration discipline

Every time you change the schema:

1. Apply via Supabase MCP `apply_migration` with `project_id: nkefzhgleymxhifpgfcn`.
2. **Always** also commit the SQL to `supabase/migrations/NNNN_name.sql` (4-digit zero-padded, hyphenated snake-case) so it's replayable in a fresh DB.
3. **Always** regenerate types via Supabase MCP `generate_typescript_types` and overwrite `src/lib/database.types.ts`. Do not hand-edit.
4. Run `npm run typecheck` immediately after — types regen plus your migration plus the consuming code must all reconcile in one commit.

---

## Test conventions

- Suite lives in `tests/e2e/`. Run with `set -a && source .env.local && set +a && npm run test:e2e`.
- `tests/e2e/helpers.ts` exports `TEST_EMAIL_DOMAIN = 'clariven-e2e.test'`, `ADMIN_EMAIL`, `CUSTOMER_EMAIL`, `SECONDARY_CUSTOMER_EMAIL`, `TEST_PASSWORD`.
- `globalSetup` truncates all users in `@clariven-e2e.test`, then creates fresh customer + admin + secondary customer. **Never** seed prod data into these emails.
- Playwright uses port `3100` and its own dev server. If preview MCP is running on port 3000 you can run tests concurrently. If preview is on 3100, stop it first.
- The 4 known pre-existing failures are documented above.

---

## Vercel deployment

- **`vercel.json`** declares 2 cron entries (`*/15 * * * *` for poll-invoices, `0 9 * * *` for pull-notifications).
- **Required prod env vars** (see `.env.local.example` for the full list with annotations):
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only, cron-only)
  - `NEXT_PUBLIC_SITE_URL`
  - `GBP_API_BASE`, `GBP_CLIENT_ID`, `GBP_API_PASSWORD` · `GBP_MOCK=false` in prod
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`, `KATIE_PHONE_NUMBER` · `TWILIO_MOCK=false` in prod
  - `CRON_SECRET` (32+ random chars; rotated periodically; matches `Authorization: Bearer` from Vercel Cron)
  - `UPSTASH_REDIS_REST_URL` / `_TOKEN` (optional rate limiting; not currently consumed)

---

## Roadmap / queued work

User has new features planned for the next session. Likely candidates from the previously generated feature menu (parking lot at `~/.claude/plans/knowing-what-you-currently-calm-hennessy.md`):

**Admin power tools (Group 3)**
- Inline mark-shipped + tracking popover on `/admin/orders` rows
- Bulk status change
- CSV export of filtered orders
- Audit log viewer at `/admin/audit` (data is already being written)
- Commission payout report
- Customer detail view at `/admin/customers/[id]` with admin-only `profiles.admin_notes`

**Catalog / pricing levers**
- Sale price + compare-at columns on `product_prices` (crossed-out original)
- Tiered / qty discounts per SKU
- Site-wide promo codes decoupled from affiliates

**Operational / launch-readiness**
- `/api/healthz` returning Supabase + Green.Money + Twilio status
- Sentry / error capture
- Rate limit `/api/orders` + admin POSTs (Upstash env vars already in spec)
- Lighthouse + axe in CI

**Sibling parity (Purity Science PR #1 features still NOT in ClarivenLabs)**
- Support tickets subsystem (`lib/support/` on PR #1)
- Multi-org / team invites (requires schema rewrite — likely too invasive)
- Reorder list templates / saved-list abstraction (we shipped a simpler one-shot reorder; Purity has saved templates)

User will describe specifically which to tackle next.

---

## Adopt next session (the env-resilience helper)

`src/lib/coas/actions.ts` has a private `envConfigured()` check at the top. Most other server actions don't. Promote this to a shared helper at `src/lib/supabase/env.ts` and wrap every new server action with it before `createClient()` so prod env misconfiguration surfaces as a friendly error rather than a styled 500. This is the only architectural invariant (#8) that isn't uniformly applied yet — fix it before the next big feature lands.

---

## Per-milestone protocol

When the user says "build feature X":

1. **If it's milestone-sized**, write a plan-mode plan first. Use `ExitPlanMode` for approval.
2. For smaller changes, proceed but commit at clean breakpoints.
3. Commit message tags: `feat(<area>):`, `chore(<area>):`, `docs(<area>):`, `fix:`. Look at recent `git log` for style.
4. Mirror Purity Science patterns when porting (read `git show claude/quizzical-cray-809438:lib/<dir>/...` from `/Users/samovington/Purityscience`).
5. After material code changes: `graphify update .` to keep the graph current.
6. After applying any migration: regenerate types + refresh HANDOFF if behavior or scope shifted in a meaningful way, in a single `docs(handoff):` commit at the end of the session.
