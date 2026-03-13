'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  ArrowRight,
  CheckCircle2,
  Building2,
  FlaskConical,
  Shield,
  Users,
  MessageSquare,
  Headphones,
} from 'lucide-react';
import { cn } from '@/lib/utils';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
              Let&apos;s Build Your
              <br />
              <span className="bg-gradient-to-r from-cl-teal to-cl-blue-accent bg-clip-text text-transparent">
                Peptide Supply Chain
              </span>
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
              Whether you&apos;re a clinic exploring peptide therapies, a pharmacy expanding
              your formulary, or a research institution sourcing compounds — we&apos;re here to help.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════ CONTACT INFO BAR ════════════════════ */}
      <section className="py-6 bg-cl-gray-50 border-b border-cl-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Phone, label: 'Sales', value: '(888) 555-0142', href: 'tel:+18885550142' },
              { icon: Mail, label: 'Email', value: 'info@clarivenlabs.com', href: 'mailto:info@clarivenlabs.com' },
              { icon: MapPin, label: 'Headquarters', value: 'Scottsdale, AZ', href: '#' },
              { icon: Clock, label: 'Hours', value: 'Mon–Fri, 7AM–6PM MST', href: '#' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-lg bg-cl-teal/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-cl-teal" />
                </div>
                <div>
                  <p className="text-xs text-cl-gray-400 uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm font-medium text-cl-navy group-hover:text-cl-teal transition-colors">
                    {item.value}
                  </p>
                </div>
              </a>
            ))}
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
                  Tell us about your needs and a dedicated account specialist will respond
                  within one business day.
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
                      Thank You for Your Interest
                    </h3>
                    <p className="text-cl-gray-500 max-w-md mx-auto mb-6">
                      Your inquiry has been received. A dedicated account specialist will
                      reach out within one business day to discuss your peptide supply needs.
                    </p>
                    <p className="text-sm text-cl-gray-400">
                      Reference ID: CL-{Date.now().toString(36).toUpperCase()}
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
                          placeholder="John"
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
                          placeholder="Smith"
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
                          placeholder="john@clinic.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-cl-navy mb-1.5">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-cl-gray-200 bg-white text-cl-navy placeholder:text-cl-gray-400 focus:outline-none focus:ring-2 focus:ring-cl-teal/30 focus:border-cl-teal transition"
                          placeholder="(555) 000-0000"
                        />
                      </div>
                    </div>

                    {/* Organization + Role */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-cl-navy mb-1.5">
                          Organization <span className="text-cl-error">*</span>
                        </label>
                        <input
                          type="text"
                          name="organization"
                          required
                          value={formData.organization}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-cl-gray-200 bg-white text-cl-navy placeholder:text-cl-gray-400 focus:outline-none focus:ring-2 focus:ring-cl-teal/30 focus:border-cl-teal transition"
                          placeholder="Your clinic or organization"
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
                          <option value="physician">Physician / Medical Director</option>
                          <option value="np-pa">Nurse Practitioner / PA</option>
                          <option value="pharmacist">Pharmacist</option>
                          <option value="pharmacy-owner">Pharmacy Owner</option>
                          <option value="researcher">Researcher / PI</option>
                          <option value="procurement">Procurement / Purchasing</option>
                          <option value="practice-manager">Practice Manager</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Interest */}
                    <div>
                      <label className="block text-sm font-medium text-cl-navy mb-1.5">
                        What are you interested in?
                      </label>
                      <select
                        name="interest"
                        value={formData.interest}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-cl-gray-200 bg-white text-cl-navy focus:outline-none focus:ring-2 focus:ring-cl-teal/30 focus:border-cl-teal transition"
                      >
                        <option value="">Select an option</option>
                        <option value="product-inquiry">Product Inquiry & Pricing</option>
                        <option value="bulk-order">Bulk / Volume Orders</option>
                        <option value="custom-formulation">Custom Formulation</option>
                        <option value="new-account">Open a New Account</option>
                        <option value="coa-request">COA / Documentation Request</option>
                        <option value="partnership">Partnership Opportunity</option>
                        <option value="general">General Question</option>
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-cl-navy mb-1.5">
                        Message
                      </label>
                      <textarea
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-cl-gray-200 bg-white text-cl-navy placeholder:text-cl-gray-400 focus:outline-none focus:ring-2 focus:ring-cl-teal/30 focus:border-cl-teal transition resize-none"
                        placeholder="Tell us about your peptide supply needs, volume requirements, or any specific questions..."
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cl-teal text-white font-semibold hover:bg-cl-teal-light transition-all duration-300 shadow-lg shadow-cl-teal/20"
                    >
                      <Send className="w-5 h-5" />
                      Submit Inquiry
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
                  {/* Why contact us */}
                  <div className="p-6 rounded-2xl bg-cl-gray-50 border border-cl-gray-200">
                    <h3 className="text-lg font-semibold text-cl-navy mb-4">
                      What to Expect
                    </h3>
                    <div className="space-y-4">
                      {[
                        { step: '1', text: 'Submit your inquiry with details about your needs' },
                        { step: '2', text: 'A named account specialist contacts you within 24 hours' },
                        { step: '3', text: 'Receive customized pricing and product recommendations' },
                        { step: '4', text: 'Begin your first order with dedicated support' },
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

                  {/* Benefits card */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-cl-navy to-cl-navy-light">
                    <h3 className="text-white font-semibold mb-4">
                      Why Providers Switch to Clariven
                    </h3>
                    <div className="space-y-3">
                      {[
                        'Named account specialist (not a call center)',
                        'Volume-based pricing with no hidden fees',
                        'Batch-specific COAs with every order',
                        '48-hour priority fulfillment',
                        'Custom formulation capabilities',
                        'Regulatory compliance documentation',
                      ].map((benefit) => (
                        <div key={benefit} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-cl-teal shrink-0 mt-0.5" />
                          <span className="text-sm text-white/70">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Direct contacts */}
                  <div className="p-6 rounded-2xl border border-cl-gray-200">
                    <h3 className="text-lg font-semibold text-cl-navy mb-4">
                      Direct Lines
                    </h3>
                    <div className="space-y-4">
                      {[
                        { icon: Headphones, dept: 'New Accounts', contact: '(888) 555-0142 ext 1' },
                        { icon: FlaskConical, dept: 'Technical / Quality', contact: '(888) 555-0142 ext 2' },
                        { icon: Users, dept: 'Existing Clients', contact: '(888) 555-0142 ext 3' },
                      ].map((line) => (
                        <div key={line.dept} className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-cl-gray-100 flex items-center justify-center">
                            <line.icon className="w-4 h-4 text-cl-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-cl-navy">{line.dept}</p>
                            <p className="text-xs text-cl-gray-400">{line.contact}</p>
                          </div>
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

      {/* ════════════════════ DEPARTMENT CARDS ════════════════════ */}
      <section className="py-16 bg-cl-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-cl-navy mb-3">
              Reach the Right Team
            </h2>
            <p className="text-cl-gray-500">
              Connect directly with the department best suited to help you.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Building2,
                title: 'Sales & Accounts',
                email: 'sales@clarivenlabs.com',
                description: 'New accounts, pricing, and product catalog inquiries.',
              },
              {
                icon: FlaskConical,
                title: 'Technical Support',
                email: 'technical@clarivenlabs.com',
                description: 'Product specifications, stability data, and formulation questions.',
              },
              {
                icon: Shield,
                title: 'Quality & Compliance',
                email: 'quality@clarivenlabs.com',
                description: 'COA requests, regulatory documentation, and facility certifications.',
              },
              {
                icon: Users,
                title: 'Partnerships',
                email: 'partners@clarivenlabs.com',
                description: 'Strategic partnerships, distribution, and co-development opportunities.',
              },
            ].map((dept, i) => (
              <FadeIn key={dept.title} delay={i * 0.08}>
                <div className="h-full p-6 rounded-2xl bg-white border border-cl-gray-200 hover:border-cl-teal/30 hover:shadow-md transition-all duration-300">
                  <div className="w-11 h-11 rounded-xl bg-cl-teal/10 flex items-center justify-center mb-4">
                    <dept.icon className="w-5 h-5 text-cl-teal" />
                  </div>
                  <h3 className="text-base font-semibold text-cl-navy mb-1">{dept.title}</h3>
                  <p className="text-sm text-cl-gray-500 mb-3">{dept.description}</p>
                  <a
                    href={`mailto:${dept.email}`}
                    className="text-sm font-medium text-cl-teal hover:text-cl-teal-light transition-colors"
                  >
                    {dept.email}
                  </a>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ FAQ MINI ════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-cl-navy mb-3">
              Frequently Asked Questions
            </h2>
          </FadeIn>

          <div className="space-y-4">
            {[
              {
                q: 'What is the minimum order quantity?',
                a: 'We offer flexible ordering with no minimum for most products. Volume pricing is available for practices ordering 50+ units per month.',
              },
              {
                q: 'How quickly can I receive my first order?',
                a: 'Once your account is verified, first orders typically ship within 48 hours. We offer priority and same-day processing for urgent needs.',
              },
              {
                q: 'Do you provide COAs with every shipment?',
                a: 'Yes. Every order includes batch-specific Certificates of Analysis. Historical COAs are accessible anytime through our client portal.',
              },
              {
                q: 'What documentation do I need to open an account?',
                a: 'We require a valid medical license or pharmacy license, DEA registration (if applicable), and basic business verification. Our team will guide you through the process.',
              },
              {
                q: 'Can you develop custom formulations?',
                a: 'Absolutely. Our formulation team can develop custom peptide blends, specific concentrations, and multi-peptide combinations tailored to your practice protocols.',
              },
            ].map((faq, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="p-6 rounded-2xl border border-cl-gray-200 hover:border-cl-gray-300 transition-colors">
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
