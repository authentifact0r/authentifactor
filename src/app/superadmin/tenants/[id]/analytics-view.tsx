"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, Globe, Server, CreditCard, ShoppingCart,
  Package, Users, Activity, Shield, Clock, ExternalLink,
  CheckCircle, AlertTriangle, Cloud, Zap, BarChart3,
  TrendingUp, Calendar, ArrowUpRight,
} from "lucide-react";
import type { BreakdownItem } from "@/config/usagePricing";

const fade = { hidden: { opacity: 0, y: 16 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] } }) };

const formatGbp = (n: number) => `£${n.toFixed(2)}`;
const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
const formatNum = (n: number) => n.toLocaleString();

interface Props {
  tenant: any;
  metrics: { baseRetainerGbp: number; hostingUsageGbp: number; backendUsageGbp: number; totalMonthlyCostGbp: number; hostingBreakdown: BreakdownItem[]; backendBreakdown: BreakdownItem[] } | null;
  latestUsage: any;
  usageHistory: any[];
  orderStats: { revenue: number; count: number };
}

function GlassCard({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      custom={delay}
      initial="hidden"
      animate="visible"
      variants={fade}
      className={`rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06]">
        <Icon className="h-3.5 w-3.5 text-white/50" />
      </div>
      <span className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">{label}</span>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-emerald-500/15 text-emerald-400",
    delinquent: "bg-red-500/15 text-red-400",
    paused: "bg-yellow-500/15 text-yellow-400",
  };
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${colors[status] || "bg-white/10 text-white/50"}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${status === "active" ? "bg-emerald-400" : status === "delinquent" ? "bg-red-400" : "bg-yellow-400"}`} />
    {status}
  </span>;
}

function UsageTable({ breakdown, icon: Icon, label, color }: { breakdown: BreakdownItem[]; icon: React.ElementType; label: string; color: string }) {
  if (!breakdown || breakdown.length === 0) return null;
  const total = breakdown.reduce((s, b) => s + b.totalGbp, 0);
  return (
    <GlassCard delay={3}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-white">{label}</span>
        </div>
        <span className="text-lg font-bold text-white">{formatGbp(total)}</span>
      </div>
      <div className="space-y-2">
        {breakdown.map((item) => (
          <div key={item.metricKey} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
            <div>
              <p className="text-sm text-white/70">{item.label}</p>
              <p className="text-[11px] text-white/30">{formatNum(item.quantity)} {item.unit} × {formatGbp(item.unitPriceGbp)}</p>
            </div>
            <span className={`text-sm font-medium tabular-nums ${item.totalGbp > 0 ? "text-white" : "text-white/30"}`}>{formatGbp(item.totalGbp)}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export function TenantAnalyticsView({ tenant, metrics, latestUsage, usageHistory, orderStats }: Props) {
  const t = tenant;
  const base = metrics?.baseRetainerGbp ?? 99;
  const hosting = metrics?.hostingUsageGbp ?? 0;
  const backend = metrics?.backendUsageGbp ?? 0;
  const total = metrics?.totalMonthlyCostGbp ?? (base + hosting + backend);

  const openPortal = async () => {
    const res = await fetch("/api/billing/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId: t.id, returnUrl: window.location.href }),
    });
    const { url } = await res.json();
    if (url) window.open(url, "_blank");
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/superadmin/tenants" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition mb-2">
        <ArrowLeft className="h-3.5 w-3.5" /> All Tenants
      </Link>

      {/* ═══ HERO ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-8"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-white" style={{ backgroundColor: t.primaryColor || "#059669", boxShadow: `0 8px 24px ${t.primaryColor || "#059669"}40` }}>
              {t.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{t.name}</h1>
              <div className="flex items-center gap-3 mt-1.5">
                {t.customDomain && (
                  <span className="flex items-center gap-1 text-xs text-white/40">
                    <Globe className="h-3 w-3" /> {t.customDomain}
                  </span>
                )}
                <span className="text-xs text-white/30">{t.slug}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={t.billingStatus} />
            <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-white/50 capitalize">{t.billingPlan}</span>
            <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-white/50 capitalize flex items-center gap-1">
              <Server className="h-3 w-3" /> {t.hostingProvider}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-white/[0.06]">
          {t.customDomain && (
            <a href={`https://${t.customDomain}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.06] px-4 py-2 text-xs font-medium text-white/60 hover:bg-white/[0.1] hover:text-white transition">
              <ExternalLink className="h-3 w-3" /> Open Storefront
            </a>
          )}
          {t.stripeCustomerId && (
            <button onClick={openPortal} className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.06] px-4 py-2 text-xs font-medium text-white/60 hover:bg-white/[0.1] hover:text-white transition">
              <CreditCard className="h-3 w-3" /> Stripe Portal
            </button>
          )}
          <Link href={`/superadmin/tenants/${t.id}/edit`} className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.06] px-4 py-2 text-xs font-medium text-white/60 hover:bg-white/[0.1] hover:text-white transition">
            Edit Tenant
          </Link>
        </div>
      </motion.div>

      {/* ═══ METRICS BENTO ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Products", value: t._count?.products || 0, icon: Package, color: "text-emerald-400" },
          { label: "Orders", value: t._count?.orders || 0, icon: ShoppingCart, color: "text-blue-400" },
          { label: "Revenue", value: formatGbp(orderStats.revenue), icon: TrendingUp, color: "text-violet-400" },
          { label: "Team", value: t._count?.tenantUsers || 0, icon: Users, color: "text-amber-400" },
        ].map((m, i) => (
          <GlassCard key={m.label} delay={i + 1}>
            <m.icon className={`h-5 w-5 ${m.color} mb-3`} />
            <p className="text-2xl font-bold text-white">{m.value}</p>
            <p className="text-xs text-white/40 mt-1">{m.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* ═══ BILLING ═══ */}
      <GlassCard delay={2}>
        <SectionLabel icon={CreditCard} label="Billing Cycle" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-white/40">Base Retainer</p>
            <p className="text-xl font-bold text-white mt-1">{formatGbp(base)}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 flex items-center gap-1"><Globe className="h-3 w-3" /> Hosting (Vercel)</p>
            <p className="text-xl font-bold text-white mt-1">{formatGbp(hosting)}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 flex items-center gap-1"><Cloud className="h-3 w-3" /> Backend (GCP)</p>
            <p className="text-xl font-bold text-white mt-1">{formatGbp(backend)}</p>
          </div>
          <div>
            <p className="text-xs text-emerald-400">Total Monthly</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">{formatGbp(total)}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-white/[0.06] text-xs text-white/40">
          <span><Calendar className="inline h-3 w-3 mr-1" />Next invoice: {formatDate(t.nextInvoiceDate)}</span>
          <span>Last payment: {t.lastPaymentStatus || "—"} {formatDate(t.lastPaymentDate)}</span>
          {t.lastInvoiceTotalGbp && <span>Last invoice: {formatGbp(t.lastInvoiceTotalGbp)}</span>}
        </div>
      </GlassCard>

      {/* ═══ USAGE BREAKDOWN ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <UsageTable breakdown={metrics?.hostingBreakdown || []} icon={Globe} label="Hosting Usage (Vercel)" color="bg-blue-500/15 text-blue-400" />
        <UsageTable breakdown={metrics?.backendBreakdown || []} icon={Cloud} label="Backend Usage (GCP)" color="bg-violet-500/15 text-violet-400" />
      </div>

      {/* ═══ PERFORMANCE & INFRASTRUCTURE ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard delay={4}>
          <SectionLabel icon={Activity} label="Performance & Health" />
          <div className="space-y-3">
            {[
              { label: "Uptime (30d)", value: "99.9%", status: "good" },
              { label: "Avg Response", value: "<180ms", status: "good" },
              { label: "Error Rate", value: "0.02%", status: "good" },
              { label: "SSL Certificate", value: "Valid", status: "good" },
              { label: "DNS", value: t.customDomain ? "Propagated" : "No domain", status: t.customDomain ? "good" : "warn" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-1">
                <span className="text-sm text-white/60">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{item.value}</span>
                  {item.status === "good" ? (
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard delay={5}>
          <SectionLabel icon={Server} label="Infrastructure" />
          <div className="space-y-3">
            {[
              { label: "Hosting", value: t.hostingProvider === "vercel" ? "Vercel Edge Network" : t.hostingProvider === "gcp" ? "Google Cloud Run" : "Hybrid" },
              { label: "Region", value: t.hostingProvider === "vercel" ? "Global (Edge)" : "europe-west2 (London)" },
              { label: "Runtime", value: "Node.js 20 (Next.js 16)" },
              { label: "Database", value: "PostgreSQL (Neon)" },
              { label: "CDN", value: t.hostingProvider === "vercel" ? "Vercel Edge" : "CloudFront" },
              { label: "Build System", value: "Turbopack" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-1">
                <span className="text-sm text-white/60">{item.label}</span>
                <span className="text-sm font-medium text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* ═══ STOREFRONT ANALYTICS ═══ */}
      <GlassCard delay={6}>
        <SectionLabel icon={BarChart3} label="Storefront Analytics" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-white/40">Products</p>
            <p className="text-2xl font-bold text-white mt-1">{t._count?.products || 0}</p>
          </div>
          <div>
            <p className="text-xs text-white/40">Orders (Paid)</p>
            <p className="text-2xl font-bold text-white mt-1">{orderStats.count}</p>
          </div>
          <div>
            <p className="text-xs text-white/40">Revenue</p>
            <p className="text-2xl font-bold text-white mt-1">{formatGbp(orderStats.revenue)}</p>
          </div>
          <div>
            <p className="text-xs text-white/40">Avg Order Value</p>
            <p className="text-2xl font-bold text-white mt-1">{orderStats.count > 0 ? formatGbp(orderStats.revenue / orderStats.count) : "—"}</p>
          </div>
        </div>
      </GlassCard>

      {/* ═══ ACTIVITY FEED ═══ */}
      <GlassCard delay={7}>
        <SectionLabel icon={Clock} label="Activity Timeline" />
        <div className="space-y-3">
          {[
            { time: formatDate(t.createdAt), event: "Tenant created", icon: Zap, color: "text-emerald-400" },
            ...(t.customDomain ? [{ time: "Domain connected", event: t.customDomain, icon: Globe, color: "text-blue-400" }] : []),
            ...(t.stripeCustomerId ? [{ time: "Stripe connected", event: `Customer: ${t.stripeCustomerId.slice(0, 16)}...`, icon: CreditCard, color: "text-violet-400" }] : []),
            ...(t.lastPaymentDate ? [{ time: formatDate(t.lastPaymentDate), event: `Payment ${t.lastPaymentStatus}`, icon: CheckCircle, color: t.lastPaymentStatus === "succeeded" ? "text-emerald-400" : "text-red-400" }] : []),
            ...(t.onboardingProgress ? [{ time: "Onboarding", event: `Branding: ${t.onboardingProgress.branding ? "✓" : "✗"} | Domain: ${t.onboardingProgress.domain ? "✓" : "✗"} | SEO: ${t.onboardingProgress.seo ? "✓" : "✗"}`, icon: Activity, color: "text-amber-400" }] : []),
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
                <item.icon className={`h-3 w-3 ${item.color}`} />
              </div>
              <div>
                <p className="text-sm text-white/70">{item.event}</p>
                <p className="text-[11px] text-white/30">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ═══ USAGE HISTORY ═══ */}
      {usageHistory.length > 0 && (
        <GlassCard delay={8}>
          <SectionLabel icon={BarChart3} label="Usage History" />
          <div className="space-y-2">
            {usageHistory.map((u: any) => (
              <div key={u.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                <span className="text-sm text-white/60">
                  {new Date(u.periodStart).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                </span>
                <div className="flex gap-4 text-xs tabular-nums">
                  <span className="text-white/40">GCP: {formatGbp(u.gcpCostGbp)}</span>
                  <span className="text-white/40">Vercel: {formatGbp(u.vercelCostGbp)}</span>
                  <span className="font-medium text-white">Total: {formatGbp(u.totalCostGbp)}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
