import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal — Authentifactor",
};

const legalLinks = [
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/terms", label: "Terms of Use" },
  { href: "/legal/cookies", label: "Cookie Policy" },
  { href: "/legal/gdpr", label: "GDPR" },
  { href: "/legal/security", label: "Security" },
  { href: "/legal/merchant-terms", label: "Merchant Terms" },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="mx-auto max-w-4xl flex items-center justify-between px-6 h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/authentifactor-logo.png" alt="Authentifactor" width={200} height={60} className="h-8 w-auto" />
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            {legalLinks.map((l) => (
              <Link key={l.href} href={l.href} className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-16">
        {children}
      </main>
      <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400">
        &copy; 2026 Authentifactor Ltd. All rights reserved.
      </footer>
    </div>
  );
}
