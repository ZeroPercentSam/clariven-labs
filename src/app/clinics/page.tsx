'use client';

import { motion } from 'framer-motion';
import {
  Stethoscope,
  CheckCircle2,
  ArrowRight,
  Shield,
  Clock,
  Users,
  FlaskConical,
  FileCheck,
  TrendingUp,
  Heart,
  Zap,
  BadgeCheck,
  Package,
  Headphones,
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

export default function ClinicsPage() {
  return (
    <div className="pt-[72px] bg-white">
      {/* ════════ HERO ════════ */}
      <section className="relative py-20 sm:py-28 bg-cl-navy overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cl-teal/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cl-blue/10 rounded-full blur-[100px]" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-cl-teal text-sm font-medium mb-6">
              <Stethoscope className="w-4 h-4" />
              For Clinics & Healthcare Providers
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Peptide Therapy Starts
              <br />
              <span className="bg-gradient-to-r from-cl-teal to-cl-blue-accent bg-clip-text text-transparent">
                With a Trusted Supply
              </span>
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed mb-10">
              Clariven Labs partners with forward-thinking clinics and medical practices to deliver
              pharmaceutical-grade peptides with the purity, documentation, and support your
              patients deserve.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cl-teal text-white font-semibold hover:bg-cl-teal-light transition-all">
                Open a Clinic Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/products" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/20 text-white font-semibold hover:border-white/40 hover:bg-white/5 transition-all">
                Browse Peptides
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════ PAIN POINTS → SOLUTIONS ════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-4">The Challenge</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-4">
              Your Patients Deserve Better Than Uncertainty
            </h2>
            <p className="text-cl-gray-500 max-w-2xl mx-auto">
              Peptide therapy is growing rapidly — but sourcing reliable, compliant peptides
              shouldn&apos;t feel like navigating a minefield.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Purity You Can Verify', description: 'Every vial ships with a batch-specific COA showing HPLC purity ≥98%, mass spec identity confirmation, and endotoxin results.' },
              { icon: FileCheck, title: 'Compliance Documentation', description: 'Full regulatory documentation package including 503A/503B compliance records, facility certifications, and prescriber support materials.' },
              { icon: Clock, title: '48-Hour Fulfillment', description: 'Priority processing ensures your clinic never runs out. Same-day shipping available for urgent patient needs.' },
              { icon: Headphones, title: 'Named Account Specialist', description: 'A dedicated specialist who knows your practice, anticipates reorder needs, and resolves issues before they become problems.' },
              { icon: TrendingUp, title: 'Volume-Based Pricing', description: 'Transparent tiered pricing that scales with your practice. No hidden fees, no surprise surcharges, no minimum order requirements.' },
              { icon: FlaskConical, title: 'Custom Formulations', description: 'Need a specific concentration or peptide combination? Our formulation team works directly with you to develop custom protocols.' },
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

      {/* ════════ POPULAR FOR CLINICS ════════ */}
      <section className="py-20 bg-cl-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-4">Most Requested</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-4">
              Popular Peptides for Clinical Practice
            </h2>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { name: 'Semaglutide', category: 'Weight Management', slug: 'semaglutide' },
              { name: 'BPC-157', category: 'Healing & Recovery', slug: 'bpc-157' },
              { name: 'CJC-1295 / Ipamorelin', category: 'Growth Hormone', slug: 'cjc-1295-ipamorelin' },
              { name: 'NAD+', category: 'Anti-Aging', slug: 'nad-plus' },
              { name: 'Tirzepatide', category: 'Weight Management', slug: 'tirzepatide' },
              { name: 'PT-141', category: 'Sexual Health', slug: 'pt-141' },
              { name: 'Thymosin Alpha-1', category: 'Immune Support', slug: 'thymosin-alpha-1' },
              { name: 'Sermorelin', category: 'Growth Hormone', slug: 'sermorelin' },
            ].map((peptide, i) => (
              <FadeIn key={peptide.slug} delay={i * 0.04}>
                <Link href={`/products/${peptide.slug}`}>
                  <motion.div whileHover={{ y: -3 }} className="p-5 rounded-xl bg-white border border-cl-gray-200 hover:border-cl-teal/30 hover:shadow-md transition-all cursor-pointer">
                    <p className="text-xs text-cl-teal font-medium mb-1">{peptide.category}</p>
                    <h3 className="text-base font-semibold text-cl-navy">{peptide.name}</h3>
                  </motion.div>
                </Link>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.2} className="text-center mt-8">
            <Link href="/products" className="inline-flex items-center gap-2 text-cl-teal font-medium hover:text-cl-teal-light transition-colors">
              View Full Catalog <ArrowRight className="w-4 h-4" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ════════ TESTIMONIAL ════════ */}
      <section className="py-20 bg-cl-navy">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <div className="text-3xl sm:text-4xl font-bold text-white leading-relaxed mb-8">
              &ldquo;Switching to Clariven Labs transformed how we manage our peptide
              program. The consistency, documentation, and dedicated support are
              exactly what a medical practice needs.&rdquo;
            </div>
            <div>
              <p className="text-cl-teal font-semibold">Dr. Sarah Mitchell, MD</p>
              <p className="text-white/40 text-sm">Medical Director, Integrative Wellness Center</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════ HOW IT WORKS ════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-4">
              Getting Started Is Simple
            </h2>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Submit Inquiry', description: 'Fill out our quick form with your practice details and peptide interests.' },
              { step: '02', title: 'Account Setup', description: 'Our team verifies your credentials and sets up your dedicated account within 24 hours.' },
              { step: '03', title: 'Place Your Order', description: 'Browse our catalog, get custom pricing, and place your first order with your account specialist.' },
              { step: '04', title: 'Receive & Treat', description: 'Orders ship within 48 hours with full COA documentation and cold chain packaging.' },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={i * 0.08}>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-cl-teal/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-cl-teal">{item.step}</span>
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
              Ready to Elevate Your Peptide Program?
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto mb-8">
              Join 500+ healthcare providers who trust Clariven Labs for pharmaceutical-grade
              peptides with uncompromising quality and compliance.
            </p>
            <Link href="/contact" className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cl-teal text-white font-semibold hover:bg-cl-teal-light transition-all">
              Schedule a Consultation
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
