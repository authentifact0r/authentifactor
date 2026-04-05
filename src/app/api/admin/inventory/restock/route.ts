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

    const { productId, quantity, warehouseId } = await request.json();
    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json({ error: "productId and positive quantity required" }, { status: 400 });
    }

    // Verify product belongs to tenant
    const product = await db.product.findFirst({ where: { id: productId, tenantId } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    // Verify warehouse if provided
    if (warehouseId) {
      const wh = await db.warehouse.findFirst({ where: { id: warehouseId, tenantId } });
      if (!wh) return NextResponse.json({ error: "Warehouse not found" }, { status: 404 });
    }

    const batchNumber = `RST-${product.sku}-${Date.now().toString(36).toUpperCase()}`;

    const batch = await db.inventoryBatch.create({
      data: {
        tenantId,
        productId,
        warehouseId: warehouseId || null,
        quantity,
        costPrice: Number(product.price) * 0.4,
        batchNumber,
      },
    });

    return NextResponse.json({ batch }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
