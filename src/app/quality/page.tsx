'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Shield,
  ShieldCheck,
  BadgeCheck,
  FlaskConical,
  FileCheck,
  Microscope,
  Building2,
  ClipboardCheck,
  Lock,
  CheckCircle2,
  ArrowRight,
  Award,
  Layers,
  Scan,
  TestTubes,
  Thermometer,
  PackageCheck,
  FileText,
  Download,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
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

/* ─── Animated counter ─── */
function AnimatedStat({ value, suffix = '', label }: { value: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl sm:text-4xl font-bold text-cl-teal mb-1">
        {isInView ? (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {value}{suffix}
          </motion.span>
        ) : (
          <span className="opacity-0">0</span>
        )}
      </div>
      <p className="text-sm text-cl-gray-500">{label}</p>
    </div>
  );
}

/* ─── Testing methodology data ─── */
const testingMethods = [
  {
    icon: FlaskConical,
    name: 'HPLC Analysis',
    description: 'High-Performance Liquid Chromatography confirms peptide purity at ≥98%, identifying and quantifying any impurities present.',
    detail: 'Every batch tested',
  },
  {
    icon: Microscope,
    name: 'Mass Spectrometry',
    description: 'Electrospray ionization mass spectrometry (ESI-MS) verifies molecular weight and structural integrity of each peptide.',
    detail: 'Molecular verification',
  },
  {
    icon: TestTubes,
    name: 'Endotoxin Testing',
    description: 'LAL (Limulus Amebocyte Lysate) testing ensures endotoxin levels are well below FDA-acceptable thresholds.',
    detail: '<0.5 EU/mg',
  },
  {
    icon: Scan,
    name: 'Sterility Testing',
    description: 'USP <71> compliant sterility testing confirms the absence of viable microorganisms in injectable-grade products.',
    detail: 'USP compliant',
  },
  {
    icon: Thermometer,
    name: 'Stability Testing',
    description: 'Accelerated and real-time stability studies per ICH guidelines confirm shelf life and optimal storage conditions.',
    detail: 'ICH guidelines',
  },
  {
    icon: Layers,
    name: 'Amino Acid Analysis',
    description: 'Quantitative amino acid analysis validates peptide composition and confirms the correct sequence of residues.',
    detail: 'Sequence verified',
  },
];

/* ─── Compliance certifications ─── */
const certifications = [
  {
    icon: Building2,
    title: 'cGMP Manufacturing',
    description: 'Our manufacturing partners operate under current Good Manufacturing Practice regulations (21 CFR Parts 210/211), ensuring consistent production quality.',
    badge: 'FDA Registered',
  },
  {
    icon: ClipboardCheck,
    title: '503A/503B Compliance',
    description: 'Licensed facility network supports both 503A patient-specific and 503B outsourcing facility distribution pathways under the FD&C Act.',
    badge: 'Licensed Facilities',
  },
  {
    icon: FileCheck,
    title: 'ISO 9001:2015',
    description: 'Quality management system certified to international standards, covering all processes from raw material sourcing to final product release.',
    badge: 'Certified',
  },
  {
    icon: Lock,
    title: 'DEA Registered',
    description: 'Registered with the Drug Enforcement Administration for controlled substance handling where applicable, maintaining full chain-of-custody documentation.',
    badge: 'Registered',
  },
];

/* ─── COA process steps ─── */
const coaSteps = [
  { step: '01', title: 'Raw Material Testing', description: 'Incoming amino acids and reagents undergo identity and purity verification before entering production.' },
  { step: '02', title: 'In-Process Controls', description: 'Real-time monitoring during synthesis ensures reaction completion and intermediate purity targets are met.' },
  { step: '03', title: 'Final Product Analysis', description: 'Complete analytical panel including HPLC, MS, endotoxin, sterility, and appearance testing on finished product.' },
  { step: '04', title: 'QA Review & Release', description: 'Quality Assurance reviews all test results against specifications. Product is released only upon full compliance.' },
  { step: '05', title: 'COA Generation', description: 'Batch-specific Certificate of Analysis is generated with complete test results, specifications, and QA approval.' },
  { step: '06', title: 'Digital Delivery', description: 'COA is delivered digitally with every shipment and accessible through our client portal for permanent records.' },
];

