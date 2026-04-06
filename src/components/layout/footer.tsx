"use client";

import { useTenant } from "@/components/tenant-provider";
import Link from "next/link";
import { FormEvent, useState } from "react";

const shopLinks = [
  { label: "New In", href: "/collections/new-in" },
  { label: "Ready-to-Wear", href: "/collections/ready-to-wear" },
  { label: "Handbags", href: "/collections/handbags" },
  { label: "Accessories", href: "/collections/accessories" },
  { label: "Beauty", href: "/collections/beauty" },
  { label: "Gifts", href: "/collections/gifts" },
];

const helpLinks = [
  { label: "Contact Us", href: "/contact" },
  { label: "Shipping & Delivery", href: "/shipping" },
  { label: "Returns & Exchanges", href: "/returns" },
  { label: "Size Guide", href: "/size-guide" },
  { label: "FAQs", href: "/faqs" },
];

const worldLinks = [
  { label: "Our Story", href: "/our-story" },
  { label: "The Atelier", href: "/atelier" },
  { label: "Sustainability", href: "/sustainability" },
  { label: "Careers", href: "/careers" },
];

const columnHeadingStyle =
  "uppercase tracking-[0.15em] text-[0.65rem] font-medium text-white/40 mb-5";

const linkStyle =
  "block text-[0.8rem] text-white/60 hover:text-white transition-colors duration-200";

function FooterColumn({
  heading,
  links,
}: {
  heading: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className={columnHeadingStyle}>{heading}</h4>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={linkStyle}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const tenant = useTenant();
  const [email, setEmail] = useState("");

  function handleNewsletterSubmit(e: FormEvent) {
    e.preventDefault();
    setEmail("");
  }

  return (
    <footer
      className="bg-[#1a1a1a] text-white"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-8">
        {/* Brand area */}
        <div className="mb-14 text-center">
          <h2
            className="text-2xl md:text-3xl text-white"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: "italic",
            }}
          >
            {tenant.name}
          </h2>
          <p className="mt-2 text-[0.8rem] text-white/40 tracking-wide">
            Curated luxury. Timeless elegance.
          </p>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 mb-14">
          <FooterColumn heading="SHOP" links={shopLinks} />
          <FooterColumn heading="HELP" links={helpLinks} />
          <FooterColumn heading="WORLD OF MARYAM" links={worldLinks} />
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
              className="flex-1 bg-transparent border border-white/20 px-4 py-2.5 text-[0.8rem] text-white placeholder:text-white/30 focus:outline-none focus:border-[#C5A059] transition-colors"
            />
            <button
              type="submit"
              className="bg-[#C5A059] px-6 py-2.5 text-[0.7rem] uppercase tracking-[0.15em] font-medium text-[#1a1a1a] hover:bg-[#d4b068] transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[0.7rem] text-white/40">
          <p>&copy; 2026 {tenant.name}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="hover:text-white/60 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-white/60 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/cookies"
              className="hover:text-white/60 transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
