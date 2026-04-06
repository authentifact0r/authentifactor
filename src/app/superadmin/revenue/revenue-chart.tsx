"use client";

import { RevenueBarChart } from "@/components/charts";

interface MonthlyData {
  month: string;
  gmv: number;
  fees: number;
  subscriptions: number;
}

export function RevenueChart({ data }: { data: MonthlyData[] }) {
  if (!data.length) return null;

  return (
    <RevenueBarChart
      data={data}
      title="Revenue Trend"
      xKey="month"
      bars={[
        { key: "subscriptions", label: "Subscriptions", color: "#f59e0b", stackId: "rev" },
        { key: "fees", label: "Platform Fees", color: "#10b981", stackId: "rev" },
      ]}
      currency="£"
      height={300}
    />
  );
}
