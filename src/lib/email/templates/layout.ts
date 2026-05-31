// Shared email chrome for Clariven transactional templates.
//
// RUO posture: every email carries the research-use-only disclaimer in the
// footer and uses research-customer voice (never "patient" / clinical).
// Brand tokens mirror app/globals.css (navy #0A1628, teal #0D9488, gold
// #D4A843, gray-50 #F8FAFC).

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function escapeAttr(s: string): string {
  return escapeHtml(s);
}

export function formatUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export type BaseEmailInput = {
  /** Hidden preview text shown in the inbox list. */
  preheader: string;
  eyebrow: string;
  heading: string;
  /** Pre-escaped inner HTML for the body region. */
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

/**
 * Wrap body HTML in the Clariven branded shell + RUO disclaimer footer.
 * Inline styles only (email clients strip <style>/external CSS).
 */
export function baseEmailHtml({
  preheader,
  eyebrow,
  heading,
  bodyHtml,
  ctaLabel,
  ctaUrl,
}: BaseEmailInput): string {
  const cta =
    ctaLabel && ctaUrl
      ? `<p style="margin:8px 0 32px;">
           <a href="${escapeAttr(ctaUrl)}" style="display:inline-block;background:#0A1628;color:#FFFFFF;text-decoration:none;font-weight:600;font-size:15px;padding:14px 26px;border-radius:8px;">${escapeHtml(ctaLabel)}</a>
         </p>`
      : '';
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Helvetica,Arial,sans-serif;color:#0F172A;">
    <span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${escapeHtml(preheader)}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:32px 36px 8px;">
                <p style="margin:0 0 10px;font-family:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#0D9488;">${escapeHtml(eyebrow)}</p>
                <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:#0A1628;font-weight:700;">${escapeHtml(heading)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:0 36px 8px;font-size:15px;line-height:1.6;color:#334155;">
                ${bodyHtml}
                ${cta}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 36px 28px;border-top:1px solid #E2E8F0;">
                <p style="margin:0 0 6px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#94A3B8;">ClarivenLabs · Research Materials</p>
                <p style="margin:0 0 4px;font-size:12px;line-height:1.5;color:#94A3B8;font-weight:600;">For Research Use Only. Not for human consumption. Not a drug, food, or cosmetic.</p>
                <p style="margin:0;font-size:12px;line-height:1.5;color:#94A3B8;">Questions? Reply to this email or write support@clarivenlabs.com.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** Plain-text RUO footer appended to every text body. */
export const TEXT_FOOTER = [
  '',
  '— ClarivenLabs · Research Materials',
  'For Research Use Only. Not for human consumption. Not a drug, food, or cosmetic.',
  'support@clarivenlabs.com',
].join('\n');
