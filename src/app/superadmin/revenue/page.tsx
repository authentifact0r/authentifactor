export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, TrendingUp, Building2, Percent } from "lucide-react";

function formatGBP(amount: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

export default async function RevenuePage() {
  await requireSuperAdmin();

  // Get all tenants with their paid orders
  const tenants = await db.tenant.findMany({
    where: { isActive: true },
    include: {
      orders: {
        where: { paymentStatus: "PAID" },
        select: {
          total: true,
          platformFee: true,
          platformFeePercent: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Calculate per-tenant revenue
  const tenantRevenue = tenants.map((t) => {
    const gmv = t.orders.reduce((sum, o) => sum + Number(o.total), 0);
    const fees = t.orders.reduce((sum, o) => sum + Number(o.platformFee), 0);
    const orderCount = t.orders.length;

    // Monthly breakdown (last 3 months)
    const now = new Date();
    const months: { label: string; gmv: number; fees: number; orders: number }[] = [];
    for (let i = 2; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthOrders = t.orders.filter(
        (o) => o.createdAt >= monthStart && o.createdAt <= monthEnd
      );
      months.push({
        label: monthStart.toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
        gmv: monthOrders.reduce((s, o) => s + Number(o.total), 0),
        fees: monthOrders.reduce((s, o) => s + Number(o.platformFee), 0),
        orders: monthOrders.length,
      });
    }

    return {
      id: t.id,
      name: t.name,
      slug: t.slug,
      feePercent: t.applicationFeePercent,
      gmv,
      fees,
      orderCount,
      months,
    };
  });

  // Totals
  const totalGMV = tenantRevenue.reduce((s, t) => s + t.gmv, 0);
  const totalFees = tenantRevenue.reduce((s, t) => s + t.fees, 0);
  const totalOrders = tenantRevenue.reduce((s, t) => s + t.orderCount, 0);
  const subscriptionMRR = tenants.reduce((s, t) => {
    const planPrices: Record<string, number> = { basic: 49, standard: 99, premium: 199 };
    return s + (planPrices[t.billingPlan] ?? 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Revenue</h1>
        <p className="text-sm text-gray-500">
          Transaction fees, GMV, and subscription MRR across all tenants.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total GMV</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatGBP(totalGMV)}</div>
            <p className="text-xs text-muted-foreground">{totalOrders} orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatGBP(totalFees)}</div>
            <p className="text-xs text-muted-foreground">
              {totalGMV > 0 ? ((totalFees / totalGMV) * 100).toFixed(1) : 0}% effective rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatGBP(subscriptionMRR)}</div>
            <p className="text-xs text-muted-foreground">{tenants.length} tenants</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total MRR</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatGBP(subscriptionMRR + totalFees)}</div>
            <p className="text-xs text-muted-foreground">Subscriptions + fees</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-tenant breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Tenant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Fee Rate</TableHead>
                  <TableHead className="text-right">GMV</TableHead>
                  <TableHead className="text-right">Platform Fees</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  {tenantRevenue[0]?.months.map((m) => (
                    <TableHead key={m.label} className="text-right">
                      {m.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenantRevenue.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{t.name}</span>
                        <span className="block text-xs text-gray-500">{t.slug}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{t.feePercent}%</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatGBP(t.gmv)}
                    </TableCell>
                    <TableCell className="text-right text-emerald-600 font-medium">
                      {formatGBP(t.fees)}
                    </TableCell>
                    <TableCell className="text-right">{t.orderCount}</TableCell>
                    {t.months.map((m) => (
                      <TableCell key={m.label} className="text-right text-sm">
                        <span className="block">{formatGBP(m.fees)}</span>
                        <span className="text-xs text-gray-400">{m.orders} orders</span>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
