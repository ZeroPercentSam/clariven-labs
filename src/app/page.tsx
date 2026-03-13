'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  Shield,
  FlaskConical,
  Users,
  Truck,
  CheckCircle2,
  ArrowRight,
  Star,
  Activity,
  Brain,
  Heart,
  Sparkles,
  Syringe,
  Microscope,
  Dna,
  Zap,
  MapPin,
  ChevronRight,
  Award,
  Building2,
  Clock,
  TrendingUp,
  Beaker,
  ShieldCheck,
  BadgeCheck,
  Leaf,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

/* ─── Animated Counter ─── */
function AnimatedCounter({
  target,
  suffix = '',
  prefix = '',
  duration = 2,
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const increment = target / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ─── Fade-in wrapper ─── */
function FadeIn({
  children,
  delay = 0,
  direction = 'up',
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}) {
  const dirMap = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
  };
  return (
    <motion.div
      initial={{ opacity: 0, ...dirMap[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Molecular Network Background ─── */
function MolecularNetwork() {
  const nodes = [
    { cx: 120, cy: 80, r: 3 },
    { cx: 300, cy: 140, r: 2.5 },
    { cx: 480, cy: 60, r: 3.5 },
    { cx: 650, cy: 180, r: 2 },
    { cx: 820, cy: 90, r: 3 },
    { cx: 200, cy: 280, r: 2 },
    { cx: 400, cy: 320, r: 3 },
    { cx: 580, cy: 250, r: 2.5 },
    { cx: 750, cy: 340, r: 3.5 },
    { cx: 950, cy: 200, r: 2 },
    { cx: 1100, cy: 120, r: 3 },
    { cx: 1050, cy: 300, r: 2.5 },
    { cx: 160, cy: 420, r: 2 },
    { cx: 350, cy: 480, r: 3 },
    { cx: 550, cy: 440, r: 2.5 },
    { cx: 700, cy: 500, r: 2 },
    { cx: 880, cy: 460, r: 3 },
    { cx: 1000, cy: 420, r: 2 },
    { cx: 80, cy: 560, r: 3.5 },
    { cx: 260, cy: 600, r: 2 },
    { cx: 450, cy: 580, r: 3 },
    { cx: 620, cy: 620, r: 2.5 },
    { cx: 830, cy: 580, r: 2 },
    { cx: 1020, cy: 560, r: 3 },
    { cx: 1150, cy: 480, r: 2 },
  ];

  const connections = [
    [0, 1], [1, 2], [2, 4], [3, 4], [1, 5], [1, 6], [6, 7],
    [7, 8], [4, 9], [9, 10], [10, 11], [8, 11], [5, 12],
    [6, 13], [13, 14], [14, 15], [15, 16], [16, 17], [8, 16],
    [12, 18], [18, 19], [19, 20], [20, 21], [21, 22], [22, 23],
    [23, 24], [17, 24], [3, 7], [5, 6], [13, 19], [7, 14],
    [11, 17], [9, 11], [2, 3], [14, 20], [16, 22], [15, 21],
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0D9488" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0D9488" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connection lines */}
        {connections.map(([a, b], i) => (
          <motion.line
            key={`line-${i}`}
            x1={nodes[a].cx}
            y1={nodes[a].cy}
            x2={nodes[b].cx}
            y2={nodes[b].cy}
            stroke="rgba(13,148,136,0.12)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.3 + i * 0.04, ease: 'easeOut' }}
          />
        ))}

        {/* Animated pulse traveling along select connections */}
        {[
          [0, 1, 6, 7, 8, 16, 22, 23],
          [10, 11, 17, 24],
          [18, 19, 20, 21],
        ].map((path, pi) => {
          const points = path.map((idx) => `${nodes[idx].cx},${nodes[idx].cy}`).join(' ');
          return (
            <motion.polyline
              key={`pulse-${pi}`}
              points={points}
              fill="none"
              stroke="url(#pulseGrad)"
              strokeWidth="1.5"
              strokeDasharray="20 180"
              initial={{ strokeDashoffset: 200 }}
              animate={{ strokeDashoffset: -200 }}
              transition={{ duration: 6 + pi, repeat: Infinity, ease: 'linear', delay: pi * 2 }}
              opacity={0.4}
            />
          );
        })}

        <defs>
          <linearGradient id="pulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0D9488" stopOpacity="0" />
            <stop offset="50%" stopColor="#0D9488" stopOpacity="1" />
            <stop offset="100%" stopColor="#1E40AF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Nodes */}
        {nodes.map((node, i) => (
          <motion.g key={`node-${i}`}>
            {/* Glow */}
            <motion.circle
              cx={node.cx}
              cy={node.cy}
              r={node.r * 6}
              fill="url(#nodeGlow)"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.15, 0.3, 0.15] }}
              transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.15 }}
            />
            {/* Core node */}
            <motion.circle
              cx={node.cx}
              cy={node.cy}
              r={node.r}
              fill="#0D9488"
              filter="url(#glow)"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0.5, 0.9, 0.5], scale: 1 }}
              transition={{
                opacity: { duration: 2 + (i % 4), repeat: Infinity, delay: i * 0.1 },
                scale: { duration: 0.5, delay: 0.5 + i * 0.06 },
              }}
            />
          </motion.g>
        ))}

        {/* Hexagonal ring accents */}
        {[
          { cx: 150, cy: 150, size: 40 },
          { cx: 900, cy: 400, size: 55 },
          { cx: 1080, cy: 150, size: 35 },
        ].map((hex, i) => {
          const s = hex.size;
          const points = Array.from({ length: 6 }, (_, k) => {
            const angle = (Math.PI / 3) * k - Math.PI / 6;
            return `${hex.cx + s * Math.cos(angle)},${hex.cy + s * Math.sin(angle)}`;
          }).join(' ');
          return (
            <motion.polygon
              key={`hex-${i}`}
              points={points}
              fill="none"
              stroke="rgba(13,148,136,0.08)"
              strokeWidth="1"
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: 30 }}
              transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse', delay: i * 3 }}
              style={{ transformOrigin: `${hex.cx}px ${hex.cy}px` }}
            />
          );
        })}
      </svg>
    </div>
  );
}

