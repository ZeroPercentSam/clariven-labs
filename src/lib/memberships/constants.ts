// Client-safe membership constants (no 'server-only') — shared by the admin UI
// and the server action. Fee figures quoted from the Consulting Services
// Agreement §3 ($12,500 initial engagement fee, $5,000/Active Month retainer).

export const INITIAL_ENGAGEMENT_FEE_CENTS = 1_250_000; // $12,500.00
export const MONTHLY_RETAINER_CENTS = 500_000; // $5,000.00

export const MEMBERSHIP_STATUSES = [
  'new',
  'contacted',
  'agreement_sent',
  'signed',
  'active',
  'declined',
] as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

export const MEMBERSHIP_STATUS_LABELS: Record<MembershipStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  agreement_sent: 'Agreement sent',
  signed: 'Signed',
  active: 'Active',
  declined: 'Declined',
};

export const MEMBERSHIP_STATUS_STYLES: Record<MembershipStatus, string> = {
  new: 'bg-cl-blue/10 text-cl-blue',
  contacted: 'bg-cl-gold/10 text-cl-gold',
  agreement_sent: 'bg-cl-teal/10 text-cl-teal',
  signed: 'bg-cl-teal/10 text-cl-teal',
  active: 'bg-cl-success/10 text-cl-success',
  declined: 'bg-cl-error/10 text-cl-error',
};
