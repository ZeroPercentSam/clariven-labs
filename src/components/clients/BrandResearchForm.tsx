'use client';

import { useActionState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { saveBrandResearch, type IntakeState } from '@/lib/clients/intake-actions';
import type { ClientIntake } from '@/lib/clients/intake-queries';

const FIELD =
  'w-full px-3 py-2 rounded-lg border border-cl-gray-200 bg-white text-cl-navy text-sm placeholder:text-cl-gray-400 focus:outline-none focus:ring-2 focus:ring-cl-teal/30 focus:border-cl-teal transition';
const LABEL = 'block text-sm font-medium text-cl-navy mb-1.5';

export function BrandResearchForm({ intake }: { intake: ClientIntake | null }) {
  const [state, action, pending] = useActionState<IntakeState, FormData>(saveBrandResearch, {
    ok: false,
  });

  return (
    <div className="bg-white border border-cl-gray-200 rounded-xl p-6">
      <h2 className="text-sm font-semibold text-cl-navy mb-1">Brand name &amp; market research</h2>
      <p className="text-xs text-cl-gray-500 mb-4">
        Pick your brand name and domain. Clariven checks availability and competing entities before
        you form the legal entity.
      </p>
      <form action={action} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Proposed brand name</label>
            <input
              name="proposed_name"
              defaultValue={intake?.proposed_name ?? ''}
              placeholder="e.g. Acme Research"
              className={FIELD}
            />
          </div>
          <div>
            <label className={LABEL}>Desired domain / URL</label>
            <input
              name="desired_domain"
              defaultValue={intake?.desired_domain ?? ''}
              placeholder="e.g. acmeresearch.com"
              className={FIELD}
            />
          </div>
        </div>
        <div>
          <label className={LABEL}>Notes — alternatives, competitor concerns</label>
          <textarea
            name="competitor_notes"
            rows={3}
            defaultValue={intake?.competitor_notes ?? ''}
            placeholder="Backup names, any similar brands you've found…"
            className={`${FIELD} resize-none`}
          />
        </div>
        <label className="flex items-start gap-2 text-sm text-cl-gray-600">
          <input
            type="checkbox"
            name="competitor_checked"
            defaultChecked={intake?.competitor_checked ?? false}
            className="mt-0.5 accent-cl-teal"
          />
          <span>I&apos;ve confirmed there are no obvious competing entities or trademarks using this name.</span>
        </label>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2 text-[12px] font-semibold tracking-wider text-white bg-cl-teal rounded-lg hover:bg-cl-teal/90 transition uppercase disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending ? 'Saving…' : 'Save'}
          </button>
          {state.ok ? (
            <span className="text-sm text-cl-success inline-flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Saved
            </span>
          ) : null}
          {state.error ? <span className="text-sm text-cl-error">{state.error}</span> : null}
        </div>
      </form>
    </div>
  );
}
