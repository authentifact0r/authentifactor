import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";
import { computeBillingMetrics } from "@/lib/usageBilling";
import type { PlanId } from "@/config/usagePricing";

/**
 * GET /api/billing/usage?months=3
 *
 * 2026-05-20 hardening (audit CRITICAL #7): tenantId is derived from
 * the authenticated admin's JWT — any query-string tenantId is ignored.
 * Previously this returned any tenant's billing data without auth.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin();
    const tenantId = user.tenantId;
    const months = parseInt(request.nextUrl.searchParams.get("months") || "1");

    const since = new Date();
    since.setMonth(since.getMonth() - months);

    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      select: { billingPlan: true, hostingProvider: true, name: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const records = await db.tenantUsage.findMany({
      where: { tenantId, periodStart: { gte: since } },
      orderBy: { periodStart: "desc" },
    });

    const plan = (tenant.billingPlan || "accelerator") as PlanId;
    const provider = tenant.hostingProvider || "vercel";

    const periodsWithMetrics = records.map((r) => {
      const metrics = computeBillingMetrics(plan, r as any, provider);
      return { ...r, metrics };
    });

    return NextResponse.json({
      records: periodsWithMetrics,
      plan,
      hostingProvider: provider,
      tenantName: tenant.name,
    });
  } catch (error: any) {
    if (error?.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error?.message?.startsWith("Forbidden")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Usage fetch error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * POST /api/billing/usage — record usage for a period.
 *
 * 2026-05-20 hardening (audit CRITICAL #7): requires super-admin. This
 * route writes the usage records that DRIVE the next invoice — a
 * tenant admin could otherwise write zero usage to dodge billing, and
 * an unauthenticated caller could write inflated usage to bill a
 * competitor's tenant into the ground. The cron/scheduler that
 * periodically ingests cloud-provider metrics should authenticate as
 * a super-admin service account (TODO: migrate to a dedicated
 * internal-shared-secret header pattern with `crypto.timingSafeEqual`).
 */
export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin();
    const body = await request.json();
    const { tenantId, periodStart, periodEnd, gcp, vercel } = body;

    if (!tenantId || !periodStart || !periodEnd) {
      return NextResponse.json({ error: "tenantId, periodStart, periodEnd required" }, { status: 400 });
    }

    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      select: { billingPlan: true, hostingProvider: true },
    });

    const plan = (tenant?.billingPlan || "accelerator") as PlanId;
    const provider = tenant?.hostingProvider || "vercel";

    const usageData = {
      gcpCloudRunRequests: gcp?.cloud_run_requests || 0,
      gcpCloudRunCpuSeconds: gcp?.cloud_run_cpu_seconds || 0,
      gcpCloudRunMemoryGbHrs: gcp?.cloud_run_memory_gb_hours || 0,
      gcpFirestoreReads: gcp?.firestore_reads || 0,
      gcpFirestoreWrites: gcp?.firestore_writes || 0,
      gcpFirestoreStorageGb: gcp?.firestore_storage_gb || 0,
      gcpStorageGb: gcp?.storage_gb || 0,
      gcpStorageEgressGb: gcp?.storage_egress_gb || 0,
      vercelBuildMinutes: vercel?.build_minutes || 0,
      vercelServerlessInvocations: vercel?.serverless_invocations || 0,
      vercelEdgeRequests: vercel?.edge_invocations || 0,
      vercelBandwidthGb: vercel?.bandwidth_gb || 0,
      vercelImageOptimizations: vercel?.image_optimization || 0,
    };

    const metrics = computeBillingMetrics(plan, usageData, provider);

    const record = await db.tenantUsage.upsert({
      where: {
        tenantId_periodStart_periodEnd: {
          tenantId,
          periodStart: new Date(periodStart),
          periodEnd: new Date(periodEnd),
        },
      },
      update: {
        ...usageData,
        gcpCostGbp: metrics.backendUsageGbp,
        vercelCostGbp: metrics.hostingUsageGbp,
        totalCostGbp: metrics.totalMonthlyCostGbp,
      },
      create: {
        tenantId,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        ...usageData,
        gcpCostGbp: metrics.backendUsageGbp,
        vercelCostGbp: metrics.hostingUsageGbp,
        totalCostGbp: metrics.totalMonthlyCostGbp,
      },
    });

    return NextResponse.json({ record, metrics });
  } catch (error: any) {
    if (error?.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error?.message?.startsWith("Forbidden")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Usage record error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
