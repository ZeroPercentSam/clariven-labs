'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Package,
  FileText,
  BarChart3,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function PortalPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="pt-[72px] min-h-screen bg-cl-navy relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cl-teal/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cl-blue/8 rounded-full blur-[120px]" />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-16">
        {/* ── LEFT: Login Form ── */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-cl-teal text-xs font-medium mb-4">
              <Lock className="w-3 h-3" />
              Secure Client Access
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Client Portal
            </h1>
            <p className="text-white/40 text-sm">
              Access your account, orders, COAs, and analytics dashboard.
            </p>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="space-y-5"
          >
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@organization.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-cl-teal/40 focus:border-cl-teal transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="block text-sm font-medium text-white/70">Password</label>
                <button type="button" className="text-xs text-cl-teal hover:text-cl-teal-light transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-cl-teal/40 focus:border-cl-teal transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember + Sign in */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-cl-teal focus:ring-cl-teal/30"
              />
              <label htmlFor="remember" className="text-sm text-white/50">
                Keep me signed in
              </label>
            </div>

            <button
              type="submit"
              className="group w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-cl-teal text-white font-semibold hover:bg-cl-teal-light transition-all shadow-lg shadow-cl-teal/20"
            >
              Sign In to Portal
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-white/40">
              Don&apos;t have an account?{' '}
              <Link href="/contact" className="text-cl-teal hover:text-cl-teal-light font-medium transition-colors">
                Request Access
              </Link>
            </p>
          </div>

          {/* Security note */}
          <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <Shield className="w-5 h-5 text-cl-teal shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-white/40 leading-relaxed">
                Protected by 256-bit SSL encryption. Access is restricted to verified
                healthcare professionals and authorized organizational representatives.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── RIGHT: Portal Features ── */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1 max-w-lg"
        >
          <h2 className="text-xl font-semibold text-white mb-6">
            Your Command Center
          </h2>

          <div className="space-y-4">
            {[
              { icon: Package, title: 'Order Management', description: 'Place, track, and manage orders across all locations. View order history and set up recurring orders.' },
              { icon: FileText, title: 'COA Library', description: 'Access batch-specific Certificates of Analysis instantly. Search by product, lot number, or date.' },
              { icon: BarChart3, title: 'Usage Analytics', description: 'Track spending, ordering patterns, and usage trends across your organization with real-time dashboards.' },
              { icon: Clock, title: 'Reorder Automation', description: 'Set up automatic reorder points and scheduled orders to ensure you never run low on critical products.' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-4 p-5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.06] transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-cl-teal/10 flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5 text-cl-teal" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">{feature.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Support info */}
          <div className="mt-8 p-5 rounded-xl bg-cl-teal/10 border border-cl-teal/20">
            <p className="text-sm text-cl-teal font-medium mb-1">Need help accessing your portal?</p>
            <p className="text-xs text-white/40">
              Contact your account specialist or call (888) 555-0142 ext 3 for portal support.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
