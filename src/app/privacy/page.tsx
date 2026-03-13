'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="pt-[72px] bg-white">
      <section className="py-16 sm:py-20 bg-cl-navy">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Privacy Policy</h1>
            <p className="text-white/40 text-sm">Last updated: March 2026</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 prose prose-gray max-w-none">
          <div className="space-y-8 text-cl-gray-600 text-sm leading-relaxed">
            <div>
              <h2 className="text-xl font-semibold text-cl-navy mb-3">1. Information We Collect</h2>
              <p>Clariven Labs (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects information you provide when you request product information, create an account, place orders, or contact us. This may include your name, email address, phone number, organization name, professional credentials, and order history.</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-cl-navy mb-3">2. How We Use Your Information</h2>
              <p>We use your information to process orders, provide customer support, send relevant product and compliance updates, improve our services, and comply with legal and regulatory requirements. We do not sell your personal information to third parties.</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-cl-navy mb-3">3. Information Sharing</h2>
              <p>We may share information with service providers who assist in our operations (shipping, payment processing, analytics), regulatory authorities when required by law, and professional verification services to validate healthcare credentials.</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-cl-navy mb-3">4. Data Security</h2>
              <p>We implement industry-standard security measures including SSL encryption, access controls, and regular security assessments to protect your information. Our systems are designed to comply with applicable healthcare data protection requirements.</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-cl-navy mb-3">5. Your Rights</h2>
              <p>You may request access to, correction of, or deletion of your personal information by contacting us at privacy@clarivenlabs.com. We will respond to valid requests within 30 days.</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-cl-navy mb-3">6. Contact Us</h2>
              <p>For privacy-related inquiries, contact us at privacy@clarivenlabs.com or write to Clariven Labs, Attn: Privacy Officer, Scottsdale, AZ.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
