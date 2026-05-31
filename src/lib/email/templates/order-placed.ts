import { baseEmailHtml, escapeHtml, formatUsd, TEXT_FOOTER } from './layout';

export type OrderPlacedInput = {
  customerName: string;
  orderNumber: number | string;
  totalCents: number;
  itemSummary: string;
  ctaUrl: string;
};

/**
 * "Order received" confirmation, fired the moment an order is created. The
 * actual payment invoice is sent separately by Green.Money — this is the
 * Clariven-branded acknowledgement so the customer has a record + a portal link.
 */
export function orderPlacedEmail({
  customerName,
  orderNumber,
  totalCents,
  itemSummary,
  ctaUrl,
}: OrderPlacedInput) {
  const orderRef = `#${orderNumber}`;
  const subject = `Order received — ${orderRef}`;

  const text = [
    `Hi ${customerName},`,
    '',
    `We've received your order ${orderRef}.`,
    '',
    `Items: ${itemSummary}`,
    `Total: ${formatUsd(totalCents)}`,
    '',
    'A payment invoice is on its way in a separate email. You can track your',
    'order status any time in your portal:',
    ctaUrl,
    TEXT_FOOTER,
  ].join('\n');

  const bodyHtml = `
    <p style="margin:0 0 16px;">Hi ${escapeHtml(customerName)},</p>
    <p style="margin:0 0 16px;">We've received your order <strong style="font-family:'JetBrains Mono',ui-monospace,monospace;color:#0A1628;">${escapeHtml(orderRef)}</strong>. A payment invoice is on its way in a separate email.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border:1px solid #E2E8F0;border-radius:8px;width:100%;background:#F8FAFC;">
      <tr><td style="padding:14px 18px;border-bottom:1px solid #E2E8F0;">
        <p style="margin:0 0 2px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#0D9488;">Items</p>
        <p style="margin:0;font-size:14px;color:#334155;">${escapeHtml(itemSummary)}</p>
      </td></tr>
      <tr><td style="padding:14px 18px;">
        <p style="margin:0 0 2px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#0D9488;">Total</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:#0A1628;">${escapeHtml(formatUsd(totalCents))}</p>
      </td></tr>
    </table>`;

  const html = baseEmailHtml({
    preheader: `Order ${orderRef} received — ${formatUsd(totalCents)}`,
    eyebrow: 'Order received',
    heading: 'Thanks — we have your order.',
    bodyHtml,
    ctaLabel: 'View order',
    ctaUrl,
  });

  return { subject, html, text };
}
