'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  FlaskConical,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Shield,
  ShieldCheck,
  BadgeCheck,
  TrendingUp,
  Activity,
  Heart,
  Sparkles,
  Brain,
  Dna,
  Beaker,
  Syringe,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { products, productCategories, type Product } from '@/lib/products';

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

const categoryIcons: Record<string, React.ElementType> = {
  'all': FlaskConical,
  'weight-management': TrendingUp,
  'growth-hormone': Activity,
  'healing-recovery': Heart,
  'anti-aging': Sparkles,
  'cognitive': Brain,
  'immune': ShieldCheck,
  'sexual-health': Syringe,
  'skin-hair': Sparkles,
  'bioregulators': Dna,
  'blends': Beaker,
};

/* ─── Product Card ─── */
function ProductCard({ product, index }: { product: Product; index: number }) {
  const categoryLabel =
    productCategories.find((c) => c.id === product.category)?.name || product.category;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
    >
      <Link href={`/products/${product.slug}`}>
        <motion.div
          whileHover={{ y: -6 }}
          className="group h-full p-6 rounded-2xl bg-white border border-cl-gray-200 hover:border-cl-teal/30 hover:shadow-lg hover:shadow-cl-teal/5 transition-all duration-300 cursor-pointer"
        >
          {/* Category badge */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-cl-teal bg-cl-teal/10 px-2.5 py-1 rounded-full">
              {categoryLabel}
            </span>
            {product.purity && (
              <span className="text-xs font-medium text-cl-gray-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {product.purity}
              </span>
            )}
          </div>

          {/* Name */}
          <h3 className="text-lg font-semibold text-cl-navy mb-2 group-hover:text-cl-teal transition-colors">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-cl-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
            {product.description}
          </p>

          {/* Strengths */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.strengths.slice(0, 4).map((str) => (
              <span
                key={str}
                className="text-xs px-2 py-0.5 rounded bg-cl-gray-100 text-cl-gray-500"
              >
                {str}
              </span>
            ))}
            {product.strengths.length > 4 && (
              <span className="text-xs px-2 py-0.5 rounded bg-cl-gray-100 text-cl-gray-400">
                +{product.strengths.length - 4} more
              </span>
            )}
          </div>

          {/* Benefits */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.benefits.slice(0, 2).map((b) => (
              <span key={b} className="text-xs text-cl-gray-400">
                {b}
              </span>
            ))}
          </div>

          {/* Bottom */}
          <div className="flex items-center justify-between pt-3 border-t border-cl-gray-100">
            <span className="text-xs text-cl-gray-400">{product.form}</span>
            <ChevronRight className="w-4 h-4 text-cl-gray-300 group-hover:text-cl-teal group-hover:translate-x-1 transition-all" />
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

/* ═══════════════════════════════ PRODUCTS PAGE ═══════════════════════════════ */

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    let result = products;
    if (activeCategory !== 'all') {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.benefits.some((b) => b.toLowerCase().includes(q))
      );
    }
    return result;
  }, [activeCategory, searchQuery]);

  const activeCategoryName =
    productCategories.find((c) => c.id === activeCategory)?.name || 'All Peptides';

  return (
    <div className="pt-[72px] bg-white">
      {/* ════════════════════ HERO ════════════════════ */}
      <section className="relative py-20 sm:py-24 bg-cl-navy overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cl-blue/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cl-teal/10 rounded-full blur-[120px]" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-4">
              Product Catalog
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Pharmaceutical-Grade
              <br />
              <span className="bg-gradient-to-r from-cl-teal to-cl-blue-accent bg-clip-text text-transparent">
                Peptide Portfolio
              </span>
            </h1>
            <p className="text-lg text-white/55 max-w-2xl mx-auto leading-relaxed mb-8">
              Browse our comprehensive catalog of 50+ peptides across therapeutic categories.
              Every product meets ≥98% purity with batch-specific COAs.
            </p>

            {/* Trust signals */}
            <div className="flex flex-wrap justify-center gap-6 text-white/40 text-sm">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cl-teal" />
                cGMP Manufactured
              </span>
              <span className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-cl-teal" />
                COA Verified
              </span>
              <span className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-cl-teal" />
                HPLC Tested
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════ CATALOG ════════════════════ */}
      <section className="py-16 bg-cl-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          {/* Search + Filter bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cl-gray-400" />
              <input
                type="text"
                placeholder="Search peptides by name or benefit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3 rounded-xl border border-cl-gray-200 bg-white text-cl-navy placeholder:text-cl-gray-400 focus:outline-none focus:ring-2 focus:ring-cl-teal/30 focus:border-cl-teal transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-cl-gray-100 transition"
                >
                  <X className="w-4 h-4 text-cl-gray-400" />
                </button>
              )}
            </div>

            {/* Results count */}
            <div className="flex items-center text-cl-gray-500 text-sm">
              <FlaskConical className="w-4 h-4 mr-2 text-cl-teal" />
              <span>
                Showing <strong className="text-cl-navy">{filteredProducts.length}</strong>{' '}
                {filteredProducts.length === 1 ? 'peptide' : 'peptides'}
                {activeCategory !== 'all' && (
                  <>
                    {' '}
                    in{' '}
                    <strong className="text-cl-navy">{activeCategoryName}</strong>
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar categories */}
            <div className="lg:w-64 shrink-0">
              <div className="sticky top-[88px]">
                <h3 className="text-sm font-semibold text-cl-gray-400 uppercase tracking-wider mb-3">
                  Categories
                </h3>
                <div className="space-y-1">
                  {productCategories.map((cat) => {
                    const Icon = categoryIcons[cat.id] || FlaskConical;
                    const isActive = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left',
                          isActive
                            ? 'bg-cl-teal/10 text-cl-teal border border-cl-teal/20'
                            : 'text-cl-gray-500 hover:bg-cl-gray-100 hover:text-cl-navy border border-transparent'
                        )}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="flex-1">{cat.name}</span>
                        <span
                          className={cn(
                            'text-xs tabular-nums',
                            isActive ? 'text-cl-teal' : 'text-cl-gray-400'
                          )}
                        >
                          {cat.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* CTA sidebar card */}
                <div className="mt-8 p-5 rounded-2xl bg-gradient-to-br from-cl-navy to-cl-navy-light">
                  <h4 className="text-white font-semibold text-sm mb-2">
                    Need a custom formulation?
                  </h4>
                  <p className="text-white/50 text-xs leading-relaxed mb-4">
                    Our team can develop custom peptide blends tailored to your practice needs.
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1.5 text-cl-teal text-sm font-medium hover:text-cl-teal-light transition-colors"
                  >
                    Contact Us
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Product grid */}
            <div className="flex-1">
              <AnimatePresence mode="popLayout">
                {filteredProducts.length > 0 ? (
                  <motion.div
                    layout
                    className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5"
                  >
                    {filteredProducts.map((product, i) => (
                      <ProductCard key={product.id} product={product} index={i} />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                  >
                    <FlaskConical className="w-12 h-12 text-cl-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-cl-navy mb-2">
                      No peptides found
                    </h3>
                    <p className="text-cl-gray-400 mb-6">
                      Try adjusting your search or browse a different category.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setActiveCategory('all');
                      }}
                      className="text-cl-teal font-medium hover:text-cl-teal-light transition-colors"
                    >
                      Clear all filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════ BOTTOM CTA ════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-4">
              Don&apos;t See What You Need?
            </h2>
            <p className="text-cl-gray-500 text-lg max-w-xl mx-auto mb-8">
              We continuously expand our catalog. Contact us for custom formulations,
              specific strengths, or volume pricing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cl-teal text-white font-semibold hover:bg-cl-teal-light transition-all duration-300"
              >
                Request a Custom Peptide
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/quality"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-cl-gray-200 text-cl-navy font-semibold hover:border-cl-teal/30 hover:bg-cl-gray-50 transition-all duration-300"
              >
                View Quality Standards
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
