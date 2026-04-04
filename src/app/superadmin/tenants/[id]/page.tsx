export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { TenantAnalyticsView } from "./analytics-view";
import { computeBillingMetrics } from "@/lib/usageBilling";
import type { PlanId } from "@/config/usagePricing";

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const tenant = await db.tenant.findUnique({
    where: { id },
    include: {
      _count: { select: { products: true, orders: true, tenantUsers: true, usageRecords: true } },
      onboardingProgress: true,
    },
  });

  if (!tenant) return notFound();

  // Get latest usage
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const latestUsage = await db.tenantUsage.findFirst({
    where: { tenantId: id, periodStart: { gte: periodStart } },
    orderBy: { periodStart: "desc" },
  });

  // Get usage history (3 months)
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const usageHistory = await db.tenantUsage.findMany({
    where: { tenantId: id, periodStart: { gte: threeMonthsAgo } },
    orderBy: { periodStart: "desc" },
  });

  // Get order stats
  const orderStats = await db.order.aggregate({
    where: { tenantId: id, paymentStatus: "PAID" },
    _sum: { total: true },
    _count: true,
  });

  // Compute billing metrics
  const plan = (tenant.billingPlan || "standard") as PlanId;
  const provider = tenant.hostingProvider || "vercel";
  const metrics = latestUsage
    ? computeBillingMetrics(plan, latestUsage as any, provider)
    : null;

  // Serialize dates
  const serialized = {
    ...tenant,
    createdAt: tenant.createdAt.toISOString(),
    updatedAt: tenant.updatedAt.toISOString(),
    nextInvoiceDate: tenant.nextInvoiceDate?.toISOString() || null,
    lastPaymentDate: tenant.lastPaymentDate?.toISOString() || null,
    onboardingProgress: tenant.onboardingProgress
      ? { ...tenant.onboardingProgress, updatedAt: tenant.onboardingProgress.updatedAt.toISOString(), completedAt: tenant.onboardingProgress.completedAt?.toISOString() || null }
      : null,
  };

  return (
    <TenantAnalyticsView
      tenant={serialized as any}
      metrics={metrics}
      latestUsage={latestUsage ? { ...latestUsage, periodStart: latestUsage.periodStart.toISOString(), periodEnd: latestUsage.periodEnd.toISOString(), reportedAt: latestUsage.reportedAt.toISOString() } : null}
      usageHistory={usageHistory.map((u) => ({ ...u, periodStart: u.periodStart.toISOString(), periodEnd: u.periodEnd.toISOString(), reportedAt: u.reportedAt.toISOString() }))}
      orderStats={{ revenue: Number(orderStats._sum.total ?? 0), count: orderStats._count }}
    />
  );
}
