// Pure helpers for the daily lot-expiration cron (Phase 5 c).
//
// The cron invokes `selectLotsToNotify` with all candidate lots + the existing
// sent-history rows; it returns the (lot_id, threshold_days) tuples that still
// need an email. Keeping the selection logic pure makes the threshold / window /
// idempotency math unit-testable without service-role credentials. Ported from
// Purity's inventory cron, adapted to Clariven's no-inventory model: lots have
// no qty — an `active` flag gates them instead of `qty_on_hand > 0`.

export const LOT_THRESHOLDS = [90, 60, 30, 14] as const;
export type LotThreshold = (typeof LOT_THRESHOLDS)[number];

export type CandidateLot = {
  id: string;
  expirationDate: string; // ISO date (YYYY-MM-DD)
  active: boolean;
};

export type SentHistoryRow = {
  lot_id: string;
  threshold_days: number;
};

export type AlertTuple = {
  lotId: string;
  thresholdDays: LotThreshold;
};

/**
 * Returns the (lot, threshold) tuples the cron should emit on `today`.
 *
 * Rules:
 *   1. Lot must be active (retired/recalled lots don't alert).
 *   2. The lot's expiration_date must fall within
 *      `[today + threshold - WINDOW_DAYS, today + threshold]` for the threshold
 *      to fire. WINDOW_DAYS = 1 → a single-day window per (lot, threshold) on
 *      the daily run. A lot expiring exactly at `today + threshold` is included.
 *   3. Idempotency: a (lot_id, threshold_days) already in `sentHistory` is not
 *      emitted again. Higher-urgency thresholds still fire even if a lower-
 *      urgency one already ran (a lot that got the 90-day notice still gets its
 *      60/30/14-day notices).
 */
export function selectLotsToNotify(
  lots: CandidateLot[],
  sentHistory: SentHistoryRow[],
  today: Date,
): AlertTuple[] {
  const sentSet = new Set(sentHistory.map((r) => `${r.lot_id}:${r.threshold_days}`));
  const todayMs = startOfUTCDay(today).getTime();
  const tuples: AlertTuple[] = [];

  for (const lot of lots) {
    if (!lot.active) continue;
    const expMs = startOfUTCDay(new Date(lot.expirationDate)).getTime();
    const daysUntilExp = Math.round((expMs - todayMs) / DAY_MS);

    for (const threshold of LOT_THRESHOLDS) {
      if (daysUntilExp <= threshold && daysUntilExp > threshold - WINDOW_DAYS) {
        const key = `${lot.id}:${threshold}`;
        if (!sentSet.has(key)) {
          tuples.push({ lotId: lot.id, thresholdDays: threshold });
        }
      }
    }
  }

  return tuples;
}

const DAY_MS = 86_400_000;
const WINDOW_DAYS = 1;

function startOfUTCDay(d: Date): Date {
  const c = new Date(d);
  c.setUTCHours(0, 0, 0, 0);
  return c;
}
