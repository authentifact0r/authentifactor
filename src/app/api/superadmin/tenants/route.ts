import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { computeBillingMetrics } from "@/lib/usageBilling";
import type { PlanId } from "@/config/usagePricing";

export async function GET() {
  try {
    const tenants = await db.tenant.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        customDomain: true,
        primaryColor: true,
        billingPlan: true,
        billingStatus: true,
        billingEmail: true,
        hostingProvider: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        nextInvoiceDate: true,
        lastPaymentStatus: true,
        lastPaymentDate: true,
        lastInvoiceTotalGbp: true,
        lastInvoiceBaseRetainerGbp: true,
        lastInvoiceHostingUsageGbp: true,
        lastInvoiceBackendUsageGbp: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            products: true,
            orders: true,
            tenantUsers: true,
          },
        },
      },
    });

    // Fetch latest usage for each tenant and compute live costs
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const enriched = await Promise.all(
      tenants.map(async (t) => {
        const latestUsage = await db.tenantUsage.findFirst({
          where: { tenantId: t.id, periodStart: { gte: periodStart } },
          orderBy: { periodStart: "desc" },
        });

        const plan = (t.billingPlan || "accelerator") as PlanId;
        const provider = t.hostingProvider || "vercel";

        if (latestUsage) {
          const metrics = computeBillingMetrics(plan, latestUsage as any, provider);
          return {
            ...t,
            // Override lastInvoice fields with live computed data
            lastInvoiceBaseRetainerGbp: t.lastInvoiceBaseRetainerGbp ?? metrics.baseRetainerGbp,
            lastInvoiceHostingUsageGbp: t.lastInvoiceHostingUsageGbp ?? metrics.hostingUsageGbp,
            lastInvoiceBackendUsageGbp: t.lastInvoiceBackendUsageGbp ?? metrics.backendUsageGbp,
            lastInvoiceTotalGbp: t.lastInvoiceTotalGbp ?? metrics.totalMonthlyCostGbp,
            // Add live usage metrics
            liveMetrics: {
              baseRetainerGbp: metrics.baseRetainerGbp,
              hostingUsageGbp: metrics.hostingUsageGbp,
              backendUsageGbp: metrics.backendUsageGbp,
              totalMonthlyCostGbp: metrics.totalMonthlyCostGbp,
            },
          };
        }

        // No usage data — return base plan price
        const basePrices: Record<string, number> = { basic: 49, standard: 99, premium: 199 };
        const base = basePrices[plan] || 99;
        return {
          ...t,
          lastInvoiceBaseRetainerGbp: t.lastInvoiceBaseRetainerGbp ?? base,
          lastInvoiceHostingUsageGbp: t.lastInvoiceHostingUsageGbp ?? 0,
          lastInvoiceBackendUsageGbp: t.lastInvoiceBackendUsageGbp ?? 0,
          lastInvoiceTotalGbp: t.lastInvoiceTotalGbp ?? base,
          liveMetrics: null,
        };
      })
    );

    return NextResponse.json({ tenants: enriched });
  } catch (error: any) {
    console.error("Superadmin tenants error:", error);
    return NextResponse.json({ tenants: [], error: error.message }, { status: 500 });
  }
}
