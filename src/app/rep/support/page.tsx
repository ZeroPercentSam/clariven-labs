import { requireActiveRep } from '@/lib/rep/portal-queries';

export const metadata = { title: 'Rep support — Clariven Labs' };
export const dynamic = 'force-dynamic';

export default async function RepSupportPage() {
  await requireActiveRep();
  return (
    <div>
      <h1 className="text-2xl font-bold text-cl-navy mb-6">Support</h1>
      <div className="bg-white border border-cl-gray-200 rounded-xl p-6 space-y-3 text-sm text-cl-gray-600">
        <p>
          Questions about commissions, payouts, or your assigned organizations? Email the rep desk
          and we&apos;ll get back to you.
        </p>
        <p>
          <a href="mailto:reps@clarivenlabs.com" className="text-cl-teal font-semibold hover:text-cl-teal/80">
            reps@clarivenlabs.com
          </a>
        </p>
        <p className="text-xs text-cl-gray-400">
          A full in-app ticketing surface is on the roadmap. For now, email is fastest.
        </p>
      </div>
    </div>
  );
}
