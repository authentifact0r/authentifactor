"use client";

import { motion } from "framer-motion";
import { Building2, Users, ShoppingCart, TrendingUp, Activity, Server, CreditCard, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: string;
  icon: React.ElementType;
  gradient: string;
  delay?: number;
}

function MetricCard({ label, value, change, icon: Icon, gradient, delay = 0 }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm transition-shadow hover:shadow-[0_8px_40px_rgba(0,0,0,0.3)] hover:border-white/[0.1]"
    >
      {/* Gradient glow */}
      <div className={cn("absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-40", gradient)} />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", gradient.replace("bg-", "bg-").replace("/40", "/10"))}>
            <Icon className="h-5 w-5 text-white/80" />
          </div>
          {change && (
            <span className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              change.startsWith("+") ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
            )}>
              {change}
            </span>
          )}
        </div>
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
        <p className="text-sm text-white/40 mt-1">{label}</p>
      </div>
    </motion.div>
  );
}

interface DashboardData {
  totalTenants: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: string;
  mrr: string;
  activeNow: number;
}

export function DashboardCards({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-6">
      {/* Primary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard label="Total Tenants" value={data.totalTenants} change="+2 this month" icon={Building2} gradient="bg-emerald-500/40" delay={0} />
        <MetricCard label="Total Users" value={data.totalUsers} icon={Users} gradient="bg-blue-500/40" delay={0.05} />
        <MetricCard label="Total Orders" value={data.totalOrders} icon={ShoppingCart} gradient="bg-violet-500/40" delay={0.1} />
        <MetricCard label="Total Revenue" value={data.totalRevenue} change="+12%" icon={TrendingUp} gradient="bg-amber-500/40" delay={0.15} />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <CreditCard className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="text-sm text-white/40">MRR</span>
          </div>
          <p className="text-2xl font-bold text-white">{data.mrr}</p>
          <div className="mt-3 h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
              <Activity className="h-4 w-4 text-blue-400" />
            </div>
            <span className="text-sm text-white/40">System Health</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <p className="text-lg font-semibold text-emerald-400">All Systems Operational</p>
          </div>
          <p className="text-xs text-white/30 mt-2">99.9% uptime • &lt;200ms latency</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
              <Server className="h-4 w-4 text-violet-400" />
            </div>
            <span className="text-sm text-white/40">Infrastructure</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">Vercel</span>
              <span className="text-xs text-emerald-400">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">Cloud Run</span>
              <span className="text-xs text-emerald-400">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">PostgreSQL</span>
              <span className="text-xs text-emerald-400">Online</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
              <Zap className="h-4 w-4 text-amber-400" />
            </div>
            <span className="text-sm text-white/40">Active Now</span>
          </div>
          <p className="text-2xl font-bold text-white">{data.activeNow}</p>
          <p className="text-xs text-white/30 mt-1">Users across all tenants</p>
        </motion.div>
      </div>
    </div>
  );
}
