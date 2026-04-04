"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Building2, Users, CreditCard, BarChart3,
  Settings, Activity, LogOut, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/superadmin", label: "Overview", icon: LayoutDashboard },
  { href: "/superadmin/tenants", label: "Tenants", icon: Building2 },
  { href: "/superadmin/billing", label: "Billing", icon: CreditCard },
  { href: "/superadmin/billing/usage", label: "Usage", icon: BarChart3 },
  { href: "/superadmin/users", label: "Users", icon: Users },
];

const bottomItems = [
  { href: "/superadmin/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="hidden lg:flex w-[260px] flex-col border-r border-white/[0.06] bg-black/40 backdrop-blur-2xl"
    >
      {/* Logo */}
      <div className="flex h-[72px] items-center gap-3 border-b border-white/[0.06] px-6">
        <Image
          src="/images/authentifactor-logo.png"
          alt="Authentifactor"
          width={375}
          height={375}
          className="h-10 w-auto"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
          Platform
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/superadmin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-white/[0.08] text-white"
                  : "text-white/50 hover:bg-white/[0.04] hover:text-white/80"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-white/[0.08] border border-white/[0.06]"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <div className={cn(
                "relative flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                isActive
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-white/[0.04] text-white/40 group-hover:text-white/60"
              )}>
                <Icon className="h-4 w-4" />
                {isActive && (
                  <div className="absolute inset-0 rounded-lg bg-emerald-400/10 blur-sm" />
                )}
              </div>
              <span className="relative">{label}</span>
              {isActive && <ChevronRight className="relative ml-auto h-3.5 w-3.5 text-white/30" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/[0.06] px-3 py-4 space-y-1">
        {bottomItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/40 transition-all hover:bg-white/[0.04] hover:text-white/60"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04]">
              <Icon className="h-4 w-4" />
            </div>
            {label}
          </Link>
        ))}
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/30 transition-all hover:bg-red-500/[0.06] hover:text-red-400"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04]">
              <LogOut className="h-4 w-4" />
            </div>
            Sign Out
          </button>
        </form>
      </div>
    </motion.aside>
  );
}
