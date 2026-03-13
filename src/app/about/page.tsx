'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Shield,
  FlaskConical,
  Users,
  Award,
  Target,
  Eye,
  Lightbulb,
  Building2,
  Globe,
  CheckCircle2,
  ArrowRight,
  Microscope,
  HeartPulse,
  TrendingUp,
  Handshake,
  GraduationCap,
  Dna,
  Clock,
  MapPin,
  Beaker,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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

/* ─── Timeline Item ─── */
function TimelineItem({
  year,
  title,
  description,
  delay,
}: {
  year: string;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <FadeIn delay={delay}>
      <div className="relative pl-10 pb-12 last:pb-0">
        {/* Line */}
        <div className="absolute left-[11px] top-2 bottom-0 w-px bg-cl-gray-200" />
        {/* Dot */}
        <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-cl-teal flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-cl-teal" />
        </div>
        <div className="text-cl-teal font-semibold text-sm mb-1">{year}</div>
        <h4 className="text-lg font-semibold text-cl-navy mb-2">{title}</h4>
        <p className="text-cl-gray-500 leading-relaxed">{description}</p>
      </div>
    </FadeIn>
  );
}

/* ─── Team Member ─── */
function TeamMember({
  name,
  role,
  bio,
  initials,
  delay,
}: {
  name: string;
  role: string;
  bio: string;
  initials: string;
  delay: number;
}) {
  return (
    <FadeIn delay={delay}>
      <motion.div
        whileHover={{ y: -6 }}
        className="group p-8 rounded-2xl bg-white border border-cl-gray-200 hover:border-cl-teal/30 hover:shadow-xl hover:shadow-cl-teal/5 transition-all duration-300"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cl-navy to-cl-blue flex items-center justify-center mb-5">
          <span className="text-white font-bold text-lg">{initials}</span>
        </div>
        <h4 className="text-lg font-semibold text-cl-navy mb-1">{name}</h4>
        <p className="text-cl-teal text-sm font-medium mb-3">{role}</p>
        <p className="text-cl-gray-500 text-sm leading-relaxed">{bio}</p>
      </motion.div>
    </FadeIn>
  );
}

/* ─── Stat Block ─── */
function StatBlock({
  value,
  label,
  delay,
}: {
  value: string;
  label: string;
  delay: number;
}) {
  return (
    <FadeIn delay={delay}>
      <div className="text-center">
        <div className="text-4xl sm:text-5xl font-bold text-white mb-2">{value}</div>
        <p className="text-white/50 text-sm font-medium">{label}</p>
      </div>
    </FadeIn>
  );
}

/* ═══════════════════════════════ ABOUT PAGE ═══════════════════════════════ */

