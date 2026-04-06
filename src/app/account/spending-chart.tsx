"use client";

import { RevenueBarChart } from "@/components/charts";

interface MonthlySpend {
  month: string;
  amount: number;
  orders: number;
}

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
      <RevenueBarChart
        data={data}
        title=""
        xKey="month"
        bars={[{ key: "amount", label: "Spent", color: "#C5A059" }]}
        currency="£"
        height={200}
      />
    </div>
  );
}
