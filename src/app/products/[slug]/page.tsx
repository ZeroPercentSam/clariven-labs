'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FlaskConical,
  Shield,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Thermometer,
  Beaker,
  FileCheck,
  ShieldCheck,
  BadgeCheck,
  Download,
  Package,
  Clock,
  Truck,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { products, productCategories } from '@/lib/products';
import { AddToCartControl } from '@/components/products/AddToCartControl';

/* ─── FadeIn ─── */
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

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return (
      <div className="pt-[72px] min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <FlaskConical className="w-16 h-16 text-cl-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-cl-navy mb-2">Product Not Found</h1>
          <p className="text-cl-gray-500 mb-6">The peptide you&apos;re looking for doesn&apos;t exist in our catalog.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-cl-teal font-medium hover:text-cl-teal-light transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const categoryLabel =
    productCategories.find((c) => c.id === product.category)?.name || product.category;

  // Get related products from same category
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="pt-[72px] bg-white">
      {/* ════════════════════ BREADCRUMB ════════════════════ */}
      <div className="bg-cl-gray-50 border-b border-cl-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <nav className="flex items-center gap-2 text-sm text-cl-gray-400">
            <Link href="/" className="hover:text-cl-teal transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/products" className="hover:text-cl-teal transition-colors">
              Products
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              href={`/products?category=${product.category}`}
              className="hover:text-cl-teal transition-colors"
            >
              {categoryLabel}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-cl-navy font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* ════════════════════ PRODUCT HEADER ════════════════════ */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Left: Product visual placeholder */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="aspect-square rounded-3xl bg-gradient-to-br from-cl-gray-50 to-cl-gray-100 border border-cl-gray-200 flex flex-col items-center justify-center p-10"
              >
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cl-teal/10 to-cl-blue/10 flex items-center justify-center mb-6">
                  <FlaskConical className="w-12 h-12 text-cl-teal" />
                </div>
                <p className="text-2xl font-bold text-cl-navy text-center mb-2">{product.name}</p>
                <span className="text-cl-teal font-semibold text-sm">{product.purity} Purity</span>

                {/* Trust badges */}
                <div className="flex gap-3 mt-6">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-cl-gray-200 text-xs text-cl-gray-500">
                    <ShieldCheck className="w-3 h-3 text-cl-teal" />
                    cGMP
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-cl-gray-200 text-xs text-cl-gray-500">
                    <BadgeCheck className="w-3 h-3 text-cl-teal" />
                    COA
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-cl-gray-200 text-xs text-cl-gray-500">
                    <FileCheck className="w-3 h-3 text-cl-teal" />
                    HPLC
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: Product details */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {/* Category badge */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-medium text-cl-teal bg-cl-teal/10 px-3 py-1 rounded-full">
                    {categoryLabel}
                  </span>
                  {product.purity && (
                    <span className="text-sm text-cl-gray-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-cl-success" />
                      {product.purity} Verified Purity
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-4">
                  {product.name}
                </h1>

                <p className="text-cl-gray-500 text-lg leading-relaxed mb-8">
                  {product.description}
                </p>

                {/* Strength picker + add-to-cart (prices live in Supabase product_prices) */}
                <div className="mb-8">
                  <AddToCartControl
                    productSlug={product.slug}
                    productName={product.name}
                    strengths={product.strengths}
                  />
                </div>

                {/* Key benefits */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-cl-gray-400 uppercase tracking-wider mb-3">
                    Research Applications
                  </h3>
                  <div className="space-y-2">
                    {product.benefits.map((benefit) => (
                      <div key={benefit} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-cl-teal shrink-0" />
                        <span className="text-cl-gray-600">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Secondary CTA — COA download stays as a placeholder (Phase > v1) */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-cl-gray-200 text-cl-navy font-semibold hover:border-cl-teal/30 hover:bg-cl-gray-50 transition-all duration-300">
                    <Download className="w-5 h-5" />
                    Download COA
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════ SPECS ════════════════════ */}
      <section className="py-16 bg-cl-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <h2 className="text-2xl font-bold text-cl-navy mb-8">Product Specifications</h2>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: FlaskConical, label: 'Purity', value: product.purity || '≥98%' },
              { icon: Beaker, label: 'Form', value: product.form || 'Lyophilized Powder' },
              { icon: Thermometer, label: 'Storage', value: product.storage || '2-8°C' },
              { icon: FileCheck, label: 'Testing', value: 'HPLC + Mass Spec' },
            ].map((spec, i) => (
              <FadeIn key={spec.label} delay={i * 0.08}>
                <div className="p-5 rounded-xl bg-white border border-cl-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <spec.icon className="w-5 h-5 text-cl-teal" />
                    <span className="text-sm text-cl-gray-400 font-medium">{spec.label}</span>
                  </div>
                  <p className="text-cl-navy font-semibold">{spec.value}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Quality assurance */}
          <FadeIn delay={0.3}>
            <div className="mt-10 p-8 rounded-2xl bg-white border border-cl-gray-200">
              <h3 className="text-lg font-semibold text-cl-navy mb-4">Quality Assurance</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  'Batch-specific Certificate of Analysis (COA)',
                  'HPLC purity verification on every batch',
                  'Mass spectrometry identity confirmation',
                  'Endotoxin testing (LAL method)',
                  'Full chain-of-custody documentation',
                  'cGMP compliant manufacturing',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cl-teal mt-0.5 shrink-0" />
                    <span className="text-sm text-cl-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Shipping info */}
          <FadeIn delay={0.4}>
            <div className="mt-6 grid sm:grid-cols-3 gap-4">
              {[
                {
                  icon: Truck,
                  title: '48-Hour Priority Shipping',
                  desc: 'Temperature-controlled packaging to all 50 states.',
                },
                {
                  icon: Package,
                  title: 'Secure Packaging',
                  desc: 'Validated cold chain logistics with tamper-evident seals.',
                },
                {
                  icon: Clock,
                  title: 'Same-Day Processing',
                  desc: 'Orders placed by 2 PM EST ship same business day.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex gap-3 p-5 rounded-xl bg-white border border-cl-gray-200"
                >
                  <item.icon className="w-5 h-5 text-cl-teal shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-cl-navy text-sm mb-1">{item.title}</h4>
                    <p className="text-cl-gray-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════════ RELATED PRODUCTS ════════════════════ */}
      {related.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <FadeIn>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-cl-navy">Related Peptides</h2>
                <Link
                  href={`/products?category=${product.category}`}
                  className="text-cl-teal font-medium text-sm hover:text-cl-teal-light transition-colors flex items-center gap-1"
                >
                  View all {categoryLabel}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </FadeIn>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((rel, i) => (
                <FadeIn key={rel.id} delay={i * 0.1}>
                  <Link href={`/products/${rel.slug}`}>
                    <motion.div
                      whileHover={{ y: -6 }}
                      className="group p-6 rounded-2xl bg-white border border-cl-gray-200 hover:border-cl-teal/30 hover:shadow-lg hover:shadow-cl-teal/5 transition-all duration-300"
                    >
                      <span className="text-xs font-medium text-cl-teal bg-cl-teal/10 px-2.5 py-1 rounded-full">
                        {categoryLabel}
                      </span>
                      <h3 className="text-lg font-semibold text-cl-navy mt-3 mb-2 group-hover:text-cl-teal transition-colors">
                        {rel.name}
                      </h3>
                      <p className="text-cl-gray-500 text-sm line-clamp-2 mb-3">
                        {rel.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {rel.strengths.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="text-xs px-2 py-0.5 rounded bg-cl-gray-100 text-cl-gray-500"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════ BOTTOM CTA ════════════════════ */}
      <section className="py-16 bg-cl-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-2xl sm:text-3xl font-bold text-cl-navy mb-4">
              Ready to Order {product.name}?
            </h2>
            <p className="text-cl-gray-500 max-w-lg mx-auto mb-8">
              Contact our team for pricing, volume discounts, and custom formulation options.
              All orders include batch-specific COAs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cl-teal text-white font-semibold hover:bg-cl-teal-light transition-all"
              >
                Request a Quote
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-cl-gray-200 text-cl-navy font-semibold hover:border-cl-teal/30 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Catalog
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
