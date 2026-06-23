'use client';

import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  Eye,
  Server,
  UserCheck,
  FileText,
  Mail,
  ChevronRight,
  ArrowRight,
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
  { id: 'information-collected', label: 'Information We Collect' },
  { id: 'how-we-use', label: 'How We Use Information' },
  { id: 'information-sharing', label: 'Information Sharing' },
  { id: 'data-security', label: 'Data Security' },
  { id: 'cookies', label: 'Cookies & Tracking' },
  { id: 'data-retention', label: 'Data Retention' },
  { id: 'your-rights', label: 'Your Rights' },
  { id: 'scope', label: 'Scope & Governing Law' },
  { id: 'children', label: 'Children\'s Privacy' },
  { id: 'changes', label: 'Policy Changes' },
  { id: 'contact', label: 'Contact Us' },
];

export default function PrivacyPage() {
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
              <span className="text-white/70 text-sm font-medium">Privacy Policy</span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cl-teal/20 to-cl-blue/20 border border-white/10 flex items-center justify-center">
                <Shield className="w-7 h-7 text-cl-teal" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                  Privacy Policy
                </h1>
                <p className="text-white/40 text-sm mt-1">
                  Last updated: May 2026 &middot; Draft — pending legal review
                </p>
              </div>
            </div>

            <p className="text-lg text-white/50 max-w-2xl leading-relaxed">
              At Clariven Labs, protecting the privacy and security of our customers&apos;
              information is fundamental to our business. This policy describes how we collect,
              use, and safeguard your data.
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
                  <h4 className="text-sm font-semibold text-cl-navy mb-1">Privacy Questions?</h4>
                  <p className="text-xs text-cl-gray-500 leading-relaxed mb-3">
                    Contact our Privacy Officer for any data-related inquiries.
                  </p>
                  <a
                    href="mailto:privacy@clarivenlabs.com"
                    className="text-cl-teal text-sm font-medium hover:text-cl-teal-light transition-colors"
                  >
                    privacy@clarivenlabs.com
                  </a>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 max-w-3xl">
              <div className="space-y-12">
                {/* Highlights */}
                <FadeIn>
                  <div className="grid sm:grid-cols-3 gap-4 pb-10 border-b border-cl-gray-100">
                    {[
                      { icon: Lock, title: 'Encrypted', desc: 'Information you send us is encrypted in transit' },
                      { icon: Eye, title: 'No Selling', desc: 'We never sell personal information to third parties' },
                      { icon: UserCheck, title: 'Your Control', desc: 'Access, correct, or delete your data anytime' },
                    ].map((item, i) => (
                      <div key={item.title} className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cl-teal/10 flex items-center justify-center shrink-0">
                          <item.icon className="w-5 h-5 text-cl-teal" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-cl-navy">{item.title}</h4>
                          <p className="text-xs text-cl-gray-500 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </FadeIn>

                {/* Section 1 */}
                <FadeIn>
                  <div id="information-collected">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">1</span>
                      Information We Collect
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed space-y-4">
                      <p>
                        Clariven Labs LLC, a Wyoming limited liability company (&quot;we,&quot; &quot;us,&quot; or
                        &quot;our&quot;), collects information you provide directly and information generated through
                        your use of our services. We are committed to collecting only the minimum data
                        necessary to serve you effectively. We collect business and contact information about
                        research buyers; we do not collect patient or health records, and this policy does not
                        govern any such information.
                      </p>
                      <div>
                        <h3 className="text-sm font-semibold text-cl-navy mb-2">Information You Provide</h3>
                        <ul className="space-y-1.5 text-sm">
                          {[
                            'Contact information: name, email address, phone number, mailing address',
                            'Research-buyer details: institution or company name, role, and area of research',
                            'Eligibility information you submit to confirm you are a qualified research buyer',
                            'Order information: product selections, quantities, shipping preferences',
                            'Communication records: inquiries, support tickets, feedback',
                            'Account credentials: username and encrypted password',
                          ].map((item) => (
                            <li key={item} className="flex items-start gap-2">
                              <ChevronRight className="w-3.5 h-3.5 text-cl-teal mt-0.5 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-cl-navy mb-2">Automatically Collected Information</h3>
                        <ul className="space-y-1.5 text-sm">
                          {[
                            'Device and browser information (type, version, operating system)',
                            'IP address and approximate geographic location',
                            'Pages visited, time spent, and navigation patterns',
                            'Referring website or search terms used to find us',
                          ].map((item) => (
                            <li key={item} className="flex items-start gap-2">
                              <ChevronRight className="w-3.5 h-3.5 text-cl-teal mt-0.5 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </FadeIn>

                {/* Section 2 */}
                <FadeIn>
                  <div id="how-we-use">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">2</span>
                      How We Use Your Information
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed space-y-4">
                      <p>We use collected information for the following purposes:</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {[
                          { title: 'Order Fulfillment', desc: 'Processing orders, managing shipments, and providing order status updates' },
                          { title: 'Account Management', desc: 'Creating and maintaining your account, verifying research-buyer eligibility, managing preferences' },
                          { title: 'Customer Support', desc: 'Responding to inquiries, resolving issues, providing technical product information' },
                          { title: 'Compliance', desc: 'Confirming research-use eligibility, meeting legal and regulatory requirements, maintaining audit trails' },
                          { title: 'Communications', desc: 'Sending product updates, compliance notices, and relevant industry information' },
                          { title: 'Service Improvement', desc: 'Analyzing usage patterns to improve website functionality and user experience' },
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

                {/* Section 3 */}
                <FadeIn>
                  <div id="information-sharing">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">3</span>
                      Information Sharing
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed space-y-4">
                      <p>
                        We do not sell, rent, or trade your personal information. We may share information
                        only in the following limited circumstances:
                      </p>
                      <ul className="space-y-3 text-sm">
                        {[
                          { title: 'Service Providers', desc: 'Trusted partners who assist with shipping, payment processing, analytics, and infrastructure — bound by strict confidentiality agreements.' },
                          { title: 'Legal & Regulatory Authorities', desc: 'When required by law, subpoena, court order, or a lawful government request, or to comply with applicable regulatory requirements.' },
                          { title: 'Eligibility Verification', desc: 'Verification services used to confirm that an account holder is a qualified research buyer for account-eligibility purposes.' },
                          { title: 'Business Transfers', desc: 'In connection with a merger, acquisition, or sale of assets — with advance notice provided to affected accounts.' },
                        ].map((item) => (
                          <li key={item.title}>
                            <strong className="text-cl-navy">{item.title}:</strong>{' '}
                            {item.desc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </FadeIn>

                {/* Section 4 */}
                <FadeIn>
                  <div id="data-security">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">4</span>
                      Data Security
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed space-y-4">
                      <p>
                        We implement comprehensive security measures to protect your information against
                        unauthorized access, alteration, disclosure, or destruction. Our security program includes:
                      </p>
                      <div className="p-6 rounded-2xl bg-cl-gray-50 border border-cl-gray-100">
                        <div className="grid sm:grid-cols-2 gap-4">
                          {[
                            'Encryption in transit for information you send us',
                            'Access limited to people who need it to do their work',
                            'Multi-factor authentication on administrative access',
                            'Reputable, security-conscious infrastructure providers',
                            'Prompt review and response if an issue is reported',
                          ].map((item) => (
                            <div key={item} className="flex items-start gap-2">
                              <Shield className="w-4 h-4 text-cl-teal mt-0.5 shrink-0" />
                              <span className="text-sm">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeIn>

                {/* Section 5 */}
                <FadeIn>
                  <div id="cookies">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">5</span>
                      Cookies &amp; Tracking Technologies
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed space-y-4">
                      <p>
                        We use cookies and similar technologies to improve your experience on our website.
                        These include:
                      </p>
                      <ul className="space-y-3 text-sm">
                        {[
                          { title: 'Essential Cookies', desc: 'Required for core functionality such as login sessions, shopping cart, and security features. These cannot be disabled.' },
                          { title: 'Analytics Cookies', desc: 'Help us understand how visitors interact with our site so we can improve performance and content. Data is aggregated and anonymized.' },
                          { title: 'Preference Cookies', desc: 'Remember your settings and preferences (language, region, display options) for a more personalized experience.' },
                        ].map((item) => (
                          <li key={item.title}>
                            <strong className="text-cl-navy">{item.title}:</strong>{' '}
                            {item.desc}
                          </li>
                        ))}
                      </ul>
                      <p>
                        You can control cookie preferences through your browser settings. Note that disabling
                        essential cookies may impact site functionality.
                      </p>
                    </div>
                  </div>
                </FadeIn>

                {/* Section 6 */}
                <FadeIn>
                  <div id="data-retention">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">6</span>
                      Data Retention
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed space-y-4">
                      <p>
                        We retain your information only as long as necessary to fulfill the purposes described
                        in this policy, comply with legal obligations, and resolve disputes. Specific retention
                        periods include:
                      </p>
                      <ul className="space-y-1.5 text-sm">
                        {[
                          'Active account data: retained for the duration of the business relationship plus 3 years',
                          'Order and transaction records: 7 years per regulatory requirements',
                          'Eligibility verification records: duration of account plus 5 years',
                          'Analytics data: 26 months in aggregated, anonymized form',
                          'Communication records: 3 years from last interaction',
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
                  <div id="your-rights">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">7</span>
                      Your Rights
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed space-y-4">
                      <p>
                        Depending on your jurisdiction, you may have the following rights regarding your
                        personal information:
                      </p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {[
                          { title: 'Access', desc: 'Request a copy of the personal data we hold about you' },
                          { title: 'Correction', desc: 'Request correction of inaccurate or incomplete data' },
                          { title: 'Deletion', desc: 'Request deletion of your personal data (subject to legal retention requirements)' },
                          { title: 'Portability', desc: 'Receive your data in a structured, machine-readable format' },
                          { title: 'Restriction', desc: 'Request limitation of processing in certain circumstances' },
                          { title: 'Objection', desc: 'Object to processing based on legitimate interests or direct marketing' },
                        ].map((item) => (
                          <div key={item.title} className="p-4 rounded-xl bg-cl-gray-50 border border-cl-gray-100">
                            <h4 className="text-sm font-semibold text-cl-navy mb-1">{item.title}</h4>
                            <p className="text-xs text-cl-gray-500 leading-relaxed">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                      <p>
                        To exercise any of these rights, contact us at{' '}
                        <a href="mailto:privacy@clarivenlabs.com" className="text-cl-teal hover:text-cl-teal-light transition-colors font-medium">
                          privacy@clarivenlabs.com
                        </a>
                        . We will respond to verified requests within 30 days.
                      </p>
                    </div>
                  </div>
                </FadeIn>

                {/* Section 8 */}
                <FadeIn>
                  <div id="scope">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">8</span>
                      Scope &amp; Governing Law
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed space-y-4">
                      <p>
                        Clariven Labs sells research-use-only materials to research professionals and
                        institutions. We collect business and account information from research buyers; we do
                        not collect, process, or store patient records or health information, and the
                        information we handle is not health data. This policy governs that business and
                        account information only.
                      </p>
                      <p>
                        This Privacy Policy and any dispute relating to it are governed by the laws of the
                        State of Wyoming, without regard to its conflict of law principles, and the state and
                        federal courts located in Cheyenne, Wyoming have exclusive jurisdiction over such
                        matters. Where other privacy laws apply to you based on your residence or location, we
                        honor the rights those laws grant, as described in the &quot;Your Rights&quot; section above.
                      </p>
                    </div>
                  </div>
                </FadeIn>

                {/* Section 9 */}
                <FadeIn>
                  <div id="children">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">9</span>
                      Children&apos;s Privacy
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed">
                      <p>
                        Our services are designed for qualified research professionals and research
                        institutions. We do not knowingly collect personal information from individuals under
                        the age of 18. If we become aware that we have inadvertently collected data from a
                        minor, we will promptly delete it.
                      </p>
                    </div>
                  </div>
                </FadeIn>

                {/* Section 10 */}
                <FadeIn>
                  <div id="changes">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">10</span>
                      Policy Changes
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed space-y-4">
                      <p>
                        We may update this Privacy Policy periodically to reflect changes in our practices,
                        technologies, legal requirements, or other factors. When we make material changes, we
                        will notify account holders via email and update the &quot;Last updated&quot; date at the
                        top of this page.
                      </p>
                      <p>
                        We encourage you to review this policy periodically. Continued use of our services
                        after changes constitutes acceptance of the updated policy.
                      </p>
                    </div>
                  </div>
                </FadeIn>

                {/* Section 11 */}
                <FadeIn>
                  <div id="contact">
                    <h2 className="text-xl font-bold text-cl-navy mb-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-cl-teal bg-cl-teal/10 w-8 h-8 rounded-lg flex items-center justify-center">11</span>
                      Contact Us
                    </h2>
                    <div className="text-cl-gray-600 text-[15px] leading-relaxed space-y-4">
                      <p>
                        For questions, concerns, or requests related to this Privacy Policy or our data
                        practices, please contact:
                      </p>
                      <div className="p-6 rounded-2xl bg-cl-gray-50 border border-cl-gray-100">
                        <p className="font-semibold text-cl-navy mb-1">Clariven Labs LLC — Privacy Officer</p>
                        <p className="text-sm space-y-1">
                          <span className="block">Email: <a href="mailto:privacy@clarivenlabs.com" className="text-cl-teal hover:text-cl-teal-light transition-colors">privacy@clarivenlabs.com</a></span>
                          <span className="block">Clariven Labs LLC, a Wyoming limited liability company</span>
                          <span className="block">Address: Attn: Privacy Officer — Clariven Labs LLC, Wyoming (registered address available on request)</span>
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
              Review our complete legal documentation for comprehensive coverage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/terms"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-cl-gray-200 text-cl-navy font-semibold hover:border-cl-teal/30 hover:bg-white transition-all"
              >
                <FileText className="w-5 h-5" />
                Terms of Service
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
