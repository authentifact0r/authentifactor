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
        title: "Commerce",
        links: [
          { label: "E-Commerce Platforms", href: "#services" },
          { label: "Multi-Tenant Storefronts", href: "#services" },
          { label: "Payment Integration", href: "#services" },
          { label: "Subscription & Auto-Ship", href: "#services" },
        ],
      },
      {
        title: "Digital",
        links: [
          { label: "Brand Websites", href: "#services" },
          { label: "Mobile Apps", href: "#services" },
          { label: "SEO & Growth", href: "#services" },
          { label: "Custom Development", href: "#services" },
        ],
      },
    ],
    features: [
      { image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80&fit=crop", title: "E-Commerce", link: "#services" },
      { image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&q=80&fit=crop", title: "Custom Dev", link: "#services" },
    ],
  },
  {
    label: "Capabilities",
    href: "#capabilities",
    columns: [
      {
        title: "Platform",
        links: [
          { label: "Multi-Tenant Architecture", href: "#capabilities" },
          { label: "Stripe & Paystack", href: "#capabilities" },
          { label: "Apple Pay & Google Pay", href: "#capabilities" },
          { label: "Geo-Currency Detection", href: "#capabilities" },
        ],
      },
      {
        title: "Infrastructure",
        links: [
          { label: "Vercel Edge Deployment", href: "#capabilities" },
          { label: "Custom Domain Routing", href: "#capabilities" },
          { label: "GDPR & Compliance", href: "#capabilities" },
          { label: "Real-Time Analytics", href: "#capabilities" },
        ],
      },
    ],
    features: [
      { image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&q=80&fit=crop", title: "Platform Power", link: "#capabilities" },
      { image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&q=80&fit=crop", title: "Scale Ready", link: "#capabilities" },
    ],
  },
  {
    label: "Work",
    href: "#work",
    columns: [
      {
        title: "Live Clients",
        links: [
          { label: "Taste of Motherland", href: "https://taste-of-motherland.authentifactor.com" },
          { label: "Styled by Maryam", href: "https://styledbymaryam.com" },
          { label: "Vibrant Minds", href: "https://vibrantmindsasc.org.uk" },
          { label: "Toks Mimi Foods", href: "https://toks-mimi.authentifactor.com" },
        ],
      },
      {
        title: "Industries",
        links: [
          { label: "African Grocery", href: "#work" },
          { label: "Luxury Fashion", href: "#work" },
          { label: "Education", href: "#work" },
          { label: "Healthcare", href: "#work" },
        ],
      },
    ],
    features: [
      { image: "/images/screenshots/styledbymaryam.png", title: "Styled by Maryam", link: "https://styledbymaryam.com" },
      { image: "/images/screenshots/vibrantminds.png", title: "Vibrant Minds", link: "https://vibrantmindsasc.org.uk" },
    ],
  },
  {
    label: "Marketplace",
    href: "/platform/marketplace",
    columns: [
      {
        title: "For Merchants",
        links: [
          { label: "Browse Stores", href: "/platform/marketplace" },
          { label: "Start Selling", href: "/platform/get-started" },
          { label: "Pricing Plans", href: "/platform/get-started" },
          { label: "Referral Program", href: "/platform/get-started" },
        ],
      },
      {
        title: "By Category",
        links: [
          { label: "Grocery & Food", href: "/platform/marketplace" },
          { label: "Fashion & Textiles", href: "/platform/marketplace" },
          { label: "Catering & Meal Prep", href: "/platform/marketplace" },
          { label: "Beauty & Cosmetics", href: "/platform/marketplace" },
        ],
      },
    ],
    features: [
      { image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80&fit=crop", title: "Discover Stores", link: "/platform/marketplace" },
      { image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80&fit=crop", title: "Join the Platform", link: "/platform/get-started" },
    ],
  },
];

const mobileNavLinks = [
  { label: "Services", href: "#services" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Work", href: "#work" },
  { label: "Marketplace", href: "/platform/marketplace" },
  { label: "Get Started", href: "/platform/get-started" },
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
    <div className="min-h-screen bg-white">
      {/* ─── Mega Menu Navbar ─── */}
      <motion.header
        className={`fixed z-50 transition-all duration-500 ${
          scrolled
            ? "top-3 left-3 right-3 rounded-2xl border border-white/[0.08] bg-gray-950/95 shadow-2xl shadow-black/10 backdrop-blur-2xl"
            : "top-0 left-0 right-0 bg-gray-950/60 backdrop-blur-md border-b border-white/[0.06]"
        }`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mx-auto flex h-[68px] max-w-[1400px] items-center justify-between px-6 lg:px-10">
          {/* Logo */}
          <Link href="/platform" className="flex items-center gap-3 shrink-0 z-[1002]">
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
                    activeMega === idx ? "text-white" : "text-gray-400 hover:text-white"
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
                      className="bg-white border border-gray-200/60 shadow-2xl shadow-gray-300/30 flex gap-8 p-7 min-w-[640px] max-w-[840px] rounded-xl"
                    >
                      {/* Link columns */}
                      <div className="flex gap-8 flex-1">
                        {item.columns.map((col) => (
                          <div key={col.title} className="min-w-[145px]">
                            <h4 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-900 mb-3">
                              {col.title}
                            </h4>
                            <ul className="space-y-2.5">
                              {col.links.map((link) => (
                                <li key={link.label}>
                                  <Link
                                    href={link.href}
                                    onClick={() => setActiveMega(null)}
                                    className="text-[13px] text-gray-500 hover:text-emerald-600 transition-colors"
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
              className="hidden lg:block text-[11px] font-medium uppercase tracking-[0.12em] text-gray-400 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <button
              onClick={() => router.push("/platform/get-started")}
              className="hidden lg:block ml-2 bg-white px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-950 hover:bg-gray-100 transition-all cursor-pointer rounded-full"
            >
              Get Started
            </button>

            {/* Mobile toggle */}
            <button
              className="lg:hidden flex flex-col gap-[5px] p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              <span className={`block w-[22px] h-[1px] bg-gray-400 transition-transform origin-center ${mobileOpen ? "translate-y-[3px] rotate-45" : ""}`} />
              <span className={`block w-[22px] h-[1px] bg-gray-400 transition-transform origin-center ${mobileOpen ? "-translate-y-[3px] -rotate-45" : ""}`} />
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
            className="fixed inset-0 z-40 bg-gray-950"
          >
            <div className="flex flex-col justify-center min-h-full px-8 pt-24 pb-12">
              <ul className="space-y-0">
                {mobileNavLinks.map((link) => (
                  <li key={link.label} className="border-b border-white/[0.06] first:border-t">
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between py-5 text-2xl font-light italic text-white hover:text-emerald-400 transition-colors group"
                    >
                      {link.label}
                      <span className="text-sm font-normal not-italic text-gray-700 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-8 space-y-3">
                <Link
                  href="/platform/get-started"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center bg-white text-gray-950 py-3.5 text-sm font-semibold uppercase tracking-wider rounded-full"
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center border border-white/10 text-gray-400 py-3.5 text-sm font-medium uppercase tracking-wider rounded-full"
                >
                  Sign In
                </Link>
              </div>
              <p className="mt-10 text-center text-[10px] text-gray-700 uppercase tracking-[0.2em]">
                cs@authentifactor.com
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <main>{children}</main>

      {/* ─── Editorial Footer ─── */}
      <footer className="bg-gray-950 pt-24 pb-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-start gap-8 border-b border-white/[0.06] pb-16 md:flex-row md:items-end md:justify-between">
            <div>
              <Image
                src="/images/authentifactor-logo.png"
                alt="Authentifactor"
                width={375}
                height={375}
                className="h-20 w-auto"
              />
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-gray-500">
                We architect the digital infrastructure that powers ambitious brands.
                Your vision, our engineering.
              </p>
            </div>
            <Link
              href="/platform/get-started"
              className="group flex items-center gap-3 text-lg font-semibold text-white transition-colors hover:text-emerald-400"
            >
              Start a project
              <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <div className="grid gap-10 border-b border-white/[0.06] py-12 md:grid-cols-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-600">Services</h4>
              <ul className="mt-5 space-y-3">
                {["E-Commerce", "Brand Websites", "Mobile Apps", "SEO & Growth", "Custom Dev"].map((s) => (
                  <li key={s}><a href="#services" className="text-sm text-gray-500 transition-colors hover:text-white">{s}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-600">Company</h4>
              <ul className="mt-5 space-y-3">
                {["About", "Clients", "Process", "Contact"].map((s) => (
                  <li key={s}><a href="#" className="text-sm text-gray-500 transition-colors hover:text-white">{s}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-600">Legal</h4>
              <ul className="mt-5 space-y-3">
                {[{ label: "Privacy Policy", href: "/legal/privacy" }, { label: "Terms of Service", href: "/legal/terms" }, { label: "Cookie Policy", href: "/legal/cookies" }, { label: "Merchant Terms", href: "/legal/merchant-terms" }].map((s) => (
                  <li key={s.label}><Link href={s.href} className="text-sm text-gray-500 transition-colors hover:text-white">{s.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-600">Connect</h4>
              <ul className="mt-5 space-y-3">
                <li><a href="mailto:cs@authentifactor.com" className="text-sm text-gray-500 transition-colors hover:text-white">cs@authentifactor.com</a></li>
                <li><a href="#" className="text-sm text-gray-500 transition-colors hover:text-white">LinkedIn</a></li>
                <li><a href="#" className="text-sm text-gray-500 transition-colors hover:text-white">Twitter / X</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 pt-8 md:flex-row">
            <p className="text-xs text-gray-700">&copy; 2026 Authentifactor. All rights reserved.</p>
            <p className="text-xs text-gray-800">Built by Authentifactor</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
