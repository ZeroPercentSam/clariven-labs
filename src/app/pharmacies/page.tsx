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
              For Biotech & Contract Research
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              RUO Product Programs,
              <br />
              <span className="bg-gradient-to-r from-cl-teal to-cl-blue-accent bg-clip-text text-transparent">
                Built for R&amp;D Teams
              </span>
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed mb-10">
              Clariven Labs helps biotech R&amp;D teams, pharma research groups, and CROs stand up
              compliant research-use-only product programs — compliance, documentation, brand, and
              operations, coordinated end to end. For laboratory research use only.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cl-teal text-white font-semibold hover:bg-cl-teal-light transition-all">
                Talk to Our Team
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/quality" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/20 text-white font-semibold hover:border-white/40 hover:bg-white/5 transition-all">
                Our Quality Standards
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════ R&D-SPECIFIC VALUE PROPS ════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-4">Built for R&amp;D</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-4">
              A Partner From Concept to Launch
            </h2>
            <p className="text-cl-gray-500 max-w-2xl mx-auto">
              We understand the compliance, documentation, and operational demands of biotech and CRO
              research programs — and we handle the groundwork so your team can stay on the science.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Scale, title: 'Compliance & Positioning', description: 'Research-use-only positioning, labeling, and attestations set up to withstand scrutiny from day one.' },
              { icon: FileCheck, title: 'Documentation & COAs', description: 'Batch records, COAs, safety data, and stability reports organized into an audit-ready package.' },
              { icon: Layers, title: 'Brand & Storefront', description: 'A credible brand identity and storefront, stood up and maintained for your research-use-only program.' },
              { icon: Package, title: 'Fulfillment & 3PL', description: 'Labeling, packaging, and third-party logistics coordinated through vetted partners.' },
              { icon: Truck, title: 'Operations Setup', description: 'Payments, order flow, and the operational backbone wired up and handed over running.' },
              { icon: Building2, title: 'Vendor & Audit Readiness', description: 'Supplier-qualification files, audit histories, and technical documentation ready before buyers ask.' },
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
              <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-4">Audit Ready</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-6">
                Documentation That Passes Vendor Qualification
              </h2>
              <p className="text-cl-gray-500 leading-relaxed mb-8">
                Corporate quality systems and institutional supplier reviews require meticulous
                documentation of your research material supply chain. Clariven Labs provides the
                complete characterization package your R&amp;D program needs to qualify a vendor.
              </p>
              <div className="space-y-3">
                {[
                  'Batch-specific Certificates of Analysis (COAs)',
                  'Certificate of Conformance for each lot',
                  'Supplier qualification and audit reports',
                  'Safety Data Sheets (SDS) for all products',
                  'ICH-aligned stability study data',
                  'Manufacturing facility quality documentation',
                  'Chain of custody and traceability records',
                  'Reference standard characterization data',
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
              &ldquo;For a CRO, supplier qualification is critical. Clariven Labs provides
              the most complete characterization package we&apos;ve seen from any research
              peptide supplier.&rdquo;
            </div>
            <div>
              <p className="text-cl-teal font-semibold">Michael Torres, PhD</p>
              <p className="text-white/40 text-sm">Director of Quality, Contract Research Organization</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════ CTA ════════ */}
      <section className="py-20 bg-gradient-to-br from-cl-navy to-cl-navy-light">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Launch Your RUO Program?
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto mb-8">
              Schedule a call with our team to scope the compliance, documentation, and operations
              behind your research-use-only program. We&apos;ll map the path from where you are to launch.
            </p>
            <div className="flex justify-center">
              <Link href="/contact" className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cl-teal text-white font-semibold hover:bg-cl-teal-light transition-all">
                Request a Consultation
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
