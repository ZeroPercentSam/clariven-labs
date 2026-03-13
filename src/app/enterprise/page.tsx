'use client';

import { motion } from 'framer-motion';
import {
  Building,
  CheckCircle2,
  ArrowRight,
  Shield,
  Users,
  FileCheck,
  TrendingUp,
  Globe,
  Lock,
  Package,
  BarChart3,
  Headphones,
  Handshake,
  Settings,
  Layers,
  Truck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
              Enterprise & Multi-Location
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Scale Your Peptide Program
              <br />
              <span className="bg-gradient-to-r from-cl-gold to-cl-gold-light bg-clip-text text-transparent">
                Across Every Location
              </span>
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed mb-10">
              Clariven Labs provides enterprise-grade peptide supply solutions for multi-location
              practices, hospital networks, and pharmacy chains — with centralized management,
              volume economics, and white-glove support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cl-gold text-cl-navy font-semibold hover:bg-cl-gold-light transition-all">
                Schedule Executive Briefing
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/quality" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/20 text-white font-semibold hover:border-white/40 hover:bg-white/5 transition-all">
                View Quality Standards
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════ ENTERPRISE VALUE PROPS ════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-cl-gold font-semibold text-sm tracking-widest uppercase mb-4">Enterprise Solutions</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-4">
              Built for Complexity. Designed for Scale.
            </h2>
            <p className="text-cl-gray-500 max-w-2xl mx-auto">
              Managing peptide supply across multiple locations demands more than a catalog
              and a phone number. Clariven Labs delivers enterprise infrastructure.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Globe, title: 'Multi-Location Management', description: 'Centralized ordering with location-specific fulfillment, billing, and compliance documentation. One relationship, unlimited locations.' },
              { icon: BarChart3, title: 'Volume Economics', description: 'Enterprise-tier pricing with contracted rates, volume rebates, and predictable budgeting. Custom pricing models for high-volume programs.' },
              { icon: Handshake, title: 'Dedicated Account Team', description: 'Named enterprise account manager plus technical specialist, regulatory liaison, and logistics coordinator. Quarterly business reviews included.' },
              { icon: Settings, title: 'Custom Integration', description: 'API access for procurement system integration, automated reordering, and inventory management. EDI and punch-out catalog options available.' },
              { icon: Lock, title: 'Supply Assurance', description: 'Reserved inventory programs, multi-source manufacturing, and business continuity planning to protect your supply chain against disruptions.' },
              { icon: FileCheck, title: 'Enterprise Compliance', description: 'Centralized compliance documentation, vendor qualification packages, and audit support for corporate quality management systems.' },
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
            <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-4">
              Enterprise Clients We Serve
            </h2>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: 'Multi-Location Practices', description: 'Medical groups with 5+ clinic locations requiring unified peptide supply management.', icon: Building },
              { title: 'Hospital Networks', description: 'Health systems integrating peptide therapies across inpatient and outpatient settings.', icon: Shield },
              { title: 'Pharmacy Chains', description: 'Compounding pharmacy groups needing centralized API procurement and quality documentation.', icon: Package },
              { title: 'Wellness Franchises', description: 'National and regional franchise networks standardizing peptide therapy protocols.', icon: Globe },
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
            <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-4">
              The Enterprise Engagement Model
            </h2>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Discovery Call', description: 'Executive briefing to understand your organization, volume, locations, and requirements.' },
              { step: '02', title: 'Custom Proposal', description: 'Tailored pricing, supply agreement, and implementation plan for your organization.' },
              { step: '03', title: 'Onboarding', description: 'Location-by-location setup with ordering systems, compliance packages, and staff training.' },
              { step: '04', title: 'Ongoing Partnership', description: 'Quarterly business reviews, supply planning, and continuous improvement initiatives.' },
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

      {/* ════════ TESTIMONIAL ════════ */}
      <section className="py-20 bg-cl-navy">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <div className="text-3xl sm:text-4xl font-bold text-white leading-relaxed mb-8">
              &ldquo;Managing peptide supply across 12 locations was a logistics
              nightmare until we partnered with Clariven. One account team,
              consistent quality, simplified compliance.&rdquo;
            </div>
            <div>
              <p className="text-cl-gold font-semibold">Robert Chang</p>
              <p className="text-white/40 text-sm">VP Operations, National Integrative Health Network</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════ CTA ════════ */}
      <section className="py-20 bg-gradient-to-br from-cl-navy to-cl-navy-light">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Let&apos;s Design Your Enterprise Solution
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto mb-8">
              Schedule a confidential executive briefing to explore how Clariven Labs
              can streamline your multi-location peptide supply chain.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cl-gold text-cl-navy font-semibold hover:bg-cl-gold-light transition-all">
                Schedule Executive Briefing
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/quality" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/20 text-white font-semibold hover:border-white/40 hover:bg-white/5 transition-all">
                View Quality Standards
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
