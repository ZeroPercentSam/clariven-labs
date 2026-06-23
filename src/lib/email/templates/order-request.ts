import { baseEmailHtml, escapeHtml, TEXT_FOOTER } from './layout';

export type OrderRequestEmailInput = {
  heading: string;
  intro: string;
  itemCount: number;
  kindLabel: string;
  ctaLabel: string;
  ctaUrl: string;
};

/** Generic order-request notification — reused for staff + client copies. */
export function orderRequestEmail({
  heading,
  intro,
  itemCount,
  kindLabel,
  ctaLabel,
  ctaUrl,
}: OrderRequestEmailInput) {
  const items = `${itemCount} item${itemCount === 1 ? '' : 's'}`;
  const subject = `${kindLabel} request — ${items}`;

  const text = [intro, '', `Type: ${kindLabel}`, `Items: ${items}`, '', ctaUrl, TEXT_FOOTER].join('\n');

  const bodyHtml = `
    <p style="margin:0 0 16px;">${escapeHtml(intro)}</p>
    <p style="margin:0 0 8px;font-size:14px;color:#334155;">
      <strong style="color:#0A1628;">${escapeHtml(kindLabel)}</strong> · ${escapeHtml(items)}
    </p>`;

  const html = baseEmailHtml({
    preheader: subject,
    eyebrow: 'Order request',
    heading,
    bodyHtml,
    ctaLabel,
    ctaUrl,
  });

  return { subject, html, text };
}
