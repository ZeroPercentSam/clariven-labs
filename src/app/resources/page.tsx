'use client';

import { motion } from 'framer-motion';
import { BookOpen, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';

/* ═══════════════════════════════ RESOURCES ═══════════════════════════════ */

export default function ResourcesPage() {
  return (
    <div className="pt-[72px] bg-white">
      {/* ════════════════════ HERO ════════════════════ */}
      <section className="relative py-24 sm:py-28 bg-cl-navy overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cl-teal/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cl-blue/10 rounded-full blur-[100px]" />

        <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-cl-teal text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              Resources
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">
              Resources Are{' '}
              <span className="bg-gradient-to-r from-cl-teal to-cl-blue-accent bg-clip-text text-transparent">
                On the Way
              </span>
            </h1>
            <p className="text-lg text-white/55 leading-relaxed">
              We&apos;re putting together practical guides on launching and running a compliant
              research-use-only program — positioning, labeling, documentation, and operations. They
              aren&apos;t published yet. In the meantime, the fastest way to get answers is to reach out.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════ CONTACT CTA ════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="p-10 rounded-2xl bg-cl-gray-50 border border-cl-gray-200"
          >
            <div className="w-12 h-12 rounded-xl bg-cl-teal/10 flex items-center justify-center mx-auto mb-5">
              <Mail className="w-6 h-6 text-cl-teal" />
            </div>
            <h2 className="text-2xl font-bold text-cl-navy mb-3">Have a question now?</h2>
            <p className="text-cl-gray-500 mb-8">
              Ask us directly and a Clariven specialist will help. We&apos;ll also let you know when the
              guides go live.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-cl-teal text-white font-semibold hover:bg-cl-teal-light transition-all"
              >
                Contact Us
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="mailto:support@clarivenlabs.com"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border-2 border-cl-gray-200 text-cl-navy font-semibold hover:border-cl-teal/40 transition-all"
              >
                support@clarivenlabs.com
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
