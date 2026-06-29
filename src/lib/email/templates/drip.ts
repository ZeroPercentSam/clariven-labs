import { baseEmailHtml, escapeHtml, TEXT_FOOTER } from './layout';
import { requestCallMailto } from '../request-call';

/** The four staged onboarding follow-ups. Kinds double as EmailKind log keys. */
export type DripKind =
  | 'drip-sign-reminder'
  | 'drip-checklist-nudge'
  | 'drip-launch-ready'
  | 'drip-live-checkin';

type DripInput = { name: string; portalUrl: string };

type Spec = {
  subject: string;
  eyebrow: string;
  heading: string;
  preheader: string;
  paras: string[];
  ctaLabel: string;
  ctaUrl: string;
  /** Append the "request an onboarding call" mailto line (to Alletia). */
  showCallLink?: boolean;
};

export function dripEmail(kind: DripKind, input: DripInput): { subject: string; html: string; text: string } {
  const name = input.name?.trim() || 'there';
  const mailto = requestCallMailto(input.name);
  const spec = specFor(kind, input.portalUrl);

  const bodyHtml = [
    `<p style="margin:0 0 16px;">Hi ${escapeHtml(name)},</p>`,
    ...spec.paras.map((p) => `<p style="margin:0 0 16px;color:#334155;">${escapeHtml(p)}</p>`),
    spec.showCallLink
      ? `<p style="margin:0 0 8px;color:#334155;">Prefer to talk it through? <a href="${mailto}" style="color:#0D9488;font-weight:600;">Request an onboarding call by clicking here</a> — it opens a pre-filled email; just add a couple of times that work.</p>`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  const html = baseEmailHtml({
    preheader: spec.preheader,
    eyebrow: spec.eyebrow,
    heading: spec.heading,
    bodyHtml,
    ctaLabel: spec.ctaLabel,
    ctaUrl: spec.ctaUrl,
  });

  const text = [
    `Hi ${name},`,
    '',
    ...spec.paras.flatMap((p) => [p, '']),
    `${spec.ctaLabel}: ${spec.ctaUrl}`,
    ...(spec.showCallLink ? ['', `Or request an onboarding call: ${mailto}`] : []),
    '',
    'Questions any time: support@clarivenlabs.com',
    TEXT_FOOTER,
  ].join('\n');

  return { subject: spec.subject, html, text };
}

function specFor(kind: DripKind, portal: string): Spec {
  switch (kind) {
    case 'drip-sign-reminder':
      return {
        subject: 'Quick step: your Clariven consulting agreement is waiting',
        eyebrow: 'Next step',
        heading: 'One quick step to get started',
        preheader: 'Your consulting agreement still needs your e-signature.',
        paras: [
          'One item before we can start building — your consulting agreement still needs your e-signature. It takes about two minutes in your portal.',
          "Once it's signed we'll send your wire instructions and help you book your onboarding call.",
        ],
        ctaLabel: 'Review & e-sign',
        ctaUrl: portal,
      };
    case 'drip-checklist-nudge':
      return {
        subject: 'Anything blocking your Clariven onboarding?',
        eyebrow: 'Checking in',
        heading: 'Anything we can unblock?',
        preheader: "Your onboarding checklist hasn't moved in about a week.",
        paras: [
          "Checking in — your onboarding checklist hasn't moved in about a week. If you're stuck on an item (brand details, compliance docs, product selection), reply and we'll knock it out with you.",
        ],
        ctaLabel: 'Open your checklist',
        ctaUrl: portal,
        showCallLink: true,
      };
    case 'drip-launch-ready':
      return {
        subject: "You're cleared to launch",
        eyebrow: 'Milestone',
        heading: "You're cleared to launch",
        preheader: 'Your research-use-only product line is launch-ready.',
        paras: [
          "Big milestone — your research-use-only product line is launch-ready. Here's the final checklist before we flip you live.",
          "Reply with any last questions and we'll set your go-live date.",
        ],
        ctaLabel: 'View final checklist',
        ctaUrl: portal,
      };
    case 'drip-live-checkin':
      return {
        subject: "You're live — here's how to run it",
        eyebrow: "You're live",
        heading: "You're live — here's how to run it",
        preheader: 'Track orders, reorder, and pull COAs from your portal.',
        paras: [
          "Congrats on going live. From your portal you can track orders, reorder products, and pull COAs anytime. We're on call for anything — compliance, brand, web, and fulfillment.",
        ],
        ctaLabel: 'Open your portal',
        ctaUrl: portal,
        showCallLink: true,
      };
  }
}
