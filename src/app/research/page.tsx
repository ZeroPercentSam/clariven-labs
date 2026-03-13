'use client';

import { motion } from 'framer-motion';
import {
  Microscope,
  CheckCircle2,
  ArrowRight,
  Shield,
  FlaskConical,
  FileCheck,
  Dna,
  Beaker,
  GraduationCap,
  BookOpen,
  Package,
  Award,
  Clock,
  Layers,
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

export default function ResearchPage() {
  return (
    <div className="pt-[72px] bg-white">
      {/* ════════ HERO ════════ */}
      <section className="relative py-20 sm:py-28 bg-cl-navy overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cl-blue/12 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cl-teal/8 rounded-full blur-[100px]" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-cl-teal text-sm font-medium mb-6">
              <Microscope className="w-4 h-4" />
              For Research Institutions
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Research-Grade Peptides.
              <br />
              <span className="bg-gradient-to-r from-cl-teal to-cl-blue-accent bg-clip-text text-transparent">
                Publication-Ready Data.
              </span>
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed mb-10">
              Clariven Labs supplies universities, CROs, and research institutions with
              high-purity peptides and comprehensive analytical documentation that
              supports reproducible, peer-reviewed research.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cl-teal text-white font-semibold hover:bg-cl-teal-light transition-all">
                Request Research Pricing
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/products" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/20 text-white font-semibold hover:border-white/40 hover:bg-white/5 transition-all">
                Browse Catalog
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════ RESEARCH VALUE PROPS ════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-4">Purpose-Built for Research</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-4">
              Quality That Stands Up to Peer Review
            </h2>
            <p className="text-cl-gray-500 max-w-2xl mx-auto">
              Your research results are only as reliable as your reagents. Clariven Labs
              provides the consistency and documentation your work demands.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Award, title: '≥98% Verified Purity', description: 'Every lot is HPLC-verified at ≥98% purity with full mass spectrometry identity confirmation. Lot-to-lot consistency ensures reproducible results.' },
              { icon: FileCheck, title: 'Complete Analytical Data', description: 'Batch-specific COAs include HPLC chromatograms, MS spectra, amino acid analysis, and endotoxin data — ready for your methods section.' },
              { icon: Dna, title: '50+ Peptide Catalog', description: 'Comprehensive catalog covering growth factors, signaling peptides, metabolic regulators, neuropeptides, and novel research compounds.' },
              { icon: Layers, title: 'Flexible Quantities', description: 'From milligram research-scale quantities to gram-scale for in vivo studies. No minimum order requirements for academic labs.' },
              { icon: GraduationCap, title: 'Academic Pricing', description: 'Special pricing programs for universities, NIH-funded labs, and non-profit research institutions. PO and institutional billing accepted.' },
              { icon: Clock, title: 'Fast Turnaround', description: 'In-stock items ship within 48 hours. Custom synthesis projects include milestone updates and expedited options for grant deadlines.' },
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

      {/* ════════ RESEARCH APPLICATIONS ════════ */}
      <section className="py-20 bg-cl-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-4">Research Applications</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-4">
              Peptides Across Research Domains
            </h2>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: 'Metabolic Research', examples: 'GLP-1 agonists, GIP analogs, insulin sensitizers', icon: Beaker },
              { title: 'Neuroscience', examples: 'Neuropeptides, cognitive enhancers, neuroprotective agents', icon: Dna },
              { title: 'Immunology', examples: 'Thymic peptides, immunomodulators, cytokine analogs', icon: Shield },
              { title: 'Wound Healing', examples: 'Growth factors, tissue repair peptides, angiogenic agents', icon: FlaskConical },
              { title: 'Oncology', examples: 'Anti-proliferative peptides, targeted delivery conjugates', icon: Microscope },
              { title: 'Endocrinology', examples: 'Growth hormone secretagogues, GHRH analogs', icon: Layers },
              { title: 'Aging & Longevity', examples: 'Telomerase activators, senolytic peptides, NAD+ precursors', icon: Award },
              { title: 'Drug Development', examples: 'Lead compounds, SAR studies, peptide-drug conjugates', icon: BookOpen },
            ].map((area, i) => (
              <FadeIn key={area.title} delay={i * 0.04}>
                <div className="h-full p-5 rounded-xl bg-white border border-cl-gray-200">
                  <div className="w-9 h-9 rounded-lg bg-cl-teal/10 flex items-center justify-center mb-3">
                    <area.icon className="w-4 h-4 text-cl-teal" />
                  </div>
                  <h3 className="text-base font-semibold text-cl-navy mb-1">{area.title}</h3>
                  <p className="text-xs text-cl-gray-400">{area.examples}</p>
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
              &ldquo;The lot-to-lot consistency from Clariven Labs has been exceptional.
              Having reliable analytical data with every order saves us significant
              time in our QC workflows.&rdquo;
            </div>
            <div>
              <p className="text-cl-teal font-semibold">Dr. James Whitfield, PhD</p>
              <p className="text-white/40 text-sm">Principal Investigator, State University Peptide Research Lab</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════ CTA ════════ */}
      <section className="py-20 bg-gradient-to-br from-cl-navy to-cl-navy-light">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Advance Your Research with Clariven Labs
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto mb-8">
              Request academic pricing, discuss custom synthesis projects, or order
              sample quantities to evaluate our peptide quality firsthand.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cl-teal text-white font-semibold hover:bg-cl-teal-light transition-all">
                Request Academic Pricing
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/products" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/20 text-white font-semibold hover:border-white/40 hover:bg-white/5 transition-all">
                View Full Catalog
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
