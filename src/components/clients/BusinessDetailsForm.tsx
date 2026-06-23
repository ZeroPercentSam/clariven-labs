'use client';

import { useActionState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { saveBusinessDetails, type IntakeState } from '@/lib/clients/intake-actions';
import type { ClientIntake } from '@/lib/clients/intake-queries';

const FIELD =
  'w-full px-3 py-2 rounded-lg border border-cl-gray-200 bg-white text-cl-navy text-sm placeholder:text-cl-gray-400 focus:outline-none focus:ring-2 focus:ring-cl-teal/30 focus:border-cl-teal transition';
const LABEL = 'block text-sm font-medium text-cl-navy mb-1.5';

export function BusinessDetailsForm({ intake }: { intake: ClientIntake | null }) {
  const [state, action, pending] = useActionState<IntakeState, FormData>(saveBusinessDetails, {
    ok: false,
  });

  return (
    <div className="bg-white border border-cl-gray-200 rounded-xl p-6">
      <h2 className="text-sm font-semibold text-cl-navy mb-1">Business details (LLC &amp; address)</h2>
      <p className="text-xs text-cl-gray-500 mb-4">
        Used to set up your site&apos;s privacy policy and other legal pages, and to broker your orders.
      </p>
      <form action={action} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Legal entity name</label>
            <input name="legal_name" defaultValue={intake?.legal_name ?? ''} className={FIELD} placeholder="Acme Research LLC" />
          </div>
          <div>
            <label className={LABEL}>Formation state</label>
            <input name="llc_state" defaultValue={intake?.llc_state ?? ''} className={FIELD} placeholder="Wyoming" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>EIN</label>
            <input name="ein" defaultValue={intake?.ein ?? ''} className={FIELD} placeholder="XX-XXXXXXX" />
          </div>
          <div>
            <label className={LABEL}>Registered agent</label>
            <input name="registered_agent" defaultValue={intake?.registered_agent ?? ''} className={FIELD} />
          </div>
        </div>
        <div>
          <label className={LABEL}>Address line 1</label>
          <input name="address_line1" defaultValue={intake?.address_line1 ?? ''} className={FIELD} />
        </div>
        <div>
          <label className={LABEL}>Address line 2</label>
          <input name="address_line2" defaultValue={intake?.address_line2 ?? ''} className={FIELD} />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className={LABEL}>City</label>
            <input name="city" defaultValue={intake?.city ?? ''} className={FIELD} />
          </div>
          <div>
            <label className={LABEL}>State</label>
            <input name="state" defaultValue={intake?.state ?? ''} className={FIELD} />
          </div>
          <div>
            <label className={LABEL}>Postal code</label>
            <input name="postal_code" defaultValue={intake?.postal_code ?? ''} className={FIELD} />
          </div>
          <div>
            <label className={LABEL}>Country</label>
            <input name="country" defaultValue={intake?.country ?? 'US'} className={FIELD} />
          </div>
        </div>
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
