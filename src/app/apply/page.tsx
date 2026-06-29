'use client';

import { useActionState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Building2,
  Send,
  ArrowRight,
  CheckCircle2,
  FileSignature,
  CreditCard,
  CalendarCheck,
  LayoutDashboard,
} from 'lucide-react';
import { submitMembershipRequest } from '@/lib/memberships/actions';
import { requestCallMailto } from '@/lib/email/request-call';

const FIELD =
  'w-full px-4 py-3 rounded-xl border border-cl-gray-200 bg-white text-cl-navy placeholder:text-cl-gray-400 focus:outline-none focus:ring-2 focus:ring-cl-teal/30 focus:border-cl-teal transition';

const NEXT_STEPS = [
  { icon: FileSignature, text: 'Check your email to review and e-sign your consulting agreement.' },
  { icon: CreditCard, text: 'Submit your initial engagement fee — wire instructions are in a separate email.' },
  { icon: CalendarCheck, text: 'Request your onboarding call so we can map your plan.' },
  { icon: LayoutDashboard, text: 'We provision your private client portal and guided onboarding.' },
];

export default function ApplyPage() {
  const [state, formAction, pending] = useActionState(submitMembershipRequest, { ok: false });

  return (
    <div className="pt-[72px] bg-white min-h-screen">
      {/* Hero */}
      <section className="relative py-20 sm:py-24 bg-cl-navy overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cl-teal/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cl-blue/10 rounded-full blur-[100px]" />
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-cl-teal text-sm font-medium mb-6">
              <Building2 className="w-4 h-4" />
              Become a Client
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Apply to Launch Your
              <br />
              <span className="bg-gradient-to-r from-cl-teal to-cl-blue-accent bg-clip-text text-transparent">
                Research Brand
              </span>
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
              Tell us about your research company. Once you apply, we send your agreement, your
              onboarding next steps, and how to request your kickoff call.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Body */}
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-6">
          {state.ok ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl bg-cl-gray-50 border border-cl-gray-200 p-8 sm:p-10"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-cl-success/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-cl-success" />
                </div>
                <h2 className="text-2xl font-bold text-cl-navy mb-2">Application received</h2>
                <p className="text-cl-gray-500 max-w-md mx-auto">
                  Thanks — check your inbox. Here&apos;s what happens next:
                </p>
              </div>
              <ol className="space-y-4 max-w-lg mx-auto">
                {NEXT_STEPS.map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-lg bg-cl-teal/10 flex items-center justify-center shrink-0">
                      <s.icon className="w-4 h-4 text-cl-teal" />
                    </span>
                    <span className="text-sm text-cl-gray-600 pt-1.5">{s.text}</span>
                  </li>
                ))}
              </ol>
              <div className="text-center mt-8">
                <a
                  href={requestCallMailto()}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-cl-teal text-white font-semibold hover:bg-cl-teal-light transition shadow-lg shadow-cl-teal/20"
                >
                  <CalendarCheck className="w-5 h-5" />
                  Request an onboarding call
                </a>
              </div>
            </motion.div>
          ) : (
            <div className="rounded-2xl border border-cl-gray-200 shadow-xl shadow-cl-navy/5 p-8 sm:p-10 bg-white">
              <h2 className="text-2xl font-bold text-cl-navy mb-2">Client application</h2>
              <p className="text-cl-gray-500 mb-8">
                A Clariven specialist reviews every application and follows up within one business day.
              </p>
              <form action={formAction} className="space-y-5">
                {/* Honeypot — hidden from users; bots that fill it are dropped. */}
                <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-cl-navy mb-1.5">
                      Full name <span className="text-cl-error">*</span>
                    </label>
                    <input type="text" name="name" required placeholder="Jordan Reyes" className={FIELD} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-cl-navy mb-1.5">
                      Email <span className="text-cl-error">*</span>
                    </label>
                    <input type="email" name="email" required placeholder="you@company.com" className={FIELD} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-cl-navy mb-1.5">Phone</label>
                    <input type="tel" name="phone" placeholder="Optional" className={FIELD} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-cl-navy mb-1.5">Proposed brand name</label>
                    <input type="text" name="brand" placeholder="If you have one in mind" className={FIELD} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cl-navy mb-1.5">
                    Tell us about your research company
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    placeholder="Where you want to take it, timelines, and any questions…"
                    className={`${FIELD} resize-none`}
                  />
                </div>

                {state.error ? (
                  <p className="text-sm text-cl-error bg-cl-error/5 border border-cl-error/20 rounded-lg px-4 py-3">
                    {state.error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={pending}
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cl-teal text-white font-semibold hover:bg-cl-teal-light transition-all duration-300 shadow-lg shadow-cl-teal/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  {pending ? 'Submitting…' : 'Submit application'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-xs text-cl-gray-400">
                  By applying, you agree to our{' '}
                  <Link href="/privacy" className="text-cl-teal hover:underline">Privacy Policy</Link>. For
                  research-use-only programs. We&apos;ll never share your information with third parties.
                </p>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
