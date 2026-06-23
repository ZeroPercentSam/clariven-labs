'use client';

import Link from 'next/link';
import { Dna } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-cl-navy pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cl-teal to-cl-blue flex items-center justify-center">
                <Dna className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-lg tracking-wider">
                CLARIVEN<span className="text-cl-teal">LABS</span>
              </span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-6">
              Research-use-only brand &amp; compliance consulting — helping laboratories and research
              companies launch compliant RUO product programs.
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Quality & Compliance', href: '/quality' },
                { label: 'Resources', href: '/resources' },
                { label: 'Contact', href: '/contact' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-white/40 text-sm hover:text-cl-teal transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Who We Serve */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
              Who We Serve
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Academic Labs', href: '/clinics' },
                { label: 'Biotech & Industry', href: '/pharmacies' },
                { label: 'Research Institutions', href: '/research' },
                { label: 'Enterprise', href: '/enterprise' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-white/40 text-sm hover:text-cl-teal transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Client Portal', href: '/portal' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-white/40 text-sm hover:text-cl-teal transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/30 text-xs text-center md:text-left">
              &copy; {new Date().getFullYear()} Clariven Labs, LLC. All rights reserved.
            </p>
            <p className="text-white/20 text-xs text-center md:text-right max-w-xl leading-relaxed">
              For Research Use Only. Products sold by Clariven Labs LLC are intended for
              laboratory research use only — not for human or animal consumption. They are not
              drugs, foods, cosmetics, or medical devices, and are not intended to diagnose,
              treat, cure, or prevent any disease. These statements have not been evaluated by the FDA.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
