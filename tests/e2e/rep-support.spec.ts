// Phase 7 fast-follow (migration 0025) — rep support tickets RLS lock.
// A sales rep has no org; the broadened support policies let a rep file + read +
// reply to their OWN (org-less) tickets via the author path, while preserving
// every customer guarantee. Drives RLS directly against Postgres with
// authenticated anon-key clients (one per identity). Self-contained:
// `e2e-repsup-` users, torn down after.

import { expect, test } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../src/lib/database.types';
import { admin, createApprovedOrgFor, TEST_EMAIL_DOMAIN, TEST_PASSWORD } from './helpers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const EMAIL_REPA = `e2e-repsup-a@${TEST_EMAIL_DOMAIN}`;
const EMAIL_REPB = `e2e-repsup-b@${TEST_EMAIL_DOMAIN}`;
const EMAIL_CUST = `e2e-repsup-cust@${TEST_EMAIL_DOMAIN}`;
const EMAIL_ADMIN = `e2e-repsup-admin@${TEST_EMAIL_DOMAIN}`;

let repAUid = '';
let repBUid = '';
let custUid = '';
let custOrg = '';
let ticketId = '';

function signInClient(email: string): Promise<SupabaseClient<Database>> {
  const client = createClient<Database>(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client.auth
    .signInWithPassword({ email, password: TEST_PASSWORD })
    .then(({ error }) => {
      if (error) throw new Error(`signIn ${email}: ${error.message}`);
      return client;
    });
}

async function cleanup() {
  const supa = admin();
  const { data: list } = await supa.auth.admin.listUsers({ perPage: 200 });
  const uids = (list?.users ?? [])
    .filter((u) => u.email?.startsWith('e2e-repsup-') && u.email.endsWith(`@${TEST_EMAIL_DOMAIN}`))
    .map((u) => u.id);
  if (uids.length) {
    const { data: tks } = await supa.from('support_tickets').select('id').in('created_by', uids);
    const tids = (tks ?? []).map((t) => t.id);
    if (tids.length) {
      await supa.from('ticket_messages').delete().in('ticket_id', tids);
      await supa.from('support_tickets').delete().in('id', tids);
    }
    await supa.from('sales_reps').delete().in('id', uids);
  }
  // The customer's personal org (e2e-std-… slug) — clear membership + org.
  const { data: orgs } = await supa.from('organizations').select('id').like('slug', 'e2e-std-e2e-repsup%');
  for (const o of orgs ?? []) {
    await supa.from('support_tickets').delete().eq('organization_id', o.id);
    await supa.from('org_members').delete().eq('organization_id', o.id);
    await supa.from('organizations').delete().eq('id', o.id);
  }
  for (const id of uids) await supa.auth.admin.deleteUser(id);
}

test.describe.serial('rep support tickets (0025 RLS lock)', () => {
  test.beforeAll(async () => {
    await cleanup();
    const supa = admin();

    const mk = async (email: string) => {
      const { data, error } = await supa.auth.admin.createUser({
        email,
        password: TEST_PASSWORD,
        email_confirm: true,
      });
      if (error || !data.user) throw new Error(`createUser ${email}: ${error?.message}`);
      return data.user.id;
    };
    repAUid = await mk(EMAIL_REPA);
    repBUid = await mk(EMAIL_REPB);
    custUid = await mk(EMAIL_CUST);
    const adminUid = await mk(EMAIL_ADMIN);

    // Two active reps (no org).
    for (const id of [repAUid, repBUid]) {
      const { error } = await supa.from('sales_reps').insert({
        id,
        status: 'active',
        legal_name: 'Rep',
        onboarding_completed_at: new Date().toISOString(),
        approved_at: new Date().toISOString(),
      });
      if (error) throw new Error(`seed rep: ${error.message}`);
    }
    // Admin.
    await supa.from('profiles').update({ role: 'admin' }).eq('id', adminUid);
    // Customer in an approved org.
    custOrg = await createApprovedOrgFor(custUid, 'E2E RepSup Cust');
  });

  test.afterAll(cleanup);

  test('an active rep opens an org-less ticket and reads it back', async () => {
    const repA = await signInClient(EMAIL_REPA);
    const { data, error } = await repA
      .from('support_tickets')
      .insert({
        organization_id: null,
        created_by: repAUid,
        subject: 'Commission question',
        body: 'When is the next payout batch?',
        category: 'billing',
        status: 'open',
        priority: 'normal',
      })
      .select('id')
      .single();
    expect(error).toBeNull();
    expect(data?.id).toBeTruthy();
    ticketId = data!.id;

    const { data: readBack } = await repA.from('support_tickets').select('id').eq('id', ticketId);
    expect(readBack ?? []).toHaveLength(1);
  });

  test('a rep cannot plant a ticket inside a customer org', async () => {
    const repA = await signInClient(EMAIL_REPA);
    const { error } = await repA.from('support_tickets').insert({
      organization_id: custOrg, // not the rep's (rep has none) → tkt_ins rejects
      created_by: repAUid,
      subject: 'Sneaky',
      body: 'should be blocked',
      status: 'open',
      priority: 'normal',
    });
    expect(error).not.toBeNull(); // RLS with_check violation
  });

  test('another rep cannot read the ticket', async () => {
    const repB = await signInClient(EMAIL_REPB);
    const { data } = await repB.from('support_tickets').select('id').eq('id', ticketId);
    expect(data ?? []).toHaveLength(0);
  });

  test('a customer cannot read the rep ticket', async () => {
    const cust = await signInClient(EMAIL_CUST);
    const { data } = await cust.from('support_tickets').select('id').eq('id', ticketId);
    expect(data ?? []).toHaveLength(0);
  });

  test('an admin sees the rep ticket', async () => {
    const adminClient = await signInClient(EMAIL_ADMIN);
    const { data } = await adminClient.from('support_tickets').select('id').eq('id', ticketId);
    expect(data ?? []).toHaveLength(1);
  });

  test('the rep can reply but cannot post an internal note', async () => {
    const repA = await signInClient(EMAIL_REPA);
    const { error: okErr } = await repA.from('ticket_messages').insert({
      ticket_id: ticketId,
      author_id: repAUid,
      body: 'Following up.',
      is_internal: false,
    });
    expect(okErr).toBeNull();

    const { error: internalErr } = await repA.from('ticket_messages').insert({
      ticket_id: ticketId,
      author_id: repAUid,
      body: 'staff-only note attempt',
      is_internal: true, // tmsg_ins forbids is_internal for non-admins
    });
    expect(internalErr).not.toBeNull();
  });

  test('a foreign rep cannot reply on the ticket', async () => {
    const repB = await signInClient(EMAIL_REPB);
    const { error } = await repB.from('ticket_messages').insert({
      ticket_id: ticketId,
      author_id: repBUid,
      body: 'intruding',
      is_internal: false,
    });
    expect(error).not.toBeNull(); // parent ticket not visible to repB → tmsg_ins EXISTS fails
  });
});
