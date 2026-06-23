'use client';

import { motion } from 'framer-motion';
import {
  Building,
  ArrowRight,
  Shield,
  FileCheck,
  Globe,
  Lock,
  Package,
  BarChart3,
  Handshake,
  Settings,
} from 'lucide-react';
import Link from 'next/link';

function FadeIn({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
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

export default function EnterprisePage() {
  return (
    <div className="pt-[72px] bg-white">
      {/* ════════ HERO ════════ */}
      <section className="relative py-20 sm:py-28 bg-cl-navy overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cl-gold/6 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cl-blue/10 rounded-full blur-[100px]" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-cl-gold text-sm font-medium mb-6">
              <Building className="w-4 h-4" />
              Multi-Brand &amp; At Scale
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Launch Multiple Research Brands
              <br />
              <span className="bg-gradient-to-r from-cl-gold to-cl-gold-light bg-clip-text text-transparent">
                Under One Standard
              </span>
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed mb-10">
              For operators and groups launching more than one research-use-only product line, Clariven
              Labs runs the same guided program across every brand — one compliance standard, one team,
              repeatable from launch to launch. For laboratory research use only.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cl-gold text-cl-navy font-semibold hover:bg-cl-gold-light transition-all">
                Schedule a Briefing
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/quality" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/20 text-white font-semibold hover:border-white/40 hover:bg-white/5 transition-all">
                Our Compliance Approach
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════ VALUE PROPS ════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-cl-gold font-semibold text-sm tracking-widest uppercase mb-4">At-Scale Consulting</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-4">
              Built for Complexity. Designed to Repeat.
            </h2>
            <p className="text-cl-gray-500 max-w-2xl mx-auto">
              Running more than one research-use-only brand multiplies the places things can drift.
              We keep every program on the same standard.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Globe, title: 'One Standard, Every Brand', description: 'Consistent research-use-only positioning, labeling, and compliance applied across your whole portfolio.' },
              { icon: BarChart3, title: 'A Shared Playbook', description: 'The same guided onboarding program runs each launch, so nothing is reinvented from brand to brand.' },
              { icon: Handshake, title: 'One Dedicated Team', description: 'A named Clariven team that knows your portfolio and carries context across every program.' },
              { icon: Settings, title: 'Repeatable Setup', description: 'Brand, web, and fulfillment stood up the same proven way each time, then handed over running.' },
              { icon: Lock, title: 'Compliance That Scales', description: 'One review standard applied to every brand — and re-checked each time you add a product or page.' },
              { icon: FileCheck, title: 'Centralized Documentation', description: 'Attestations and program documentation organized across the portfolio, ready when partners ask.' },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.06}>
                <motion.div whileHover={{ y: -4 }} className="h-full p-6 rounded-2xl bg-white border border-cl-gray-200 hover:border-cl-gold/30 hover:shadow-lg hover:shadow-cl-gold/5 transition-all duration-300">
                  <div className="w-11 h-11 rounded-xl bg-cl-gold/10 flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-cl-gold" />
                  </div>
                  <h3 className="text-lg font-semibold text-cl-navy mb-2">{item.title}</h3>
                  <p className="text-sm text-cl-gray-500 leading-relaxed">{item.description}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ WHO WE SERVE ════════ */}
      <section className="py-20 bg-cl-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-4">Who This Is For</h2>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: 'Multi-Brand Operators', description: 'Teams running more than one research-use-only brand and wanting one consistent standard.', icon: Building },
              { title: 'Holding Groups', description: 'Groups launching several research-use-only lines that should share compliance and operations.', icon: Shield },
              { title: 'Expanding Companies', description: 'Research companies broadening their lineup who need each addition to stay compliant.', icon: Package },
              { title: 'Networks & Partners', description: 'Networks standardizing how they bring new research-use-only programs to market.', icon: Globe },
            ].map((client, i) => (
              <FadeIn key={client.title} delay={i * 0.06}>
                <div className="h-full p-6 rounded-2xl bg-white border border-cl-gray-200">
                  <div className="w-11 h-11 rounded-xl bg-cl-navy/5 flex items-center justify-center mb-4">
                    <client.icon className="w-5 h-5 text-cl-navy" />
                  </div>
                  <h3 className="text-base font-semibold text-cl-navy mb-2">{client.title}</h3>
                  <p className="text-sm text-cl-gray-500 leading-relaxed">{client.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ ENGAGEMENT MODEL ════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-4">How a Portfolio Engagement Works</h2>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Briefing', description: 'We learn your portfolio, the brands you’re planning, and the standard you want to hold them to.' },
              { step: '02', title: 'Plan', description: 'A shared playbook and a named team, with the guided program mapped across every brand.' },
              { step: '03', title: 'Build', description: 'We run each launch through the same program — compliance, brand, web, and fulfillment.' },
              { step: '04', title: 'Ongoing Partnership', description: 'Reviews as you add brands or products, keeping the whole portfolio on one standard.' },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={i * 0.08}>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-cl-gold/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-cl-gold">{item.step}</span>
                  </div>
                  <h3 className="text-base font-semibold text-cl-navy mb-2">{item.title}</h3>
                  <p className="text-sm text-cl-gray-500">{item.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ CTA ════════ */}
      <section className="py-20 bg-gradient-to-br from-cl-navy to-cl-navy-light">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Let&apos;s Map Your Portfolio
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto mb-8">
              Schedule a briefing to explore how Clariven Labs can launch and maintain multiple
              research-use-only brands on one standard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cl-gold text-cl-navy font-semibold hover:bg-cl-gold-light transition-all">
                Schedule a Briefing
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/quality" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/20 text-white font-semibold hover:border-white/40 hover:bg-white/5 transition-all">
                Our Compliance Approach
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
