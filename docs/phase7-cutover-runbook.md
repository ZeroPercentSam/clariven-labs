# Phase 7 — Production cutover runbook (cred-gated)

One-shot, push-button cutover for ClarivenLabs once Sam provides the creds below.
Everything here is **blocked on creds only** — the code is built, deployed, and
no-ops cleanly until each key lands. Run top to bottom; each step is idempotent.

- Supabase project ref: `nkefzhgleymxhifpgfcn`
- Vercel project: `prj_Y81sT27IjQhSAqDmPM3UQRzPrv5R` · team `team_UzmBeQLz4ciE24ALWGwgkYhF`
- Apex: `clarivenlabs.com` **307-redirects to www.clarivenlabs.com on ALL routes (incl. /api)** — always `curl -L`.
- Advisors baseline (2026-06-01): **WARN-only, zero ERROR**. Must stay WARN-only after cutover.

---

## 0. Preconditions — creds Sam must hand over

| Cred | Where it goes | Notes |
|---|---|---|
| `SUPABASE_ACCESS_TOKEN` (`sbp_…`) | shell env, script-only | **Rotate immediately after** running step 2. |
| Resend project + `updates.clarivenlabs.com` DNS | Resend dashboard | MX + SPF + 3 DKIM CNAMEs + DMARC (`p=none`). Verify domain → "verified" before step 1. |
| `RESEND_API_KEY` (`re_…`) | Vercel env ×3 + `.env.local` | Email layer no-ops while empty — nothing breaks pre-cutover. |
| `RESEND_FROM_EMAIL` | Vercel env ×3 | `ClarivenLabs <noreply@updates.clarivenlabs.com>` |
| `RESEND_REPLY_TO` | Vercel env ×3 | `support@clarivenlabs.com` |
| `UPSTASH_REDIS_REST_URL` + `_TOKEN` | Vercel env ×3 | Vercel Marketplace → Upstash. Flips rate-limiting from no-op → live 429s. |
| Live GBP creds (`GBP_CLIENT_ID`, `GBP_API_PASSWORD`) | Vercel env (prod) | Required before flipping `GBP_MOCK=false`. |
| Live Twilio creds (`TWILIO_ACCOUNT_SID`/`_AUTH_TOKEN`/`_FROM_NUMBER`, `KATIE_PHONE_NUMBER`) | Vercel env (prod) | Required before flipping `TWILIO_MOCK=false`. |

Canonical env key list: `.env.local.example` (now includes the Resend block).

---

## 1. Resend domain + DNS (do first; DNS propagation is the long pole)

1. Create a **new** Resend project (isolated from Bioveris/Purity).
2. Add domain `updates.clarivenlabs.com`; copy the MX/SPF/DKIM/DMARC records into DNS.
3. Wait for Resend to show the domain **verified**, then:
   ```sh
   curl -H "Authorization: Bearer $RESEND_API_KEY" https://api.resend.com/domains
   # → the updates.clarivenlabs.com entry shows "status":"verified"
   ```

## 2. Supabase Auth config (Site URL + redirect allow-list + branded recovery email)

Runs `scripts/configure-supabase-auth.mjs` — sets Site URL, the reset/callback
URI allow-list (apex + www + vercel.app fallback), `mailer_autoconfirm=false`
(email verification ON), Resend SMTP, and the branded RUO-clean recovery template.

```sh
cd /Users/samovington/ClarivenLabs/clariven-labs
SUPABASE_ACCESS_TOKEN=sbp_xxx node --env-file=.env.local scripts/configure-supabase-auth.mjs
```

Requires `RESEND_API_KEY` in `.env.local` (the script wires it as SMTP pass).
Idempotent — every PATCH is a full-state set. **Rotate the access token after.**

Optional hardening (one toggle, closes the `auth_leaked_password_protection`
WARN): enable HaveIBeenPwned leaked-password protection in
Dashboard → Auth → Policies, or add `"password_hibp_enabled": true` to the
script's auth-config PATCH payload before running.

## 3. Vercel env vars (prod + preview + dev)

Set all of these on the project (Settings → Environment Variables, or `vercel env add`):

```
RESEND_API_KEY            = re_…           (all 3 envs)
RESEND_FROM_EMAIL         = ClarivenLabs <noreply@updates.clarivenlabs.com>
RESEND_REPLY_TO           = support@clarivenlabs.com
UPSTASH_REDIS_REST_URL    = https://…       (all 3 envs)
UPSTASH_REDIS_REST_TOKEN  = …
NEXT_PUBLIC_SITE_URL      = https://clarivenlabs.com   (prod; verify preview/dev too)
GBP_CLIENT_ID / GBP_API_PASSWORD          (prod, live)
TWILIO_ACCOUNT_SID / _AUTH_TOKEN / _FROM_NUMBER / KATIE_PHONE_NUMBER  (prod, live)
```

**Do NOT flip the mocks yet** — flip only after the live creds above are confirmed in env.

## 4. Flip integrations live (only after step 3 creds confirmed)

```
GBP_MOCK     = false    (prod)
TWILIO_MOCK  = false    (prod)
```

Keep `GBP_MOCK=true` / `TWILIO_MOCK=true` in preview + dev so CI/E2E never touch live.

## 5. Redeploy + confirm READY

The new env only applies to a fresh deployment. Push an empty commit (git author
must be `ZeroPercentSam <198869586+ZeroPercentSam@users.noreply.github.com>`):

```sh
git commit --allow-empty -m "chore: production cutover — live env" && git push
```

Poll the Vercel deployment until `readyState: READY`
(`get_deployment` MCP or dashboard). Project already has `ssoProtection: null`.

---

## 6. Verification (post-cutover smoke — all on the live apex)

- [ ] `curl -L https://clarivenlabs.com/api/healthz` → `200`; body shows
      `resend:"configured"`, `gbp:"configured"`, `twilio:"configured"`,
      `cron:"configured"` (NOT `mock`/`missing`).
- [ ] **Password reset round-trip:** `/forgot-password` on the live site → email
      arrives from `noreply@updates.clarivenlabs.com` with a
      `https://clarivenlabs.com/reset-password?...` link (NOT localhost) → reset succeeds.
- [ ] **Live order round-trip (small):** place one real order → GBP invoice fires,
      ops SMS to `KATIE_PHONE_NUMBER` arrives, order emails (placed/paid) land,
      `email_log` row written.
- [ ] **Rate limiting live:** 6 rapid `POST /api/orders` → 6th returns `429` +
      `Retry-After` (was a silent no-op pre-Upstash).
- [ ] `get_advisors` (security) → still **WARN-only, no new ERROR**.
- [ ] RUO guard intact: `site-no-clinical.spec` green; zero clinical/human-use
      language on customer routes.

## 7. Rollback

- Integrations misbehaving → set `GBP_MOCK=true` / `TWILIO_MOCK=true` back on prod + redeploy.
- Email bouncing → unset `RESEND_API_KEY` on prod (layer reverts to no-op; orders still succeed — side-effects are best-effort, never roll back the order).
- Auth redirect wrong → re-run step 2 after fixing the domain; the PATCH is a full-state overwrite.

---

## Exit criteria (Phase 7 / sprint done)

Full E2E green · branded transactional email live · RUO-locked · rate-limiting live ·
advisors WARN-only · 3 sites complete. Then final `docs(handoff):` HANDOFF.md rewrite.
