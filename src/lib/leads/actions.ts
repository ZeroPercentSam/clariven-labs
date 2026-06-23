'use server';

import { headers } from 'next/headers';
import { sendEmail } from '@/lib/email/send';
import { checkRateLimit } from '@/lib/ratelimit';

// Shared handler for the public contact form (/contact) and the home-page
// consultation form (/). Both are unauthenticated → trust boundary: validate
// every field, honeypot + rate-limit against spam, then notify the team inbox.
// Leads are emailed (not persisted) — add a DB table only if lead history is
// needed. ponytail: email-only sink, add a `leads` table when you need a CRM.

export type LeadState = { ok: boolean; error?: string };

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}

const ROW_LABELS: Record<string, string> = {
  Name: 'name',
  Email: 'email',
  Phone: 'phone',
  Organization: 'organization',
  Role: 'role',
  Interest: 'interest',
  Message: 'message',
};

export async function submitLead(_prev: LeadState, formData: FormData): Promise<LeadState> {
  // Honeypot: a hidden field real users never see. If filled, it's a bot —
  // return success so the bot moves on, but send nothing.
  if (String(formData.get('company_website') ?? '').trim()) return { ok: true };

  const get = (k: string) => String(formData.get(k) ?? '').trim().slice(0, 2000);
  const name = get('name') || [get('firstName'), get('lastName')].filter(Boolean).join(' ').trim();
  const email = get('email');
  const phone = get('phone');
  const organization = get('organization');
  const role = get('role');
  const interest = get('interest');
  const message = get('message');

  if (!name) return { ok: false, error: 'Please enter your name.' };
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }

  // Per-IP rate limit (no-op until Upstash is configured; fails open).
  const hdrs = await headers();
  const ip = (hdrs.get('x-forwarded-for')?.split(',')[0] ?? hdrs.get('x-real-ip') ?? 'unknown').trim();
  const rl = await checkRateLimit(`lead:${ip}`, { name: 'lead', limit: 5, windowSec: 3600 });
  if (!rl.ok) {
    return { ok: false, error: 'Too many requests — try again later, or email support@clarivenlabs.com.' };
  }

  const values: Record<string, string> = { name, email, phone, organization, role, interest, message };
  const rows = Object.entries(ROW_LABELS)
    .map(([label, key]) => [label, values[key]] as const)
    .filter(([, v]) => v);

  const html = `<h2>New consultation request</h2><table cellpadding="6" style="border-collapse:collapse">${rows
    .map(
      ([label, v]) =>
        `<tr><td style="font-weight:600;vertical-align:top">${esc(label)}</td><td>${esc(v).replace(/\n/g, '<br>')}</td></tr>`,
    )
    .join('')}</table>`;
  const text = `New consultation request\n\n${rows.map(([label, v]) => `${label}: ${v}`).join('\n')}`;

  const to = process.env.LEAD_NOTIFY_EMAIL || 'support@clarivenlabs.com';
  const res = await sendEmail({ to, subject: `New consultation request — ${name}`, html, text, kind: 'contact-lead' });
  if (!res.ok) {
    return { ok: false, error: 'Could not send right now. Please email support@clarivenlabs.com directly.' };
  }
  return { ok: true };
}
