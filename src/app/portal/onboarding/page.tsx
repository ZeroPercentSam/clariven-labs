import { getMyOnboarding } from '@/lib/clients/queries';
import { getMyIntake } from '@/lib/clients/intake-queries';
import { OnboardingChecklist } from '@/components/clients/OnboardingChecklist';
import { OnboardingProgressRing } from '@/components/clients/OnboardingProgressRing';
import { BrandResearchForm } from '@/components/clients/BrandResearchForm';
import { BusinessDetailsForm } from '@/components/clients/BusinessDetailsForm';
import { CollapsibleCard } from '@/components/clients/CollapsibleCard';
import { getActiveAgreements, getAgreementConsents } from '@/lib/agreements/queries';
import { fillAgreement } from '@/lib/agreements/fill';
import { AgreementSign } from '@/components/clients/AgreementSign';

export const metadata = { title: 'Onboarding — Clariven Labs' };
export const dynamic = 'force-dynamic';

export default async function PortalOnboardingPage() {
  const view = await getMyOnboarding();

  if (!view) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-cl-navy mb-2">Onboarding</h1>
        <div className="bg-white border border-cl-gray-200 rounded-xl p-10 text-center">
          <p className="text-cl-navy font-semibold mb-1">Your onboarding hasn&apos;t started yet</p>
          <p className="text-sm text-cl-gray-500">
            Your Clariven Labs contact will set up your launch checklist shortly. Check back soon.
          </p>
        </div>
      </div>
    );
  }

  // "Phase X of N" + the first not-yet-done item ("what's next").
  const totalPhases = view.phases.length;
  const currentPhaseNumber =
    view.phases.findIndex((p) => p.totalCount > 0 && p.doneCount < p.totalCount) + 1;
  let nextItem: string | null = null;
  for (const p of view.phases) {
    for (const s of p.steps) {
      for (const it of s.items) {
        if (it.status !== 'done' && it.status !== 'na') {
          nextItem = it.label;
          break;
        }
      }
      if (nextItem) break;
    }
    if (nextItem) break;
  }

  const complete = currentPhaseNumber === 0;
  const intake = await getMyIntake();
  const agreements = await getActiveAgreements();
  const consents = await getAgreementConsents(view.org.id);
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-cl-navy">Your onboarding</h1>
        <p className="text-sm text-cl-gray-500 mt-1">
          Track every step to launch. Check items off as you complete them — your Clariven team sees
          your progress in real time.
        </p>
      </div>

      <div className="bg-white border border-cl-gray-200 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6">
        <OnboardingProgressRing pct={view.pctComplete} caption={`${view.doneCount}/${view.totalCount}`} />
        <div className="flex-1 text-center sm:text-left">
          {complete ? (
            <p className="text-lg font-semibold text-cl-teal">All onboarding steps complete 🎉</p>
          ) : (
            <>
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-cl-gray-400">
                Phase {currentPhaseNumber} of {totalPhases}
              </p>
              <p className="text-lg font-semibold text-cl-navy mt-1">{view.currentPhaseTitle}</p>
              {nextItem ? (
                <p className="text-sm text-cl-gray-500 mt-2">
                  <span className="font-semibold text-cl-navy">Up next:</span> {nextItem}
                </p>
              ) : null}
            </>
          )}
        </div>
      </div>

      {agreements.length > 0 ? (
        <CollapsibleCard
          title="Agreements"
          subtitle="Review and e-sign your Clariven Labs agreement(s)."
          filled={consents.length >= agreements.length}
          defaultOpen={consents.length < agreements.length}
        >
          <div className="space-y-6">
            {agreements.map((a) => {
              const c = consents.find((x) => x.slug === a.slug);
              return (
                <div key={a.id}>
                  <p className="text-sm font-semibold text-cl-navy mb-2">{a.label}</p>
                  <AgreementSign
                    slug={a.slug}
                    label={a.label}
                    body={fillAgreement(a.body_md, intake, today)}
                    signed={c ? { name: c.signed_legal_name, at: c.signed_at } : null}
                  />
                </div>
              );
            })}
          </div>
        </CollapsibleCard>
      ) : null}

      <div className="space-y-3">
        <CollapsibleCard
          title="Brand name & market research"
          subtitle="Your proposed brand name, domain, and competitor check."
          filled={!!intake?.proposed_name}
          defaultOpen={!intake?.proposed_name}
        >
          <BrandResearchForm intake={intake} />
        </CollapsibleCard>
        <CollapsibleCard
          title="Business details (LLC & address)"
          subtitle="Legal entity, EIN, registered agent, and address for your site's legal pages."
          filled={!!intake?.legal_name}
          defaultOpen={!intake?.legal_name}
        >
          <BusinessDetailsForm intake={intake} />
        </CollapsibleCard>
      </div>

      <OnboardingChecklist orgId={view.org.id} phases={view.phases} />
    </div>
  );
}
