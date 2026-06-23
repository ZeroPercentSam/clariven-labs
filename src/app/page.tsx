'use client';

import { useActionState, useRef, useEffect, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  Shield,
  FlaskConical,
  Users,
  CheckCircle2,
  ArrowRight,
  Activity,
  MapPin,
  Building2,
  ShieldCheck,
  BadgeCheck,
} from 'lucide-react';
import Link from 'next/link';
import { submitLead } from '@/lib/leads/actions';

/* ─── Home consultation form ─── */
const FIELD_CLASS =
  'w-full px-4 py-3 rounded-xl border border-cl-gray-200 bg-cl-gray-50 text-cl-navy placeholder:text-cl-gray-400 focus:outline-none focus:ring-2 focus:ring-cl-teal/30 focus:border-cl-teal transition';

function ConsultationForm() {
  const [state, formAction, pending] = useActionState(submitLead, { ok: false });

  if (state.ok) {
    return (
      <div className="bg-white rounded-2xl border border-cl-gray-200 shadow-xl shadow-cl-navy/5 p-8 sm:p-10 text-center">
        <div className="w-14 h-14 rounded-full bg-cl-success/10 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-7 h-7 text-cl-success" />
        </div>
        <h3 className="text-xl font-semibold text-cl-navy mb-2">Thanks — we&apos;ll be in touch</h3>
        <p className="text-cl-gray-500 text-sm">
          A specialist will reach out within one business day.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-cl-gray-200 shadow-xl shadow-cl-navy/5 p-8 sm:p-10">
      <h3 className="text-xl font-semibold text-cl-navy mb-1">Schedule a Consultation</h3>
      <p className="text-cl-gray-400 text-sm mb-6">
        Tell us about your needs and a specialist will reach out within one business day.
      </p>
      <form action={formAction} className="space-y-4">
        {/* Honeypot — hidden from users; bots that fill it are dropped. */}
        <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        <div className="grid sm:grid-cols-2 gap-4">
          <input type="text" name="name" required placeholder="Full Name" className={FIELD_CLASS} />
          <input type="email" name="email" required placeholder="Work Email" className={FIELD_CLASS} />
        </div>
        <input type="text" name="organization" placeholder="Organization / Laboratory Name" className={FIELD_CLASS} />
        <input type="tel" name="phone" placeholder="Phone Number" className={FIELD_CLASS} />
        <select name="role" defaultValue="" className={FIELD_CLASS}>
          <option value="">I am a...</option>
          <option value="academic">University / Academic Lab</option>
          <option value="biotech">Biotech / CRO</option>
          <option value="research">Research Institution</option>
          <option value="other">Other</option>
        </select>
        {state.error ? (
          <p className="text-sm text-cl-error bg-cl-error/5 border border-cl-error/20 rounded-lg px-4 py-3">
            {state.error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full py-4 rounded-xl bg-cl-teal text-white font-semibold text-lg hover:bg-cl-teal-light transition-colors duration-300 shadow-lg shadow-cl-teal/20 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? 'Sending…' : 'Request Consultation'}
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
  );
}

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
              End-to-End RUO Brand &amp; Compliance Consulting
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.08] tracking-tight mb-6"
          >
            Launch Your Research Brand.
            <br />
            <span className="bg-gradient-to-r from-cl-teal to-cl-blue-accent bg-clip-text text-transparent">
              Compliant From Day One.
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Clariven Labs helps laboratories and research companies stand up a research-use-only
            product line — brand, compliance, web, and fulfillment — through one guided onboarding
            program, managed end to end by a dedicated team.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-14"
          >
            <Link
              href="/contact"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cl-teal text-white font-semibold text-lg hover:bg-cl-teal-light transition-all duration-300 shadow-lg shadow-cl-teal/20"
            >
              Request a Consultation
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/20 text-white font-semibold text-lg hover:border-white/40 hover:bg-white/5 transition-all duration-300"
            >
              Client Sign In
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="flex flex-wrap justify-center gap-3"
          >
            <TrustBadge icon={FlaskConical} label="Research Use Only" />
            <TrustBadge icon={ShieldCheck} label="Compliance-First" />
            <TrustBadge icon={MapPin} label="USA-Based" />
            <TrustBadge icon={BadgeCheck} label="Guided Onboarding" />
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
              { value: 9, suffix: '', label: 'Onboarding Phases', icon: Activity },
              { value: 21, suffix: '', label: 'Guided Steps', icon: CheckCircle2 },
              { value: 120, suffix: '+', label: 'Checkpoints', icon: FlaskConical },
              { value: 100, suffix: '%', label: 'Research Use Only', icon: Shield },
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
                What We Do
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-4">
                Everything It Takes to Launch a Research Brand
              </h2>
              <p className="text-cl-gray-500 max-w-2xl mx-auto text-lg">
                One partner from kickoff to launch — compliance, brand, web, and fulfillment,
                tracked through a single guided onboarding program.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            <ValueCard
              icon={ShieldCheck}
              title="Compliance, Handled"
              description="Research-use-only positioning, labeling, attestations, and documentation set up correctly from the start — so your brand launches clean and stays that way."
              delay={0}
            />
            <ValueCard
              icon={Building2}
              title="Brand, Web & Fulfillment"
              description="We stand up your brand identity, storefront, and third-party logistics, and coordinate the web, legal, and operations partners it takes to go live."
              delay={0.15}
            />
            <ValueCard
              icon={Users}
              title="A Guided Program"
              description="A single onboarding checklist — 9 phases and 21 guided steps — run by a named Clariven team, so you always know exactly what's next and who owns it."
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
                  Ready to Launch Your
                  <br />
                  Research Brand?
                </h2>
                <p className="text-cl-gray-500 text-lg mb-8 leading-relaxed">
                  Tell us about your research company and where you want to take it. A Clariven
                  specialist will walk you through the onboarding program and map out your path to
                  a compliant, research-use-only launch.
                </p>
                <div className="space-y-4">
                  {[
                    'A named Clariven team from kickoff through launch',
                    'One guided plan — 9 phases, 21 guided steps',
                    'Compliance, brand, web & fulfillment coordinated for you',
                    'Research-use-only, end to end',
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
              <ConsultationForm />
            </FadeIn>
          </div>
        </div>
      </section>

    </div>
  );
}
