export const dynamic = "force-dynamic";

import { getScopedDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Package, ShoppingCart, AlertTriangle, TrendingUp, Clock } from "lucide-react";
import { SalesDashboardWrapper } from "./sales-dashboard-wrapper";

export default async function AdminDashboard() {
  await requireAdmin();

  let totalProducts = 0;
  let totalOrders = 0;
  let pendingOrders = 0;
  let lowStockBatches = 0;
  let expiringBatches = 0;
  let recentOrders: any[] = [];
  let totalRevenue = 0;

  try {
    const tdb = await getScopedDb();
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const results = await Promise.all([
      tdb.product.count({ where: { isActive: true } }),
      tdb.order.count(),
      tdb.order.count({ where: { status: "PENDING" } }),
      tdb.inventoryBatch.count({ where: { quantity: { lte: 10, gt: 0 } } }),
      tdb.inventoryBatch.count({ where: { expiryDate: { lte: thirtyDaysFromNow, gte: now } } }),
      tdb.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, orderNumber: true, total: true, status: true, createdAt: true },
      }),
      tdb.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { total: true } }),
    ]);

    totalProducts = results[0];
    totalOrders = results[1];
    pendingOrders = results[2];
    lowStockBatches = results[3];
    expiringBatches = results[4];
    recentOrders = results[5];
    totalRevenue = Number(results[6]._sum.total ?? 0);
  } catch {
    // No tenant context or DB issue — show zeros
  }

  const stats = [
    { label: "Products", value: totalProducts, icon: Package, color: "text-emerald-400 bg-emerald-500/10" },
    { label: "Total Orders", value: totalOrders, icon: ShoppingCart, color: "text-blue-400 bg-blue-500/10" },
    { label: "Revenue", value: formatPrice(totalRevenue), icon: TrendingUp, color: "text-green-400 bg-green-500/10" },
  ];

  return (
    <div className="space-y-6 p-6 md:p-8">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-sm text-white/50">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-amber-500/20 bg-amber-500/[0.06]">
          <CardContent className="flex items-center gap-4 p-5">
            <AlertTriangle className="h-8 w-8 text-amber-400" />
            <div>
              <p className="font-semibold text-amber-300">{lowStockBatches} low stock batches</p>
              <p className="text-sm text-amber-400/60">Items with 10 or fewer units</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/20 bg-red-500/[0.06]">
          <CardContent className="flex items-center gap-4 p-5">
            <Clock className="h-8 w-8 text-red-400" />
            <div>
              <p className="font-semibold text-red-300">{expiringBatches} batches expiring soon</p>
              <p className="text-sm text-red-400/60">Within the next 30 days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <Card className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              Recent Orders
              {pendingOrders > 0 && (
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">{pendingOrders} pending</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-sm">
                  <div>
                    <p className="font-medium text-white">{order.orderNumber}</p>
                    <p className="text-xs text-white/40">{order.createdAt.toLocaleDateString("en-GB")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">{formatPrice(Number(order.total))}</p>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold mt-1 ${
                      order.status === "PENDING" ? "bg-amber-500/20 text-amber-300" :
                      order.status === "DELIVERED" ? "bg-emerald-500/20 text-emerald-300" :
                      "bg-white/10 text-white/50"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Sales Dashboard */}
      <SalesDashboardWrapper />
    </div>
  );
}
