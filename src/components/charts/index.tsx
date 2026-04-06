"use client";

/**
 * Reusable chart components built on shadcn/ui Chart + Recharts.
 * Drop these into any project — just needs:
 *   - src/components/ui/chart.tsx (shadcn chart)
 *   - recharts package
 *   - src/lib/utils.ts (cn function)
 *
 * Usage:
 *   import { RevenueBarChart, TrendLineChart, MetricCard, TopItemsChart } from "@/components/charts";
 */

import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReactNode } from "react";

// ─── MetricCard ──────────────────────────────────────────────
// Compact stat card — use in a grid for KPIs

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
  trend?: { value: number; label: string }; // e.g. { value: 12, label: "vs last month" }
  className?: string;
}

export function MetricCard({ title, value, icon, description, trend, className }: MetricCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <p className={`text-xs mt-1 ${trend.value >= 0 ? "text-emerald-500" : "text-red-500"}`}>
            {trend.value >= 0 ? "+" : ""}
            {trend.value}% {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── RevenueBarChart ─────────────────────────────────────────
// Stacked or single bar chart for revenue/spending over time

interface RevenueBarChartProps {
  data: Record<string, any>[];
  title: string;
  xKey: string;
  bars: { key: string; label: string; color: string; stackId?: string }[];
  height?: number;
  currency?: string;
}

export function RevenueBarChart({
  data,
  title,
  xKey,
  bars,
  height = 300,
  currency = "£",
}: RevenueBarChartProps) {
  const config: ChartConfig = {};
  bars.forEach((b) => {
    config[b.key] = { label: b.label, color: b.color };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className={`w-full`} style={{ height }}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              tickFormatter={(v) => `${currency}${v}`}
            />
            <ChartTooltip
              content={<ChartTooltipContent formatter={(v) => `${currency}${Number(v).toFixed(2)}`} />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            {bars.map((b, i) => (
              <Bar
                key={b.key}
                dataKey={b.key}
                fill={`var(--color-${b.key})`}
                radius={i === bars.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                stackId={b.stackId}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// ─── TrendLineChart ──────────────────────────────────────────
// Smooth area/line chart for trends over time

interface TrendLineChartProps {
  data: Record<string, any>[];
  title: string;
  xKey: string;
  lines: { key: string; label: string; color: string }[];
  height?: number;
  currency?: string;
  area?: boolean; // fill under the line
}

export function TrendLineChart({
  data,
  title,
  xKey,
  lines,
  height = 300,
  currency,
  area = false,
}: TrendLineChartProps) {
  const config: ChartConfig = {};
  lines.forEach((l) => {
    config[l.key] = { label: l.label, color: l.color };
  });

  const Chart = area ? AreaChart : LineChart;
  const DataLine = area ? Area : Line;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="w-full" style={{ height }}>
          <Chart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              tickFormatter={currency ? (v) => `${currency}${v}` : undefined}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={currency ? (v) => `${currency}${Number(v).toFixed(2)}` : undefined}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            {lines.map((l) => (
              <DataLine
                key={l.key}
                type="monotone"
                dataKey={l.key}
                stroke={`var(--color-${l.key})`}
                fill={area ? `var(--color-${l.key})` : undefined}
                fillOpacity={area ? 0.15 : undefined}
                strokeWidth={2}
                dot={false}
                name={l.label}
              />
            ))}
          </Chart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// ─── TopItemsChart ───────────────────────────────────────────
// Horizontal bar chart for top N items (products, categories, etc.)

interface TopItemsChartProps {
  data: { name: string; value: number }[];
  title: string;
  color?: string;
  height?: number;
  currency?: string;
}

export function TopItemsChart({
  data,
  title,
  color = "#6366f1",
  height = 250,
  currency = "£",
}: TopItemsChartProps) {
  const config: ChartConfig = {
    value: { label: "Value", color },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="w-full" style={{ height }}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickFormatter={(v) => `${currency}${v}`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              width={120}
            />
            <ChartTooltip
              content={<ChartTooltipContent formatter={(v) => `${currency}${Number(v).toFixed(2)}`} />}
            />
            <Bar dataKey="value" fill="var(--color-value)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// ─── DonutChart ──────────────────────────────────────────────
// For category/status breakdowns

interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
  title: string;
  height?: number;
}

export function DonutChart({ data, title, height = 250 }: DonutChartProps) {
  const config: ChartConfig = {};
  data.forEach((d) => {
    config[d.name] = { label: d.name, color: d.color };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <ChartContainer config={config} className="w-full" style={{ height }}>
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
