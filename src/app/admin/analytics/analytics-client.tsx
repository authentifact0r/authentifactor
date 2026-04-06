"use client";

import {
  MetricCard,
  RevenueBarChart,
  TrendLineChart,
  TopItemsChart,
  DonutChart,
} from "@/components/charts";
import { DollarSign, ShoppingCart, TrendingUp, BarChart3 } from "lucide-react";

interface Props {
  currency: string;
  monthlyData: { month: string; revenue: number; orders: number; avgOrder: number }[];
  topProducts: { name: string; value: number }[];
  orderStatusData: { name: string; value: number; color: string }[];
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  revenueTrend: number;
}

const currencySymbols: Record<string, string> = {
  GBP: "£",
  NGN: "₦",
  USD: "$",
  EUR: "€",
  GHS: "₵",
  KES: "KSh",
};

function fmt(amount: number, currency: string) {
  const sym = currencySymbols[currency] || "£";
  return `${sym}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function AnalyticsClient({
  currency,
  monthlyData,
  topProducts,
  orderStatusData,
  totalRevenue,
  totalOrders,
  avgOrderValue,
  revenueTrend,
}: Props) {
  const sym = currencySymbols[currency] || "£";

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-gray-500">Last 6 months performance</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={fmt(totalRevenue, currency)}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="Last 6 months"
          trend={revenueTrend !== 0 ? { value: revenueTrend, label: "vs prior period" } : undefined}
        />
        <MetricCard
          title="Total Orders"
          value={totalOrders}
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
          description="Paid orders"
        />
        <MetricCard
          title="Avg Order Value"
          value={fmt(avgOrderValue, currency)}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          description="Per transaction"
        />
        <MetricCard
          title="Avg Monthly Revenue"
          value={fmt(totalRevenue / 6, currency)}
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
          description="6-month average"
        />
      </div>

      {/* Revenue + Orders Trend */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueBarChart
          data={monthlyData}
          title="Monthly Revenue"
          xKey="month"
          bars={[{ key: "revenue", label: "Revenue", color: "#10b981" }]}
          currency={sym}
          height={280}
        />
        <TrendLineChart
          data={monthlyData}
          title="Order Trends"
          xKey="month"
          lines={[
            { key: "orders", label: "Orders", color: "#6366f1" },
            { key: "avgOrder", label: "Avg Order", color: "#f59e0b" },
          ]}
          currency={sym}
          height={280}
        />
      </div>

      {/* Top Products + Order Status */}
      <div className="grid gap-4 lg:grid-cols-2">
        {topProducts.length > 0 && (
          <TopItemsChart
            data={topProducts}
            title="Top Products by Revenue"
            color="#8b5cf6"
            currency={sym}
            height={Math.max(200, topProducts.length * 40)}
          />
        )}
        {orderStatusData.length > 0 && (
          <DonutChart
            data={orderStatusData}
            title="Order Status Breakdown"
            height={280}
          />
        )}
      </div>
    </div>
  );
}
