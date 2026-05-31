/**
 * Rep program — client-safe constants + zod schemas. Imported by both server
 * actions and React (client) components, so this file MUST NOT import any
 * server-only module (no next/headers, no supabase server client). Ported +
 * RUO-trimmed from Purity lib/rep/constants.ts.
 */
import { z } from 'zod';

export const REP_STATUSES = [
  'pending_invite',
  'pending_review',
  'active',
  'suspended',
] as const;
export type RepStatus = (typeof REP_STATUSES)[number];

export const REP_STATUS_LABELS: Record<RepStatus, string> = {
  pending_invite: 'Pending invite',
  pending_review: 'Awaiting approval',
  active: 'Active',
  suspended: 'Suspended',
};

export const REP_INVITATION_STATUSES = ['pending', 'accepted', 'revoked', 'expired'] as const;
export type RepInvitationStatus = (typeof REP_INVITATION_STATUSES)[number];

export const REP_PAYOUT_METHODS = ['ACH', 'PayPal', 'Check'] as const;
export type RepPayoutMethod = (typeof REP_PAYOUT_METHODS)[number];

export const REP_PAYOUT_METHOD_LABELS: Record<RepPayoutMethod, string> = {
  ACH: 'ACH (US bank transfer)',
  PayPal: 'PayPal',
  Check: 'Mailed check',
};

export const TAX_ID_KINDS = ['SSN', 'EIN'] as const;
export type TaxIdKind = (typeof TAX_ID_KINDS)[number];

export const TAX_ID_KIND_LABELS: Record<TaxIdKind, string> = {
  SSN: 'SSN (individual)',
  EIN: 'EIN (business)',
};

export const REP_BUSINESS_TYPES = [
  'individual',
  'sole_proprietor',
  'llc',
  'corporation',
  'partnership',
  'other',
] as const;
export type RepBusinessType = (typeof REP_BUSINESS_TYPES)[number];

export const REP_BUSINESS_TYPE_LABELS: Record<RepBusinessType, string> = {
  individual: 'Individual',
  sole_proprietor: 'Sole proprietorship (DBA)',
  llc: 'LLC',
  corporation: 'Corporation (C-Corp / S-Corp)',
  partnership: 'Partnership',
  other: 'Other',
};

// Friendly mapping for the rep-program RPC error codes (raised by the
// SECURITY DEFINER RPCs in migration 0016).
export const REP_ERROR_MESSAGES: Record<string, string> = {
  UNAUTHENTICATED: 'Sign in to continue.',
  REP_INVITATION_NOT_FOUND: "We couldn't find that invitation. The link may be invalid.",
  REP_INVITATION_ALREADY_ACCEPTED: 'This invitation has already been accepted.',
  REP_INVITATION_REVOKED:
    'This invitation was revoked. Contact the admin who invited you for a new one.',
  REP_INVITATION_EXPIRED: 'This invitation has expired. Ask the admin to send a new one.',
  REP_INVITATION_EMAIL_MISMATCH:
    "Sign in with the email this invitation was sent to. Your current email doesn't match.",
  REP_USER_ALREADY_IN_ORG:
    "Your account is linked to a customer organization. Reps can't be customers — contact support.",
  REP_USER_IS_ADMIN: 'Your account is an admin account. Contact support if this is wrong.',
  REP_FIELD_LOCKED: 'That field requires admin approval to change. Contact an admin.',
};

export function friendlyRepError(raw: string | undefined): string {
  if (!raw) return 'Something went wrong. Please try again.';
  for (const key of Object.keys(REP_ERROR_MESSAGES)) {
    if (raw.includes(key)) return REP_ERROR_MESSAGES[key];
  }
  return raw;
}

// ---------------------------------------------------------------------------
// Validators
// ---------------------------------------------------------------------------

// Tax ID: loose — stored as raw text (strict format validation is admin-side;
// we don't want to reject legitimate IDs). Keep dashes for SSN readability.
const taxIdSchema = z
  .string()
  .min(4, 'Tax ID is required.')
  .max(40, 'Tax ID looks too long.')
  .transform((s) => s.trim());

export const repOnboardingSchema = z.object({
  // W-9 / identity
  legalName: z
    .string()
    .min(2, 'Enter your full legal name (as on your tax forms).')
    .max(200)
    .transform((s) => s.trim()),
  taxId: taxIdSchema,
  taxIdKind: z.enum(TAX_ID_KINDS),
  businessType: z.enum(REP_BUSINESS_TYPES),
  phone: z.string().min(7, 'Enter a phone number.').max(40).transform((s) => s.trim()),

  // Payout
  payoutMethod: z.enum(REP_PAYOUT_METHODS),
  payoutAccountMasked: z
    .string()
    .min(2, 'Enter the last 4 digits of your account (or your PayPal email).')
    .max(120)
    .transform((s) => s.trim()),
  payoutAccountRef: z.string().max(500).optional().transform((s) => s?.trim() ?? ''),

  // Address
  addressLine1: z.string().min(2).max(200).transform((s) => s.trim()),
  addressLine2: z.string().max(200).optional().transform((s) => s?.trim() ?? ''),
  addressCity: z.string().min(1).max(120).transform((s) => s.trim()),
  addressState: z.string().min(2).max(40).transform((s) => s.trim()),
  addressPostalCode: z.string().min(3).max(20).transform((s) => s.trim()),
  addressCountry: z.string().min(2).max(40).default('US'),

  // Signature — the rep's typed-name e-signature on the current agreement
  // version; must equal legalName (case-insensitive, whitespace-collapsed).
  signedLegalName: z
    .string()
    .min(2, 'Type your legal name to sign the agreement.')
    .max(200)
    .transform((s) => s.trim()),
});
export type RepOnboardingInput = z.infer<typeof repOnboardingSchema>;

// Signature ↔ legal-name comparison (shared by the form + the server check).
export function normalizeName(s: string): string {
  return s.trim().replace(/\s+/g, ' ').toLowerCase();
}
