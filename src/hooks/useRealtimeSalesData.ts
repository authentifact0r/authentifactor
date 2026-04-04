"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface SaleDataPoint {
  time: string;
  sales: number;
}

export interface LatestPayment {
  id: string;
  amount: number;
  product: string;
  customer: string;
  time: string;
}

export function useRealtimeSalesData() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [salesCount, setSalesCount] = useState(0);
  const [averageSale, setAverageSale] = useState(0);
  const [salesChartData, setSalesChartData] = useState<SaleDataPoint[]>([]);
  const [cumulativeRevenueData, setCumulativeRevenueData] = useState<SaleDataPoint[]>([]);
  const [latestPayments, setLatestPayments] = useState<LatestPayment[]>([]);
  const cumulativeRef = useRef(0);

  const fetchSalesData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/sales-snapshot");
      if (!res.ok) return;
      const data = await res.json();

      if (data.totalRevenue !== undefined) setTotalRevenue(data.totalRevenue);
      if (data.salesCount !== undefined) setSalesCount(data.salesCount);
      if (data.averageSale !== undefined) setAverageSale(data.averageSale);
      if (data.latestPayments) setLatestPayments(data.latestPayments);

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
      const saleAmount = data.lastSaleAmount || 0;

      setSalesChartData((prev) => {
        const next = [...prev, { time: timeStr, sales: saleAmount }];
        return next.length > 60 ? next.slice(-60) : next;
      });

      cumulativeRef.current += saleAmount;
      setCumulativeRevenueData((prev) => {
        const next = [...prev, { time: timeStr, sales: cumulativeRef.current }];
        return next.length > 60 ? next.slice(-60) : next;
      });
    } catch {
      // Silently fail — will retry on next interval
    }
  }, []);

  useEffect(() => {
    fetchSalesData();
    const interval = setInterval(fetchSalesData, 3000);
    return () => clearInterval(interval);
  }, [fetchSalesData]);

  return {
    totalRevenue,
    salesCount,
    averageSale,
    salesChartData,
    cumulativeRevenueData,
    latestPayments,
  };
}
