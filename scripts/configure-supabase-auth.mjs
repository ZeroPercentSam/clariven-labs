#!/usr/bin/env node
/**
 * Configure Supabase Auth for ClarivenLabs production.
 *
 * Sets the dashboard Site URL + URI allow-list (so password-reset / magic-link
 * redirects land on clarivenlabs.com, not localhost), and wires the recovery
 * email template + Resend SMTP so reset emails are Clariven-branded.
 *
 * RUO posture: the recovery email carries NO clinical / human-use language.
 *
 * Requires a Supabase Personal Access Token with project-config write scope:
 *   https://supabase.com/dashboard/account/tokens  (rotate after use)
 *
 * Run:
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx node --env-file=.env.local scripts/configure-supabase-auth.mjs
 *
 * Idempotent — every PATCH is a full-state set; re-run after any domain change.
 */

const PROJECT_REF = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(
  /https:\/\/([a-z0-9]+)\.supabase\.co/,
)?.[1];
if (!PROJECT_REF) {
  console.error("Missing project ref — couldn't parse NEXT_PUBLIC_SUPABASE_URL.");
  process.exit(1);
}

const PAT = process.env.SUPABASE_ACCESS_TOKEN;
if (!PAT) {
  console.error(
    'Missing SUPABASE_ACCESS_TOKEN. Set it inline:\n' +
      '  SUPABASE_ACCESS_TOKEN=sbp_... node --env-file=.env.local scripts/configure-supabase-auth.mjs',
  );
  process.exit(1);
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) {
  console.error('Missing RESEND_API_KEY in .env.local.');
  process.exit(1);
}

// ----------------------------------------------------------------------------
// Desired state
// ----------------------------------------------------------------------------

const SITE_URL = 'https://clarivenlabs.com';
const URI_ALLOW_LIST = [
  // Canonical (apex)
  `${SITE_URL}/reset-password`,
  `${SITE_URL}/auth/callback`,
  // www variant
  'https://www.clarivenlabs.com/reset-password',
  'https://www.clarivenlabs.com/auth/callback',
  // Vercel fallback host (pre-cutover links still validate)
  'https://clariven-labs.vercel.app/reset-password',
  'https://clariven-labs.vercel.app/auth/callback',
].join(',');

const SMTP = {
  smtp_admin_email: 'noreply@updates.clarivenlabs.com',
  smtp_host: 'smtp.resend.com',
  smtp_port: '465',
  smtp_user: 'resend',
  smtp_pass: RESEND_API_KEY,
  smtp_sender_name: 'ClarivenLabs',
  smtp_max_frequency: 60,
  rate_limit_email_sent: 60,
};

// User decision (2026-05): email verification ON for sign-ups.
const MAILER_AUTOCONFIRM = false;

// {{ .ConfirmationURL }} is Supabase's substitution token — preserve verbatim.
const TEMPLATES = {
  mailer_subjects_recovery: 'Reset your ClarivenLabs password',
  mailer_templates_recovery_content: `<!doctype html>
<html>
  <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Helvetica,Arial,sans-serif;background:#F8FAFC;color:#0F172A;margin:0;padding:32px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" width="560" style="background:#FFFFFF;border:1px solid #E2E8F0;border-radius:12px;">
      <tr>
        <td style="padding:32px 36px 16px 36px;border-bottom:1px solid #E2E8F0;">
          <p style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#0D9488;margin:0;">ClarivenLabs</p>
          <h1 style="font-size:22px;font-weight:700;margin:8px 0 0 0;color:#0A1628;">Reset your password</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 36px;">
          <p style="font-size:15px;line-height:1.55;margin:0 0 16px 0;">A password reset was requested for your ClarivenLabs account.</p>
          <p style="font-size:15px;line-height:1.55;margin:0 0 24px 0;">Click below to set a new password. If you didn't request this, ignore this email — your password stays the same.</p>
          <p style="text-align:center;margin:32px 0;">
            <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#0A1628;color:#FFFFFF;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px;">Reset password</a>
          </p>
          <p style="font-size:13px;color:#64748B;line-height:1.55;margin:24px 0 0 0;">Or paste this URL into your browser:</p>
          <p style="font-size:12px;word-break:break-all;color:#0D9488;margin:8px 0 0 0;">{{ .ConfirmationURL }}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 36px 24px 36px;border-top:1px solid #E2E8F0;">
          <p style="font-size:12px;color:#94A3B8;margin:0;">ClarivenLabs — research-use-only peptides. For Research Use Only. Not for human consumption.</p>
          <p style="font-size:11px;color:#94A3B8;margin:8px 0 0 0;">Questions? Reply to this email or write support@clarivenlabs.com.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`,
};

// ----------------------------------------------------------------------------
// PATCH the auth config
// ----------------------------------------------------------------------------

const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`;

const payload = {
  site_url: SITE_URL,
  uri_allow_list: URI_ALLOW_LIST,
  mailer_autoconfirm: MAILER_AUTOCONFIRM,
  ...SMTP,
  ...TEMPLATES,
};

console.log(`PATCH ${url}`);
const safePayload = { ...payload, smtp_pass: '<REDACTED>' };
console.log('Payload (secrets redacted):');
console.log(JSON.stringify(safePayload, null, 2));

const res = await fetch(url, {
  method: 'PATCH',
  headers: {
    Authorization: `Bearer ${PAT}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
});

if (!res.ok) {
  console.error(`PATCH failed: ${res.status} ${res.statusText}`);
  console.error(await res.text());
  process.exit(1);
}

const result = await res.json();
console.log('\n✓ Auth config updated.');
console.log(`  site_url:        ${result.site_url}`);
console.log(`  uri_allow_list:  ${result.uri_allow_list?.slice(0, 80)}…`);
console.log(`  smtp_host:       ${result.smtp_host}`);
console.log(`  smtp_sender:     ${result.smtp_admin_email}`);
console.log(`  recovery subj:   ${result.mailer_subjects_recovery}`);
console.log('\nNext: fire a forgot-password from the live login screen.');
console.log('Verify the email lands from noreply@updates.clarivenlabs.com with a');
console.log('https://clarivenlabs.com/reset-password?... link (NOT localhost).');
