'use client';

import { useActionState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { signAgreement, type SignState } from '@/lib/agreements/actions';

// Renders one agreement: scrollable body + typed-name e-signature, or a signed
// confirmation if already consented. Mirrors the Purity rep agreement sign UX.
export function AgreementSign({
  slug,
  label,
  body,
  signed,
}: {
  slug: string;
  label: string;
  body: string;
  signed?: { name: string; at: string } | null;
}) {
  const [state, action, pending] = useActionState<SignState, FormData>(signAgreement, { ok: false });
  const done = Boolean(signed) || state.ok;

  return (
    <div className="space-y-3">
      <div className="max-h-72 overflow-y-auto rounded-lg border border-cl-gray-200 bg-cl-gray-50 p-4 text-xs leading-relaxed text-cl-gray-700 whitespace-pre-wrap">
        {body}
      </div>

      {done ? (
        <div className="flex items-center gap-2 rounded-lg bg-cl-success/5 border border-cl-success/20 px-3 py-2 text-sm text-cl-success">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>
            Signed{signed ? ` by ${signed.name} on ${new Date(signed.at).toLocaleDateString()}` : ''}.
          </span>
        </div>
      ) : (
        <form action={action} className="space-y-3">
          <input type="hidden" name="slug" value={slug} />
          <input
            type="text"
            name="signed_legal_name"
            required
            autoComplete="off"
            placeholder="Type your full legal name to sign"
            className="w-full rounded-lg border border-cl-gray-200 bg-white px-3 py-2 text-sm text-cl-navy focus:outline-none focus:ring-2 focus:ring-cl-teal/30 focus:border-cl-teal"
          />
          <label className="flex items-start gap-2 text-xs text-cl-gray-600">
            <input type="checkbox" name="agree" required className="mt-0.5 shrink-0" />
            <span>
              I have read and agree to the {label}. I understand that typing my legal name and
              submitting constitutes my electronic signature under the E-SIGN Act.
            </span>
          </label>
          {state.error ? <p className="text-sm text-cl-error">{state.error}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center rounded-xl bg-cl-teal px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-cl-teal-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Signing…' : 'Sign & submit'}
          </button>
        </form>
      )}
    </div>
  );
}
