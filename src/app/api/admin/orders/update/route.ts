import { NextRequest, NextResponse } from "next/server";
import { getScopedDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const tdb = await getScopedDb();

    const { orderId, status, trackingNumber, notes } = await request.json();
    if (!orderId || !status) {
      return NextResponse.json({ error: "orderId and status required" }, { status: 400 });
    }

    // Verify order belongs to tenant
    const order = await tdb.order.findFirst({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const data: Record<string, any> = { status };
    if (trackingNumber !== undefined && trackingNumber !== null) data.trackingNumber = trackingNumber;
    if (notes !== undefined && notes !== null) data.notes = notes;
    if (status === "SHIPPED") data.shippedAt = new Date();
    if (status === "DELIVERED") data.deliveredAt = new Date();

    const updated = await tdb.order.update({ where: { id: orderId }, data });

    return NextResponse.json({ order: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
