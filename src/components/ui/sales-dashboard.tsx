"use client";

import React, { FC, useMemo } from "react";
import { useRealtimeSalesData, type SaleDataPoint, type LatestPayment } from "@/hooks/useRealtimeSalesData";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
} from "recharts";
import { DollarSign, Repeat2, TrendingUp, Clock, BarChart } from "lucide-react";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount);

interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
  icon?: React.ReactNode;
  description?: string;
  valueClassName?: string;
}

const MetricCard: FC<MetricCardProps> = ({ title, value, unit = "", icon, description, valueClassName }) => (
  <Card className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-white/60">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className={`text-2xl font-bold text-white ${valueClassName || ""}`}>
        {unit}{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      {description && <p className="text-xs text-white/40 mt-1">{description}</p>}
    </CardContent>
  </Card>
);

interface ChartProps {
  data: SaleDataPoint[];
  title: string;
  dataKey: keyof SaleDataPoint;
  lineColor: string;
  legendName: string;
}

const SalesChart: FC<ChartProps> = React.memo(({ data, title, dataKey, lineColor, legendName }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const now = new Date();
    const twoMinAgo = new Date(now.getTime() - 2 * 60 * 1000);
    const filtered = data.filter((p) => {
      if (!p.time) return false;
      const parts = p.time.split(":");
      if (parts.length !== 3) return true;
      const pt = new Date();
      pt.setHours(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
      return pt >= twoMinAgo;
    });
    return filtered.length > 0 ? filtered : data.slice(-10);
  }, [data]);

  return (
    <Card className="flex-1 min-w-[300px] border-white/[0.08] bg-white/[0.04] backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <BarChart className="h-5 w-5 text-emerald-400" />{title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="time"
                stroke="rgba(255,255,255,0.3)"
                fontSize={10}
                interval="preserveStartEnd"
                tickFormatter={(t) => {
                  if (typeof t === "string" && t.includes(":")) {
                    const p = t.split(":");
                    return p.length >= 3 ? `${p[1]}:${p[2]}` : t;
                  }
                  return t;
                }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.3)"
                fontSize={10}
                tickFormatter={(v) => `£${v}`}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.9)",
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: "0.5rem",
                  color: "#fff",
                }}
                labelStyle={{ color: "rgba(255,255,255,0.5)" }}
                formatter={(value: any) => [formatCurrency(Number(value) || 0), legendName]}
              />
              <Legend wrapperStyle={{ color: "rgba(255,255,255,0.5)", paddingTop: "8px" }} />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={lineColor}
                strokeWidth={2}
                dot={false}
                name={legendName}
                isAnimationActive={chartData.length <= 1}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});

export const SalesDashboard: FC = () => {
  const {
    totalRevenue,
    cumulativeRevenueData,
    salesCount,
    averageSale,
    salesChartData,
    latestPayments,
  } = useRealtimeSalesData();

  return (
    <div className="w-full p-6 md:p-8 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Sales Dashboard</h1>
        <p className="text-sm text-white/40 mt-1">Real-time insights into tenant sales performance</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={totalRevenue}
          unit="£"
          icon={<DollarSign className="h-4 w-4 text-white/30" />}
          description="Today's revenue"
          valueClassName="!text-emerald-400"
        />
        <MetricCard
          title="Transactions"
          value={salesCount}
          icon={<Repeat2 className="h-4 w-4 text-white/30" />}
          description="Sales today"
        />
        <MetricCard
          title="Average Sale"
          value={averageSale}
          unit="£"
          icon={<TrendingUp className="h-4 w-4 text-white/30" />}
          description="Per transaction"
          valueClassName="!text-blue-400"
        />
        <Card className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/60">Status</CardTitle>
            <Clock className="h-4 w-4 text-white/30 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              Live
            </div>
            <p className="text-xs text-white/40 mt-1">Polling every 3 seconds</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SalesChart
          data={salesChartData}
          title="Sales per Interval"
          dataKey="sales"
          lineColor="#10b981"
          legendName="Sale Amount"
        />
        <SalesChart
          data={cumulativeRevenueData}
          title="Cumulative Revenue"
          dataKey="sales"
          lineColor="#8b5cf6"
          legendName="Cumulative"
        />
      </div>

      {/* Latest Payments */}
      <Card className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <DollarSign className="h-5 w-5 text-emerald-400" /> Latest Payments
          </CardTitle>
          <CardDescription className="text-white/40">Recently completed transactions</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[280px]">
            <div className="divide-y divide-white/[0.06]">
              {latestPayments.length === 0 ? (
                <p className="p-6 text-center text-white/40">No payments yet today...</p>
              ) : (
                latestPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.03] transition-colors">
                    <div>
                      <span className="font-semibold text-lg text-white">{formatCurrency(payment.amount)}</span>
                      <p className="text-sm text-white/40">{payment.product} — {payment.customer}</p>
                    </div>
                    <span className="text-xs text-white/30">{payment.time}</span>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="pt-4 border-t border-white/[0.06]">
          <p className="text-sm text-white/30">Showing last 10 transactions</p>
        </CardFooter>
      </Card>
    </div>
  );
};
