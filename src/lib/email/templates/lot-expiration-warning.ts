import { baseEmailHtml, escapeHtml, TEXT_FOOTER } from './layout';

export type LotExpirationWarningInput = {
  lotNumber: string;
  productName: string;
  strengthLabel: string;
  thresholdDays: number;
  expirationDate: string; // ISO date
  adminLotUrl: string;
};

/**
 * Internal ops warning — fired by the daily lot-expiration cron when an active
 * lot's expiration_date crosses a 90/60/30/14-day threshold. Sent to every
 * admin. Dedupe is per-lot via lot_alert_notifications (migration 0023), not
 * per-recipient, so adding an admin doesn't backfill missed warnings. RUO voice:
 * COA validity, never clinical / "sellable".
 */
export function lotExpirationWarningEmail({
  lotNumber,
  productName,
  strengthLabel,
  thresholdDays,
  expirationDate,
  adminLotUrl,
}: LotExpirationWarningInput) {
  const urgency =
    thresholdDays === 14
      ? 'Action required — under 2 weeks'
      : thresholdDays === 30
        ? 'Plan now — 30 days out'
        : `${thresholdDays}-day notice`;

  const variant = strengthLabel ? `${productName} — ${strengthLabel}` : productName;
  const expFmt = formatDate(expirationDate);
  const subject = `[${urgency}] Lot ${lotNumber} (${variant}) expires ${expFmt}`;

  const heading =
    thresholdDays === 14
      ? `Lot ${lotNumber} expires in under two weeks.`
      : `Lot ${lotNumber} expires in ${thresholdDays} days.`;

  const guidance =
    'Upload a refreshed COA or retire this lot before its expiration — expired-lot COAs should not be presented as current.';

  const text = [
    'Lot expiration warning',
    '',
    `${heading} (Expires ${expFmt}.)`,
    '',
    `Product: ${variant}`,
    `Lot: ${lotNumber}`,
    '',
    guidance,
    '',
    'Manage this lot:',
    adminLotUrl,
    TEXT_FOOTER,
  ].join('\n');

  const bodyHtml = `
    <p style="margin:0 0 16px;">${escapeHtml(urgency)}.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;border:1px solid #E2E8F0;border-radius:8px;background:#F8FAFC;">
      <tr>
        <td style="padding:14px 16px;">
          <p style="margin:0 0 4px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:0.16em;color:#0D9488;text-transform:uppercase;">Product</p>
          <p style="margin:0 0 10px;font-size:14px;color:#0A1628;">${escapeHtml(variant)}</p>
          <p style="margin:0 0 4px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:0.16em;color:#0D9488;text-transform:uppercase;">Lot · Expires</p>
          <p style="margin:0;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:13px;color:#0A1628;">${escapeHtml(lotNumber)} · ${escapeHtml(expFmt)}</p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 20px;">${escapeHtml(guidance)}</p>`;

  const html = baseEmailHtml({
    preheader: `Lot ${lotNumber} expires ${expFmt}`,
    eyebrow: 'Internal · Lot expiration alert',
    heading,
    bodyHtml,
    ctaLabel: 'Open lot in admin',
    ctaUrl: adminLotUrl,
  });

  return { subject, html, text };
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}
