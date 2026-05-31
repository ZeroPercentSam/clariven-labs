'use client';

import { motion } from 'framer-motion';
import {
  BookOpen,
  ArrowRight,
  FileText,
  Download,
  Clock,
  Tag,
  FlaskConical,
  Shield,
  TrendingUp,
  Brain,
  Microscope,
  Scale,
  ChevronRight,
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

const featuredArticles = [
  {
    title: 'Understanding GLP-1 Receptor Agonists: A Research Overview',
    excerpt: 'An evidence-based review of single-, dual-, and triple-pathway GLP-1 / GIP / glucagon receptor agonists in metabolic research.',
    category: 'Research Review',
    readTime: '8 min read',
    date: 'March 2026',
    icon: TrendingUp,
    featured: true,
  },
  {
    title: 'BPC-157 Research: Mechanisms of Action and Investigational Potential',
    excerpt: 'A comprehensive summary of current research on BPC-157 peptide, covering tissue repair, anti-inflammatory pathways, and in-vitro assay data.',
    category: 'Research Summary',
    readTime: '12 min read',
    date: 'February 2026',
    icon: Microscope,
    featured: true,
  },
  {
    title: 'Research-Use-Only Peptides: Sourcing, Documentation & Compliance',
    excerpt: 'A practical guide for laboratories on RUO sourcing frameworks, documentation requirements, and chain-of-custody best practices.',
    category: 'Compliance Guide',
    readTime: '10 min read',
    date: 'February 2026',
    icon: Scale,
    featured: true,
  },
];

const articles = [
  { title: 'Growth Hormone Peptides: CJC-1295, Ipamorelin, and Sermorelin Compared', category: 'Research Review', readTime: '7 min', icon: FlaskConical },
  { title: 'Peptide Stability: Best Practices for Storage and Handling', category: 'Technical Guide', readTime: '5 min', icon: Shield },
  { title: 'The Role of Thymosin Alpha-1 in Immune Modulation', category: 'Research Summary', readTime: '9 min', icon: Brain },
  { title: 'Understanding COAs: How to Read a Certificate of Analysis', category: 'Education', readTime: '6 min', icon: FileText },
  { title: 'Peptides in Regenerative Research: Current Applications', category: 'Research Review', readTime: '11 min', icon: Microscope },
  { title: 'Quality Assurance in Peptide Manufacturing: From Synthesis to COA', category: 'Technical Guide', readTime: '8 min', icon: Shield },
];

const guides = [
  { title: 'Peptide Handling Quick Reference', description: 'Reconstitution, storage & stability guidance for common research peptides.', type: 'PDF Guide' },
  { title: 'Research Lab Documentation Checklist', description: 'COA, purity & chain-of-custody tracking for research peptides.', type: 'Checklist' },
  { title: 'Peptide Storage & Handling Protocol', description: 'Temperature requirements, reconstitution procedures, and stability data for proper peptide management.', type: 'Protocol' },
  { title: 'Standing Up a Peptide Research Program', description: 'Sourcing and documentation considerations for adding research peptides to your lab.', type: 'White Paper' },
];

export default function ResourcesPage() {
  return (
    <div className="pt-[72px] bg-white">
      {/* ════════ HERO ════════ */}
      <section className="relative py-20 sm:py-24 bg-cl-navy overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cl-blue/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cl-teal/8 rounded-full blur-[100px]" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-cl-teal text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              Resources & Insights
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Knowledge Center for
              <br />
              <span className="bg-gradient-to-r from-cl-teal to-cl-blue-accent bg-clip-text text-transparent">
                Peptide Professionals
              </span>
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
              Research reviews, compliance guides, research summaries, and technical resources
              curated for researchers and laboratories working with peptides.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ════════ FEATURED ARTICLES ════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="mb-12">
            <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-2">Featured</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-cl-navy">Latest Insights</h2>
          </FadeIn>

          <div className="grid lg:grid-cols-3 gap-6">
            {featuredArticles.map((article, i) => (
              <FadeIn key={article.title} delay={i * 0.08}>
                <motion.div whileHover={{ y: -4 }} className="group h-full flex flex-col p-6 rounded-2xl border border-cl-gray-200 hover:border-cl-teal/30 hover:shadow-lg hover:shadow-cl-teal/5 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-cl-teal/10 flex items-center justify-center">
                      <article.icon className="w-5 h-5 text-cl-teal" />
                    </div>
                    <span className="text-xs font-medium text-cl-teal bg-cl-teal/10 px-2.5 py-1 rounded-full">
                      {article.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-cl-navy mb-3 group-hover:text-cl-teal transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-cl-gray-500 leading-relaxed mb-4 flex-1">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-cl-gray-100">
                    <div className="flex items-center gap-3 text-xs text-cl-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTime}
                      </span>
                      <span>{article.date}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-cl-gray-300 group-hover:text-cl-teal group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ ALL ARTICLES ════════ */}
      <section className="py-20 bg-cl-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-cl-navy">All Articles</h2>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((article, i) => (
              <FadeIn key={article.title} delay={i * 0.05}>
                <motion.div whileHover={{ y: -3 }} className="group p-5 rounded-xl bg-white border border-cl-gray-200 hover:border-cl-teal/30 hover:shadow-md transition-all duration-300 cursor-pointer">
                  <div className="flex items-center gap-2 mb-3">
                    <article.icon className="w-4 h-4 text-cl-teal" />
                    <span className="text-xs font-medium text-cl-gray-400">{article.category}</span>
                    <span className="text-xs text-cl-gray-300">·</span>
                    <span className="text-xs text-cl-gray-400">{article.readTime}</span>
                  </div>
                  <h3 className="text-base font-semibold text-cl-navy group-hover:text-cl-teal transition-colors">
                    {article.title}
                  </h3>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ DOWNLOADABLE GUIDES ════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-4">Downloads</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-cl-navy mb-4">
              Research & Compliance Guides
            </h2>
            <p className="text-cl-gray-500 max-w-xl mx-auto">
              Practical resources for your lab. Available to registered Clariven Labs clients.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {guides.map((guide, i) => (
              <FadeIn key={guide.title} delay={i * 0.06}>
                <div className="group flex items-start gap-4 p-6 rounded-2xl border border-cl-gray-200 hover:border-cl-teal/30 hover:shadow-md transition-all duration-300">
                  <div className="w-11 h-11 rounded-xl bg-cl-teal/10 flex items-center justify-center shrink-0">
                    <Download className="w-5 h-5 text-cl-teal" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-cl-teal">{guide.type}</span>
                    <h3 className="text-base font-semibold text-cl-navy mb-1 group-hover:text-cl-teal transition-colors">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-cl-gray-500">{guide.description}</p>
                  </div>
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
              Stay Informed
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto mb-8">
              Get the latest peptide research, compliance updates, and research insights
              delivered to your inbox. For qualified research professionals only.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your professional email"
                className="flex-1 px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cl-teal/40 focus:border-cl-teal transition"
              />
              <button className="px-6 py-3.5 rounded-xl bg-cl-teal text-white font-semibold hover:bg-cl-teal-light transition-colors shrink-0">
                Subscribe
              </button>
            </div>
            <p className="text-xs text-white/30 mt-3">No spam. Unsubscribe anytime. For qualified research professionals.</p>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
