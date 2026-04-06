export const dynamic = "force-dynamic";

import { requireAdmin } from "@/lib/auth";
import { getScopedDb } from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import { formatPrice } from "@/lib/utils";
import { AnalyticsClient } from "./analytics-client";

export default async function AnalyticsPage() {
  await requireAdmin();
  const tenant = await getTenant();
  const tdb = await getScopedDb();

  const now = new Date();

  // ─── Revenue + Orders by Month (last 6 months) ────────────
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const allOrders = await tdb.order.findMany({
    where: {
      paymentStatus: "PAID",
      createdAt: { gte: sixMonthsAgo },
    },
    select: {
      total: true,
      platformFee: true,
      createdAt: true,
      items: { select: { productId: true, quantity: true, totalPrice: true } },
    },
  });

  const monthlyData: {
    month: string;
    revenue: number;
    orders: number;
    avgOrder: number;
  }[] = [];

  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    const label = monthStart.toLocaleDateString("en-GB", { month: "short" });
    const monthOrders = allOrders.filter(
      (o) => o.createdAt >= monthStart && o.createdAt <= monthEnd
    );
    const revenue = monthOrders.reduce((s, o) => s + Number(o.total), 0);
    const count = monthOrders.length;

    monthlyData.push({
      month: label,
      revenue: Math.round(revenue * 100) / 100,
      orders: count,
      avgOrder: count > 0 ? Math.round((revenue / count) * 100) / 100 : 0,
    });
  }

  // ─── Top Products by Revenue ───────────────────────────────
  const productRevenue = new Map<string, { name: string; revenue: number; qty: number }>();

  for (const order of allOrders) {
    for (const item of order.items) {
      const existing = productRevenue.get(item.productId) || { name: "", revenue: 0, qty: 0 };
      existing.revenue += Number(item.totalPrice);
      existing.qty += item.quantity;
      productRevenue.set(item.productId, existing);
    }
  }

  // Fetch product names
  const productIds = Array.from(productRevenue.keys());
  if (productIds.length > 0) {
    const products = await tdb.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });
    for (const p of products) {
      const entry = productRevenue.get(p.id);
      if (entry) entry.name = p.name;
    }
  }

  const topProducts = Array.from(productRevenue.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8)
    .map((p) => ({
      name: p.name || "Unknown",
      value: Math.round(p.revenue * 100) / 100,
    }));

  // ─── Order Status Breakdown ────────────────────────────────
  const allOrderStatuses = await tdb.order.findMany({
    select: { status: true },
  });

  const statusCounts = new Map<string, number>();
  for (const o of allOrderStatuses) {
    statusCounts.set(o.status, (statusCounts.get(o.status) || 0) + 1);
  }

  const statusColors: Record<string, string> = {
    PENDING: "#f59e0b",
    CONFIRMED: "#3b82f6",
    PROCESSING: "#8b5cf6",
    SHIPPED: "#06b6d4",
    DELIVERED: "#10b981",
    CANCELLED: "#6b7280",
    REFUNDED: "#ef4444",
  };

  const orderStatusData = Array.from(statusCounts.entries()).map(([name, value]) => ({
    name,
    value,
    color: statusColors[name] || "#6b7280",
  }));

  // ─── Summary KPIs ─────────────────────────────────────────
  const totalRevenue = allOrders.reduce((s, o) => s + Number(o.total), 0);
  const totalOrderCount = allOrders.length;
  const avgOrderValue = totalOrderCount > 0 ? totalRevenue / totalOrderCount : 0;

  // Previous period comparison (6 months before that)
  const prevPeriodStart = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const prevOrders = await tdb.order.findMany({
    where: {
      paymentStatus: "PAID",
      createdAt: { gte: prevPeriodStart, lt: sixMonthsAgo },
    },
    select: { total: true },
  });
  const prevRevenue = prevOrders.reduce((s, o) => s + Number(o.total), 0);
  const revenueTrend = prevRevenue > 0
    ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100)
    : 0;

  return (
    <AnalyticsClient
      currency={tenant.currency}
      monthlyData={monthlyData}
      topProducts={topProducts}
      orderStatusData={orderStatusData}
      totalRevenue={totalRevenue}
      totalOrders={totalOrderCount}
      avgOrderValue={avgOrderValue}
      revenueTrend={revenueTrend}
    />
  );
}
