"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Package, BarChart3, Warehouse, ShoppingCart, Zap, Box, LogOut,
  CreditCard, Palette, Mail, Users, Truck, ChevronRight, Download,
  Settings, Gift,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Box },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/import", label: "Import Products", icon: Download },
  { href: "/admin/flash-sales", label: "Flash Sales", icon: Zap },
  { href: "/admin/warehouses", label: "Warehouses", icon: Warehouse },
  { href: "/admin/shipping", label: "Shipping", icon: Truck },
  { href: "/admin/team", label: "Team", icon: Users },
  { href: "/admin/branding", label: "Branding", icon: Palette },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/billing", label: "Account & Billing", icon: CreditCard },
  { href: "/admin/referrals", label: "Referrals", icon: Gift },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface Props {
  tenantName: string;
  tenantInitial: string;
  tenantColor: string;
  tenantSlug: string;
}

export function AdminSidebar({ tenantName, tenantInitial, tenantColor, tenantSlug }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tenant = searchParams.get("tenant") || tenantSlug;
  const tenantParam = tenant ? `?tenant=${tenant}` : "";

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-56 flex-shrink-0 border-r border-[#E5E5E5] bg-white lg:block">
        <div className="flex h-16 items-center gap-2.5 border-b border-[#E5E5E5] px-5">
          <div
            className="flex h-8 w-8 items-center justify-center text-sm font-bold text-white"
            style={{ backgroundColor: tenantColor }}
          >
            {tenantInitial}
          </div>
          <span
            className="text-[#1a1a1a] truncate text-sm"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic", fontWeight: 400 }}
          >
            {tenantName}
          </span>
        </div>

        <nav className="p-3 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={`${href}${tenantParam}`}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 text-[0.8rem] font-medium transition-all",
                  isActive
                    ? "text-[#1a1a1a] bg-[#F5F0E8]"
                    : "text-[#999] hover:text-[#1a1a1a] hover:bg-[#F9F7F2]"
                )}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <div className={cn(
                  "flex h-7 w-7 items-center justify-center transition-all",
                  isActive
                    ? "text-[#C5A059]"
                    : "text-[#bbb]"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                {label}
                {isActive && <ChevronRight className="ml-auto h-3 w-3 text-[#C5A059]" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-[#E5E5E5] p-3">
          <a
            href="/api/auth/logout"
            className="flex items-center gap-2.5 px-3 py-2 text-[0.8rem] font-medium text-[#bbb] hover:text-[#e25950] transition-all"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <div className="flex h-7 w-7 items-center justify-center">
              <LogOut className="h-4 w-4" />
            </div>
            Sign Out
          </a>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#E5E5E5] bg-white p-3 lg:hidden">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center text-xs font-bold text-white mr-1"
          style={{ backgroundColor: tenantColor }}
        >
          {tenantInitial}
        </div>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={`${href}${tenantParam}`}
              className={cn(
                "flex items-center gap-1 whitespace-nowrap px-3 py-1.5 text-xs font-medium transition",
                isActive
                  ? "bg-[#F5F0E8] text-[#1a1a1a] border border-[#C5A059]/30"
                  : "bg-white text-[#999] border border-[#E5E5E5]"
              )}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <Icon className="h-3 w-3" />
              {label}
            </Link>
          );
        })}
      </div>
    </>
  );
}
