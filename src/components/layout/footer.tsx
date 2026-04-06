"use client";

import { useTenant } from "@/components/tenant-provider";
import Link from "next/link";
import { FormEvent, useState } from "react";

const helpLinks = [
  { label: "Contact Us", href: "/contact" },
  { label: "Shipping & Delivery", href: "/shipping-info" },
  { label: "Returns & Exchanges", href: "/returns" },
  { label: "Size Guide", href: "/size-guide" },
  { label: "FAQs", href: "/faqs" },
];

const columnHeadingStyle =
  "uppercase tracking-[0.15em] text-[0.65rem] font-medium text-white/40 mb-5";

const linkStyle =
  "block text-[0.8rem] text-white/60 hover:text-white transition-colors duration-200";

export function Footer() {
  const tenant = useTenant();
  const [email, setEmail] = useState("");
  const accent = tenant.accentColor || "#C5A059";

  // Dynamic shop links from tenant's actual categories
  const shopLinks = [
    { label: "Shop All", href: "/products" },
    ...tenant.categories.slice(0, 6).map((cat) => ({
      label: cat,
      href: `/products?category=${encodeURIComponent(cat)}`,
    })),
  ];

  function handleNewsletterSubmit(e: FormEvent) {
    e.preventDefault();
    setEmail("");
  }

  return (
    <footer
      className="bg-[#1a1a1a] text-white"
      style={{ fontFamily: "var(--font-body, Inter), sans-serif" }}
    >
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-8">
        {/* Brand area */}
        <div className="mb-14 text-center">
          <h2
            className="text-2xl md:text-3xl text-white"
            style={{
              fontFamily: "var(--font-display, Georgia), serif",
              fontStyle: "italic",
            }}
          >
            {tenant.name}
          </h2>
          {tenant.tagline && (
            <p className="mt-2 text-[0.8rem] text-white/40 tracking-wide">
              {tenant.tagline}
            </p>
          )}
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 mb-14">
          <div>
            <h4 className={columnHeadingStyle}>SHOP</h4>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkStyle}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className={columnHeadingStyle}>HELP</h4>
            <ul className="space-y-3">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkStyle}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className={columnHeadingStyle}>ABOUT {tenant.name.toUpperCase()}</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className={linkStyle}>Our Story</Link></li>
              <li><Link href="/sustainability" className={linkStyle}>Sustainability</Link></li>
              <li><Link href="/careers" className={linkStyle}>Careers</Link></li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-white/10 pt-10 mb-10 max-w-md mx-auto text-center">
          <h4 className={columnHeadingStyle}>BE THE FIRST TO KNOW</h4>
          <form onSubmit={handleNewsletterSubmit} className="flex">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 bg-transparent border border-white/20 px-4 py-2.5 text-[0.8rem] text-white placeholder:text-white/30 focus:outline-none transition-colors"
              style={{ borderColor: email ? accent : undefined }}
            />
            <button
              type="submit"
              className="px-6 py-2.5 text-[0.7rem] uppercase tracking-[0.15em] font-medium text-white hover:opacity-90 transition-colors"
              style={{ backgroundColor: accent }}
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[0.7rem] text-white/40">
          <p>&copy; {new Date().getFullYear()} {tenant.name}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/legal/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-white/60 transition-colors">Terms</Link>
            <Link href="/legal/cookies" className="hover:text-white/60 transition-colors">Cookies</Link>
          </div>
          <p className="text-white/20 text-[0.6rem]">Powered by Authentifactor</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
