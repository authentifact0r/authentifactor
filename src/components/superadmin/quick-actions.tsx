"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Building2, Users, CreditCard, Activity, X } from "lucide-react";
import Link from "next/link";

const actions = [
  { label: "Create Tenant", href: "/superadmin/tenants/new", icon: Building2, color: "bg-emerald-500/15 text-emerald-400" },
  { label: "View Billing", href: "/superadmin/billing", icon: CreditCard, color: "bg-blue-500/15 text-blue-400" },
  { label: "Manage Users", href: "/superadmin/users", icon: Users, color: "bg-violet-500/15 text-violet-400" },
  { label: "View Logs", href: "/superadmin", icon: Activity, color: "bg-amber-500/15 text-amber-400" },
];

export function QuickActions() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-16 right-0 w-56 rounded-2xl border border-white/[0.08] bg-gray-950/95 p-2 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          >
            {actions.map(({ label, href, icon: Icon, color }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 hover:bg-white/[0.06] hover:text-white transition-all"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                {label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-[0_8px_32px_rgba(16,185,129,0.3)] hover:bg-emerald-500 transition-colors"
      >
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
          {open ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </motion.div>
      </motion.button>
    </div>
  );
}
