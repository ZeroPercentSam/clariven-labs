// Fill agreement placeholders from a client's intake at render time, so the
// signer sees their own entity name/state/address. Unknown fields keep the
// bracket placeholder. ponytail: plain string replace, fine for a fixed token set.

export type IntakeLike = {
  legal_name?: string | null;
  llc_state?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
} | null;

export function fillAgreement(body: string, intake: IntakeLike, today: string): string {
  const addr = [
    intake?.address_line1,
    intake?.address_line2,
    [intake?.city, intake?.state, intake?.postal_code].filter(Boolean).join(', '),
    intake?.country,
  ]
    .filter(Boolean)
    .join(', ');
  const legal = intake?.legal_name?.trim();
  return body
    .replaceAll('[Effective Date]', today)
    .replaceAll('[Client Legal Name]', legal || '[Client Legal Name]')
    .replaceAll('[CLIENT LEGAL NAME]', legal || '[Client Legal Name]')
    .replaceAll('[State]', intake?.llc_state?.trim() || '[State]')
    .replaceAll('[entity type]', 'limited liability company')
    .replaceAll('[Client Address]', addr || '[Client Address]');
}