/* ─── Trust Badge ─── */
function TrustBadge({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.05 }}
      className="flex items-center gap-2.5 px-5 py-3 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-sm"
    >
      <Icon className="w-4.5 h-4.5 text-cl-teal" />
      <span className="text-sm font-medium text-white/80 tracking-wide">{label}</span>
    </motion.div>
  );
}

/* ─── Product Category Card ─── */
const categoryIcons: Record<string, React.ElementType> = {
  'Weight Management': TrendingUp,
  'Growth Hormone Peptides': Activity,
  'Healing & Recovery': Heart,
  'Anti-Aging & Longevity': Sparkles,
  'Cognitive & Neuroprotection': Brain,
  'Immune Support': ShieldCheck,
  'Bioregulators': Dna,
  'Premium Blends': Beaker,
};

const categoryData = [
  { name: 'Weight Management', desc: 'Semaglutide, Retatrutide, Liraglutide & more', count: 7, slug: 'weight-management' },
  { name: 'Growth Hormone Peptides', desc: 'CJC-1295, Ipamorelin, Sermorelin & more', count: 12, slug: 'growth-hormone' },
  { name: 'Healing & Recovery', desc: 'BPC-157, TB-500, LL-37, KPV & more', count: 8, slug: 'healing-recovery' },
  { name: 'Anti-Aging & Longevity', desc: 'Epitalon, GHK-Cu, MOTS-C & more', count: 6, slug: 'anti-aging' },
  { name: 'Cognitive & Neuroprotection', desc: 'Selank, Semax, PE-22-28 & more', count: 4, slug: 'cognitive' },
  { name: 'Immune Support', desc: 'Thymosin Alpha 1, Thymalin & more', count: 2, slug: 'immune' },
  { name: 'Bioregulators', desc: 'Pinealon, Cortagen, Vesugen & more', count: 9, slug: 'bioregulators' },
  { name: 'Premium Blends', desc: 'BPC/TB-500, CagriSema, Glow & more', count: 8, slug: 'blends' },
];

