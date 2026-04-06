"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Menu, X, ShoppingBag, User, Search } from "lucide-react";
import { useTenant } from "@/components/tenant-provider";
import { CartSheet } from "@/components/shop/cart-sheet";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const tenant = useTenant();

  // Dynamic nav from tenant's actual product categories
  const navCategories = [
    { name: "Shop All", href: "/products" },
    ...tenant.categories.slice(0, 6).map((cat) => ({
      name: cat,
      href: `/products?category=${encodeURIComponent(cat)}`,
    })),
  ];

  // Use tenant colors instead of hardcoded values
  const COLORS = {
    bg: "#FFFFFF",
    text: "#1a1a1a",
    accent: tenant.accentColor || "#C5A059",
    muted: "#777777",
    border: "#E5E5E5",
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Lock body scroll when mobile menu is open
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

  const promoText = tenant.freeShippingMinimum
    ? `Complimentary shipping on orders over ${tenant.currency === "NGN" ? "\u20A6" : "\u00A3"}${tenant.freeShippingMinimum.toLocaleString()}`
    : tenant.tagline || `Discover ${tenant.name}`;

  return (
    <>
      <header
        className="sticky top-0 z-40 transition-shadow duration-300"
        style={{
          backgroundColor: COLORS.bg,
          boxShadow: scrolled ? "0 1px 8px rgba(0,0,0,0.06)" : "none",
        }}
      >
        {/* Promo bar */}
        <div
          className="px-4 py-2 text-center"
          style={{ backgroundColor: COLORS.accent }}
        >
          <p
            className="text-white"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.65rem",
              fontWeight: 400,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            {promoText}
          </p>
        </div>

        {/* Main header */}
        <div
          className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8"
          style={{ borderBottom: `1px solid ${COLORS.border}` }}
        >
          {/* Left: Logo */}
          <div className="flex items-center gap-3 lg:w-1/3">
            <Link href="/" className="group">
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontStyle: "italic",
                  fontWeight: 500,
                  fontSize: "1.45rem",
                  color: COLORS.text,
                  letterSpacing: "0.01em",
                  lineHeight: 1,
                }}
              >
                {tenant.name}
              </span>
            </Link>
          </div>

          {/* Center: Desktop navigation */}
          <nav className="hidden items-center justify-center gap-1 lg:flex lg:w-1/3">
            {navCategories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="group relative px-3 py-2 transition-colors"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: COLORS.text,
                }}
              >
                <span className="relative">
                  {cat.name}
                  <span
                    className="absolute -bottom-0.5 left-0 h-px w-0 transition-all duration-300 group-hover:w-full"
                    style={{ backgroundColor: COLORS.accent }}
                  />
                </span>
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-4 lg:w-1/3">
            <button
              type="button"
              className="hidden transition-colors hover:opacity-60 lg:block"
              aria-label="Search"
            >
              <Search
                className="h-[18px] w-[18px]"
                style={{ color: COLORS.text }}
                strokeWidth={1.5}
              />
            </button>

            <Link
              href="/account"
              className="hidden transition-colors hover:opacity-60 lg:block"
              aria-label="Account"
            >
              <User
                className="h-[18px] w-[18px]"
                style={{ color: COLORS.text }}
                strokeWidth={1.5}
              />
            </Link>

            <CartSheet />

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="transition-colors hover:opacity-60 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu
                className="h-5 w-5"
                style={{ color: COLORS.text }}
                strokeWidth={1.5}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile slide-out menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={closeMobile}
          />

          {/* Panel */}
          <div
            className="absolute inset-y-0 left-0 flex w-full max-w-sm flex-col"
            style={{ backgroundColor: COLORS.bg }}
          >
            {/* Mobile header */}
            <div
              className="flex h-16 items-center justify-between px-5"
              style={{ borderBottom: `1px solid ${COLORS.border}` }}
            >
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontStyle: "italic",
                  fontWeight: 500,
                  fontSize: "1.3rem",
                  color: COLORS.text,
                }}
              >
                {tenant.name}
              </span>
              <button
                type="button"
                onClick={closeMobile}
                aria-label="Close menu"
                className="transition-colors hover:opacity-60"
              >
                <X
                  className="h-5 w-5"
                  style={{ color: COLORS.text }}
                  strokeWidth={1.5}
                />
              </button>
            </div>

            {/* Mobile nav links */}
            <nav className="flex-1 overflow-y-auto px-5 py-8">
              <ul className="flex flex-col gap-0">
                {navCategories.map((cat) => (
                  <li key={cat.name}>
                    <Link
                      href={cat.href}
                      onClick={closeMobile}
                      className="block py-3 transition-colors"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: COLORS.text,
                        borderBottom: `1px solid ${COLORS.border}`,
                      }}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Secondary links */}
              <div className="mt-10 flex flex-col gap-4">
                <Link
                  href="/account"
                  onClick={closeMobile}
                  className="flex items-center gap-3 transition-colors hover:opacity-60"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.7rem",
                    fontWeight: 400,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: COLORS.muted,
                  }}
                >
                  <User className="h-4 w-4" strokeWidth={1.5} />
                  My Account
                </Link>
                <Link
                  href="/products"
                  onClick={closeMobile}
                  className="flex items-center gap-3 transition-colors hover:opacity-60"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.7rem",
                    fontWeight: 400,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: COLORS.muted,
                  }}
                >
                  <Search className="h-4 w-4" strokeWidth={1.5} />
                  Search
                </Link>
              </div>
            </nav>

            {/* Mobile promo footer */}
            <div
              className="px-5 py-4"
              style={{
                borderTop: `1px solid ${COLORS.border}`,
              }}
            >
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.6rem",
                  fontWeight: 400,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: COLORS.muted,
                  textAlign: "center",
                }}
              >
                {promoText}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
