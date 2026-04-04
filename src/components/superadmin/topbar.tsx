"use client";

import { Search, Bell, Menu } from "lucide-react";
import { motion } from "framer-motion";

export function Topbar({ title = "Overview" }: { title?: string }) {
  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-[72px] items-center justify-between border-b border-white/[0.06] px-6 bg-black/20 backdrop-blur-xl"
    >
      <div className="flex items-center gap-4">
        <button className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] text-white/50">
          <Menu className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">{title}</h1>
          <p className="text-xs text-white/30">Authentifactor Platform</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white/[0.04] border border-white/[0.06] px-3 h-9 w-64">
          <Search className="h-3.5 w-3.5 text-white/30" />
          <input
            type="text"
            placeholder="Search tenants, users..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none"
          />
          <kbd className="hidden md:flex items-center gap-0.5 rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/30">
            ⌘K
          </kbd>
        </div>

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white/60 transition">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] pl-2.5 pr-3 h-9">
          <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white">
            A
          </div>
          <span className="text-xs font-medium text-white/60">Admin</span>
        </div>
      </div>
    </motion.header>
  );
}
