export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { Building2, Users, ShoppingCart, TrendingUp } from "lucide-react";

export default async function SuperAdminDashboard() {
  const [totalTenants, totalUsers, totalOrders, revenue] = await Promise.all([
    db.tenant.count(),
    db.user.count(),
    db.order.count(),
    db.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { total: true },
    }),
  ]);

  const totalRevenue = Number(revenue._sum.total ?? 0);

  const stats = [
    {
      label: "Total Tenants",
      value: totalTenants,
      icon: Building2,
      color: "text-emerald-700 bg-emerald-50",
    },
    {
      label: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "text-blue-700 bg-blue-50",
    },
    {
      label: "Total Orders",
      value: totalOrders,
      icon: ShoppingCart,
      color: "text-purple-700 bg-purple-50",
    },
    {
      label: "Total Revenue",
      value: formatPrice(totalRevenue),
      icon: TrendingUp,
      color: "text-green-700 bg-green-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Dashboard</h1>
        <p className="text-sm text-gray-500">
          Overview of all tenants and platform-wide metrics.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
