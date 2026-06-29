// Onboarding-call request CTA. Booking is handled by emailing Alletia directly
// (no scheduler), so this builds a mailto: with a pre-filled subject + body.
// Client-safe (no server-only imports) — imported by both the email templates
// and the public /apply success screen.

export const ALLETIA_EMAIL = 'alletia.demartino@s8ventures.com';

export function requestCallMailto(name = ''): string {
  const subject = 'Onboarding call request';
  const body = [
    'Hi Alletia,',
    '',
    "I'd like to request my Clariven onboarding call. A few times that work for me:",
    '- ',
    '- ',
    '- ',
    '',
    `Thanks,${name ? `\n${name}` : ''}`,
  ].join('\n');
  // ponytail: \n encodes to %0A — switch to %0D%0A only if a target mail client mishandles it
  return `mailto:${ALLETIA_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