/* ─── Value Prop Card ─── */
function ValueCard({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <FadeIn delay={delay}>
      <motion.div
        whileHover={{ y: -8, boxShadow: '0 0 40px rgba(13,148,136,0.15)' }}
        transition={{ duration: 0.3 }}
        className="relative group p-8 rounded-2xl bg-white border border-cl-gray-200 hover:border-cl-teal/30 transition-colors duration-300"
      >
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cl-teal/10 to-cl-blue/10 flex items-center justify-center mb-6 group-hover:from-cl-teal/20 group-hover:to-cl-blue/20 transition-all duration-300">
          <Icon className="w-7 h-7 text-cl-teal" />
        </div>
        <h3 className="text-xl font-semibold text-cl-navy mb-3">{title}</h3>
        <p className="text-cl-gray-500 leading-relaxed">{description}</p>
      </motion.div>
    </FadeIn>
  );
}

/* ─── Testimonial Card ─── */
function TestimonialCard({
  quote,
  name,
  role,
  delay,
}: {
  quote: string;
  name: string;
  role: string;
  delay: number;
}) {
  return (
    <FadeIn delay={delay}>
      <div className="p-8 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-cl-gold text-cl-gold" />
          ))}
        </div>
        <p className="text-white/80 leading-relaxed mb-6 italic">&ldquo;{quote}&rdquo;</p>
        <div>
          <p className="text-white font-semibold">{name}</p>
          <p className="text-white/50 text-sm">{role}</p>
        </div>
      </div>
    </FadeIn>
  );
}

