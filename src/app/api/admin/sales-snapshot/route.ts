import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await db.order.findMany({
      where: { createdAt: { gte: today } },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        items: { include: { product: { select: { name: true } } } },
      },
    });

    const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const salesCount = orders.length;
    const averageSale = salesCount > 0 ? totalRevenue / salesCount : 0;
    const lastSaleAmount = orders[0]?.totalAmount || 0;

    const latestPayments = orders.slice(0, 10).map((o) => ({
      id: o.id,
      amount: o.totalAmount || 0,
      product: o.items?.[0]?.product?.name || "Order",
      customer: o.customerName || o.customerEmail || "Customer",
      time: o.createdAt.toLocaleTimeString("en-GB"),
    }));

    return NextResponse.json({
      totalRevenue,
      salesCount,
      averageSale,
      lastSaleAmount,
      latestPayments,
    });
  } catch (error: any) {
    // Return zeros if no orders table or connection issue
    return NextResponse.json({
      totalRevenue: 0,
      salesCount: 0,
      averageSale: 0,
      lastSaleAmount: 0,
      latestPayments: [],
    });
  }
}
