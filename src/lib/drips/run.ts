import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/send';
import { dripEmail, type DripKind } from '@/lib/email/templates/drip';

/**
 * Onboarding drip sender — invoked daily by /api/cron/drips (service role, so it
 * sees every org). Four staged follow-ups, each fired at most once per client
 * (the drip_sends unique constraint is the idempotency guard). Conditions use
 * only state we actually track:
 *
 *   sign-reminder   onboarding + no agreement consent + >=2 days since start
 *   checklist-nudge onboarding + items incomplete + no checklist activity in 7 days
 *   launch-ready    status flipped to launch_ready
 *   live-checkin    status live + >=3 days since launch
 *
 * (Fee-received and call-booked drips are intentionally omitted — we don't track
 * those signals, so we can't assert them truthfully.)
 *
 * ponytail: per-org email lookups use prebuilt maps from 4 bulk queries — fine
 * for tens of clients; switch to a single SQL view if the client count explodes.
 */

const DAY_MS = 86_400_000;

export type DripRunResult = {
  ok: true;
  orgs: number;
  sent: number;
  skippedNoEmail: number;
};

export async function runDrips(): Promise<DripRunResult> {
  const db = createAdminClient();

  const [{ data: progress }, { data: consents }, { data: itemStatus }, { data: members }, { data: already }] =
    await Promise.all([
      db
        .from('client_onboarding_progress')
        .select('organization_id, status, items_total, items_done, started_at, launched_at'),
      db.from('client_agreement_consents').select('organization_id'),
      db.from('client_item_status').select('organization_id, done_at').not('done_at', 'is', null),
      db.from('org_members').select('organization_id, user_id, created_at').order('created_at', { ascending: true }),
      db.from('drip_sends').select('organization_id, drip_kind'),
    ]);

  if (!progress?.length) return { ok: true, orgs: 0, sent: 0, skippedNoEmail: 0 };

  const signed = new Set((consents ?? []).map((c) => c.organization_id));
  const sent = new Set((already ?? []).map((s) => `${s.organization_id}:${s.drip_kind}`));

  // Most recent checklist activity per org (ms).
  const lastActivity = new Map<string, number>();
  for (const r of itemStatus ?? []) {
    const t = r.done_at ? Date.parse(r.done_at) : 0;
    if (t > (lastActivity.get(r.organization_id) ?? 0)) lastActivity.set(r.organization_id, t);
  }

  // First member per org = primary client contact.
  const firstMember = new Map<string, string>();
  for (const m of members ?? []) {
    if (m.organization_id && !firstMember.has(m.organization_id)) firstMember.set(m.organization_id, m.user_id);
  }
  const userIds = [...new Set(firstMember.values())];
  const profById = new Map<string, { email: string | null; full_name: string | null }>();
  if (userIds.length) {
    const { data: profiles } = await db.from('profiles').select('id, email, full_name').in('id', userIds);
    for (const p of profiles ?? []) profById.set(p.id, { email: p.email, full_name: p.full_name });
  }

  const now = Date.now();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.clarivenlabs.com';
  const portalUrl = `${siteUrl}/portal/onboarding`;

  let sentCount = 0;
  let skippedNoEmail = 0;

  for (const o of progress) {
    const org = o.organization_id;
    if (!org) continue;
    const prof = profById.get(firstMember.get(org) ?? '');
    if (!prof?.email) {
      skippedNoEmail += 1;
      continue;
    }
    const started = o.started_at ? Date.parse(o.started_at) : 0;
    const launched = o.launched_at ? Date.parse(o.launched_at) : 0;
    const activity = lastActivity.get(org) || started;

    const due: DripKind[] = [];
    if (o.status === 'onboarding' && !signed.has(org) && started && now - started >= 2 * DAY_MS) {
      due.push('drip-sign-reminder');
    }
    if (
      o.status === 'onboarding' &&
      Number(o.items_done) < Number(o.items_total) &&
      activity &&
      now - activity >= 7 * DAY_MS
    ) {
      due.push('drip-checklist-nudge');
    }
    if (o.status === 'launch_ready') due.push('drip-launch-ready');
    if (o.status === 'live' && launched && now - launched >= 3 * DAY_MS) due.push('drip-live-checkin');

    for (const kind of due) {
      if (sent.has(`${org}:${kind}`)) continue;
      try {
        const t = dripEmail(kind, { name: prof.full_name ?? '', portalUrl });
        const res = await sendEmail(
          { to: prof.email, subject: t.subject, html: t.html, text: t.text, kind },
          { logClient: db },
        );
        // Only claim the drip on a real send → genuine failures (and no-op sends
        // when Resend is unconfigured) retry next run; the unique constraint
        // still prevents any duplicate row.
        if (res.ok && !res.noop) {
          await db.from('drip_sends').insert({ organization_id: org, drip_kind: kind });
          sentCount += 1;
        }
      } catch (e) {
        console.error('[drip] send failed', { org, kind, error: e instanceof Error ? e.message : String(e) });
      }
    }
  }

  return { ok: true, orgs: progress.length, sent: sentCount, skippedNoEmail };
}
