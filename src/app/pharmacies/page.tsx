'use client';

import { motion } from 'framer-motion';
import {
  Pill,
  CheckCircle2,
  ArrowRight,
  Shield,
  Clock,
  FileCheck,
  FlaskConical,
  TrendingUp,
  Building2,
  Package,
  Layers,
  BadgeCheck,
  Scale,
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

export default function PharmaciesPage() {
  return (
    <div className="pt-[72px] bg-white">
      {/* ════════ HERO ════════ */}
      <section className="relative py-20 sm:py-28 bg-cl-navy overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cl-blue/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cl-teal/8 rounded-full blur-[100px]" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-cl-teal text-sm font-medium mb-6">
              <Pill className="w-4 h-4" />
              For Compounding Pharmacies
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              API-Grade Peptides for
              <br />
              <span className="bg-gradient-to-r from-cl-teal to-cl-blue-accent bg-clip-text text-transparent">
                Compounding Excellence
              </span>
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed mb-10">
              Clariven Labs provides compounding pharmacies with pharmaceutical-grade Active
              Pharmaceutical Ingredients (APIs) backed by complete regulatory documentation
              and batch traceability.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cl-teal text-white font-semibold hover:bg-cl-teal-light transition-all">
                Open a Pharmacy Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/quality" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/20 text-white font-semibold hover:border-white/40 hover:bg-white/5 transition-all">
                View Quality Standards
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════ PHARMACY-SPECIFIC VALUE PROPS ════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-4">Built for Pharmacy</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-4">
              Your Compounding Partner, Not Just a Supplier
            </h2>
            <p className="text-cl-gray-500 max-w-2xl mx-auto">
              We understand the unique regulatory, quality, and operational demands
              of compounding pharmacies — because we built our supply chain around them.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Scale, title: '503A/503B Compliance', description: 'Complete documentation packages designed for both patient-specific (503A) and outsourcing facility (503B) requirements under federal and state regulations.' },
              { icon: FileCheck, title: 'Full COA & Documentation', description: 'Batch-specific COAs with HPLC, MS, endotoxin, sterility results plus safety data sheets, stability reports, and supplier qualification files.' },
              { icon: Layers, title: 'Bulk API Supply', description: 'Gram-to-kilogram quantities with consistent lot sizes. Multi-lot reservations available for high-volume compounding operations.' },
              { icon: Package, title: 'GMP-Grade Packaging', description: 'Properly labeled, sealed, and stored APIs arrive in pharmaceutical-grade packaging with tamper-evident seals and temperature indicators.' },
              { icon: Truck, title: 'Reliable Supply Chain', description: 'Multi-source manufacturing network eliminates single-point-of-failure risks. Safety stock programs available for critical formulations.' },
              { icon: Building2, title: 'Facility Audit Support', description: 'We support your Board of Pharmacy inspections with supplier qualification documentation, audit histories, and regulatory correspondence.' },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.06}>
                <motion.div whileHover={{ y: -4 }} className="h-full p-6 rounded-2xl bg-white border border-cl-gray-200 hover:border-cl-teal/30 hover:shadow-lg hover:shadow-cl-teal/5 transition-all duration-300">
                  <div className="w-11 h-11 rounded-xl bg-cl-teal/10 flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-cl-teal" />
                  </div>
                  <h3 className="text-lg font-semibold text-cl-navy mb-2">{item.title}</h3>
                  <p className="text-sm text-cl-gray-500 leading-relaxed">{item.description}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ COMPLIANCE SECTION ════════ */}
      <section className="py-20 bg-cl-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-4">Regulatory Ready</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-6">
                Compliance Documentation That Passes Inspection
              </h2>
              <p className="text-cl-gray-500 leading-relaxed mb-8">
                State board inspections and FDA audits require meticulous documentation
                of your API supply chain. Clariven Labs provides the complete documentation
                package your pharmacy needs to demonstrate compliance.
              </p>
              <div className="space-y-3">
                {[
                  'Batch-specific Certificates of Analysis (COAs)',
                  'Certificate of Conformance for each lot',
                  'Supplier qualification and audit reports',
                  'Safety Data Sheets (SDS) for all products',
                  'ICH-compliant stability study data',
                  'cGMP manufacturing facility documentation',
                  'Chain of custody and traceability records',
                  'Drug Master File (DMF) reference letters',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-cl-teal shrink-0 mt-0.5" />
                    <span className="text-sm text-cl-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="bg-gradient-to-br from-cl-navy to-cl-navy-light rounded-2xl p-8">
                <h3 className="text-white font-semibold text-xl mb-6">Quality by the Numbers</h3>
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { value: '≥98%', label: 'Minimum Purity' },
                    { value: '100%', label: 'COA Coverage' },
                    { value: '<0.5', label: 'EU/mg Endotoxin' },
                    { value: 'USP', label: 'Testing Standards' },
                    { value: '6-Point', label: 'Analytical Panel' },
                    { value: 'ICH', label: 'Stability Protocol' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-2xl font-bold text-cl-teal mb-1">{stat.value}</div>
                      <p className="text-xs text-white/40">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ════════ TESTIMONIAL ════════ */}
      <section className="py-20 bg-cl-navy">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <div className="text-3xl sm:text-4xl font-bold text-white leading-relaxed mb-8">
              &ldquo;As a 503B outsourcing facility, supplier qualification is critical.
              Clariven Labs provides the most complete documentation package we&apos;ve
              seen from any peptide API supplier.&rdquo;
            </div>
            <div>
              <p className="text-cl-teal font-semibold">Michael Torres, RPh</p>
              <p className="text-white/40 text-sm">Director of Quality, Regional Compounding Pharmacy</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════ CTA ════════ */}
      <section className="py-20 bg-gradient-to-br from-cl-navy to-cl-navy-light">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Upgrade Your API Supply Chain
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto mb-8">
              Request bulk pricing, sample COAs, or schedule a call with our pharmacy
              sales team. We&apos;ll show you why leading compounders choose Clariven.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cl-teal text-white font-semibold hover:bg-cl-teal-light transition-all">
                Request Bulk Pricing
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/products" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/20 text-white font-semibold hover:border-white/40 hover:bg-white/5 transition-all">
                View API Catalog
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
