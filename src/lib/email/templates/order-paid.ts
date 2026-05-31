import { baseEmailHtml, escapeHtml, formatUsd, TEXT_FOOTER } from './layout';

export type OrderPaidInput = {
  customerName: string;
  orderNumber: number | string;
  totalCents: number;
  ctaUrl: string;
};

/**
 * "Payment received" confirmation, fired when the Green.Money poll detects an
 * order transitioning to paid. Reassures the customer and sets the next-step
 * expectation (preparing → shipped).
 */
export function orderPaidEmail({
  customerName,
  orderNumber,
  totalCents,
  ctaUrl,
}: OrderPaidInput) {
  const orderRef = `#${orderNumber}`;
  const subject = `Payment received — order ${orderRef}`;

  const text = [
    `Hi ${customerName},`,
    '',
    `We've received your payment of ${formatUsd(totalCents)} for order ${orderRef}.`,
    '',
    'Your order is now being prepared. We\'ll email you tracking as soon as it',
    'ships. Track status any time in your portal:',
    ctaUrl,
    TEXT_FOOTER,
  ].join('\n');

  const bodyHtml = `
    <p style="margin:0 0 16px;">Hi ${escapeHtml(customerName)},</p>
    <p style="margin:0 0 16px;">We've received your payment of <strong style="color:#0A1628;">${escapeHtml(formatUsd(totalCents))}</strong> for order <strong style="font-family:'JetBrains Mono',ui-monospace,monospace;color:#0A1628;">${escapeHtml(orderRef)}</strong>.</p>
    <p style="margin:0 0 20px;">Your order is now being prepared. We'll email you tracking as soon as it ships.</p>`;

  const html = baseEmailHtml({
    preheader: `Payment received for order ${orderRef}`,
    eyebrow: 'Payment received',
    heading: 'Payment confirmed — preparing your order.',
    bodyHtml,
    ctaLabel: 'View order',
    ctaUrl,
  });

  return { subject, html, text };
}
