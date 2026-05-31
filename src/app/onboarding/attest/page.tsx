import { redirect } from 'next/navigation';
import { getOrg } from '@/lib/auth/roles';
import { submitAttestation } from '@/lib/onboarding/actions';

export const metadata = { title: 'Research-use attestation — Clariven Labs' };
export const dynamic = 'force-dynamic';

const ATTESTATION =
  'I attest that this organization will use all ClarivenLabs materials for laboratory research ' +
  'use only — not for human or animal consumption — and in compliance with all applicable laws ' +
  'and institutional policies. I am authorized to make this attestation for the organization.';

export default async function AttestPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  // Already onboarded → don't show the form again.
  const org = await getOrg();
  if (org) {
    redirect(org.approval_status === 'approved' ? '/portal' : '/onboarding/pending');
  }

  return (
    <main className="min-h-screen bg-white pt-[96px] pb-24 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-cl-navy mb-2">Set up your research account</h1>
        <p className="text-cl-gray-500 text-sm mb-8 leading-relaxed">
          ClarivenLabs supplies materials for laboratory research use only. Tell us about your
          organization and confirm your research-use intent. An admin reviews each new account
          before ordering is enabled — you&apos;ll see your status on the next screen.
        </p>

        <form action={submitAttestation} className="space-y-4">
          <Field name="org_name" label="Organization name" required maxLength={200} />
          <Field
            name="legal_entity_name"
            label="Legal entity name"
            required
            maxLength={200}
            hint="The registered entity that will be invoiced (e.g. university, institute, company)."
          />

          <label className="block">
            <span className="block text-xs font-semibold tracking-wider text-cl-gray-500 uppercase mb-1.5">
              Research context
            </span>
            <textarea
              name="research_context"
              required
              minLength={10}
              maxLength={2000}
              rows={4}
              placeholder="Briefly describe the laboratory research these materials support."
              className="w-full px-3 py-2 rounded-lg border border-cl-gray-200 bg-white text-sm text-cl-navy focus:outline-none focus:border-cl-teal/60"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <Field
              name="institutional_affiliation"
              label="Institutional affiliation (optional)"
              maxLength={200}
            />
            <Field
              name="orcid_or_inst_id"
              label="ORCID / institutional ID (optional)"
              maxLength={100}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field name="billing_email" label="Billing email (optional)" type="email" maxLength={200} />
            <Field name="phone" label="Phone (optional)" type="tel" maxLength={40} />
          </div>

          <label className="block">
            <span className="block text-xs font-semibold tracking-wider text-cl-gray-500 uppercase mb-1.5">
              Supporting document (optional, PDF)
            </span>
            <input
              type="file"
              name="attestation_file"
              accept="application/pdf"
              className="w-full text-sm text-cl-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-cl-gray-100 file:px-3 file:py-2 file:text-cl-navy"
            />
            <span className="block mt-1 text-xs text-cl-gray-400">
              Institutional letter, purchase authorization, or similar. Max 20 MB.
            </span>
          </label>

          <div className="border-t border-cl-gray-200 pt-5">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                name="acknowledged"
                required
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-cl-gray-300 text-cl-teal focus:ring-cl-teal/60"
              />
              <span className="text-[13px] leading-snug text-cl-gray-600">{ATTESTATION}</span>
            </label>
          </div>

          {error ? (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cl-teal text-white font-semibold hover:bg-cl-teal-light transition"
          >
            Submit for review
          </button>
        </form>
      </div>
    </main>
  );
}

function Field({
  name,
  label,
  required,
  type = 'text',
  maxLength,
  hint,
}: {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  maxLength?: number;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold tracking-wider text-cl-gray-500 uppercase mb-1.5">
        {label}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        maxLength={maxLength}
        className="w-full px-3 py-2 rounded-lg border border-cl-gray-200 bg-white text-sm text-cl-navy focus:outline-none focus:border-cl-teal/60"
      />
      {hint ? <span className="block mt-1 text-xs text-cl-gray-400">{hint}</span> : null}
    </label>
  );
}
