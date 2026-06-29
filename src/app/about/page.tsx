'use client';

import { motion } from 'framer-motion';
import {
  Target,
  Eye,
  Lightbulb,
  ShieldCheck,
  Building2,
  Users,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

/* ─── Fade-in wrapper ─── */
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
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════ ABOUT PAGE ═══════════════════════════════ */

export default function AboutPage() {
  return (
    <div className="pt-[72px] bg-white">
      {/* ════════════════════ HERO ════════════════════ */}
      <section className="relative py-24 sm:py-32 bg-cl-navy overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cl-blue/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cl-teal/10 rounded-full blur-[120px]" />

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-4">
              About Clariven Labs
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Built to Launch Research Brands —
              <br />
              <span className="bg-gradient-to-r from-cl-teal to-cl-blue-accent bg-clip-text text-transparent">
                Compliant From Day One
              </span>
            </h1>
            <p className="text-lg text-white/55 max-w-2xl mx-auto leading-relaxed">
              Clariven Labs is a research-use-only brand &amp; compliance consultancy. We help
              laboratories and research companies stand up a compliant RUO product line — and stay
              on the right side of the line as they grow.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════ FOUNDATION ════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-3">
                What Drives Us
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy">Our Foundation</h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: 'Our Mission',
                description:
                  'Make it straightforward for a research company to launch a research-use-only product line — with the compliance, brand, and operations handled correctly from the start.',
              },
              {
                icon: Eye,
                title: 'Our Approach',
                description:
                  'One partner from kickoff to launch. A single guided onboarding program — 9 phases, 22 steps — run by a named team, so you always know what’s next and who owns it.',
              },
              {
                icon: Lightbulb,
                title: 'Our Principle',
                description:
                  'Research use only, stated plainly and meant. We don’t overstate what a product is, and we won’t make a claim a research-use-only brand can’t stand behind.',
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.15}>
                <div className="relative p-8 rounded-2xl bg-cl-gray-50 border border-cl-gray-100 h-full">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cl-teal/10 to-cl-blue/10 flex items-center justify-center mb-6">
                    <item.icon className="w-7 h-7 text-cl-teal" />
                  </div>
                  <h3 className="text-xl font-semibold text-cl-navy mb-3">{item.title}</h3>
                  <p className="text-cl-gray-500 leading-relaxed">{item.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ HOW WE WORK ════════════════════ */}
      <section className="py-24 bg-cl-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-3">
                How We Work
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-4">
                One Guided Plan, Start to Launch
              </h2>
              <p className="text-cl-gray-500 max-w-2xl mx-auto text-lg">
                The same program runs every engagement, so nothing gets missed and you always know
                where things stand.
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Scope', desc: 'We learn your goals and map the compliance, brand, and operational groundwork your program needs.' },
              { step: '02', title: 'Plan', desc: 'You get a guided checklist and a named team, with a clear owner for every step.' },
              { step: '03', title: 'Build', desc: 'We coordinate compliance, brand, web, and fulfillment — and the partners it takes to go live.' },
              { step: '04', title: 'Launch & Support', desc: 'Your program goes live with the documentation in place, and we stay on through launch.' },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={i * 0.08}>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-cl-teal/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-cl-teal">{item.step}</span>
                  </div>
                  <h3 className="text-base font-semibold text-cl-navy mb-2">{item.title}</h3>
                  <p className="text-sm text-cl-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ WHAT WE HANDLE ════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-3">
                What We Handle
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy">
                The Groundwork Behind a Launch
              </h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: 'Compliance',
                desc: 'Research-use-only positioning, labeling, attestations, and documentation, set up to hold up to scrutiny.',
              },
              {
                icon: Building2,
                title: 'Brand, Web & Fulfillment',
                desc: 'Brand identity, storefront, and third-party logistics, coordinated end to end through vetted partners.',
              },
              {
                icon: Users,
                title: 'A Named Team',
                desc: 'A dedicated Clariven team that owns the plan with you, from the first call through launch.',
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1}>
                <div className="flex gap-4 p-6 rounded-xl bg-cl-gray-50 border border-cl-gray-200 h-full">
                  <div className="w-11 h-11 rounded-lg bg-cl-teal/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-cl-teal" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-cl-navy mb-1">{item.title}</h4>
                    <p className="text-cl-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
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
                  Partner With Clariven Labs
                </h2>
                <p className="text-white/55 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
                  Tell us about your research company and where you want to take it. We&apos;ll map the
                  path to a compliant, research-use-only launch.
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
                    href="/quality"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/20 text-white font-semibold hover:border-white/40 hover:bg-white/5 transition-all duration-300"
                  >
                    Our Compliance Approach
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
