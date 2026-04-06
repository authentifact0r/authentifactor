import { NextRequest, NextResponse } from "next/server";
import { getScopedDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const tdb = await getScopedDb();

    const { batchId, delta } = await request.json();
    if (!batchId || typeof delta !== "number") {
      return NextResponse.json({ error: "batchId and delta required" }, { status: 400 });
    }

    const batch = await tdb.inventoryBatch.findFirst({ where: { id: batchId } });
    if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 });

    const newQty = batch.quantity + delta;
    if (newQty < 0) return NextResponse.json({ error: "Cannot reduce below 0" }, { status: 400 });

    const updated = await tdb.inventoryBatch.update({
      where: { id: batchId },
      data: { quantity: newQty },
    });

    return NextResponse.json({ batch: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
