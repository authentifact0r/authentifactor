"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Work", href: "#work" },
  { label: "Marketplace", href: "/platform/marketplace" },
];

export default function PlatformShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Floating Navbar ─── */}
      <motion.header
        className={`fixed z-50 transition-all duration-500 ${
          scrolled
            ? "top-3 left-3 right-3 rounded-2xl border border-white/[0.08] bg-gray-950/90 shadow-2xl shadow-black/10 backdrop-blur-2xl"
            : "top-0 left-0 right-0 bg-gray-950/60 backdrop-blur-md border-b border-white/[0.06]"
        }`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">
          <Link href="/platform" className="flex items-center gap-3 shrink-0">
            <Image
              src="/images/authentifactor-logo.png"
              alt="Authentifactor"
              width={375}
              height={375}
              className="h-14 w-auto"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-full px-5 py-2 text-[13px] font-medium text-gray-400 transition-all hover:bg-white/[0.06] hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <div className="mx-3 h-4 w-px bg-gray-800" />
            <Link
              href="/login"
              className="rounded-full px-5 py-2 text-[13px] font-medium text-gray-400 transition-colors hover:text-white"
            >
              Sign In
            </Link>
            <button
              onClick={() => router.push("/platform/get-started")}
              className="ml-1 rounded-full bg-white px-6 py-2.5 text-[13px] font-semibold text-gray-950 transition-all hover:bg-gray-100 cursor-pointer"
            >
              Get Started
            </button>
          </nav>

          {/* Mobile toggle */}
          <button
            className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-white/10 hover:text-white md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="border-t border-white/[0.06] px-6 pb-8 pt-6 md:hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-4 py-3 text-[15px] font-medium text-gray-400 transition-colors hover:bg-white/[0.06] hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 text-[15px] font-medium text-gray-400 transition-colors hover:text-white"
                >
                  Sign In
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); router.push("/platform/get-started"); }}
                  className="mt-2 rounded-full bg-white py-3.5 text-center text-[15px] font-semibold text-gray-950 cursor-pointer"
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Content */}
      <main>{children}</main>

      {/* ─── Editorial Footer ─── */}
      <footer className="bg-gray-950 pt-24 pb-12">
        <div className="mx-auto max-w-6xl px-6">
          {/* Top — Large CTA text */}
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

          {/* Middle — Links grid */}
          <div className="grid gap-10 border-b border-white/[0.06] py-12 md:grid-cols-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-600">
                Services
              </h4>
              <ul className="mt-5 space-y-3">
                {["E-Commerce", "Brand Websites", "Mobile Apps", "SEO & Growth", "Custom Dev"].map((s) => (
                  <li key={s}>
                    <a href="#services" className="text-sm text-gray-500 transition-colors hover:text-white">{s}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-600">
                Company
              </h4>
              <ul className="mt-5 space-y-3">
                {["About", "Clients", "Process", "Contact"].map((s) => (
                  <li key={s}>
                    <a href="#" className="text-sm text-gray-500 transition-colors hover:text-white">{s}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-600">
                Legal
              </h4>
              <ul className="mt-5 space-y-3">
                {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((s) => (
                  <li key={s}>
                    <a href="#" className="text-sm text-gray-500 transition-colors hover:text-white">{s}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-600">
                Connect
              </h4>
              <ul className="mt-5 space-y-3">
                <li><a href="mailto:hello@authentifactor.com" className="text-sm text-gray-500 transition-colors hover:text-white">hello@authentifactor.com</a></li>
                <li><a href="#" className="text-sm text-gray-500 transition-colors hover:text-white">LinkedIn</a></li>
                <li><a href="#" className="text-sm text-gray-500 transition-colors hover:text-white">Twitter / X</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="flex flex-col items-center justify-between gap-4 pt-8 md:flex-row">
            <p className="text-xs text-gray-700">
              &copy; 2026 Authentifactor. All rights reserved.
            </p>
            <p className="text-xs text-gray-800">
              Built by Authentifactor
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
