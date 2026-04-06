"use client";

import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface MonthlySpend {
  month: string;
  amount: number;
  orders: number;
}

const chartConfig = {
  amount: {
    label: "Spent",
    color: "#C5A059",
  },
} satisfies ChartConfig;

export function SpendingChart({ data }: { data: MonthlySpend[] }) {
  if (!data.length || data.every((d) => d.amount === 0)) return null;

  return (
    <div>
      <h2
        className="text-xl text-[#1a1a1a] mb-4"
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: "italic",
          fontWeight: 400,
        }}
      >
        Your Spending
      </h2>
      <div className="bg-white border border-[#E5E5E5] p-5">
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart
            data={data}
            margin={{ top: 5, right: 5, left: 5, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E5E5E5" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={11}
              fontFamily="Inter, sans-serif"
              stroke="#999"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={11}
              fontFamily="Inter, sans-serif"
              stroke="#999"
              tickFormatter={(v) => `£${v}`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => `£${Number(value).toFixed(2)}`}
                />
              }
            />
            <Bar
              dataKey="amount"
              fill="var(--color-amount)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}
