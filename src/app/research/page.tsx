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
              Stand Up Your Research Brand.
              <br />
              <span className="bg-gradient-to-r from-cl-teal to-cl-blue-accent bg-clip-text text-transparent">
                Built for Rigor.
              </span>
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed mb-10">
              Clariven Labs helps universities, CROs, and research institutions launch and run
              compliant research-use-only programs — with the documentation and rigor that
              reproducible, peer-reviewed work demands.
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

      {/* ════════ RESEARCH VALUE PROPS ════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-4">Purpose-Built for Research</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-4">
              Groundwork That Stands Up to Peer Review
            </h2>
            <p className="text-cl-gray-500 max-w-2xl mx-auto">
              A research-use-only program is only as credible as the compliance and documentation
              behind it. Clariven Labs builds and maintains that foundation for you.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Award, title: 'Compliance, Done Right', description: 'Research-use-only positioning, labeling, and attestations set up correctly from the start — and kept that way.' },
              { icon: FileCheck, title: 'Audit-Ready Documentation', description: 'COAs, batch records, and reference data organized into a package your methods section and reviewers can cite.' },
              { icon: Dna, title: 'Brand & Web', description: 'A credible brand identity and storefront, designed and stood up for your research-use-only program.' },
              { icon: Layers, title: 'Fulfillment & Operations', description: 'Third-party logistics, payments, and order flow coordinated end to end through vetted partners.' },
              { icon: GraduationCap, title: 'Guided Onboarding', description: 'A single checklist — 9 phases, 21 steps — run by a named Clariven team so nothing slips.' },
              { icon: Clock, title: 'Predictable Launch', description: 'Clear milestones and a dedicated specialist keep your launch on schedule against grant and program deadlines.' },
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
              Talk to our team about launching or running your research-use-only program — the
              compliance, documentation, brand, and operations, handled end to end.
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
