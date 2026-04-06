"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useTenant } from "@/components/tenant-provider";

interface SubCategory {
  name: string;
  href: string;
}

interface MegaMenuCategory {
  name: string;
  href: string;
  subcategories: SubCategory[];
}

/**
 * Groups flat category list into mega-menu structure.
 * Categories with "/" are treated as subcategories (e.g. "Ready-to-Wear/Blazers").
 * Otherwise, each category becomes a top-level item linking to the products page.
 */
function buildMegaMenuData(categories: string[]): MegaMenuCategory[] {
  const grouped = new Map<string, SubCategory[]>();

  for (const cat of categories) {
    if (cat.includes("/")) {
      const [parent, child] = cat.split("/", 2);
      if (!grouped.has(parent)) grouped.set(parent, []);
      grouped.get(parent)!.push({
        name: child.trim(),
        href: `/products?category=${encodeURIComponent(cat)}`,
      });
    } else {
      if (!grouped.has(cat)) grouped.set(cat, []);
    }
  }

  return Array.from(grouped.entries()).map(([name, subcategories]) => ({
    name,
    href: `/products?category=${encodeURIComponent(name)}`,
    subcategories,
  }));
}

export function MegaMenu() {
  const tenant = useTenant();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const menuData = buildMegaMenuData(tenant.categories);

  const handleMouseEnter = (name: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(name);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const COLORS = {
    text: tenant.textColor || "#1a1a1a",
    accent: tenant.accentColor || "#C5A059",
    bg: tenant.backgroundColor || "#FFFFFF",
    border: "#E5E5E5",
    muted: "#777777",
  };

  return (
    <nav className="hidden items-center justify-center lg:flex">
      {/* Shop All */}
      <Link
        href="/products"
        className="group relative px-3 py-2 transition-colors"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.7rem",
          fontWeight: 500,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: COLORS.text,
        }}
      >
        <span className="relative">
          Shop All
          <span
            className="absolute -bottom-0.5 left-0 h-px w-0 transition-all duration-300 group-hover:w-full"
            style={{ backgroundColor: COLORS.accent }}
          />
        </span>
      </Link>

      {menuData.map((cat) => (
        <div
          key={cat.name}
          className="relative"
          onMouseEnter={() => handleMouseEnter(cat.name)}
          onMouseLeave={handleMouseLeave}
        >
          <Link
            href={cat.href}
            className="group relative flex items-center gap-1 px-3 py-2 transition-colors"
            style={{
              fontFamily: "var(--font-body)",
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
            {cat.subcategories.length > 0 && (
              <ChevronDown
                className="h-3 w-3 transition-transform duration-200"
                style={{
                  color: COLORS.muted,
                  transform: activeMenu === cat.name ? "rotate(180deg)" : "rotate(0)",
                }}
                strokeWidth={1.5}
              />
            )}
          </Link>

          {/* Mega-menu dropdown */}
          {cat.subcategories.length > 0 && activeMenu === cat.name && (
            <div
              className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2"
              onMouseEnter={() => handleMouseEnter(cat.name)}
              onMouseLeave={handleMouseLeave}
            >
              <div
                className="min-w-[220px] rounded-lg border p-4 shadow-xl"
                style={{
                  backgroundColor: COLORS.bg,
                  borderColor: COLORS.border,
                }}
              >
                <p
                  className="mb-3 pb-2"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    fontStyle: "italic",
                    color: COLORS.text,
                    borderBottom: `1px solid ${COLORS.border}`,
                  }}
                >
                  {cat.name}
                </p>
                <ul className="space-y-1">
                  {cat.subcategories.map((sub) => (
                    <li key={sub.name}>
                      <Link
                        href={sub.href}
                        onClick={() => setActiveMenu(null)}
                        className="block rounded-md px-2 py-1.5 transition-colors hover:bg-black/[0.03]"
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.75rem",
                          fontWeight: 400,
                          color: COLORS.muted,
                          letterSpacing: "0.04em",
                        }}
                      >
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href={cat.href}
                      onClick={() => setActiveMenu(null)}
                      className="block rounded-md px-2 py-1.5 transition-colors"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        color: COLORS.accent,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}
                    >
                      View All
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
