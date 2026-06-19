import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type {
  EngagementStatus,
  ItemStatus,
  OwnerRole,
  ClientMemberRole,
} from '@/lib/clients/constants';

// ── View shapes ──────────────────────────────────────────────────────────────
export type ClientListRow = {
  orgId: string;
  name: string;
  slug: string;
  status: EngagementStatus;
  itemsTotal: number;
  itemsDone: number;
  itemsBlocked: number;
  pctComplete: number;
  currentPhaseTitle: string | null;
  startedAt: string | null;
  launchedAt: string | null;
};

export type OnboardingItemView = {
  itemId: number;
  label: string;
  helpText: string | null;
  category: string | null;
  status: ItemStatus;
  doneAt: string | null;
};

export type OnboardingStepView = {
  stepId: number;
  title: string;
  description: string | null;
  ownerRole: OwnerRole;
  flag: 'blocked' | 'na' | null;
  items: OnboardingItemView[];
  doneCount: number;
  totalCount: number; // excludes 'na'
};

export type OnboardingPhaseView = {
  phaseId: number;
  title: string;
  subtitle: string | null;
  steps: OnboardingStepView[];
  doneCount: number;
  totalCount: number;
};

export type ClientOnboardingView = {
  org: { id: string; name: string; slug: string };
  status: EngagementStatus;
  startedAt: string;
  launchedAt: string | null;
  phases: OnboardingPhaseView[];
  doneCount: number;
  totalCount: number;
  pctComplete: number;
  currentPhaseTitle: string | null;
};

export type ClientMemberRow = {
  userId: string;
  email: string | null;
  fullName: string | null;
  orgRole: ClientMemberRole;
};

// ── Admin list ───────────────────────────────────────────────────────────────
/** Every consulting client + onboarding progress (RLS: admin sees all). */
export async function listClients(): Promise<ClientListRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('client_onboarding_progress')
    .select('*')
    .order('organization_name', { ascending: true });
  return (data ?? []).map((r) => ({
    orgId: r.organization_id as string,
    name: r.organization_name ?? 'Untitled client',
    slug: r.organization_slug ?? '',
    status: (r.status ?? 'onboarding') as EngagementStatus,
    itemsTotal: Number(r.items_total ?? 0),
    itemsDone: Number(r.items_done ?? 0),
    itemsBlocked: Number(r.items_blocked ?? 0),
    pctComplete: Number(r.pct_complete ?? 0),
    currentPhaseTitle: r.current_phase_title ?? null,
    startedAt: r.started_at ?? null,
    launchedAt: r.launched_at ?? null,
  }));
}

