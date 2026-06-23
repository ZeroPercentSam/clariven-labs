import { baseEmailHtml, escapeHtml, formatUsd, TEXT_FOOTER } from './layout';

export type MembershipWelcomeInput = {
  name: string;
  /** Booking link (Calendly/Cal.com). Empty string → CTA + url line omitted. */
  bookingUrl: string;
  initialFeeCents: number;
};

/** "Welcome to Clariven Labs — here's what happens next" applicant email. */
export function membershipWelcomeEmail({ name, bookingUrl, initialFeeCents }: MembershipWelcomeInput) {
  const subject = 'Welcome to Clariven Labs — here’s what happens next';
  const fee = formatUsd(initialFeeCents);

  const text = [
    `Hi ${name},`,
    '',
    'Welcome to Clariven Labs. We help you launch and run a research-use-only',
    'product line end to end — compliance, brand, web, and fulfillment.',
    '',
    'Here’s what happens next:',
    '1. Sign your consulting agreement — check your inbox for a separate email to review and e-sign.',
    `2. Submit your initial engagement fee of ${fee} — wire instructions are in a separate email.`,
    bookingUrl ? `3. Book your onboarding call: ${bookingUrl}` : '3. Book your onboarding call — we’ll send a link shortly.',
    '4. We provision your private client portal and guided onboarding checklist.',
    '',
    'Questions any time: support@clarivenlabs.com',
    TEXT_FOOTER,
  ].join('\n');

  const item = (s: string) => `<li style="margin:0 0 10px;">${s}</li>`;
  const bodyHtml = `
    <p style="margin:0 0 16px;">Hi ${escapeHtml(name)},</p>
    <p style="margin:0 0 16px;">Welcome to Clariven Labs. We help you launch and run a research-use-only product line end to end — compliance, brand, web, and fulfillment.</p>
    <p style="margin:0 0 8px;font-weight:600;color:#0A1628;">Here’s what happens next</p>
    <ol style="margin:0 0 20px;padding-left:20px;color:#334155;font-size:15px;line-height:1.6;">
      ${item('Sign your consulting agreement — check your inbox for a separate email to review and e-sign.')}
      ${item(`Submit your initial engagement fee of <strong>${escapeHtml(fee)}</strong> — wire instructions are in a separate email.`)}
      ${item(bookingUrl ? 'Book your onboarding call using the button below.' : 'Book your onboarding call — we’ll send a link shortly.')}
      ${item('We provision your private client portal and guided onboarding checklist.')}
    </ol>`;

  const html = baseEmailHtml({
    preheader: 'Welcome to Clariven Labs — your next steps inside.',
    eyebrow: 'Welcome',
    heading: 'Welcome to Clariven Labs',
    bodyHtml,
    ...(bookingUrl ? { ctaLabel: 'Book your onboarding call', ctaUrl: bookingUrl } : {}),
  });

  return { subject, html, text };
}