/* ═══════════════════════════════ QUALITY PAGE ═══════════════════════════════ */

export default function QualityPage() {
  return (
    <div className="pt-[72px] bg-white">
      {/* ════════════════════ HERO ════════════════════ */}
      <section className="relative py-20 sm:py-28 bg-cl-navy overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cl-teal/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cl-blue/10 rounded-full blur-[120px]" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-cl-teal text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Quality & Compliance
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Uncompromising Quality.
              <br />
              <span className="bg-gradient-to-r from-cl-teal to-cl-blue-accent bg-clip-text text-transparent">
                Verifiable at Every Step.
              </span>
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed mb-10">
              From raw material sourcing to final product release, every decision we make is
              guided by a single principle: your patients and research deserve the highest
              standard of purity and compliance.
            </p>

            {/* Quality stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[
                { value: '≥98%', label: 'Minimum Purity' },
                { value: '6-Point', label: 'Testing Panel' },
                { value: '100%', label: 'Batch COAs' },
                { value: 'cGMP', label: 'Manufacturing' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-2xl sm:text-3xl font-bold text-cl-teal mb-1">{stat.value}</div>
                  <p className="text-xs text-white/40">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════ QUALITY PHILOSOPHY ════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-4">
                Our Quality Philosophy
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-6 leading-tight">
                Quality Isn&apos;t a Department.
                <br />
                It&apos;s Our Infrastructure.
              </h2>
              <p className="text-cl-gray-500 leading-relaxed mb-6">
                At Clariven Labs, quality assurance isn&apos;t an afterthought bolted onto our process —
                it&apos;s the foundation upon which every process is built. Our vertically integrated
                quality system spans the entire product lifecycle, from raw material qualification
                through final delivery to your facility.
              </p>
              <p className="text-cl-gray-500 leading-relaxed mb-8">
                We maintain relationships with fewer, more qualified suppliers rather than chasing
                lowest-cost sourcing. Every manufacturing partner undergoes rigorous qualification
                audits and ongoing performance monitoring. The result: consistent, reliable product
                quality that your patients and research can depend on.
              </p>

              <div className="space-y-3">
                {[
                  'Vendor qualification program with annual re-audits',
                  'Environmental monitoring throughout production',
                  'Document-controlled SOPs for every process',
                  'CAPA system for continuous improvement',
                  'Annual management review of quality metrics',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-cl-teal shrink-0 mt-0.5" />
                    <span className="text-sm text-cl-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="relative">
                {/* Quality visual */}
                <div className="bg-gradient-to-br from-cl-navy to-cl-navy-light rounded-2xl p-8 sm:p-10">
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { icon: ShieldCheck, label: 'cGMP Certified', color: 'text-cl-teal' },
                      { icon: BadgeCheck, label: 'ISO 9001:2015', color: 'text-cl-blue-accent' },
                      { icon: Award, label: 'USP Compliant', color: 'text-cl-gold' },
                      { icon: FileCheck, label: 'DEA Registered', color: 'text-cl-teal-light' },
                    ].map((cert, i) => (
                      <motion.div
                        key={cert.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                        className="flex flex-col items-center gap-3 p-5 rounded-xl bg-white/5 border border-white/10"
                      >
                        <cert.icon className={cn('w-8 h-8', cert.color)} />
                        <span className="text-white/80 text-sm font-medium text-center">{cert.label}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    <p className="text-white/40 text-sm">
                      Audited annually by independent third-party quality assessors
                    </p>
                  </div>
                </div>

                {/* Floating badge */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="absolute -bottom-4 -right-4 bg-cl-teal text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-cl-teal/20"
                >
                  Zero Tolerance for Compromise
                </motion.div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ════════════════════ TESTING METHODOLOGY ════════════════════ */}
      <section className="py-20 bg-cl-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-4">
              Analytical Testing
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-4">
              Six-Point Testing Panel
            </h2>
            <p className="text-cl-gray-500 max-w-2xl mx-auto">
              Every batch undergoes comprehensive analytical testing before release.
              No exceptions. No shortcuts.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testingMethods.map((method, i) => (
              <FadeIn key={method.name} delay={i * 0.06}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="h-full p-6 rounded-2xl bg-white border border-cl-gray-200 hover:border-cl-teal/30 hover:shadow-lg hover:shadow-cl-teal/5 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-cl-teal/10 flex items-center justify-center">
                      <method.icon className="w-5 h-5 text-cl-teal" />
                    </div>
                    <span className="text-xs font-medium text-cl-teal bg-cl-teal/10 px-2.5 py-1 rounded-full">
                      {method.detail}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-cl-navy mb-2">{method.name}</h3>
                  <p className="text-sm text-cl-gray-500 leading-relaxed">{method.description}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ COMPLIANCE & CERTIFICATIONS ════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-4">
              Regulatory Compliance
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-4">
              Compliance-First Infrastructure
            </h2>
            <p className="text-cl-gray-500 max-w-2xl mx-auto">
              We maintain the highest regulatory standards so you can focus on your patients
              and research with complete confidence in your supply chain.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 gap-6">
            {certifications.map((cert, i) => (
              <FadeIn key={cert.title} delay={i * 0.08}>
                <div className="group h-full p-7 rounded-2xl border border-cl-gray-200 hover:border-cl-navy/20 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-xl bg-cl-navy/5 group-hover:bg-cl-navy/10 flex items-center justify-center shrink-0 transition-colors">
                      <cert.icon className="w-7 h-7 text-cl-navy" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-cl-navy">{cert.title}</h3>
                        <span className="text-xs font-medium text-cl-success bg-cl-success/10 px-2 py-0.5 rounded-full">
                          {cert.badge}
                        </span>
                      </div>
                      <p className="text-sm text-cl-gray-500 leading-relaxed">{cert.description}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ COA PROCESS ════════════════════ */}
      <section className="py-20 bg-cl-navy">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-4">
              Certificate of Analysis
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              From Synthesis to COA
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              Every batch follows a rigorous quality lifecycle. Here&apos;s how we ensure
              the COA you receive reflects absolute product integrity.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coaSteps.map((step, i) => (
              <FadeIn key={step.step} delay={i * 0.06}>
                <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300">
                  <span className="text-4xl font-bold text-cl-teal/20 absolute top-4 right-5">{step.step}</span>
                  <h3 className="text-white font-semibold text-lg mb-2 pr-10">{step.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* COA access card */}
          <FadeIn delay={0.3}>
            <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-cl-teal/20 to-cl-blue/20 border border-cl-teal/20 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-cl-teal/20 flex items-center justify-center shrink-0">
                <FileText className="w-8 h-8 text-cl-teal" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-semibold text-white mb-1">Access COAs Instantly</h3>
                <p className="text-white/50 text-sm">
                  All Certificates of Analysis are available digitally through our client portal.
                  Search by product, lot number, or date to find exactly what you need.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-cl-teal text-white rounded-xl font-semibold hover:bg-cl-teal-light transition-colors shrink-0"
              >
                <Download className="w-4 h-4" />
                Request Access
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════════ SUPPLY CHAIN INTEGRITY ════════════════════ */}
      <section className="py-20 bg-cl-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-4">
              Supply Chain Integrity
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-4">
              Controlled at Every Touchpoint
            </h2>
            <p className="text-cl-gray-500 max-w-2xl mx-auto">
              Quality doesn&apos;t end at the lab bench. Our supply chain is designed to maintain
              product integrity from manufacturing through delivery.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Building2,
                title: 'Qualified Suppliers',
                description: 'Multi-tier vendor qualification with ongoing performance audits and approved supplier lists.',
              },
              {
                icon: PackageCheck,
                title: 'Cold Chain Logistics',
                description: 'Temperature-controlled packaging and monitoring ensures product stability during transit.',
              },
              {
                icon: Scan,
                title: 'Batch Traceability',
                description: 'Full lot genealogy from raw materials through finished product with serialized tracking.',
              },
              {
                icon: Lock,
                title: 'Secure Handling',
                description: 'Tamper-evident packaging, chain of custody documentation, and signature-required delivery.',
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.08}>
                <div className="h-full p-6 rounded-2xl bg-white border border-cl-gray-200 text-center">
                  <div className="w-12 h-12 rounded-xl bg-cl-teal/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-cl-teal" />
                  </div>
                  <h3 className="text-base font-semibold text-cl-navy mb-2">{item.title}</h3>
                  <p className="text-sm text-cl-gray-500 leading-relaxed">{item.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ QUALITY METRICS ════════════════════ */}
      <section className="py-16 bg-white border-y border-cl-gray-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <AnimatedStat value={99.7} suffix="%" label="Order Accuracy" />
            <AnimatedStat value={0} suffix="<0.1% Returns" label="Product Return Rate" />
            <AnimatedStat value={100} suffix="%" label="Batch COA Coverage" />
            <AnimatedStat value={48} suffix="hr" label="Avg. Ship Time" />
          </div>
        </div>
      </section>

      {/* ════════════════════ DOCUMENTATION & RESOURCES ════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-4">
              Documentation
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-4">
              Compliance Resources
            </h2>
            <p className="text-cl-gray-500 max-w-2xl mx-auto">
              Access the documentation you need to maintain regulatory compliance
              and support your quality management system.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Certificate of Analysis (COA)',
                description: 'Batch-specific analytical results including purity, identity, endotoxin, and sterility data.',
                action: 'Request COA',
                icon: FileCheck,
              },
              {
                title: 'Safety Data Sheets (SDS)',
                description: 'Comprehensive safety, handling, and storage information for each peptide product.',
                action: 'View SDS Library',
                icon: Shield,
              },
              {
                title: 'Facility Certifications',
                description: 'Current cGMP certifications, ISO registrations, and regulatory licenses for our manufacturing network.',
                action: 'Request Documentation',
                icon: Building2,
              },
              {
                title: 'Product Specifications',
                description: 'Detailed specifications including acceptable ranges for purity, appearance, pH, and stability.',
                action: 'View Specifications',
                icon: ClipboardCheck,
              },
              {
                title: 'Stability Study Reports',
                description: 'ICH-compliant stability data supporting product shelf life and recommended storage conditions.',
                action: 'Request Reports',
                icon: Thermometer,
              },
              {
                title: 'Regulatory Compliance Guide',
                description: 'Overview of 503A/503B regulations, peptide classification, and prescriber requirements.',
                action: 'Download Guide',
                icon: FileText,
              },
            ].map((doc, i) => (
              <FadeIn key={doc.title} delay={i * 0.06}>
                <div className="group h-full p-6 rounded-2xl border border-cl-gray-200 hover:border-cl-teal/30 hover:shadow-md transition-all duration-300 flex flex-col">
                  <div className="w-10 h-10 rounded-lg bg-cl-gray-100 group-hover:bg-cl-teal/10 flex items-center justify-center mb-4 transition-colors">
                    <doc.icon className="w-5 h-5 text-cl-gray-500 group-hover:text-cl-teal transition-colors" />
                  </div>
                  <h3 className="text-base font-semibold text-cl-navy mb-2">{doc.title}</h3>
                  <p className="text-sm text-cl-gray-500 leading-relaxed mb-4 flex-1">{doc.description}</p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-cl-teal hover:text-cl-teal-light transition-colors"
                  >
                    {doc.action}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ BOTTOM CTA ════════════════════ */}
      <section className="py-20 bg-gradient-to-br from-cl-navy to-cl-navy-light">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cl-teal/10 border border-cl-teal/20 text-cl-teal text-sm font-medium mb-6">
              <ShieldCheck className="w-4 h-4" />
              Quality You Can Verify
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Partner with a Supplier
              <br />
              You Can Trust?
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto mb-8">
              Experience the Clariven difference. Request sample COAs, schedule a facility
              tour, or speak with our quality team directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cl-teal text-white font-semibold hover:bg-cl-teal-light transition-all duration-300"
              >
                Schedule a Quality Review
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/20 text-white font-semibold hover:border-white/40 hover:bg-white/5 transition-all duration-300"
              >
                Browse Our Catalog
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
