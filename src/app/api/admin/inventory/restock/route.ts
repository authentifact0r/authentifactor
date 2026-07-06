import { NextRequest, NextResponse } from "next/server";
import { getScopedDb, TENANT_ID } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const tdb = await getScopedDb();

    const { productId, quantity, warehouseId } = await request.json();
    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json({ error: "productId and positive quantity required" }, { status: 400 });
    }

    // Verify product belongs to tenant
    const product = await tdb.product.findFirst({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    // Verify warehouse if provided
    if (warehouseId) {
      const warehouse = await tdb.warehouse.findFirst({ where: { id: warehouseId } });
      if (!warehouse) return NextResponse.json({ error: "Warehouse not found" }, { status: 404 });
    }

    // Generate batch number
    const count = await tdb.inventoryBatch.count({ where: { productId } });
    const batchNumber = `${product.sku || "BATCH"}-${String(count + 1).padStart(3, "0")}`;

    const batch = await tdb.inventoryBatch.create({
      data: {
        tenantId: TENANT_ID, // real value injected by tenantDb extension (lib/db.ts)
        productId,
        warehouseId: warehouseId || null,
        batchNumber,
        quantity,
        costPrice: product.price,
      },
    });

    return NextResponse.json({ batch }, { status: 201 });
  } catch (error: any) {
    return apiError(error, { context: "admin/inventory/restock" });
  }
}
