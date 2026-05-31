import { baseEmailHtml, escapeHtml, TEXT_FOOTER } from './layout';

export type OrderShippedInput = {
  customerName: string;
  orderNumber: number | string;
  carrier: string;
  trackingNumber: string;
  /** Carrier deep-link (lib/tracking trackingUrl); falls back to ctaUrl. */
  trackingUrl?: string | null;
  ctaUrl: string;
};

/**
 * "Order shipped" notice with carrier + tracking, fired when an admin sets an
 * order to shipped / adds tracking.
 */
export function orderShippedEmail({
  customerName,
  orderNumber,
  carrier,
  trackingNumber,
  trackingUrl,
  ctaUrl,
}: OrderShippedInput) {
  const orderRef = `#${orderNumber}`;
  const subject = `Your order shipped — ${orderRef}`;
  const trackHref = trackingUrl || ctaUrl;

  const text = [
    `Hi ${customerName},`,
    '',
    `Order ${orderRef} is on its way.`,
    '',
    `Carrier:  ${carrier}`,
    `Tracking: ${trackingNumber}`,
    '',
    'Track your shipment:',
    trackHref,
    TEXT_FOOTER,
  ].join('\n');

  const bodyHtml = `
    <p style="margin:0 0 16px;">Hi ${escapeHtml(customerName)},</p>
    <p style="margin:0 0 16px;">Order <strong style="font-family:'JetBrains Mono',ui-monospace,monospace;color:#0A1628;">${escapeHtml(orderRef)}</strong> handed off to ${escapeHtml(carrier)} today.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border:1px solid #E2E8F0;border-radius:8px;width:100%;background:#F8FAFC;">
      <tr><td style="padding:14px 18px;border-bottom:1px solid #E2E8F0;">
        <p style="margin:0 0 2px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#0D9488;">Carrier</p>
        <p style="margin:0;font-size:15px;color:#0A1628;">${escapeHtml(carrier)}</p>
      </td></tr>
      <tr><td style="padding:14px 18px;">
        <p style="margin:0 0 2px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#0D9488;">Tracking number</p>
        <p style="margin:0;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:15px;color:#0A1628;">${escapeHtml(trackingNumber)}</p>
      </td></tr>
    </table>`;

  const html = baseEmailHtml({
    preheader: `Order ${orderRef} shipped via ${carrier}`,
    eyebrow: 'Shipped',
    heading: 'Your order is on its way.',
    bodyHtml,
    ctaLabel: 'Track order',
    ctaUrl: trackHref,
  });

  return { subject, html, text };
}
