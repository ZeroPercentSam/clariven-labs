import type { WireDetails } from '@/lib/email/templates/membership-wire-instructions';

// Wire details from env (sensitive — never in the repo). Returns null until all
// required fields are set, so the wire-instructions email is simply skipped.
export function wireFromEnv(reference: string): WireDetails | null {
  const bankName = process.env.WIRE_BANK_NAME?.trim();
  const accountName = process.env.WIRE_ACCOUNT_NAME?.trim();
  const routing = process.env.WIRE_ROUTING?.trim();
  const account = process.env.WIRE_ACCOUNT?.trim();
  if (!bankName || !accountName || !routing || !account) return null;
  return {
    bankName,
    accountName,
    routing,
    account,
    swift: process.env.WIRE_SWIFT?.trim() || null,
    reference,
  };
}
