'use client';

import { motion } from 'framer-motion';
import {
  Scale,
  FileText,
  ChevronRight,
  ArrowRight,
  Shield,
  AlertTriangle,
  Package,
  CreditCard,
  Truck,
  Ban,
  Gavel,
  BookOpen,
  Mail,
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

const sections = [
  { id: 'acceptance', label: 'Acceptance of Terms' },
  { id: 'eligibility', label: 'Account Eligibility' },
  { id: 'product-use', label: 'Product Use & Restrictions' },
  { id: 'orders', label: 'Orders & Payment' },
  { id: 'shipping', label: 'Shipping & Returns' },
  { id: 'intellectual-property', label: 'Intellectual Property' },
  { id: 'prohibited', label: 'Prohibited Conduct' },
  { id: 'liability', label: 'Limitation of Liability' },
  { id: 'indemnification', label: 'Indemnification' },
  { id: 'disputes', label: 'Dispute Resolution' },
  { id: 'regulatory', label: 'Regulatory Disclaimer' },
  { id: 'modifications', label: 'Modifications' },
  { id: 'contact', label: 'Contact' },
];

export default function TermsPage() {
  return (
    <div className="pt-[72px] bg-white">
      {/* ════════════════════ HERO ════════════════════ */}
      <section className="relative py-20 sm:py-24 bg-cl-navy overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cl-blue/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cl-teal/8 rounded-full blur-[120px]" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Link href="/" className="text-white/40 text-sm hover:text-cl-teal transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-white/30" />
              <span className="text-white/70 text-sm font-medium">Terms of Service</span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cl-teal/20 to-cl-blue/20 border border-white/10 flex items-center justify-center">
                <Scale className="w-7 h-7 text-cl-teal" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                  Terms of Service
                </h1>
                <p className="text-white/40 text-sm mt-1">
                  Last updated: March 13, 2026 &middot; Effective immediately
                </p>
              </div>
            </div>

            <p className="text-lg text-white/50 max-w-2xl leading-relaxed">
              These terms govern your access to and use of the Clariven Labs website, client portal,
              and all related services. Please review them carefully before engaging with our platform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════ CONTENT ════════════════════ */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar navigation */}
            <div className="lg:w-64 shrink-0">
              <div className="sticky top-[88px]">
                <h3 className="text-xs font-semibold text-cl-gray-400 uppercase tracking-wider mb-3">
                  On This Page
                </h3>
                <nav className="space-y-0.5">
                  {sections.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="block px-3 py-2 text-sm text-cl-gray-500 hover:text-cl-teal hover:bg-cl-teal/5 rounded-lg transition-colors"
                    >
                      {s.label}
                    </a>
                  ))}
                </nav>

                <div className="mt-8 p-5 rounded-2xl bg-cl-gray-50 border border-cl-gray-200">
                  <Mail className="w-5 h-5 text-cl-teal mb-3" />
                  <h4 className="text-sm font-semibold text-cl-navy mb-1">Legal Questions?</h4>
                  <p className="text-xs text-cl-gray-500 leading-relaxed mb-3">
                    Contact our legal team for any terms-related inquiries.
                  </p>
                  <a
                    href="mailto:legal@clarivenlabs.com"
                    className="text-cl-teal text-sm font-medium hover:text-cl-teal-light transition-colors"
                  >
                    legal@clarivenlabs.com
                  </a>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 max-w-3xl">
              <div className="space-y-12">
                {/* Important notice */}
                <FadeIn>
                  <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200/60 flex gap-4">
                    <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-amber-900 mb-1">Important Notice</h4>
                      <p className="text-sm text-amber-800/80 leading-relaxed">
                        Our products are available exclusively to licensed healthcare professionals,
                        registered compounding pharmacies, and qualified research institutions. By
                        creating an account, you confirm that you meet these eligibility requirements.
                      </p>
                    </div>
                  </div>
                </FadeIn>

                {/* Section 1 */}
                <FadeIn>
                  <div id="acceptance">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">1</span>
                      Acceptance of Terms
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed space-y-4">
                      <p>
                        By accessing or using the Clariven Labs website (&quot;clarivenlabs.com&quot;), client portal,
                        or any services provided by Clariven Labs, LLC (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or
                        &quot;our&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not
                        agree with any part of these Terms, you must discontinue use of our services immediately.
                      </p>
                      <p>
                        These Terms constitute a legally binding agreement between you (or the organization
                        you represent) and Clariven Labs. By placing an order, you represent that you have the
                        authority to bind your organization to these Terms.
                      </p>
                    </div>
                  </div>
                </FadeIn>

                {/* Section 2 */}
                <FadeIn>
                  <div id="eligibility">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">2</span>
                      Account Eligibility
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed space-y-4">
                      <p>
                        To create an account and purchase products from Clariven Labs, you must meet
                        the following requirements:
                      </p>
                      <ul className="space-y-1.5 text-sm">
                        {[
                          'Hold a valid, active professional license (MD, DO, NP, PA, PharmD, RPh, or equivalent)',
                          'Operate a licensed healthcare facility, compounding pharmacy, or accredited research institution',
                          'Provide verifiable DEA registration (where applicable for controlled substance analogs)',
                          'Be at least 18 years of age and legally authorized to enter into contracts',
                          'Provide accurate and complete registration information',
                        ].map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <ChevronRight className="w-3.5 h-3.5 text-cl-teal mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      <p>
                        Clariven Labs reserves the right to verify credentials at any time and to suspend or
                        terminate accounts that fail to meet eligibility requirements. Providing false or
                        misleading credential information may result in immediate account termination and
                        referral to appropriate regulatory authorities.
                      </p>
                    </div>
                  </div>
                </FadeIn>

                {/* Section 3 */}
                <FadeIn>
                  <div id="product-use">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">3</span>
                      Product Use &amp; Restrictions
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed space-y-4">
                      <p>
                        All products sold by Clariven Labs are intended exclusively for legitimate medical,
                        pharmaceutical compounding, or scientific research purposes:
                      </p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {[
                          { title: 'Clinical Use', desc: 'Products may be prescribed and administered by licensed healthcare providers in accordance with applicable laws and clinical guidelines.' },
                          { title: 'Compounding', desc: 'Products may be used as pharmaceutical ingredients by licensed 503A and 503B compounding facilities in compliance with USP standards.' },
                          { title: 'Research', desc: 'Products labeled "For Research Use Only" are restricted to qualified research institutions with proper IRB oversight where applicable.' },
                          { title: 'Resale', desc: 'Resale of Clariven Labs products requires a separate distribution agreement. Unauthorized resale is prohibited and may violate state and federal law.' },
                        ].map((item) => (
                          <div key={item.title} className="p-4 rounded-xl bg-cl-gray-50 border border-cl-gray-100">
                            <h4 className="text-sm font-semibold text-cl-navy mb-1">{item.title}</h4>
                            <p className="text-xs text-cl-gray-500 leading-relaxed">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </FadeIn>

                {/* Section 4 */}
                <FadeIn>
                  <div id="orders">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">4</span>
                      Orders &amp; Payment
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed space-y-4">
                      <p>
                        All orders are subject to acceptance by Clariven Labs and product availability.
                        By placing an order, you agree to the following:
                      </p>
                      <ul className="space-y-1.5 text-sm">
                        {[
                          'Pricing is quoted per order and subject to change without notice. Published prices are for reference only.',
                          'Payment terms are established in your account agreement (Net 30, Net 60, or prepayment as applicable).',
                          'Volume pricing and contract rates are available for qualifying accounts.',
                          'Clariven Labs reserves the right to cancel any order if credential verification fails or payment is not received.',
                          'Sales tax will be applied where required by applicable state and local laws.',
                          'Late payments may incur a 1.5% monthly finance charge and may result in account suspension.',
                        ].map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <ChevronRight className="w-3.5 h-3.5 text-cl-teal mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </FadeIn>

                {/* Section 5 */}
                <FadeIn>
                  <div id="shipping">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">5</span>
                      Shipping &amp; Returns
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed space-y-4">
                      <p>
                        Shipping terms and return policies are governed by your account agreement and the
                        following general provisions:
                      </p>
                      <div className="p-6 rounded-2xl bg-cl-gray-50 border border-cl-gray-100 space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-cl-navy mb-1">Shipping</h4>
                          <p className="text-sm text-cl-gray-600">
                            Orders placed before 2:00 PM EST on business days are processed same-day.
                            All shipments utilize temperature-controlled packaging and are tracked from
                            our facility to your door. Risk of loss transfers upon carrier acceptance.
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-cl-navy mb-1">Returns</h4>
                          <p className="text-sm text-cl-gray-600">
                            Due to the pharmaceutical nature of our products, returns are restricted to
                            damaged, defective, or incorrectly shipped items only. All claims must be
                            reported within 48 hours of receipt with photographic documentation. Products
                            returned due to customer error may be subject to a restocking fee.
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-cl-navy mb-1">Cold Chain Guarantee</h4>
                          <p className="text-sm text-cl-gray-600">
                            Products requiring refrigeration are shipped with validated cold chain packaging.
                            If temperature excursion is documented, we will replace the product at no charge.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeIn>

                {/* Section 6 */}
                <FadeIn>
                  <div id="intellectual-property">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">6</span>
                      Intellectual Property
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed space-y-4">
                      <p>
                        All content on the Clariven Labs website — including text, graphics, logos, images,
                        product descriptions, documentation, and software — is the property of Clariven Labs
                        or its licensors and is protected by United States and international copyright,
                        trademark, and intellectual property laws.
                      </p>
                      <p>
                        You may not reproduce, distribute, modify, create derivative works from, publicly
                        display, or otherwise exploit any content without our prior written consent. Limited
                        use of product documentation (COAs, spec sheets) is permitted for internal clinical
                        or research purposes.
                      </p>
                    </div>
                  </div>
                </FadeIn>

                {/* Section 7 */}
                <FadeIn>
                  <div id="prohibited">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">7</span>
                      Prohibited Conduct
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed space-y-4">
                      <p>You agree not to:</p>
                      <ul className="space-y-1.5 text-sm">
                        {[
                          'Use products for any purpose other than authorized medical, pharmaceutical, or research applications',
                          'Provide false, misleading, or fraudulent credential information',
                          'Resell, redistribute, or transfer products without authorization',
                          'Attempt to reverse-engineer, decompile, or derive formulations from our products',
                          'Interfere with or disrupt the website, client portal, or related systems',
                          'Scrape, harvest, or collect data from our website using automated means',
                          'Impersonate any person or entity, or falsely state or misrepresent your affiliation',
                          'Use our products in any manner that violates applicable federal, state, or local laws',
                        ].map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <Ban className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </FadeIn>

                {/* Section 8 */}
                <FadeIn>
                  <div id="liability">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">8</span>
                      Limitation of Liability
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed space-y-4">
                      <p>
                        Clariven Labs provides all products in strict accordance with published specifications
                        and applicable quality standards. To the maximum extent permitted by law:
                      </p>
                      <ul className="space-y-1.5 text-sm">
                        {[
                          'We are not liable for product misuse, improper storage, or use beyond the intended application',
                          'Our maximum aggregate liability shall not exceed the purchase price of the specific products giving rise to the claim',
                          'We disclaim all implied warranties, including merchantability and fitness for a particular purpose, except as expressly stated in product documentation',
                          'We are not liable for indirect, incidental, consequential, or punitive damages arising from your use of our products or services',
                          'We are not responsible for delays or failures in performance caused by events beyond our reasonable control (force majeure)',
                        ].map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <ChevronRight className="w-3.5 h-3.5 text-cl-teal mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </FadeIn>

                {/* Section 9 */}
                <FadeIn>
                  <div id="indemnification">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">9</span>
                      Indemnification
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed">
                      <p>
                        You agree to indemnify, defend, and hold harmless Clariven Labs, its officers,
                        directors, employees, agents, and affiliates from and against any claims, damages,
                        losses, liabilities, costs, and expenses (including reasonable attorneys&apos; fees)
                        arising from or related to: (a) your use of our products or services; (b) your
                        violation of these Terms; (c) your violation of any applicable law or regulation;
                        or (d) your infringement of any intellectual property or other right of any third party.
                      </p>
                    </div>
                  </div>
                </FadeIn>

                {/* Section 10 */}
                <FadeIn>
                  <div id="disputes">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">10</span>
                      Dispute Resolution
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed space-y-4">
                      <p>
                        These Terms are governed by the laws of the State of Arizona, without regard to
                        conflict of law principles. Any dispute arising under these Terms shall be resolved as follows:
                      </p>
                      <div className="space-y-3">
                        {[
                          { step: '1', title: 'Informal Resolution', desc: 'Parties will attempt to resolve disputes through good-faith negotiations for a period of 30 days.' },
                          { step: '2', title: 'Mediation', desc: 'If informal resolution fails, disputes will be submitted to binding mediation in Scottsdale, Arizona, under the rules of the American Arbitration Association.' },
                          { step: '3', title: 'Arbitration', desc: 'Unresolved disputes will proceed to binding arbitration in Maricopa County, Arizona. Each party bears its own costs unless the arbitrator determines otherwise.' },
                        ].map((item) => (
                          <div key={item.step} className="flex gap-4 p-4 rounded-xl bg-cl-gray-50 border border-cl-gray-100">
                            <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                              {item.step}
                            </span>
                            <div>
                              <h4 className="text-sm font-semibold text-cl-navy mb-0.5">{item.title}</h4>
                              <p className="text-xs text-cl-gray-500 leading-relaxed">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </FadeIn>

                {/* Section 11 */}
                <FadeIn>
                  <div id="regulatory">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">11</span>
                      Regulatory Disclaimer
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed space-y-4">
                      <div className="p-5 rounded-2xl bg-cl-gray-50 border border-cl-gray-100">
                        <p className="text-sm leading-relaxed">
                          The information provided on this website is for informational purposes only and
                          does not constitute medical, pharmaceutical, or legal advice. Clariven Labs does
                          not make therapeutic claims about its products unless specifically indicated in
                          FDA-approved labeling.
                        </p>
                        <p className="text-sm leading-relaxed mt-3">
                          Healthcare providers are solely responsible for prescribing and administering
                          products in accordance with applicable federal and state laws, clinical guidelines,
                          and their professional judgment. Research-use products are not intended for human
                          use without appropriate regulatory authorization (IND, 505(b)(2), etc.).
                        </p>
                        <p className="text-sm leading-relaxed mt-3">
                          Product descriptions, specifications, and application notes are provided for
                          informational purposes and should not be construed as guarantees of clinical outcomes.
                        </p>
                      </div>
                    </div>
                  </div>
                </FadeIn>

                {/* Section 12 */}
                <FadeIn>
                  <div id="modifications">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">12</span>
                      Modifications to Terms
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed space-y-4">
                      <p>
                        Clariven Labs reserves the right to modify these Terms at any time. Material changes
                        will be communicated to active account holders via email at least 30 days prior to
                        taking effect. Continued use of our services after the effective date of any changes
                        constitutes your acceptance of the revised Terms.
                      </p>
                      <p>
                        We recommend reviewing these Terms periodically. The &quot;Last updated&quot; date at the
                        top of this page reflects the most recent revision.
                      </p>
                    </div>
                  </div>
                </FadeIn>

                {/* Section 13 */}
                <FadeIn>
                  <div id="contact">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">13</span>
                      Contact
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed space-y-4">
                      <p>
                        For questions regarding these Terms of Service, please contact:
                      </p>
                      <div className="p-6 rounded-2xl bg-cl-gray-50 border border-cl-gray-100">
                        <p className="font-semibold text-cl-navy mb-1">Clariven Labs — Legal Department</p>
                        <p className="text-sm space-y-1">
                          <span className="block">Email: <a href="mailto:legal@clarivenlabs.com" className="text-cl-teal hover:text-cl-teal-light transition-colors">legal@clarivenlabs.com</a></span>
                          <span className="block">Phone: (480) 555-0199</span>
                          <span className="block">Address: Clariven Labs, Attn: Legal Department, 8700 E Via de Ventura, Suite 200, Scottsdale, AZ 85258</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════ RELATED LINKS ════════════════════ */}
      <section className="py-16 bg-cl-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-2xl font-bold text-cl-navy mb-4">Related Policies</h2>
            <p className="text-cl-gray-500 mb-8">
              Review our complete legal and privacy documentation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/privacy"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-cl-gray-200 text-cl-navy font-semibold hover:border-cl-teal/30 hover:bg-white transition-all"
              >
                <Shield className="w-5 h-5" />
                Privacy Policy
              </Link>
              <Link
                href="/contact"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cl-teal text-white font-semibold hover:bg-cl-teal-light transition-all"
              >
                Contact Us
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
