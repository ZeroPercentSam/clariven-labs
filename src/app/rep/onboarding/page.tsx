import { redirect } from 'next/navigation';
import { getMyRep, getCurrentRepAgreement } from '@/lib/rep/queries';
import { submitRepOnboarding } from '@/lib/rep/actions';
import {
  REP_PAYOUT_METHODS,
  REP_PAYOUT_METHOD_LABELS,
  TAX_ID_KINDS,
  TAX_ID_KIND_LABELS,
  REP_BUSINESS_TYPES,
  REP_BUSINESS_TYPE_LABELS,
} from '@/lib/rep/constants';

export const metadata = { title: 'Rep onboarding — Clariven Labs' };
export const dynamic = 'force-dynamic';

const labelCls =
  'block text-cl-gray-600 text-xs font-semibold tracking-wider uppercase mb-1.5';
const inputCls =
  'w-full bg-white border border-cl-gray-200 rounded-lg px-4 py-2.5 text-cl-navy text-sm focus:outline-none focus:border-cl-teal/60';

export default async function RepOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const rep = await getMyRep();

  // Not a rep → out. Already onboarded → status page. (Active reps land in the
  // portal once c5 ships; for now the pending page handles every post-submit
  // status.)
  if (!rep) redirect('/');
  if (rep.onboarding_completed_at) redirect('/rep/onboarding/pending');

  const agreement = await getCurrentRepAgreement();

  return (
    <main className="min-h-screen bg-white pt-[96px] pb-24 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-cl-navy mb-1">Rep onboarding</h1>
        <p className="text-cl-gray-500 text-sm mb-8">
          Tax (W-9), payout, and a signature on the rep agreement. Tax and payout details lock once
          submitted — contact an admin to change them later.
        </p>

        {error ? (
          <p className="mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        ) : null}

        <form action={submitRepOnboarding} className="space-y-8">
          {/* W-9 / identity */}
          <fieldset className="space-y-4">
            <legend className="text-cl-navy font-semibold mb-2">Identity &amp; W-9</legend>
            <label className="block">
              <span className={labelCls}>Full legal name</span>
              <input name="legalName" required maxLength={200} className={inputCls} />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className={labelCls}>Tax ID type</span>
                <select name="taxIdKind" required className={inputCls} defaultValue="SSN">
                  {TAX_ID_KINDS.map((k) => (
                    <option key={k} value={k}>
                      {TAX_ID_KIND_LABELS[k]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={labelCls}>Tax ID</span>
                <input
                  name="taxId"
                  required
                  maxLength={40}
                  placeholder="123-45-6789"
                  className={inputCls}
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className={labelCls}>Business type</span>
                <select name="businessType" required className={inputCls} defaultValue="individual">
                  {REP_BUSINESS_TYPES.map((b) => (
                    <option key={b} value={b}>
                      {REP_BUSINESS_TYPE_LABELS[b]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={labelCls}>Phone</span>
                <input name="phone" type="tel" required maxLength={40} className={inputCls} />
              </label>
            </div>
          </fieldset>

          {/* Address */}
          <fieldset className="space-y-4">
            <legend className="text-cl-navy font-semibold mb-2">Mailing address</legend>
            <label className="block">
              <span className={labelCls}>Address line 1</span>
              <input name="addressLine1" required maxLength={200} className={inputCls} />
            </label>
            <label className="block">
              <span className={labelCls}>Address line 2 (optional)</span>
              <input name="addressLine2" maxLength={200} className={inputCls} />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className={labelCls}>City</span>
                <input name="addressCity" required maxLength={120} className={inputCls} />
              </label>
              <label className="block">
                <span className={labelCls}>State</span>
                <input name="addressState" required maxLength={40} className={inputCls} />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className={labelCls}>Postal code</span>
                <input name="addressPostalCode" required maxLength={20} className={inputCls} />
              </label>
              <label className="block">
                <span className={labelCls}>Country</span>
                <input name="addressCountry" defaultValue="US" maxLength={40} className={inputCls} />
              </label>
            </div>
          </fieldset>

          {/* Payout */}
          <fieldset className="space-y-4">
            <legend className="text-cl-navy font-semibold mb-2">Payout</legend>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className={labelCls}>Method</span>
                <select name="payoutMethod" required className={inputCls} defaultValue="ACH">
                  {REP_PAYOUT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {REP_PAYOUT_METHOD_LABELS[m]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={labelCls}>Account (last 4 or PayPal email)</span>
                <input
                  name="payoutAccountMasked"
                  required
                  maxLength={120}
                  placeholder="**** 4321"
                  className={inputCls}
                />
              </label>
            </div>
            <label className="block">
              <span className={labelCls}>Payout reference (optional)</span>
              <input name="payoutAccountRef" maxLength={500} className={inputCls} />
            </label>
          </fieldset>

          {/* Agreement + signature */}
          <fieldset className="space-y-4">
            <legend className="text-cl-navy font-semibold mb-2">
              Sales representative agreement{agreement ? ` (${agreement.label})` : ''}
            </legend>
            {agreement ? (
              <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-lg border border-cl-gray-200 bg-cl-gray-50 p-4 text-xs leading-relaxed text-cl-gray-700 font-sans">
                {agreement.body_md}
              </pre>
            ) : (
              <p className="text-sm text-red-600">
                No active agreement is on file. Contact an admin before continuing.
              </p>
            )}
            <label className="block">
              <span className={labelCls}>Type your legal name to sign</span>
              <input
                name="signedLegalName"
                required
                maxLength={200}
                placeholder="Must match the legal name above"
                className={inputCls}
              />
            </label>
            <label className="flex items-start gap-2 text-sm text-cl-gray-600">
              <input type="checkbox" name="agreedToTerms" required className="mt-1" />
              <span>
                I agree to the Clariven Labs Sales Representative Agreement above and intend my typed
                name to be my electronic signature (E-SIGN).
              </span>
            </label>
          </fieldset>

          <button
            type="submit"
            disabled={!agreement}
            className="w-full px-5 py-3 text-[12px] font-semibold tracking-wider text-white bg-cl-teal rounded-lg hover:bg-cl-teal/90 transition uppercase disabled:opacity-50"
          >
            Submit for review
          </button>
        </form>
      </div>
    </main>
  );
}
