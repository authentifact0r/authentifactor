import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-dev-secret");

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("access_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const tenantId = payload.tenantId as string;

    const { batchId, delta } = await request.json();
    if (!batchId || delta === undefined) {
      return NextResponse.json({ error: "batchId and delta required" }, { status: 400 });
    }

    // Verify batch belongs to tenant
    const batch = await db.inventoryBatch.findFirst({ where: { id: batchId, tenantId } });
    if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 });

    const newQty = Math.max(0, batch.quantity + delta);

    const updated = await db.inventoryBatch.update({
      where: { id: batchId },
      data: { quantity: newQty },
    });

    return NextResponse.json({ batch: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
