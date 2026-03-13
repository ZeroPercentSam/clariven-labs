'use client';

import Link from 'next/link';
import { Dna } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-cl-navy pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
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
              Premium pharmaceutical-grade peptides for healthcare providers,
              compounding pharmacies, and research institutions.
            </p>
            <div className="flex gap-3">
              {['LinkedIn', 'Twitter', 'Instagram'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <span className="text-white/50 text-xs font-medium">
                    {social[0]}
                    {social[1]}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
              Products
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Semaglutide', href: '/products/semaglutide' },
                { label: 'BPC-157', href: '/products/bpc-157' },
                { label: 'CJC-1295', href: '/products/cjc-1295-dac' },
                { label: 'Thymosin Alpha 1', href: '/products/thymosin-alpha-1' },
                { label: 'Epitalon', href: '/products/epitalon' },
                { label: 'All Peptides', href: '/products' },
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
                { label: 'Clinics & Providers', href: '/clinics' },
                { label: 'Compounding Pharmacies', href: '/pharmacies' },
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
              Disclaimer: Products sold by Clariven Labs are intended for research, educational,
              and clinical compounding purposes only. These statements have not been evaluated
              by the FDA. Products are not intended to diagnose, treat, cure, or prevent any disease.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
