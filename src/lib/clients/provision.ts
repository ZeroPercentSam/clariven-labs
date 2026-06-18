import 'server-only';
import { randomBytes } from 'node:crypto';
import { createAdminClient } from '@/lib/supabase/admin';

// ─────────────────────────────────────────────────────────────────────────────
// Client-account provisioning — the ONE deliberate, admin-gated exception to
// architectural invariant #1 ("service-role is cron-only"). This module is the
// only non-cron importer of createAdminClient(). Callers MUST have already
// verified requireAdmin() before invoking provisionAuthUser(). Never import
// this from a "use client" file or a shared client lib. See CLAUDE.md #1.
// ─────────────────────────────────────────────────────────────────────────────

// Unambiguous alphabet (no 0/O/1/l/I) so a human can read the temp password
// off the screen and relay it without transcription errors.
const PW_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

/** Strong, human-relayable temporary password, e.g. "k7R9m-Qw3aP-...". */
export function generatePassword(): string {
  const bytes = randomBytes(20);
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += PW_ALPHABET[bytes[i] % PW_ALPHABET.length];
  return [s.slice(0, 5), s.slice(5, 10), s.slice(10, 15), s.slice(15, 20)].join('-');
}

export type ProvisionAuthResult =
  | { ok: true; userId: string; password: string }
  | { ok: false; error: string };

/**
 * Create a Supabase auth user with a generated password, email pre-confirmed so
 * the client can sign in immediately (no email is sent). Returns the password
 * once for the admin to relay. Service-role admin API — gate with requireAdmin()
 * in the calling action FIRST.
 */
export async function provisionAuthUser(input: {
  email: string;
  fullName: string;
}): Promise<ProvisionAuthResult> {
  const email = input.email.trim().toLowerCase();
  const password = generatePassword();

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, error: 'Account provisioning is not configured on this environment.' };
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: input.fullName.trim() },
  });

  if (error || !data?.user) {
    const already = /already.*registered|already.*exists|been registered/i.test(error?.message ?? '');
    return {
      ok: false,
      error: already ? 'An account with that email already exists.' : (error?.message ?? 'Could not create the account.'),
    };
  }
  return { ok: true, userId: data.user.id, password };
}

/** Best-effort rollback if the DB-side provisioning fails after the auth user
 *  was created (avoids orphaning the email). */
export async function deleteAuthUser(userId: string): Promise<void> {
  try {
    await createAdminClient().auth.admin.deleteUser(userId);
  } catch {
    // best-effort — surfaced via the action's error, admin can retry
  }
}
