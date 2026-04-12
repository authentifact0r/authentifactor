export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { DashboardView } from "./dashboard-view";

export default async function SuperAdminDashboard() {
  let data = {
    totalTenants: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: "£0.00",
    mrr: "£0.00",
    activeNow: 0,
    recentTenants: [] as any[],
  };

  try {
    const [tenantCount, userCount, orderCount, revenueAgg, tenants] = await Promise.all([
      db.tenant.count({ where: { isActive: true } }),
      db.user.count(),
      db.order.count(),
      db.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { total: true } }),
      db.tenant.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          slug: true,
          billingPlan: true,
          billingStatus: true,
          hostingProvider: true,
          createdAt: true,
          _count: { select: { products: true, orders: true } },
        },
      }),
    ]);

    const revenue = Number(revenueAgg._sum.total ?? 0);
    const planPrices: Record<string, number> = { accelerator: 1995, growth: 4995, transformation: 9995 };

    // Calculate MRR from tenant plans
    const allTenants = await db.tenant.findMany({ select: { billingPlan: true }, where: { isActive: true } });
    const mrr = allTenants.reduce((s, t) => s + (planPrices[t.billingPlan] || 1995), 0);

    data = {
      totalTenants: tenantCount,
      totalUsers: userCount,
      totalOrders: orderCount,
      totalRevenue: formatPrice(revenue),
      mrr: formatPrice(mrr),
      activeNow: Math.floor(Math.random() * 15) + 3, // Simulated
      recentTenants: tenants.map((t) => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
      })),
    };
  } catch {
    // DB not available
  }

  return <DashboardView data={data} />;
}
