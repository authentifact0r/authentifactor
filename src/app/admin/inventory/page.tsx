export const dynamic = "force-dynamic";

import { getScopedDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { headers } from "next/headers";
import { InventoryManager } from "./inventory-manager";

export default async function AdminInventoryPage() {
  await requireAdmin();

  const h = await headers();
  const tenantSlug = h.get("x-tenant-slug") || "";

  let products: any[] = [];
  let warehouses: any[] = [];
  try {
    const tdb = await getScopedDb();
    products = await tdb.product.findMany({
      include: {
        inventoryBatches: {
          include: { warehouse: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { name: "asc" },
    });
    warehouses = await tdb.warehouse.findMany({ where: { isActive: true } });

    products = products.map((p: any) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      price: Number(p.price),
      image: p.images?.[0] || null,
      isActive: p.isActive,
      totalStock: p.inventoryBatches.reduce((s: number, b: any) => s + b.quantity, 0),
      batches: p.inventoryBatches.map((b: any) => ({
        id: b.id,
        batchNumber: b.batchNumber,
        quantity: b.quantity,
        warehouse: b.warehouse?.name || "—",
        warehouseId: b.warehouse?.id || null,
        expiryDate: b.expiryDate?.toISOString() || null,
        costPrice: Number(b.costPrice),
      })),
    }));
  } catch {
    // No tenant context
  }

  return (
    <InventoryManager
      products={products}
      warehouses={warehouses.map((w: any) => ({ id: w.id, name: w.name }))}
      tenantSlug={tenantSlug}
    />
  );
}
