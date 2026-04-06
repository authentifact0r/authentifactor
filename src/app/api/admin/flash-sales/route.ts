import { NextRequest, NextResponse } from "next/server";
import { getScopedDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const tdb = await getScopedDb();

    const { productId, discountPercent, reason, durationHours } = await request.json();
    if (!productId || !discountPercent) return NextResponse.json({ error: "productId and discountPercent required" }, { status: 400 });

    // Verify product belongs to tenant (getScopedDb auto-scopes)
    const product = await tdb.product.findFirst({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    // Check no existing flash sale
    const existing = await tdb.flashSale.findFirst({ where: { productId } });
    if (existing) return NextResponse.json({ error: "This product already has a flash sale. Remove it first." }, { status: 400 });

    const now = new Date();
    const sale = await tdb.flashSale.create({
      data: {
        productId,
        discountPercent,
        reason: reason || null,
        startsAt: now,
        endsAt: new Date(now.getTime() + (durationHours || 24) * 3600000),
        isActive: true,
      },
    });

    return NextResponse.json({ sale }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
