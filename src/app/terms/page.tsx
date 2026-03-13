'use client';

import { motion } from 'framer-motion';

export default function TermsPage() {
  return (
    <div className="pt-[72px] bg-white">
      <section className="py-16 sm:py-20 bg-cl-navy">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Terms of Service</h1>
            <p className="text-white/40 text-sm">Last updated: March 2026</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="space-y-8 text-cl-gray-600 text-sm leading-relaxed">
            <div>
              <h2 className="text-xl font-semibold text-cl-navy mb-3">1. Acceptance of Terms</h2>
              <p>By accessing or using the Clariven Labs website and services, you agree to be bound by these Terms of Service. Our products are intended for sale to licensed healthcare professionals, compounding pharmacies, and qualified research institutions only.</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-cl-navy mb-3">2. Account Eligibility</h2>
              <p>To create an account and purchase products, you must provide valid professional credentials. Clariven Labs reserves the right to verify credentials and decline accounts that do not meet eligibility requirements.</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-cl-navy mb-3">3. Product Use</h2>
              <p>All products are sold strictly for legitimate medical, pharmaceutical, or research purposes. Products labeled &quot;For Research Use Only&quot; are not intended for human consumption or clinical use without appropriate regulatory authorization.</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-cl-navy mb-3">4. Orders and Payment</h2>
              <p>All orders are subject to acceptance and product availability. Pricing is subject to change without notice. Payment terms are established per account agreement. Clariven Labs reserves the right to cancel any order.</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-cl-navy mb-3">5. Shipping and Returns</h2>
              <p>Shipping terms and return policies are outlined in your account agreement. Due to the nature of our products, returns may be restricted for safety and compliance reasons. Damaged or incorrect shipments should be reported within 48 hours of receipt.</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-cl-navy mb-3">6. Limitation of Liability</h2>
              <p>Clariven Labs provides products in accordance with published specifications. We are not liable for misuse of products, improper storage, or use beyond the intended application. Maximum liability shall not exceed the purchase price of the specific products in question.</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-cl-navy mb-3">7. Regulatory Disclaimer</h2>
              <p>The information provided on this website is for informational purposes only and does not constitute medical advice. Clariven Labs does not make therapeutic claims about its products. Healthcare providers are responsible for prescribing and administering products in accordance with applicable laws and regulations.</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-cl-navy mb-3">8. Contact</h2>
              <p>For questions about these Terms, contact legal@clarivenlabs.com.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
