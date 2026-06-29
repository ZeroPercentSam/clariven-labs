import { baseEmailHtml, escapeHtml, TEXT_FOOTER } from './layout';

export type MembershipSignedInput = { orgName: string; clientName: string; adminUrl: string };

/** Internal notify to the Clariven team when a client e-signs the consulting agreement. */
export function membershipSignedEmail({ orgName, clientName, adminUrl }: MembershipSignedInput) {
  const subject = `Agreement signed — ${orgName}`;
  const text = [
    'A client just e-signed the Consulting Services Agreement in the portal.',
    '',
    `Client: ${clientName}`,
    `Organization: ${orgName}`,
    '',
    `Review: ${adminUrl}`,
    TEXT_FOOTER,
  ].join('\n');
  const bodyHtml = `<p style="margin:0 0 16px;"><strong>${escapeHtml(clientName)}</strong> (${escapeHtml(orgName)}) just e-signed the Consulting Services Agreement in the client portal.</p>`;
  const html = baseEmailHtml({
    preheader: `Agreement signed — ${orgName}`,
    eyebrow: 'Agreement signed',
    heading: 'Consulting agreement signed',
    bodyHtml,
    ctaLabel: 'Review in admin',
    ctaUrl: adminUrl,
  });
  return { subject, html, text };
}
