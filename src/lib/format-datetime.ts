/**
 * Server-safe date / time formatters pinned to ClarivenLabs HQ (America/Chicago).
 *
 * Background: `toLocaleString("en-US", {...})` without `timeZone` falls back
 * to the host's runtime TZ. On Vercel that's UTC, which means a row created
 * at 3:59 PM CDT renders as "9:59 PM" in any server-rendered surface that
 * didn't pin the zone. This util centralises the fix so every page renders
 * consistent timestamps regardless of which region the function ran in.
 *
 * If/when the team localises per-user timezone, swap the constant for a
 * value drawn from user preferences and update the callers — the API of
 * these helpers stays the same. (Portable-fix #6.)
 */

const TIME_ZONE = "America/Chicago" as const;

/**
 * "May 26, 2026, 3:59 PM CDT" — long datetime with timezone label so the
 * displayed time is unambiguous. Returns the raw ISO string if Date parsing
 * throws (e.g. malformed input from an upstream system).
 */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: TIME_ZONE,
      timeZoneName: "short",
    });
  } catch {
    return iso;
  }
}

/**
 * "May 26, 2026" — date-only formatter. Use for fields where the time-of-day
 * is irrelevant (expiration dates, lot valid-through, etc.). Pinned to
 * America/Chicago so a UTC timestamp landing just after midnight UTC doesn't
 * roll the displayed day forward for the Central-time reader.
 */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: TIME_ZONE,
    });
  } catch {
    return iso;
  }
}
