"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Menu,
  X,
  Building2,
  FlaskConical,
  Stethoscope,
  Landmark,
  ArrowRight,
  Shield,
  Dna,
} from "lucide-react";

const navItems = [
  { label: "Products", href: "/products" },
  {
    label: "Who We Serve",
    href: "#",
    children: [
      {
        label: "Clinics & Providers",
        href: "/clinics",
        description: "Anti-aging, functional medicine & wellness clinics",
        icon: Stethoscope,
      },
      {
        label: "Compounding Pharmacies",
        href: "/pharmacies",
        description: "503A & 503B licensed compounding facilities",
        icon: Building2,
      },
      {
        label: "Research Institutions",
        href: "/research",
        description: "Universities, labs & clinical research organizations",
        icon: FlaskConical,
      },
      {
        label: "Enterprise",
        href: "/enterprise",
        description: "Telemedicine platforms & large-scale operations",
        icon: Landmark,
      },
    ],
  },
  { label: "Quality & Compliance", href: "/quality" },
  { label: "About", href: "/about" },
  { label: "Resources", href: "/resources" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20);
  });

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleDropdownEnter = (label: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(label);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  return (
    <>
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-colors duration-500",
          scrolled
            ? "bg-[#0A1628]/85 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
            : "bg-[#0A1628]"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Top accent line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#0D9488] to-transparent opacity-60" />

        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <Link href="/" className="relative group flex items-center gap-3">
              {/* Logo icon — matches footer */}
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cl-teal to-cl-blue flex items-center justify-center flex-shrink-0">
                <Dna className="w-5 h-5 text-white" />
              </div>

              {/* Text mark */}
              <div className="flex flex-col leading-none">
                <span className="text-[17px] font-bold tracking-[0.28em] text-white">
                  CLARIVEN
                </span>
                <span className="text-[10px] font-semibold tracking-[0.5em] text-[#0D9488] mt-[1px]">
                  LABS
                </span>
              </div>

              {/* Hover underline */}
              <motion.div
                className="absolute -bottom-1 left-0 h-[1px] bg-gradient-to-r from-[#0D9488] to-transparent"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.children && handleDropdownEnter(item.label)}
                  onMouseLeave={() => item.children && handleDropdownLeave()}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "relative px-4 py-2 text-[13px] font-medium tracking-wide text-white/70 hover:text-white transition-colors duration-300 flex items-center gap-1.5 group",
                      activeDropdown === item.label && "text-white"
                    )}
                    onClick={(e) => {
                      if (item.children) e.preventDefault();
                    }}
                  >
                    <span>{item.label}</span>
                    {item.children && (
                      <ChevronDown
                        className={cn(
                          "w-3.5 h-3.5 transition-transform duration-300",
                          activeDropdown === item.label && "rotate-180"
                        )}
                      />
                    )}

                    {/* Hover indicator */}
                    <motion.span
                      className="absolute bottom-0 left-4 right-4 h-[1px] bg-[#0D9488]"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      style={{ originX: 0 }}
                    />
                  </Link>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {item.children && activeDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[420px]"
                        onMouseEnter={() => handleDropdownEnter(item.label)}
                        onMouseLeave={handleDropdownLeave}
                      >
                        <div className="bg-[#0E1B30]/95 backdrop-blur-2xl border border-white/[0.08] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
                          {/* Dropdown header */}
                          <div className="px-5 pt-4 pb-3 border-b border-white/[0.06]">
                            <p className="text-[10px] font-semibold tracking-[0.3em] text-[#0D9488] uppercase">
                              Solutions By Segment
                            </p>
                          </div>

                          <div className="p-2">
                            {item.children.map((child, idx) => {
                              const Icon = child.icon;
                              return (
                                <Link
                                  key={child.label}
                                  href={child.href}
                                  className="group flex items-start gap-3.5 px-3 py-3 rounded-lg hover:bg-white/[0.04] transition-all duration-200"
                                >
                                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0D9488]/20 to-[#1E40AF]/10 flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#0D9488]/20 group-hover:border-[#0D9488]/40 transition-colors">
                                    <Icon className="w-4 h-4 text-[#0D9488]" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[13px] font-medium text-white group-hover:text-[#14B8A6] transition-colors">
                                        {child.label}
                                      </span>
                                      <ArrowRight className="w-3 h-3 text-white/0 group-hover:text-[#0D9488] group-hover:translate-x-0.5 transition-all duration-200" />
                                    </div>
                                    <span className="text-[11px] text-white/40 leading-snug mt-0.5 block">
                                      {child.description}
                                    </span>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>

                          {/* Dropdown footer */}
                          <div className="px-5 py-3 bg-white/[0.02] border-t border-white/[0.06]">
                            <Link
                              href="/contact"
                              className="flex items-center gap-2 text-[11px] text-white/50 hover:text-[#D4A843] transition-colors"
                            >
                              <Shield className="w-3.5 h-3.5" />
                              <span>Not sure which solution fits? Talk to our team</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/portal"
                className="relative px-5 py-2 text-[12px] font-semibold tracking-wider text-[#D4A843] border border-[#D4A843]/30 rounded-lg hover:border-[#D4A843]/60 hover:bg-[#D4A843]/[0.06] transition-all duration-300 uppercase"
              >
                Client Portal
              </Link>

              <Link
                href="/contact"
                className="relative px-5 py-2 text-[12px] font-semibold tracking-wider text-white bg-[#0D9488] rounded-lg hover:bg-[#0D9488]/90 transition-all duration-300 uppercase group overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Request a Quote
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden relative w-10 h-10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Panel */}
            <motion.div
              className="absolute top-0 right-0 w-full max-w-sm h-full bg-[#0A1628] border-l border-white/[0.06] shadow-2xl overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Mobile header */}
              <div className="h-[72px] flex items-center justify-between px-6 border-b border-white/[0.06]">
                <div className="flex flex-col leading-none">
                  <span className="text-[15px] font-bold tracking-[0.28em] text-white">
                    CLARIVEN
                  </span>
                  <span className="text-[9px] font-semibold tracking-[0.5em] text-[#0D9488] mt-[1px]">
                    LABS
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white rounded-lg hover:bg-white/[0.05] transition-all"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile nav */}
              <div className="px-4 py-6 space-y-1">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                  >
                    {item.children ? (
                      <MobileDropdown item={item} onNavigate={() => setMobileOpen(false)} />
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="block px-4 py-3.5 text-[14px] font-medium text-white/70 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all"
                      >
                        {item.label}
                      </Link>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Mobile CTAs */}
              <div className="px-4 pt-4 pb-8 space-y-3 border-t border-white/[0.06] mx-4">
                <Link
                  href="/portal"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center px-5 py-3 text-[12px] font-semibold tracking-wider text-[#D4A843] border border-[#D4A843]/30 rounded-lg hover:border-[#D4A843]/60 transition-all uppercase"
                >
                  Client Portal
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center px-5 py-3 text-[12px] font-semibold tracking-wider text-white bg-[#0D9488] rounded-lg hover:bg-[#0D9488]/90 transition-all uppercase"
                >
                  Request a Quote
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Mobile Dropdown Sub-Component ─── */

interface MobileDropdownProps {
  item: (typeof navItems)[number];
  onNavigate: () => void;
}

function MobileDropdown({ item, onNavigate }: MobileDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-[14px] font-medium text-white/70 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all"
      >
        <span>{item.label}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-300",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && item.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pl-4 pr-2 pb-2 space-y-0.5">
              {item.children.map((child) => {
                const Icon = child.icon;
                return (
                  <Link
                    key={child.label}
                    href={child.href}
                    onClick={onNavigate}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/[0.04] transition-all group"
                  >
                    <div className="w-8 h-8 rounded-md bg-[#0D9488]/10 flex items-center justify-center flex-shrink-0 border border-[#0D9488]/20">
                      <Icon className="w-3.5 h-3.5 text-[#0D9488]" />
                    </div>
                    <div>
                      <span className="text-[13px] font-medium text-white/80 group-hover:text-[#14B8A6] transition-colors block">
                        {child.label}
                      </span>
                      <span className="text-[10px] text-white/30 block mt-0.5">
                        {child.description}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
