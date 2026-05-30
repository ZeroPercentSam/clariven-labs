/**
 * Env-resilience helper (architectural invariant #8).
 *
 * Returns false when the Supabase public env vars are missing (fresh clone,
 * CI without secrets, or a prod env not yet wired on Vercel). Server actions
 * and RSCs that call `createClient()` should short-circuit on this BEFORE
 * touching Supabase, so a misconfigured deploy surfaces as a friendly inline
 * error instead of a styled 500.
 *
 * Promoted out of `lib/coas/actions.ts` so every server action imports one
 * canonical check (HANDOFF § "adopt next session — the env-resilience helper").
 */
export function supabaseEnvConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
