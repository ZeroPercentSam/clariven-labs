// Client-safe constants for the admin sales-dashboard surface. Split from
// `sales-analytics.ts` because that module imports the server-only Supabase
// client (next/headers) — a "use client" chip component can't transitively
// import the runtime module without pulling server code into the browser
// bundle. (Project convention: chip-filter constants live in a sibling
// `*-constants.ts`.)

export type RangeDays = 7 | 30 | 90;

export const RANGE_OPTIONS: RangeDays[] = [7, 30, 90];

export function parseRange(raw: string | undefined): RangeDays {
  const n = Number.parseInt(raw ?? '', 10);
  return (RANGE_OPTIONS as number[]).includes(n) ? (n as RangeDays) : 30;
}
