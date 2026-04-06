"use client";

import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MonthlyData {
  month: string;
  gmv: number;
  fees: number;
  subscriptions: number;
}

const chartConfig = {
  gmv: {
    label: "GMV",
    color: "#6366f1",
  },
  fees: {
    label: "Platform Fees",
    color: "#10b981",
  },
  subscriptions: {
    label: "Subscriptions",
    color: "#f59e0b",
  },
} satisfies ChartConfig;

export function RevenueChart({ data }: { data: MonthlyData[] }) {
  if (!data.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              tickFormatter={(v) => `£${v}`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => `£${Number(value).toFixed(2)}`}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="subscriptions"
              fill="var(--color-subscriptions)"
              radius={[0, 0, 4, 4]}
              stackId="revenue"
            />
            <Bar
              dataKey="fees"
              fill="var(--color-fees)"
              radius={[4, 4, 0, 0]}
              stackId="revenue"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
