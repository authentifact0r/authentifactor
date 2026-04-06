import { NextResponse } from "next/server";
import { getScopedDb } from "@/lib/db";
import { db } from "@/lib/db";

export async function GET() {
  try {
    let tdb;
    try {
      tdb = await getScopedDb();
    } catch {
      // No tenant context — use global db (superadmin)
      tdb = db;
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await tdb.order.findMany({
      where: {
        createdAt: { gte: today },
        paymentStatus: "PAID",
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        total: true,
        createdAt: true,
        userId: true,
        items: { select: { product: { select: { name: true } } } },
      },
    });

    const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
    const salesCount = orders.length;
    const averageSale = salesCount > 0 ? totalRevenue / salesCount : 0;
    const lastSaleAmount = orders.length > 0 ? Number(orders[0].total) : 0;

    // Fetch customer names
    const userIds = [...new Set(orders.map((o) => o.userId))];
    const users = userIds.length > 0
      ? await db.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, firstName: true, lastName: true, email: true },
        })
      : [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    const latestPayments = orders.slice(0, 10).map((o) => {
      const user = userMap.get(o.userId);
      return {
        id: o.id,
        amount: Number(o.total),
        product: o.items?.[0]?.product?.name || "Order",
        customer: user ? `${user.firstName} ${user.lastName}`.trim() : user?.email || "Customer",
        time: o.createdAt.toLocaleTimeString("en-GB"),
      };
    });

    return NextResponse.json({
      totalRevenue,
      salesCount,
      averageSale,
      lastSaleAmount,
      latestPayments,
    });
  } catch {
    return NextResponse.json({
      totalRevenue: 0,
      salesCount: 0,
      averageSale: 0,
      lastSaleAmount: 0,
      latestPayments: [],
    });
  }
}
