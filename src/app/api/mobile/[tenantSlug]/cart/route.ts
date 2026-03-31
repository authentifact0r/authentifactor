import { NextRequest, NextResponse } from "next/server";
import { db, tenantDb, TENANT_ID } from "@/lib/db";

interface CartSyncItem {
  productId: string;
  quantity: number;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  const { tenantSlug } = await params;
  const tenant = await db.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  let body: { items: CartSyncItem[]; userId: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { items, userId } = body;

  if (!userId || !Array.isArray(items)) {
    return NextResponse.json(
      { error: "userId and items[] are required" },
      { status: 400 }
    );
  }

  // Verify user exists
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const tdb = tenantDb(tenant.id);
  const errors: string[] = [];
  const synced: { productId: string; quantity: number; name: string }[] = [];

  for (const item of items) {
    if (!item.productId || !item.quantity || item.quantity < 1) {
      errors.push(`Invalid item: ${JSON.stringify(item)}`);
      continue;
    }

    // Verify product exists and is active
    const product = await tdb.product.findFirst({
      where: { id: item.productId, isActive: true },
      include: { inventoryBatches: { select: { quantity: true } } },
    });

    if (!product) {
      errors.push(`Product ${item.productId} not found or inactive`);
      continue;
    }

    const totalStock = product.inventoryBatches.reduce(
      (s: number, b: { quantity: number }) => s + b.quantity,
      0
    );

    if (totalStock < item.quantity) {
      errors.push(
        `Insufficient stock for ${product.name}: requested ${item.quantity}, available ${totalStock}`
      );
      continue;
    }

    // Upsert cart item
    await tdb.cartItem.upsert({
      where: {
        userId_productId_tenantId: {
          userId,
          productId: item.productId,
          tenantId: tenant.id,
        },
      },
      update: { quantity: item.quantity },
      create: {
        tenantId: TENANT_ID,
        userId,
        productId: item.productId,
        quantity: item.quantity,
      },
    });

    synced.push({
      productId: item.productId,
      quantity: item.quantity,
      name: product.name,
    });
  }

  return NextResponse.json({
    synced,
    errors,
    syncedCount: synced.length,
    errorCount: errors.length,
  });
}