export default function AboutPage() {
  return (
    <div className="pt-[72px] bg-white">
      {/* ════════════════════ HERO ════════════════════ */}
      <section className="relative py-24 sm:py-32 bg-cl-navy overflow-hidden">
        {/* Bg effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cl-blue/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cl-teal/10 rounded-full blur-[120px]" />

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-4">
              About Clariven Labs
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Raising the Standard for
              <br />
              <span className="bg-gradient-to-r from-cl-teal to-cl-blue-accent bg-clip-text text-transparent">
                Peptide Excellence
              </span>
            </h1>
            <p className="text-lg text-white/55 max-w-2xl mx-auto leading-relaxed">
              Founded by pharmaceutical scientists and healthcare veterans, Clariven Labs
              was built to solve a fundamental problem: the healthcare industry deserves
              a peptide supplier it can truly trust.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════ MISSION / VISION / VALUES ════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-3">
                What Drives Us
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy">
                Our Foundation
              </h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: 'Our Mission',
                description:
                  'To deliver pharmaceutical-grade peptides with uncompromising quality, enabling healthcare providers and researchers to advance patient outcomes with confidence in every vial.',
              },
              {
                icon: Eye,
                title: 'Our Vision',
                description:
                  'To become the most trusted peptide supply partner in American healthcare — setting the industry benchmark for purity, compliance, and client service.',
              },
              {
                icon: Lightbulb,
                title: 'Our Values',
                description:
                  'Integrity in every batch. Transparency in every COA. Accountability in every interaction. We believe the standard of care starts with the standard of supply.',
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.15}>
                <div className="relative p-8 rounded-2xl bg-cl-gray-50 border border-cl-gray-100">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cl-teal/10 to-cl-blue/10 flex items-center justify-center mb-6">
                    <item.icon className="w-7 h-7 text-cl-teal" />
                  </div>
                  <h3 className="text-xl font-semibold text-cl-navy mb-3">{item.title}</h3>
                  <p className="text-cl-gray-500 leading-relaxed">{item.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ OUR STORY ════════════════════ */}
      <section className="py-24 bg-cl-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left: narrative */}
            <div>
              <FadeIn>
                <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-3">
                  Our Story
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-6">
                  Built by Scientists,
                  <br />
                  Driven by Purpose
                </h2>
              </FadeIn>
              <FadeIn delay={0.1}>
                <p className="text-cl-gray-500 leading-relaxed mb-5">
                  Clariven Labs was founded in 2019 when a group of pharmaceutical scientists
                  and integrative medicine practitioners recognized a critical gap in the
                  peptide supply chain. Too many providers were forced to choose between
                  affordable peptides and verifiable quality.
                </p>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="text-cl-gray-500 leading-relaxed mb-5">
                  We set out to build something different — a vertically integrated peptide
                  manufacturer with pharmaceutical-grade standards at every step. From raw
                  material sourcing to final QC release, every process is designed for one
                  outcome: peptides that clinicians can trust with their patients.
                </p>
              </FadeIn>
              <FadeIn delay={0.3}>
                <p className="text-cl-gray-500 leading-relaxed">
                  Today, Clariven Labs serves over 500 healthcare providers nationwide,
                  from single-practitioner clinics to multi-state compounding pharmacy
                  networks. Our team has grown, but our founding principle hasn&apos;t changed:
                  every vial that leaves our facility must meet the standard we&apos;d want
                  for our own families.
                </p>
              </FadeIn>
            </div>

            {/* Right: timeline */}
            <div className="pt-4">
              <TimelineItem
                year="2019"
                title="Founded in San Diego, CA"
                description="Clariven Labs established with a mission to bring pharmaceutical-grade peptide supply to underserved clinics and pharmacies."
                delay={0}
              />
              <TimelineItem
                year="2020"
                title="cGMP Certification Achieved"
                description="Full cGMP compliance certification, establishing our quality management system to pharmaceutical manufacturing standards."
                delay={0.1}
              />
              <TimelineItem
                year="2021"
                title="100+ Product Catalog"
                description="Expanded to over 100 peptide formulations across therapeutic categories, serving 150+ healthcare providers."
                delay={0.2}
              />
              <TimelineItem
                year="2022"
                title="503A/503B Facility Network"
                description="Partnered with 503A and 503B licensed compounding facilities, expanding our manufacturing and distribution capabilities."
                delay={0.3}
              />
              <TimelineItem
                year="2023"
                title="500+ Provider Milestone"
                description="Crossed 500 active healthcare provider accounts and 2 million vials shipped with 99.7% order accuracy."
                delay={0.4}
              />
              <TimelineItem
                year="2024"
                title="National Expansion"
                description="Expanded priority shipping to all 50 states with 48-hour delivery, launched dedicated enterprise accounts for large health systems."
                delay={0.5}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════ STATS BAR ════════════════════ */}
      <section className="py-20 bg-cl-navy relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-cl-teal/8 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-cl-blue/10 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            <StatBlock value="500+" label="Healthcare Providers" delay={0} />
            <StatBlock value="2M+" label="Vials Shipped" delay={0.1} />
            <StatBlock value="99.7%" label="Order Accuracy" delay={0.2} />
            <StatBlock value="50+" label="Peptide Formulations" delay={0.3} />
          </div>
        </div>
      </section>

      {/* ════════════════════ LEADERSHIP TEAM ════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-3">
                Leadership
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-4">
                The Team Behind the Science
              </h2>
              <p className="text-cl-gray-500 max-w-2xl mx-auto text-lg">
                Led by pharmaceutical scientists, quality engineers, and healthcare
                industry veterans with decades of combined experience.
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <TeamMember
              name="Dr. Jonathan Mercer"
              role="Co-Founder & CEO"
              bio="Former VP of Pharmaceutical Development at a leading biotech firm. 20+ years in peptide chemistry and drug development."
              initials="JM"
              delay={0}
            />
            <TeamMember
              name="Dr. Sarah Nakamura"
              role="Chief Scientific Officer"
              bio="PhD in Biochemistry from Stanford. Led peptide synthesis programs at two Fortune 500 pharma companies before joining Clariven."
              initials="SN"
              delay={0.1}
            />
            <TeamMember
              name="Robert Kincaid"
              role="VP of Quality & Compliance"
              bio="15+ years in pharmaceutical quality systems. Previously QA Director at a 503B outsourcing facility. Architect of our cGMP program."
              initials="RK"
              delay={0.2}
            />
            <TeamMember
              name="Dr. Elena Vasquez"
              role="VP of Client Solutions"
              bio="Former integrative medicine practitioner and pharmacy consultant. Bridges the gap between clinical needs and supply chain execution."
              initials="EV"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* ════════════════════ WHY TRUST US ════════════════════ */}
      <section className="py-24 bg-cl-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-cl-teal font-semibold text-sm tracking-widest uppercase mb-3">
                Our Commitment
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-cl-navy mb-4">
                What Sets Clariven Apart
              </h2>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: FlaskConical,
                title: 'Vertical Integration',
                desc: 'We control every step from raw material sourcing to final QC release. No middlemen, no compromises on quality.',
              },
              {
                icon: Shield,
                title: 'Batch-Level Traceability',
                desc: 'Every vial is traceable to its specific production batch with full chain-of-custody documentation.',
              },
              {
                icon: Microscope,
                title: 'Triple-Layer Testing',
                desc: 'HPLC purity analysis, mass spectrometry confirmation, and endotoxin testing on every production batch.',
              },
              {
                icon: Award,
                title: 'Regulatory Expertise',
                desc: 'Our compliance team maintains active relationships with state boards of pharmacy and stays ahead of regulatory changes.',
              },
              {
                icon: Handshake,
                title: 'Named Account Specialists',
                desc: 'Every client is assigned a dedicated specialist who understands your practice and anticipates your needs.',
              },
              {
                icon: Globe,
                title: 'Nationwide Fulfillment',
                desc: '48-hour priority shipping to all 50 states. Temperature-controlled packaging and validated cold chain logistics.',
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.08}>
                <div className="flex gap-4 p-6 rounded-xl bg-white border border-cl-gray-200">
                  <div className="w-11 h-11 rounded-lg bg-cl-teal/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-cl-teal" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-cl-navy mb-1">{item.title}</h4>
                    <p className="text-cl-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ CTA ════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <div className="p-12 sm:p-16 rounded-3xl bg-gradient-to-br from-cl-navy to-cl-navy-light relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-cl-teal/10 rounded-full blur-[80px]" />
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Partner With Clariven Labs
                </h2>
                <p className="text-white/55 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
                  Join 500+ healthcare providers who trust Clariven Labs for their
                  most critical peptide needs. Let&apos;s build a supply chain you can count on.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/contact"
                    className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cl-teal text-white font-semibold hover:bg-cl-teal-light transition-all duration-300"
                  >
                    Schedule a Consultation
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/quality"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/20 text-white font-semibold hover:border-white/40 hover:bg-white/5 transition-all duration-300"
                  >
                    View Our Quality Standards
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
