'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Clock,
  MapPin,
  Send,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';

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

/* ═══════════════════════════════ CONTACT PAGE ═══════════════════════════════ */

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organization: '',
    role: '',
    interest: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="pt-[72px] bg-white">
      {/* ════════════════════ HERO ════════════════════ */}
      <section className="relative py-20 sm:py-24 bg-cl-navy overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cl-teal/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cl-blue/10 rounded-full blur-[100px]" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-cl-teal text-sm font-medium mb-6">
              <MessageSquare className="w-4 h-4" />
              Get in Touch
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Let&apos;s Launch Your
              <br />
              <span className="bg-gradient-to-r from-cl-teal to-cl-blue-accent bg-clip-text text-transparent">
                Research Brand
              </span>
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
              Whether you&apos;re scoping a research-use-only product line or need the compliance,
              brand, and operations handled end to end — tell us where you want to go and we&apos;ll map
              the path.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════ CONTACT INFO BAR ════════════════════ */}
      <section className="py-6 bg-cl-gray-50 border-b border-cl-gray-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Mail, label: 'Email', value: 'support@clarivenlabs.com', href: 'mailto:support@clarivenlabs.com' },
              { icon: Clock, label: 'Response', value: 'Within 1 business day', href: null },
              { icon: MapPin, label: 'Entity', value: 'Clariven Labs LLC · Wyoming', href: null },
            ].map((item) => {
              const inner = (
                <>
                  <div className="w-10 h-10 rounded-lg bg-cl-teal/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-cl-teal" />
                  </div>
                  <div>
                    <p className="text-xs text-cl-gray-400 uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm font-medium text-cl-navy">{item.value}</p>
                  </div>
                </>
              );
              return item.href ? (
                <a key={item.label} href={item.href} className="flex items-center gap-3 group hover:opacity-80 transition">
                  {inner}
                </a>
              ) : (
                <div key={item.label} className="flex items-center gap-3">{inner}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════ FORM + SIDEBAR ════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* ── FORM ── */}
            <div className="lg:col-span-2">
              <FadeIn>
                <h2 className="text-2xl sm:text-3xl font-bold text-cl-navy mb-2">
                  Request a Consultation
                </h2>
                <p className="text-cl-gray-500 mb-8">
                  Tell us about your research company and a Clariven specialist will respond within
                  one business day.
                </p>

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16 px-8 rounded-2xl bg-cl-gray-50 border border-cl-gray-200"
                  >
                    <div className="w-16 h-16 rounded-full bg-cl-success/10 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-8 h-8 text-cl-success" />
                    </div>
                    <h3 className="text-xl font-semibold text-cl-navy mb-3">
                      Thanks — We&apos;ll Be in Touch
                    </h3>
                    <p className="text-cl-gray-500 max-w-md mx-auto">
                      Your message has been received. A Clariven specialist will reach out within one
                      business day to scope your research-use-only program.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name row */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-cl-navy mb-1.5">
                          First Name <span className="text-cl-error">*</span>
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          required
                          value={formData.firstName}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-cl-gray-200 bg-white text-cl-navy placeholder:text-cl-gray-400 focus:outline-none focus:ring-2 focus:ring-cl-teal/30 focus:border-cl-teal transition"
                          placeholder="Jordan"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-cl-navy mb-1.5">
                          Last Name <span className="text-cl-error">*</span>
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          required
                          value={formData.lastName}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-cl-gray-200 bg-white text-cl-navy placeholder:text-cl-gray-400 focus:outline-none focus:ring-2 focus:ring-cl-teal/30 focus:border-cl-teal transition"
                          placeholder="Reyes"
                        />
                      </div>
                    </div>

                    {/* Email + Phone */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-cl-navy mb-1.5">
                          Email <span className="text-cl-error">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-cl-gray-200 bg-white text-cl-navy placeholder:text-cl-gray-400 focus:outline-none focus:ring-2 focus:ring-cl-teal/30 focus:border-cl-teal transition"
                          placeholder="you@company.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-cl-navy mb-1.5">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-cl-gray-200 bg-white text-cl-navy placeholder:text-cl-gray-400 focus:outline-none focus:ring-2 focus:ring-cl-teal/30 focus:border-cl-teal transition"
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    {/* Organization + Role */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-cl-navy mb-1.5">
                          Company / Organization <span className="text-cl-error">*</span>
                        </label>
                        <input
                          type="text"
                          name="organization"
                          required
                          value={formData.organization}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-cl-gray-200 bg-white text-cl-navy placeholder:text-cl-gray-400 focus:outline-none focus:ring-2 focus:ring-cl-teal/30 focus:border-cl-teal transition"
                          placeholder="Your company or lab"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-cl-navy mb-1.5">
                          Your Role <span className="text-cl-error">*</span>
                        </label>
                        <select
                          name="role"
                          required
                          value={formData.role}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-cl-gray-200 bg-white text-cl-navy focus:outline-none focus:ring-2 focus:ring-cl-teal/30 focus:border-cl-teal transition"
                        >
                          <option value="">Select your role</option>
                          <option value="founder">Founder / Operator</option>
                          <option value="principal-investigator">Principal Investigator</option>
                          <option value="research-scientist">Research Scientist</option>
                          <option value="lab-manager">Lab Manager / Director</option>
                          <option value="operations">Operations / Procurement</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Interest */}
                    <div>
                      <label className="block text-sm font-medium text-cl-navy mb-1.5">
                        What can we help with?
                      </label>
                      <select
                        name="interest"
                        value={formData.interest}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-cl-gray-200 bg-white text-cl-navy focus:outline-none focus:ring-2 focus:ring-cl-teal/30 focus:border-cl-teal transition"
                      >
                        <option value="">Select an option</option>
                        <option value="launch">Launch a research-use-only brand</option>
                        <option value="compliance">RUO compliance review</option>
                        <option value="brand-web">Brand, web &amp; fulfillment setup</option>
                        <option value="partnership">Partnership opportunity</option>
                        <option value="general">General question</option>
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-cl-navy mb-1.5">Message</label>
                      <textarea
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-cl-gray-200 bg-white text-cl-navy placeholder:text-cl-gray-400 focus:outline-none focus:ring-2 focus:ring-cl-teal/30 focus:border-cl-teal transition resize-none"
                        placeholder="Tell us about your research company, where you want to take it, and any timelines or questions…"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cl-teal text-white font-semibold hover:bg-cl-teal-light transition-all duration-300 shadow-lg shadow-cl-teal/20"
                    >
                      <Send className="w-5 h-5" />
                      Send Message
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <p className="text-xs text-cl-gray-400 mt-3">
                      By submitting, you agree to our{' '}
                      <Link href="/privacy" className="text-cl-teal hover:underline">Privacy Policy</Link>.
                      We&apos;ll never share your information with third parties.
                    </p>
                  </form>
                )}
              </FadeIn>
            </div>

            {/* ── SIDEBAR ── */}
            <div className="lg:col-span-1">
              <FadeIn delay={0.15}>
                <div className="space-y-6 sticky top-[88px]">
                  {/* What to expect */}
                  <div className="p-6 rounded-2xl bg-cl-gray-50 border border-cl-gray-200">
                    <h3 className="text-lg font-semibold text-cl-navy mb-4">What to Expect</h3>
                    <div className="space-y-4">
                      {[
                        { step: '1', text: 'Send your message with a bit about your company and goals' },
                        { step: '2', text: 'A Clariven specialist reaches out within one business day' },
                        { step: '3', text: 'We scope your program and map a guided onboarding plan' },
                        { step: '4', text: 'A named team takes it from kickoff through launch' },
                      ].map((item) => (
                        <div key={item.step} className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-cl-teal text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {item.step}
                          </span>
                          <span className="text-sm text-cl-gray-600">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-cl-navy to-cl-navy-light">
                    <h3 className="text-white font-semibold mb-4">Why Work With Clariven</h3>
                    <div className="space-y-3">
                      {[
                        'One partner from kickoff through launch',
                        'A single guided plan with a named team',
                        'Compliance, brand, web & fulfillment coordinated',
                        'Research-use-only, handled correctly',
                      ].map((benefit) => (
                        <div key={benefit} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-cl-teal shrink-0 mt-0.5" />
                          <span className="text-sm text-white/70">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════ FAQ ════════════════════ */}
      <section className="py-20 bg-cl-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-cl-navy mb-3">
              Frequently Asked Questions
            </h2>
          </FadeIn>

          <div className="space-y-4">
            {[
              {
                q: 'What does Clariven Labs actually do?',
                a: 'We help research companies launch and run a research-use-only product line — compliance, brand, web, and fulfillment — through one guided onboarding program run by a named team.',
              },
              {
                q: 'Do you sell or manufacture products?',
                a: 'No. Clariven Labs is a consultancy. We set up and coordinate your program and its partners; we do not manufacture, test, or ship product ourselves.',
              },
              {
                q: 'What does "research use only" mean here?',
                a: 'Products in a research-use-only program are intended for laboratory research only — not for human or animal consumption, and not drugs, foods, or cosmetics. We keep your positioning and labeling consistent with that.',
              },
              {
                q: 'How long does it take?',
                a: 'It depends on scope, but the program is the same every time: a guided checklist with clear owners, so you always know what is next. We map a realistic timeline on the first call.',
              },
              {
                q: 'How do we get started?',
                a: 'Send the form above or email support@clarivenlabs.com. A specialist follows up within one business day to scope your program.',
              },
            ].map((faq, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="p-6 rounded-2xl border border-cl-gray-200 bg-white hover:border-cl-gray-300 transition-colors">
                  <h3 className="text-base font-semibold text-cl-navy mb-2">{faq.q}</h3>
                  <p className="text-sm text-cl-gray-500 leading-relaxed">{faq.a}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
