"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { ArrowUpRight } from "lucide-react";

// ─── Mega Menu Data ──────────────────────────────────────────
const megaNavItems = [
  {
    label: "Services",
    href: "#services",
    columns: [
      {
        title: "Build",
        links: [
          { label: "Commerce Platforms", href: "#services" },
          { label: "AI & Automation", href: "#services" },
          { label: "CRM & Data", href: "#services" },
          { label: "Payments & Fintech", href: "#services" },
        ],
      },
      {
        title: "Grow",
        links: [
          { label: "Brand Strategy", href: "#services" },
          { label: "Lead Generation", href: "#services" },
          { label: "Cyber Security", href: "#services" },
          { label: "Business Consulting", href: "#services" },
        ],
      },
    ],
    features: [
      { image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80&fit=crop", title: "10 Services", link: "#services" },
      { image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&q=80&fit=crop", title: "Full Spectrum", link: "#services" },
    ],
  },
  {
    label: "Work",
    href: "#work",
    columns: [
      {
        title: "Industries",
        links: [
          { label: "Grocery & Food", href: "#work" },
          { label: "Fashion & Luxury", href: "#work" },
          { label: "Education", href: "#work" },
          { label: "Healthcare", href: "#work" },
        ],
      },
      {
        title: "Outcomes",
        links: [
          { label: "Case Studies", href: "#work" },
          { label: "Client Results", href: "#work" },
          { label: "Our Process", href: "#process" },
          { label: "FAQ", href: "#faq" },
        ],
      },
    ],
    features: [
      { image: "/images/screenshots/styledbymaryam.png", title: "Fashion E-Commerce", link: "#work" },
      { image: "/images/screenshots/vibrantminds.png", title: "EdTech Platform", link: "#work" },
    ],
  },
  {
    label: "Marketplace",
    href: "/marketplace",
    columns: [
      {
        title: "Solutions",
        links: [
          { label: "SaaS & Platform as a Service", href: "/marketplace" },
          { label: "Web & Product Development", href: "/marketplace" },
          { label: "Lead Generation & Growth", href: "/marketplace" },
          { label: "Digital Trust & Security", href: "/marketplace" },
        ],
      },
      {
        title: "Get Started",
        links: [
          { label: "Start a Project", href: "/get-started" },
          { label: "Pricing", href: "/get-started" },
          { label: "Book a Call", href: "mailto:cs@authentifactor.com?subject=Consultation%20Request" },
          { label: "Referral Programme", href: "/get-started" },
        ],
      },
    ],
    features: [
      { image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&q=80&fit=crop", title: "Our Solutions", link: "/marketplace" },
      { image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&q=80&fit=crop", title: "Start a Project", link: "/get-started" },
    ],
  },
];

const mobileNavLinks = [
  { label: "Services", href: "#services" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Work", href: "#work" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Get Started", href: "/get-started" },
];

export default function PlatformShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<number | null>(null);
  const megaTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  const handleMegaEnter = (idx: number) => {
    if (megaTimeoutRef.current) clearTimeout(megaTimeoutRef.current);
    setActiveMega(idx);
  };

  const handleMegaLeave = () => {
    megaTimeoutRef.current = setTimeout(() => setActiveMega(null), 150);
  };

  return (
    <div className="min-h-screen bg-[var(--cin-bg)]" data-theme="cinematic">
      {/* ─── Mega Menu Navbar ─── */}
      <motion.header
        className={`fixed z-50 transition-all duration-500 ${
          scrolled
            ? "top-3 left-3 right-3 rounded-2xl bg-[#1e1e1e]/85 shadow-2xl shadow-black/30 backdrop-blur-2xl"
            : "top-0 left-0 right-0 bg-transparent backdrop-blur-md"
        }`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mx-auto flex h-[68px] max-w-[1400px] items-center justify-between px-6 lg:px-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 z-[1002]">
            <Image
              src="/images/authentifactor-logo.png"
              alt="Authentifactor"
              width={375}
              height={375}
              className="h-12 w-auto"
              priority
            />
          </Link>

          {/* Desktop Mega Nav */}
          <nav className="hidden lg:flex items-center gap-0">
            {megaNavItems.map((item, idx) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => handleMegaEnter(idx)}
                onMouseLeave={handleMegaLeave}
              >
                <Link
                  href={item.href}
                  className={`block px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors whitespace-nowrap ${
                    activeMega === idx ? "text-[#f0ede8]" : "text-[#9e9a94] hover:text-[#f0ede8]"
                  }`}
                >
                  {item.label}
                </Link>

                {/* Mega dropdown */}
                {activeMega === idx && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-4 z-50"
                    onMouseEnter={() => handleMegaEnter(idx)}
                    onMouseLeave={handleMegaLeave}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="bg-[#252525]/95 backdrop-blur-xl shadow-2xl shadow-black/40 flex gap-8 p-7 min-w-[640px] max-w-[840px] rounded-xl"
                    >
                      {/* Link columns */}
                      <div className="flex gap-8 flex-1">
                        {item.columns.map((col) => (
                          <div key={col.title} className="min-w-[145px]">
                            <h4 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6b6762] mb-3">
                              {col.title}
                            </h4>
                            <ul className="space-y-2.5">
                              {col.links.map((link) => (
                                <li key={link.label}>
                                  <Link
                                    href={link.href}
                                    onClick={() => setActiveMega(null)}
                                    className="text-[13px] text-[#9e9a94] hover:text-[#2DD4A0] transition-colors"
                                  >
                                    {link.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {/* Featured images */}
                      {item.features && (
                        <div className="flex gap-2 shrink-0">
                          {item.features.map((feat) => (
                            <Link
                              key={feat.title}
                              href={feat.link}
                              onClick={() => setActiveMega(null)}
                              className="block w-[145px] relative overflow-hidden rounded-lg group"
                            >
                              <img
                                src={feat.image}
                                alt=""
                                className="w-full h-full object-cover aspect-[3/4] transition-transform duration-500 group-hover:scale-105"
                              />
                              <span className="absolute bottom-0 left-0 right-0 px-2.5 pb-2.5 pt-8 bg-gradient-to-t from-black/60 to-transparent text-white text-[11px] font-light italic tracking-wide">
                                {feat.title}
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3 z-[1002]">
            <Link
              href="/login"
              className="hidden lg:block text-[11px] font-medium uppercase tracking-[0.12em] text-[#9e9a94] hover:text-[#f0ede8] transition-colors"
            >
              Sign In
            </Link>
            <button
              onClick={() => router.push("/get-started")}
              className="hidden lg:block ml-2 bg-[#2DD4A0] px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#1e1e1e] hover:bg-[#1FA87D] transition-all cursor-pointer rounded-full"
            >
              Get Started
            </button>

            {/* Mobile toggle */}
            <button
              className="lg:hidden flex flex-col gap-[5px] p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              <span className={`block w-[22px] h-[1px] bg-[#9e9a94] transition-transform origin-center ${mobileOpen ? "translate-y-[3px] rotate-45" : ""}`} />
              <span className={`block w-[22px] h-[1px] bg-[#9e9a94] transition-transform origin-center ${mobileOpen ? "-translate-y-[3px] -rotate-45" : ""}`} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[#0e0e0e]"
          >
            <div className="flex flex-col justify-center min-h-full px-8 pt-24 pb-12">
              <ul className="space-y-0">
                {mobileNavLinks.map((link) => (
                  <li key={link.label} className="border-b border-[#2a2826] first:border-t first:border-[#2a2826]">
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between py-5 text-2xl font-light italic text-[#f0ede8] hover:text-[#2DD4A0] transition-colors group"
                    >
                      {link.label}
                      <span className="text-sm font-normal not-italic text-[#6b6762] group-hover:text-[#2DD4A0] group-hover:translate-x-1 transition-all">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-8 space-y-3">
                <Link
                  href="/get-started"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center bg-[#2DD4A0] text-[#1e1e1e] py-3.5 text-sm font-semibold uppercase tracking-wider rounded-full"
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center border border-[#f0ede8]/[0.06] text-[#9e9a94] py-3.5 text-sm font-medium uppercase tracking-wider rounded-full"
                >
                  Sign In
                </Link>
              </div>
              <p className="mt-10 text-center text-[10px] text-[#6b6762] uppercase tracking-[0.2em]">
                cs@authentifactor.com
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <main>{children}</main>

      {/* ─── Editorial Footer ─── */}
      <footer className="bg-[#0e0e0e] pt-24 pb-12">
        <div className="mx-auto max-w-6xl px-6">
          {/* ─── CTA Banner ─── */}
          <div className="rounded-2xl bg-white/[0.03] p-10 md:p-14 text-center mb-16">
            <h3 className="text-2xl md:text-3xl font-bold text-[#f0ede8] tracking-tight">
              Ready to architect your{" "}
              <span className="font-light italic text-[#2DD4A0]" style={{ fontFamily: "var(--font-serif)" }}>
                next move?
              </span>
            </h3>
            <p className="mt-4 text-sm text-[#9e9a94] max-w-md mx-auto">
              Tell us about your business. We&apos;ll map a strategy, scope the work, and move fast.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/get-started"
                className="group inline-flex items-center gap-2 rounded-full bg-[#2DD4A0] px-8 py-3.5 text-sm font-bold text-[#1e1e1e] shadow-lg shadow-[#2DD4A0]/25 transition-all hover:bg-[#1FA87D] hover:shadow-[#2DD4A0]/40 hover:scale-[1.02]"
              >
                Start a Project
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <a
                href="mailto:cs@authentifactor.com"
                className="inline-flex items-center gap-2 rounded-full border border-[#f0ede8]/[0.06] px-6 py-3 text-sm font-medium text-[#9e9a94] transition-colors hover:bg-white/[0.04] hover:text-[#f0ede8]"
              >
                Or email us directly
              </a>
            </div>
          </div>

          {/* ─── Logo + tagline ─── */}
          <div className="flex flex-col items-start gap-8 pb-12 md:flex-row md:items-center md:justify-between border-b border-[#2a2826]">
            <div>
              <Image
                src="/images/authentifactor-logo.png"
                alt="Authentifactor"
                width={375}
                height={375}
                className="h-16 w-auto"
              />
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#9e9a94]">
                Digital solution architects for ambitious brands.
                Commerce, AI, CRM, security, and strategy — unified.
              </p>
            </div>
            <a
              href="mailto:cs@authentifactor.com"
              className="text-sm text-[#9e9a94] hover:text-[#2DD4A0] transition-colors"
            >
              cs@authentifactor.com
            </a>
          </div>

          {/* ─── Link columns ─── */}
          <div className="grid gap-10 border-b border-[#2a2826] py-12 md:grid-cols-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6b6762]">Services</h4>
              <ul className="mt-5 space-y-3">
                {[
                  { label: "Commerce & Platforms", href: "/#services" },
                  { label: "AI & Automation", href: "/#services" },
                  { label: "CRM & Lead Gen", href: "/#services" },
                  { label: "Payment & Fintech", href: "/#services" },
                  { label: "Cyber Security", href: "/#services" },
                  { label: "Business Consulting", href: "/#services" },
                ].map((s) => (
                  <li key={s.label}>
                    <Link href={s.href} className="text-sm text-[#9e9a94] transition-colors hover:text-[#f0ede8]">
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6b6762]">Company</h4>
              <ul className="mt-5 space-y-3">
                {[
                  { label: "Our Work", href: "/#work" },
                  { label: "Capabilities", href: "/#capabilities" },
                  { label: "Process", href: "/#process" },
                  { label: "Get Started", href: "/get-started" },
                  { label: "Marketplace", href: "/marketplace" },
                ].map((s) => (
                  <li key={s.label}>
                    <Link href={s.href} className="text-sm text-[#9e9a94] transition-colors hover:text-[#f0ede8]">
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6b6762]">Legal</h4>
              <ul className="mt-5 space-y-3">
                {[
                  { label: "Privacy Policy", href: "/legal/privacy" },
                  { label: "Terms of Service", href: "/legal/terms" },
                  { label: "Cookie Policy", href: "/legal/cookies" },
                  { label: "Merchant Terms", href: "/legal/merchant-terms" },
                  { label: "GDPR", href: "/legal/gdpr" },
                  { label: "Security", href: "/legal/security" },
                ].map((s) => (
                  <li key={s.label}>
                    <Link href={s.href} className="text-sm text-[#9e9a94] transition-colors hover:text-[#f0ede8]">
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6b6762]">Connect</h4>
              <ul className="mt-5 space-y-3">
                <li>
                  <a href="mailto:cs@authentifactor.com" className="text-sm text-[#9e9a94] transition-colors hover:text-[#f0ede8]">
                    cs@authentifactor.com
                  </a>
                </li>
                <li>
                  <a href="https://linkedin.com/company/authentifactor" target="_blank" rel="noopener noreferrer" className="text-sm text-[#9e9a94] transition-colors hover:text-[#f0ede8]">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="https://x.com/authentifactor" target="_blank" rel="noopener noreferrer" className="text-sm text-[#9e9a94] transition-colors hover:text-[#f0ede8]">
                    X (Twitter)
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* ─── Bottom bar ─── */}
          <div className="flex flex-col items-center justify-between gap-4 pt-8 md:flex-row">
            <p className="text-xs text-[#6b6762]">&copy; {new Date().getFullYear()} Authentifactor Ltd. All rights reserved.</p>
            <p className="text-xs text-[#6b6762]">Digital Solution Architects</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