/* ═══════════════════════════════ HOMEPAGE ═══════════════════════════════ */

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <div className="pt-[72px] bg-white">
      {/* ════════════════════ HERO ════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-[92vh] bg-cl-navy flex items-center justify-center overflow-hidden"
      >
        {/* Molecular network background */}
        <MolecularNetwork />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 max-w-5xl mx-auto px-6 text-center"
        >
          {/* Overline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cl-teal/30 bg-cl-teal/5 mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-cl-teal animate-pulse" />
            <span className="text-cl-teal text-sm font-medium tracking-wide">
              Now Serving 500+ Healthcare Providers Nationwide
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.08] tracking-tight mb-6"
          >
            Pharmaceutical-Grade Peptides.
            <br />
            <span className="bg-gradient-to-r from-cl-teal to-cl-blue-accent bg-clip-text text-transparent">
              Uncompromising Purity.
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Serving clinics, compounding pharmacies, and research institutions with
            ≥98% purity peptides. cGMP manufactured, batch-specific COAs, third-party verified.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-14"
          >
            <Link
              href="/products"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cl-teal text-white font-semibold text-lg hover:bg-cl-teal-light transition-all duration-300 shadow-lg shadow-cl-teal/20"
            >
              Explore Our Catalog
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/20 text-white font-semibold text-lg hover:border-white/40 hover:bg-white/5 transition-all duration-300"
            >
              Request a Quote
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="flex flex-wrap justify-center gap-3"
          >
            <TrustBadge icon={FlaskConical} label="≥98% Purity" />
            <TrustBadge icon={ShieldCheck} label="cGMP Certified" />
            <TrustBadge icon={MapPin} label="USA Made" />
            <TrustBadge icon={BadgeCheck} label="COA Verified" />
          </motion.div>
        </motion.div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ════════════════════ TRUST BAR ════════════════════ */}
      <section className="relative py-16 bg-white border-b border-cl-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { value: 500, suffix: '+', label: 'Healthcare Providers', icon: Building2 },
              { value: 100, suffix: '+', label: 'Peptide Formulations', icon: FlaskConical },
              { value: 48, label: 'Hour Priority Shipping', icon: Truck, suffix: '-Hr' },
              { value: 100, suffix: '%', label: 'Third-Party Tested', icon: Shield },
            ].map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.1}>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-cl-teal/10 flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-6 h-6 text-cl-teal" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-cl-navy mb-1">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-cl-gray-500 text-sm font-medium">{stat.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ VALUE PROPOSITIONS ════════════════════ */}
      <section className="py-24 bg-cl-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-3">
                Why Clariven Labs
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-4">
                Why Leading Providers Choose Us
              </h2>
              <p className="text-cl-gray-500 max-w-2xl mx-auto text-lg">
                From regulatory compliance to dedicated support, we set the standard
                for pharmaceutical-grade peptide supply.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            <ValueCard
              icon={FlaskConical}
              title="Pharmaceutical-Grade Purity"
              description="Every batch undergoes rigorous HPLC and mass spectrometry analysis. ≥98% purity guaranteed with batch-specific Certificates of Analysis available for every product."
              delay={0}
            />
            <ValueCard
              icon={Shield}
              title="Compliance-First Infrastructure"
              description="Manufactured within our 503A/503B licensed facility network. Full regulatory documentation, FDA-compliant labeling, and complete chain-of-custody traceability."
              delay={0.15}
            />
            <ValueCard
              icon={Users}
              title="Dedicated Account Management"
              description="Named account specialist for every client. Priority fulfillment, custom formulation support, flexible ordering, and proactive inventory management."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* ════════════════════ PRODUCT CATEGORIES ════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-3">
                Our Portfolio
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-4">
                Comprehensive Peptide Catalog
              </h2>
              <p className="text-cl-gray-500 max-w-2xl mx-auto text-lg">
                Over 50 pharmaceutical-grade peptides across 8 therapeutic categories,
                available in multiple strengths and formulations.
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categoryData.map((cat, i) => {
              const Icon = categoryIcons[cat.name] || Dna;
              return (
                <FadeIn key={cat.slug} delay={i * 0.08}>
                  <Link href={`/products?category=${cat.slug}`}>
                    <motion.div
                      whileHover={{ y: -6 }}
                      className="group relative p-6 rounded-2xl bg-white border border-cl-gray-200 hover:border-cl-teal/40 transition-all duration-300 cursor-pointer overflow-hidden"
                    >
                      {/* Hover gradient border effect */}
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-cl-teal/5 to-cl-blue/5" />

                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cl-navy/5 to-cl-teal/10 flex items-center justify-center mb-4 group-hover:from-cl-teal/10 group-hover:to-cl-blue/10 transition-all duration-300">
                          <Icon className="w-6 h-6 text-cl-teal" />
                        </div>
                        <h3 className="text-lg font-semibold text-cl-navy mb-1 group-hover:text-cl-teal transition-colors">
                          {cat.name}
                        </h3>
                        <p className="text-cl-gray-400 text-sm mb-3">{cat.desc}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-cl-gray-400 bg-cl-gray-100 px-2.5 py-1 rounded-full">
                            {cat.count} peptides
                          </span>
                          <ChevronRight className="w-4 h-4 text-cl-gray-300 group-hover:text-cl-teal group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </FadeIn>
              );
            })}
          </div>

          <FadeIn delay={0.4}>
            <div className="text-center mt-12">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-cl-teal font-semibold hover:text-cl-teal-light transition-colors group"
              >
                View Full Catalog
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════════ SOCIAL PROOF ════════════════════ */}
      <section className="py-24 bg-cl-navy relative overflow-hidden">
        {/* Bg effects */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cl-teal/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cl-blue/10 rounded-full blur-[120px]" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-3">
                Trusted by Professionals
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Built for the Standard of Care
              </h2>
              <p className="text-white/50 max-w-2xl mx-auto text-lg">
                Healthcare providers and researchers nationwide trust Clariven Labs
                for their most critical peptide needs.
              </p>
            </div>
          </FadeIn>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { value: 2, suffix: 'M+', label: 'Vials Shipped' },
              { value: 99.7, suffix: '%', label: 'Order Accuracy' },
              { value: 24, suffix: 'hr', label: 'Avg Response Time' },
              { value: 0.1, suffix: '%', label: 'Return Rate', prefix: '<' },
            ].map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.1}>
                <div className="text-center p-6 rounded-2xl border border-white/10 bg-white/[0.03]">
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                    {stat.prefix || ''}
                    {typeof stat.value === 'number' && stat.value >= 1 ? (
                      <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                    ) : (
                      <>
                        {stat.value}
                        {stat.suffix}
                      </>
                    )}
                  </div>
                  <p className="text-white/40 text-sm font-medium">{stat.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard
              quote="Switching to Clariven Labs transformed our peptide program. The purity consistency is unmatched, and their account team responds faster than any supplier we've worked with."
              name="Dr. Rebecca Chen"
              role="Medical Director, Vitality Integrative Medicine"
              delay={0}
            />
            <TestimonialCard
              quote="As a 503A compounding pharmacy, we can't afford supply chain disruptions. Clariven's 48-hour fulfillment and batch-specific COAs have made them our primary peptide source."
              name="James Hartwell, RPh"
              role="Director of Operations, Summit Compounding"
              delay={0.15}
            />
            <TestimonialCard
              quote="The breadth of their catalog and the quality of documentation sets Clariven apart. Every peptide arrives with full analytical data — exactly what our research protocols require."
              name="Dr. Michael Sorensen"
              role="Principal Investigator, Pacific Biomedical Research"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* ════════════════════ CTA SECTION ════════════════════ */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-cl-gray-50 to-white">
        {/* Decorative bg */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cl-teal/5 rounded-full blur-[100px]" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left copy */}
            <FadeIn>
              <div>
                <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-3">
                  Get Started
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-6 leading-tight">
                  Ready to Elevate Your
                  <br />
                  Peptide Supply Chain?
                </h2>
                <p className="text-cl-gray-500 text-lg mb-8 leading-relaxed">
                  Join 500+ clinics, pharmacies, and research institutions that trust
                  Clariven Labs for pharmaceutical-grade peptides. Speak with a specialist
                  today and discover why providers are making the switch.
                </p>
                <div className="space-y-4">
                  {[
                    'Dedicated account specialist assigned within 24 hours',
                    'Custom pricing for volume and recurring orders',
                    'Free sample program for qualified institutions',
                    'Full regulatory documentation package included',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-cl-teal mt-0.5 shrink-0" />
                      <span className="text-cl-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Right form */}
            <FadeIn delay={0.2}>
              <div className="bg-white rounded-2xl border border-cl-gray-200 shadow-xl shadow-cl-navy/5 p-8 sm:p-10">
                <h3 className="text-xl font-semibold text-cl-navy mb-1">
                  Schedule a Consultation
                </h3>
                <p className="text-cl-gray-400 text-sm mb-6">
                  Tell us about your needs and a specialist will reach out within one business day.
                </p>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      className="w-full px-4 py-3 rounded-xl border border-cl-gray-200 bg-cl-gray-50 text-cl-navy placeholder:text-cl-gray-400 focus:outline-none focus:ring-2 focus:ring-cl-teal/30 focus:border-cl-teal transition"
                    />
                    <input
                      type="email"
                      placeholder="Work Email"
                      className="w-full px-4 py-3 rounded-xl border border-cl-gray-200 bg-cl-gray-50 text-cl-navy placeholder:text-cl-gray-400 focus:outline-none focus:ring-2 focus:ring-cl-teal/30 focus:border-cl-teal transition"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Organization / Practice Name"
                    className="w-full px-4 py-3 rounded-xl border border-cl-gray-200 bg-cl-gray-50 text-cl-navy placeholder:text-cl-gray-400 focus:outline-none focus:ring-2 focus:ring-cl-teal/30 focus:border-cl-teal transition"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full px-4 py-3 rounded-xl border border-cl-gray-200 bg-cl-gray-50 text-cl-navy placeholder:text-cl-gray-400 focus:outline-none focus:ring-2 focus:ring-cl-teal/30 focus:border-cl-teal transition"
                  />
                  <select className="w-full px-4 py-3 rounded-xl border border-cl-gray-200 bg-cl-gray-50 text-cl-gray-400 focus:outline-none focus:ring-2 focus:ring-cl-teal/30 focus:border-cl-teal transition">
                    <option value="">I am a...</option>
                    <option value="clinic">Clinic / Medical Practice</option>
                    <option value="pharmacy">Compounding Pharmacy</option>
                    <option value="research">Research Institution</option>
                    <option value="other">Other</option>
                  </select>
                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-cl-teal text-white font-semibold text-lg hover:bg-cl-teal-light transition-colors duration-300 shadow-lg shadow-cl-teal/20"
                  >
                    Request Consultation
                  </button>
                  <p className="text-xs text-cl-gray-400 text-center">
                    By submitting, you agree to our{' '}
                    <Link href="/privacy" className="underline hover:text-cl-teal">
                      Privacy Policy
                    </Link>
                    . No spam, ever.
                  </p>
                </form>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

    </div>
  );
}
