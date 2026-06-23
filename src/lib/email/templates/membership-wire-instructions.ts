import { baseEmailHtml, escapeHtml, formatUsd, TEXT_FOOTER } from './layout';

export type WireDetails = {
  bankName: string;
  accountName: string;
  routing: string;
  account: string;
  swift?: string | null;
  reference: string;
};

export type MembershipWireInput = {
  name: string;
  amountCents: number;
  wire: WireDetails;
};

/** Bank-wire instructions for the initial engagement fee. Wire values come from
 *  env (sensitive) and are passed in by the caller — never hard-coded. */
export function membershipWireEmail({ name, amountCents, wire }: MembershipWireInput) {
  const subject = `Wire instructions — initial engagement fee (${formatUsd(amountCents)})`;
  const rows: [string, string][] = [
    ['Amount', formatUsd(amountCents)],
    ['Bank', wire.bankName],
    ['Account name', wire.accountName],
    ['Routing (ABA)', wire.routing],
    ['Account number', wire.account],
    ...(wire.swift ? ([['SWIFT / BIC', wire.swift]] as [string, string][]) : []),
    ['Reference', wire.reference],
  ];

  const text = [
    `Hi ${name},`,
    '',
    `Below are the wire instructions for your initial engagement fee of ${formatUsd(amountCents)}.`,
    '',
    ...rows.map(([l, v]) => `${l}: ${v}`),
    '',
    'Please include the reference so we can match your payment. Reply with any questions.',
    TEXT_FOOTER,
  ].join('\n');

  const bodyHtml = `
    <p style="margin:0 0 16px;">Hi ${escapeHtml(name)},</p>
    <p style="margin:0 0 16px;">Below are the wire instructions for your initial engagement fee of <strong>${escapeHtml(formatUsd(amountCents))}</strong>. Please include the reference so we can match your payment.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border:1px solid #E2E8F0;border-radius:8px;width:100%;background:#F8FAFC;">
      ${rows
        .map(
          ([l, v]) =>
            `<tr><td style="padding:10px 16px;border-bottom:1px solid #E2E8F0;vertical-align:top;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#0D9488;white-space:nowrap;">${escapeHtml(l)}</td><td style="padding:10px 16px;border-bottom:1px solid #E2E8F0;font-size:14px;color:#334155;font-family:'JetBrains Mono',ui-monospace,monospace;">${escapeHtml(v)}</td></tr>`,
        )
        .join('')}
    </table>`;

  const html = baseEmailHtml({
    preheader: `Wire instructions — ${formatUsd(amountCents)} initial engagement fee.`,
    eyebrow: 'Payment',
    heading: 'Wire instructions',
    bodyHtml,
  });

  return { subject, html, text };
}
