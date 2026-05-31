import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Clock, CheckCircle2, Ban } from 'lucide-react';
import { getMyRep } from '@/lib/rep/queries';

export const metadata = { title: 'Rep status — Clariven Labs' };
export const dynamic = 'force-dynamic';

export default async function RepOnboardingPendingPage() {
  const rep = await getMyRep();
  if (!rep) redirect('/');
  // Not yet onboarded → finish onboarding first.
  if (rep.status === 'pending_invite' && !rep.onboarding_completed_at) {
    redirect('/rep/onboarding');
  }

  const view =
    rep.status === 'active'
      ? {
          icon: <CheckCircle2 className="w-12 h-12 text-cl-teal mx-auto mb-4" />,
          title: "You're approved",
          body: 'Your rep account is active. Head to your dashboard to get started.',
          cta: { href: '/rep/dashboard', label: 'Go to dashboard' },
        }
      : rep.status === 'suspended'
        ? {
            icon: <Ban className="w-12 h-12 text-red-500 mx-auto mb-4" />,
            title: 'Account suspended',
            body:
              rep.suspended_reason ||
              'Your rep account is currently suspended. Contact an admin for details.',
            cta: null,
          }
        : {
            icon: <Clock className="w-12 h-12 text-cl-gray-400 mx-auto mb-4" />,
            title: 'Submitted for review',
            body: "Thanks — your onboarding is in. An admin will review and activate your rep account. You'll get an email when it's approved.",
            cta: null,
          };

  return (
    <main className="min-h-screen bg-white pt-[96px] pb-24 px-6">
      <div className="max-w-md mx-auto text-center">
        {view.icon}
        <h1 className="text-2xl font-bold text-cl-navy mb-2">{view.title}</h1>
        <p className="text-cl-gray-500 text-sm leading-relaxed">{view.body}</p>
        {view.cta ? (
          <Link
            href={view.cta.href}
            className="inline-block mt-6 px-5 py-2.5 rounded-xl bg-cl-teal text-white text-sm font-semibold hover:bg-cl-teal/90 transition"
          >
            {view.cta.label}
          </Link>
        ) : null}
      </div>
    </main>
  );
}
