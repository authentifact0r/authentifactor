"use client";

import { DashboardCards } from "@/components/superadmin/dashboard-cards";
import { motion } from "framer-motion";
import { Building2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  billingPlan: string;
  billingStatus: string;
  hostingProvider: string;
  createdAt: string;
  _count: { products: number; orders: number };
}

export function DashboardView({ data }: { data: any }) {
  const tenants: Tenant[] = data.recentTenants || [];

  return (
    <div className="p-6 md:p-8 space-y-8">
      <DashboardCards data={data} />

      {/* Recent Tenants */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <Building2 className="h-4 w-4 text-emerald-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">Recent Tenants</h2>
          </div>
          <Link href="/superadmin/tenants" className="flex items-center gap-1 text-xs text-white/40 hover:text-white/60 transition">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {tenants.length === 0 ? (
            <p className="p-6 text-center text-sm text-white/30">No tenants yet</p>
          ) : (
            tenants.map((t) => (
              <Link
                key={t.id}
                href={`/superadmin/tenants/${t.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 text-sm font-bold text-white/80">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-white/30">{t.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-3 text-xs text-white/40">
                    <span>{t._count.products} products</span>
                    <span>{t._count.orders} orders</span>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                    t.billingStatus === "active" ? "bg-emerald-500/15 text-emerald-400" :
                    t.billingStatus === "delinquent" ? "bg-red-500/15 text-red-400" :
                    "bg-yellow-500/15 text-yellow-400"
                  }`}>
                    {t.billingStatus}
                  </span>
                  <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-white/40 capitalize">
                    {t.billingPlan}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