// ── The nested phase→step→item tree for one org (RLS-scoped) ──────────────────
async function buildOnboardingView(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orgId: string,
): Promise<ClientOnboardingView | null> {
  const [{ data: header }, { data: org }] = await Promise.all([
    supabase.from('client_onboarding').select('*').eq('organization_id', orgId).maybeSingle(),
    supabase.from('organizations').select('id, name, slug').eq('id', orgId).maybeSingle(),
  ]);
  if (!header || !org) return null;

  const [{ data: phases }, { data: steps }, { data: items }, { data: itemStatus }, { data: stepStatus }] =
    await Promise.all([
      supabase.from('onboarding_phases').select('id, title, subtitle, sort_order').eq('active', true).order('sort_order'),
      supabase.from('onboarding_steps').select('id, phase_id, title, description, owner_role, sort_order').eq('active', true).order('sort_order'),
      supabase.from('onboarding_items').select('id, step_id, label, help_text, category, sort_order').eq('active', true).order('sort_order'),
      supabase.from('client_item_status').select('item_id, status, label_override, done_at').eq('organization_id', orgId),
      supabase.from('client_step_status').select('step_id, owner_override, flag').eq('organization_id', orgId),
    ]);

  const itemStatusById = new Map((itemStatus ?? []).map((s) => [s.item_id, s]));
  const stepStatusById = new Map((stepStatus ?? []).map((s) => [s.step_id, s]));
  const itemsByStep = new Map<number, NonNullable<typeof items>>();
  for (const it of items ?? []) {
    const arr = itemsByStep.get(it.step_id) ?? [];
    arr.push(it);
    itemsByStep.set(it.step_id, arr);
  }
  const stepsByPhase = new Map<number, NonNullable<typeof steps>>();
  for (const st of steps ?? []) {
    const arr = stepsByPhase.get(st.phase_id) ?? [];
    arr.push(st);
    stepsByPhase.set(st.phase_id, arr);
  }

  let doneCount = 0;
  let totalCount = 0;

  const phaseViews: OnboardingPhaseView[] = (phases ?? []).map((ph) => {
    let pDone = 0;
    let pTotal = 0;
    const stepViews: OnboardingStepView[] = (stepsByPhase.get(ph.id) ?? []).map((st) => {
      const ss = stepStatusById.get(st.id);
      let sDone = 0;
      let sTotal = 0;
      const itemViews: OnboardingItemView[] = (itemsByStep.get(st.id) ?? []).map((it) => {
        const is = itemStatusById.get(it.id);
        const status = (is?.status ?? 'pending') as ItemStatus;
        if (status !== 'na') {
          sTotal += 1;
          if (status === 'done') sDone += 1;
        }
        return {
          itemId: it.id,
          label: is?.label_override?.trim() || it.label,
          helpText: it.help_text,
          category: it.category,
          status,
          doneAt: is?.done_at ?? null,
        };
      });
      pDone += sDone;
      pTotal += sTotal;
      return {
        stepId: st.id,
        title: st.title,
        description: st.description,
        ownerRole: (ss?.owner_override ?? st.owner_role) as OwnerRole,
        flag: (ss?.flag ?? null) as 'blocked' | 'na' | null,
        items: itemViews,
        doneCount: sDone,
        totalCount: sTotal,
      };
    });
    doneCount += pDone;
    totalCount += pTotal;
    return {
      phaseId: ph.id,
      title: ph.title,
      subtitle: ph.subtitle,
      steps: stepViews,
      doneCount: pDone,
      totalCount: pTotal,
    };
  });

  const pctComplete = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const currentPhaseTitle =
    phaseViews.find((p) => p.totalCount > 0 && p.doneCount < p.totalCount)?.title ?? null;

  return {
    org: { id: org.id, name: org.name, slug: org.slug },
    status: (header.status ?? 'onboarding') as EngagementStatus,
    startedAt: header.started_at,
    launchedAt: header.launched_at,
    phases: phaseViews,
    doneCount,
    totalCount,
    pctComplete,
    currentPhaseTitle,
  };
}

/** Admin: one client's full onboarding tree. null if onboarding not started. */
export async function getClientOnboarding(orgId: string): Promise<ClientOnboardingView | null> {
  const supabase = await createClient();
  return buildOnboardingView(supabase, orgId);
}

/** Client portal: the signed-in user's own onboarding tree (RLS-scoped). */
export async function getMyOnboarding(): Promise<ClientOnboardingView | null> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', auth.user.id)
    .maybeSingle();
  if (!profile?.organization_id) return null;
  return buildOnboardingView(supabase, profile.organization_id);
}

/** Minimal org row — for the detail page header when onboarding isn't seeded. */
export async function getClientOrg(
  orgId: string,
): Promise<{ id: string; name: string; slug: string } | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('organizations')
    .select('id, name, slug')
    .eq('id', orgId)
    .maybeSingle();
  return data ?? null;
}

/** Members of a client org (admin view), with email + name. */
export async function getClientMembers(orgId: string): Promise<ClientMemberRow[]> {
  const supabase = await createClient();
  const { data: members } = await supabase
    .from('org_members')
    .select('user_id, org_role')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: true });
  if (!members?.length) return [];
  const ids = members.map((m) => m.user_id);
  const { data: profiles } = await supabase.from('profiles').select('id, email, full_name').in('id', ids);
  const byId = new Map((profiles ?? []).map((p) => [p.id, p]));
  return members.map((m) => ({
    userId: m.user_id,
    email: byId.get(m.user_id)?.email ?? null,
    fullName: byId.get(m.user_id)?.full_name ?? null,
    orgRole: m.org_role as ClientMemberRole,
  }));
}
