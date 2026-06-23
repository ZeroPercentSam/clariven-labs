'use client';

import { motion } from 'framer-motion';
import {
  ShieldCheck,
  FileCheck,
  ClipboardCheck,
  Scan,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

/* ─── Fade-in ─── */
function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════ COMPLIANCE APPROACH ═══════════════════════════════ */

export default function QualityPage() {
  return (
    <div className="pt-[72px] bg-white">
      {/* ════════════════════ HERO ════════════════════ */}
      <section className="relative py-24 sm:py-28 bg-cl-navy overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cl-teal/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cl-blue/10 rounded-full blur-[100px]" />

        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-4">
              Our Compliance Approach
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Research Use Only,
              <br />
              <span className="bg-gradient-to-r from-cl-teal to-cl-blue-accent bg-clip-text text-transparent">
                Done Right
              </span>
            </h1>
            <p className="text-lg text-white/55 max-w-2xl mx-auto leading-relaxed">
              We keep a brand&apos;s positioning, labeling, and documentation consistent with
              research-use-only standards — so what a company says about its products matches what
              they actually are.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════ PRINCIPLES ════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-3">
                The Standard
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-4">
                What a Compliant RUO Program Looks Like
              </h2>
              <p className="text-cl-gray-500 max-w-2xl mx-auto text-lg">
                Intended use is judged by the whole of a brand — site, labels, and marketing together.
                We hold every surface to the same line.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: 'Research-Use-Only Positioning',
                desc: 'Products are presented for laboratory research only — not for human or animal consumption, and not as drugs, foods, or cosmetics. No human-use or treatment claims, anywhere.',
              },
              {
                icon: FileCheck,
                title: 'Honest Labeling & Copy',
                desc: 'Labels, product pages, and marketing say what a product is and nothing it isn’t. Claims a research-use-only brand can’t stand behind don’t go live.',
              },
              {
                icon: ClipboardCheck,
                title: 'Documentation & Attestations',
                desc: 'Research-use attestations and the supporting documentation are organized and in place, so the program’s intent is clear and defensible.',
              },
              {
                icon: Scan,
                title: 'Consistent Across Every Surface',
                desc: 'Home page, product pages, legal pages, and emails all carry the same research-use-only framing — reviewed as a whole, not page by page.',
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1}>
                <div className="flex gap-4 p-6 rounded-2xl bg-cl-gray-50 border border-cl-gray-200 h-full">
                  <div className="w-11 h-11 rounded-lg bg-cl-teal/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-cl-teal" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-cl-navy mb-1.5">{item.title}</h3>
                    <p className="text-cl-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ HOW WE KEEP IT CLEAN ════════════════════ */}
      <section className="py-24 bg-cl-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-3">
                How We Keep It Clean
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-6">
                Compliance Built Into the Onboarding
              </h2>
              <p className="text-cl-gray-500 leading-relaxed mb-8">
                Compliance isn&apos;t a one-time review — it&apos;s a step in the guided program and an
                ongoing check as a brand grows. Here&apos;s what that includes:
              </p>
              <div className="space-y-3">
                {[
                  'Research-use-only positioning and messaging set from day one',
                  'Label and product-copy review against research-use-only standards',
                  'Research-use attestations and supporting documentation organized',
                  'Privacy, terms, and consent language reviewed for the program',
                  'A site-wide check that no human-use or treatment language slips through',
                  'Re-review whenever new products or pages are added',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-cl-teal shrink-0 mt-0.5" />
                    <span className="text-cl-gray-600 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="bg-gradient-to-br from-cl-navy to-cl-navy-light rounded-2xl p-8 sm:p-10">
                <h3 className="text-white font-semibold text-xl mb-3">Where We Draw the Line</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  We&apos;re consultants — not a manufacturer or a testing lab. We&apos;re clear about what
                  that means so the work stays honest:
                </p>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="text-cl-teal mt-0.5">✓</span>
                    <span className="text-white/70">
                      We <strong className="text-white">do</strong> set up positioning, labeling,
                      documentation, attestations, and the partners a program needs.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-white/40 mt-0.5">—</span>
                    <span className="text-white/70">
                      We <strong className="text-white">don&apos;t</strong> manufacture product, run a
                      testing lab, issue certificates of analysis, or hold manufacturing
                      certifications. When those are needed, we coordinate the qualified partners who do.
                    </span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ════════════════════ CTA ════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <div className="p-12 sm:p-16 rounded-3xl bg-gradient-to-br from-cl-navy to-cl-navy-light relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-cl-teal/10 rounded-full blur-[80px]" />
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Build on a Compliant Foundation
                </h2>
                <p className="text-white/55 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
                  Talk to us about keeping your research-use-only program clean — from positioning and
                  labeling to documentation and launch.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/contact"
                    className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cl-teal text-white font-semibold hover:bg-cl-teal-light transition-all duration-300"
                  >
                    Start the Conversation
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/20 text-white font-semibold hover:border-white/40 hover:bg-white/5 transition-all duration-300"
                  >
                    How We Work
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
