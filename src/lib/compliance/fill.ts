// Fill [COMPANY ...] / [DATE] placeholders in the RUO policy templates from a
// client's intake, so each client gets a ready-to-use policy pack. Unknown
// fields keep the bracket placeholder for the client to complete.

export type CompanyLike = {
  name?: string | null;
  legal_name?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  domain?: string | null;
  email?: string | null;
} | null;

export function fillCompany(body: string, c: CompanyLike, today: string): string {
  const name = (c?.legal_name || c?.name || '').trim();
  const addr = [
    c?.address_line1,
    c?.address_line2,
    [c?.city, c?.state, c?.postal_code].filter(Boolean).join(', '),
    c?.country,
  ]
    .filter(Boolean)
    .join(', ');
  return body
    .replaceAll('[COMPANY NAME]', name || '[COMPANY NAME]')
    .replaceAll('[COMPANY ADDRESS]', addr || '[COMPANY ADDRESS]')
    .replaceAll('[COMPANY WEBSITE]', (c?.domain || '').trim() || '[COMPANY WEBSITE]')
    .replaceAll('[COMPANY EMAIL]', (c?.email || '').trim() || '[COMPANY EMAIL]')
    .replaceAll('[DATE]', today);
}
