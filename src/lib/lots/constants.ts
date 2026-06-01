// Lot vocabulary. Client-safe (no server-only imports) so the admin lot island
// can import the expiry helpers without dragging next/headers into the bundle.

export type LotExpiryStatus = 'expired' | 'expiring-soon' | 'ok';

// Days-until-expiration buckets. `expiring-soon` mirrors the cron's max
// threshold (90d) so the UI flags exactly what the alert cron will act on.
export function lotExpiryStatus(expirationDate: string, now: Date = new Date()): LotExpiryStatus {
  const exp = Date.parse(`${expirationDate}T00:00:00Z`);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const days = Math.round((exp - today) / 86_400_000);
  if (days < 0) return 'expired';
  if (days <= 90) return 'expiring-soon';
  return 'ok';
}

export const LOT_EXPIRY_LABEL: Record<LotExpiryStatus, string> = {
  expired: 'Expired',
  'expiring-soon': 'Expiring soon',
  ok: 'Current',
};

export const LOT_EXPIRY_BADGE: Record<LotExpiryStatus, string> = {
  expired: 'bg-red-50 text-red-700',
  'expiring-soon': 'bg-amber-50 text-amber-700',
  ok: 'bg-cl-gray-100 text-cl-gray-600',
};
