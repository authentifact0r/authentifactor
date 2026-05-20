import { NextRequest, NextResponse } from "next/server";
import { db, tenantDb, TENANT_ID } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

interface CartSyncItem {
  productId: string;
  quantity: number;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  const { tenantSlug } = await params;

  // 2026-05-20 hardening (audit CRITICAL #8): previously this route
  // took `userId` from the request body with no auth — any caller
  // could overwrite any user's cart on any tenant. Now we require an
  // authenticated user and use the JWT's userId. We also verify the
  // user belongs to the tenant identified by the URL slug, so an
  // attacker can't smuggle a cross-tenant cart write by guessing IDs.
  const authUser = await getCurrentUser().catch(() => null);
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenant = await db.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }
  if (authUser.tenantId !== tenant.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { items: CartSyncItem[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { items } = body;
  const userId = authUser.id;

  if (!Array.isArray(items)) {
    return NextResponse.json(
      { error: "items[] is required" },
      { status: 400 }
    );
  }

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
