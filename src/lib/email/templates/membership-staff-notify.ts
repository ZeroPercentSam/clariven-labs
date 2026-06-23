import { baseEmailHtml, escapeHtml, TEXT_FOOTER } from './layout';

export type MembershipStaffNotifyInput = {
  name: string;
  email: string;
  phone?: string | null;
  brand?: string | null;
  message?: string | null;
  adminUrl: string;
};

/** Internal notify to the Clariven team when a new /apply submission lands. */
export function membershipStaffNotifyEmail({
  name,
  email,
  phone,
  brand,
  message,
  adminUrl,
}: MembershipStaffNotifyInput) {
  const subject = `New client application — ${brand || name}`;
  const rows: [string, string][] = [
    ['Name', name],
    ['Email', email],
    ['Phone', phone || '—'],
    ['Proposed brand', brand || '—'],
    ['Message', message || '—'],
  ];

  const text = [
    'New client application received.',
    '',
    ...rows.map(([l, v]) => `${l}: ${v}`),
    '',
    `Review: ${adminUrl}`,
    TEXT_FOOTER,
  ].join('\n');

  const bodyHtml = `
    <p style="margin:0 0 16px;">A new client application just came in via the website.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border:1px solid #E2E8F0;border-radius:8px;width:100%;background:#F8FAFC;">
      ${rows
        .map(
          ([l, v]) =>
            `<tr><td style="padding:10px 16px;border-bottom:1px solid #E2E8F0;vertical-align:top;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#0D9488;white-space:nowrap;">${escapeHtml(l)}</td><td style="padding:10px 16px;border-bottom:1px solid #E2E8F0;font-size:14px;color:#334155;">${escapeHtml(v)}</td></tr>`,
        )
        .join('')}
    </table>`;

  const html = baseEmailHtml({
    preheader: `New client application — ${brand || name}`,
    eyebrow: 'New application',
    heading: 'New client application',
    bodyHtml,
    ctaLabel: 'Review in admin',
    ctaUrl: adminUrl,
  });

  return { subject, html, text };
}
