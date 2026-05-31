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
  { id: 'ruo', label: 'Research Use Only' },
  { id: 'eligibility', label: 'Account Eligibility' },
  { id: 'buyer-representations', label: 'Buyer Representations' },
  { id: 'product-use', label: 'Product Use & Restrictions' },
  { id: 'orders', label: 'Orders & Payment' },
  { id: 'shipping', label: 'Shipping & Returns' },
  { id: 'warranty', label: 'Warranty Disclaimer' },
  { id: 'intellectual-property', label: 'Intellectual Property' },
  { id: 'prohibited', label: 'Prohibited Conduct' },
  { id: 'liability', label: 'Limitation of Liability' },
  { id: 'indemnification', label: 'Indemnification' },
  { id: 'disputes', label: 'Governing Law & Disputes' },
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
                  Last updated: May 2026 &middot; Draft — pending legal review
                </p>
              </div>
            </div>

            <p className="text-lg text-white/50 max-w-2xl leading-relaxed">
              These terms govern your access to and use of the Clariven Labs website, customer portal,
              and all related services. All products are sold strictly for laboratory research use only
              (RUO). Please review these terms carefully before engaging with our platform.
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
                      <h4 className="text-sm font-semibold text-amber-900 mb-1">
                        For Laboratory Research Use Only
                      </h4>
                      <p className="text-sm text-amber-800/80 leading-relaxed">
                        All products sold by Clariven Labs are supplied strictly FOR LABORATORY RESEARCH
                        USE ONLY (RUO). They are not drugs, foods, cosmetics, dietary supplements, or
                        medical devices, and are NOT for human or animal consumption. By creating an
                        account, you confirm that you are a qualified research professional or institution
                        and will use these materials solely for in-vitro laboratory research.
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
                        By accessing or using the Clariven Labs website (&quot;clarivenlabs.com&quot;), customer portal,
                        or any services provided by Clariven Labs LLC, a Wyoming limited liability company
                        (&quot;Company,&quot; &quot;Clariven Labs,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), you agree to be bound by
                        these Terms of Service (&quot;Terms&quot;). If you do not agree with any part of these Terms,
                        you must discontinue use of our services immediately.
                      </p>
                      <p>
                        These Terms constitute a legally binding agreement between you (or the organization
                        you represent) and Clariven Labs. By placing an order, you represent that you have the
                        authority to bind your organization to these Terms and that you are acquiring all
                        products solely for laboratory research use only (RUO).
                      </p>
                    </div>
                  </div>
                </FadeIn>

                {/* Section 2 */}
                <FadeIn>
                  <div id="ruo">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">2</span>
                      Research Use Only
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed space-y-4">
                      <div className="p-5 rounded-2xl bg-cl-navy text-white/90 border border-cl-navy">
                        <p className="text-sm leading-relaxed font-semibold text-white mb-2">
                          ALL PRODUCTS ARE SOLD FOR LABORATORY RESEARCH USE ONLY (RUO).
                        </p>
                        <p className="text-sm leading-relaxed text-white/70">
                          The products offered by Clariven Labs are research chemicals and reference
                          materials intended exclusively for laboratory and in-vitro scientific research
                          conducted by qualified professionals. They are NOT drugs, foods, cosmetics,
                          dietary supplements, or medical devices. They are NOT for human or animal
                          consumption and are NOT intended to diagnose, treat, cure, or prevent any
                          disease or condition.
                        </p>
                      </div>
                      <p>
                        Products are not approved or evaluated by the U.S. Food and Drug Administration for
                        any use in humans or animals. No product offered by Clariven Labs may be used as,
                        or in the preparation of, any article intended for human or animal use. Buyer is
                        solely responsible for determining whether a given material is suitable and lawful
                        for Buyer&apos;s intended research application.
                      </p>
                      <ul className="space-y-1.5 text-sm">
                        {[
                          'Products are supplied as research-grade materials for in-vitro laboratory research only.',
                          'Products must not be administered to, ingested by, or otherwise introduced into the body of any human or animal.',
                          'Products carry no representation of suitability for any human, therapeutic, or research-subject application.',
                          'Any use outside controlled laboratory research is strictly prohibited and is undertaken at the user’s sole risk.',
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

                {/* Section 3 */}
                <FadeIn>
                  <div id="eligibility">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">3</span>
                      Account Eligibility
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed space-y-4">
                      <p>
                        To create an account and purchase products from Clariven Labs, you must meet
                        the following requirements:
                      </p>
                      <ul className="space-y-1.5 text-sm">
                        {[
                          'Be a qualified research professional, or an authorized representative of a research institution, laboratory, university, or commercial research organization',
                          'Have the technical training and facilities to handle, store, and dispose of research chemicals safely and lawfully',
                          'Acquire products solely for legitimate in-vitro laboratory research and for no other purpose',
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
                        Clariven Labs reserves the right to verify a buyer&apos;s research credentials and
                        intended use at any time and to suspend or terminate accounts that fail to meet
                        eligibility requirements. Providing false or misleading information, or indicating
                        an intent to use products for any non-research purpose, may result in immediate
                        order cancellation, account termination, and referral to appropriate authorities.
                      </p>
                    </div>
                  </div>
                </FadeIn>

                {/* Section 4 */}
                <FadeIn>
                  <div id="buyer-representations">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">4</span>
                      Buyer Representations &amp; Obligations
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed space-y-4">
                      <p>
                        By placing an order, you represent, warrant, and covenant on your own behalf and on
                        behalf of any organization you represent that:
                      </p>
                      <ul className="space-y-1.5 text-sm">
                        {[
                          'You are a qualified research professional or institution acquiring products solely for laboratory research use only (RUO).',
                          'You will use all products solely for in-vitro and laboratory research and for no other purpose.',
                          'You will NOT administer, give, or apply any product to humans or animals, and will not ingest or consume any product.',
                          'You will NOT resell, distribute, or otherwise supply any product for human or animal use, or for any consumer, food, cosmetic, or supplement application.',
                          'You will handle, label, store, transport, and dispose of all products in accordance with all applicable federal, state, local, and international laws and with sound institutional and laboratory safety policies.',
                          'You assume all risk and liability for the receipt, possession, handling, use, and disposal of the products, and for the results of any research conducted with them.',
                          'You are not a consumer purchasing for personal use, and you are not acquiring products on behalf of any person who intends human or animal use.',
                        ].map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <ChevronRight className="w-3.5 h-3.5 text-cl-teal mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      <p>
                        These representations are a material condition of every sale. Clariven Labs relies on
                        them in agreeing to supply products and may refuse or cancel any order if it believes,
                        in its sole discretion, that a product may be used outside of laboratory research.
                      </p>
                    </div>
                  </div>
                </FadeIn>

                {/* Section 5 */}
                <FadeIn>
                  <div id="product-use">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">5</span>
                      Product Use &amp; Restrictions
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed space-y-4">
                      <p>
                        All products sold by Clariven Labs are intended exclusively for in-vitro laboratory
                        research conducted by qualified professionals. The following use rules apply:
                      </p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {[
                          { title: 'Laboratory Research', desc: 'Products may be used only for controlled, in-vitro scientific research in an appropriately equipped laboratory by trained personnel.' },
                          { title: 'No Living-Subject Use', desc: 'Products may NOT be administered to, ingested by, or otherwise introduced into any human or animal, and are not for any in-vivo application.' },
                          { title: 'Handling & Disposal', desc: 'Buyer must store, handle, and dispose of products per applicable law and institutional and laboratory safety policies, treating them as hazardous research chemicals.' },
                          { title: 'Resale', desc: 'Resale or redistribution of Clariven Labs products requires a separate written agreement. Any onward supply for human or animal use is strictly prohibited and may violate state and federal law.' },
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

                {/* Section 6 */}
                <FadeIn>
                  <div id="orders">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">6</span>
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
                          'Clariven Labs reserves the right to cancel any order if research-use eligibility verification fails or payment is not received.',
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

                {/* Section 7 */}
                <FadeIn>
                  <div id="shipping">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">7</span>
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
                            Due to the research-chemical nature of our products, returns are restricted to
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

                {/* Section 8 */}
                <FadeIn>
                  <div id="warranty">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">8</span>
                      Warranty Disclaimer
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed space-y-4">
                      <p>
                        Products are supplied <strong>&quot;AS IS&quot;</strong> and <strong>&quot;WITH ALL FAULTS&quot;</strong>{' '}
                        as research-grade materials for laboratory research use only. Except for a limited
                        warranty, if any, that a product conforms to the specifications stated on its
                        certificate of analysis at the time of shipment, Clariven Labs makes no warranties of
                        any kind, whether express, implied, statutory, or otherwise.
                      </p>
                      <p>
                        To the maximum extent permitted by law, Clariven Labs specifically disclaims all
                        implied warranties of merchantability, fitness for a particular purpose, title, and
                        non-infringement. <strong>Clariven Labs gives no warranty whatsoever that any product
                        is safe or fit for any human, research-subject, or non-laboratory use, and no
                        statement, document, or specification provided by Clariven Labs shall be construed as
                        a representation of suitability for any such use.</strong> Buyer is solely responsible
                        for confirming that each product is suitable for Buyer&apos;s intended research and for
                        validating results obtained from its use.
                      </p>
                    </div>
                  </div>
                </FadeIn>

                {/* Section 9 */}
                <FadeIn>
                  <div id="intellectual-property">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">9</span>
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
                        use of product documentation (COAs, spec sheets) is permitted for internal laboratory
                        research purposes.
                      </p>
                    </div>
                  </div>
                </FadeIn>

                {/* Section 10 */}
                <FadeIn>
                  <div id="prohibited">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">10</span>
                      Prohibited Conduct
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed space-y-4">
                      <p>You agree not to:</p>
                      <ul className="space-y-1.5 text-sm">
                        {[
                          'Use products for any purpose other than in-vitro laboratory research',
                          'Administer, give, or apply any product to humans or animals, or ingest or consume any product',
                          'Resell, redistribute, or supply products for human or animal use, or for any consumer, food, cosmetic, or supplement application',
                          'Provide false, misleading, or fraudulent information about your identity, credentials, or intended use',
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

                {/* Section 11 */}
                <FadeIn>
                  <div id="liability">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">11</span>
                      Limitation of Liability
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed space-y-4">
                      <p>
                        Clariven Labs supplies all products as research-grade materials for laboratory
                        research use only. To the maximum extent permitted by law:
                      </p>
                      <ul className="space-y-1.5 text-sm">
                        {[
                          'We are not liable for any product misuse, improper storage, or any use of products in or on humans or animals, or any use beyond in-vitro laboratory research',
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

                {/* Section 12 */}
                <FadeIn>
                  <div id="indemnification">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">12</span>
                      Indemnification
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed">
                      <p>
                        You agree to indemnify, defend, and hold harmless Clariven Labs, its officers,
                        directors, employees, agents, and affiliates from and against any and all claims,
                        damages, losses, liabilities, costs, and expenses (including reasonable attorneys&apos;
                        fees) arising from or related to: (a) your use, handling, storage, or disposal of our
                        products; (b) any misuse of products, including any administration to or use in or on
                        any human or animal, or any use outside in-vitro laboratory research, whether by you or
                        by any party to whom you transfer products; (c) your violation of these Terms or of any
                        of your representations regarding research use; (d) your violation of any applicable law
                        or regulation; or (e) your infringement of any intellectual property or other right of
                        any third party. This obligation survives termination of your account and these Terms.
                      </p>
                    </div>
                  </div>
                </FadeIn>

                {/* Section 13 */}
                <FadeIn>
                  <div id="disputes">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">13</span>
                      Governing Law &amp; Dispute Resolution
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed space-y-4">
                      <p>
                        These Terms are governed by the laws of the State of Wyoming, without regard to its
                        conflict of law principles. The parties consent to the exclusive jurisdiction and
                        venue of the state and federal courts located in Cheyenne, Wyoming for any dispute
                        not resolved under the process below. Any dispute arising under these Terms shall be
                        resolved as follows:
                      </p>
                      <div className="space-y-3">
                        {[
                          { step: '1', title: 'Informal Resolution', desc: 'Parties will attempt to resolve disputes through good-faith negotiations for a period of 30 days.' },
                          { step: '2', title: 'Mediation', desc: 'If informal resolution fails, disputes will be submitted to mediation in Cheyenne, Wyoming, under the rules of the American Arbitration Association.' },
                          { step: '3', title: 'Arbitration or Courts', desc: 'Unresolved disputes will proceed to binding arbitration in Cheyenne, Wyoming, or, where arbitration does not apply, to the state or federal courts located in Cheyenne, Wyoming. Each party bears its own costs unless the arbitrator or court determines otherwise.' },
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

                {/* Section 14 */}
                <FadeIn>
                  <div id="regulatory">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">14</span>
                      Regulatory Disclaimer &amp; No Advice
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed space-y-4">
                      <div className="p-5 rounded-2xl bg-cl-gray-50 border border-cl-gray-100">
                        <p className="text-sm leading-relaxed">
                          The information provided on this website is for general informational purposes only
                          and does not constitute medical, scientific, regulatory, or legal advice. Nothing
                          on this site is a recommendation to use any product in any human or animal, and no
                          product is offered or sold for any such use.
                        </p>
                        <p className="text-sm leading-relaxed mt-3">
                          Products are research chemicals that have not been approved or evaluated by the U.S.
                          Food and Drug Administration for safety or efficacy in humans or animals. They are
                          not drugs, foods, cosmetics, dietary supplements, or medical devices, and are not
                          intended to diagnose, treat, cure, or prevent any disease. Buyer is solely
                          responsible for complying with all laws and regulations applicable to the purchase,
                          possession, use, and disposal of research chemicals in Buyer&apos;s jurisdiction.
                        </p>
                        <p className="text-sm leading-relaxed mt-3">
                          Product descriptions, specifications, and application notes are provided for
                          informational purposes only and should not be construed as guarantees of research
                          outcomes or as any representation that a product is fit for any non-laboratory use.
                        </p>
                      </div>
                    </div>
                  </div>
                </FadeIn>

                {/* Section 15 */}
                <FadeIn>
                  <div id="modifications">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">15</span>
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

                {/* Section 16 */}
                <FadeIn>
                  <div id="contact">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">16</span>
                      Contact
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed space-y-4">
                      <p>
                        For questions regarding these Terms of Service, please contact:
                      </p>
                      <div className="p-6 rounded-2xl bg-cl-gray-50 border border-cl-gray-100">
                        <p className="font-semibold text-cl-navy mb-1">Clariven Labs LLC — Legal Department</p>
                        <p className="text-sm space-y-1">
                          <span className="block">Email: <a href="mailto:legal@clarivenlabs.com" className="text-cl-teal hover:text-cl-teal-light transition-colors">legal@clarivenlabs.com</a></span>
                          <span className="block">Clariven Labs LLC, a Wyoming limited liability company</span>
                          <span className="block">Address: Attn: Legal Department — Clariven Labs LLC, Wyoming (registered address available on request)</span>
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
