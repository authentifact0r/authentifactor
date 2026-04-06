export const dynamic = "force-dynamic";

import { getScopedDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { headers } from "next/headers";
import { OrdersManager } from "./orders-manager";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const h = await headers();
  const tenantSlug = h.get("x-tenant-slug") || "";

  let orders: any[] = [];
  let products: any[] = [];
  try {
    const tdb = await getScopedDb();
    orders = await tdb.order.findMany({
      include: {
        address: true,
        warehouse: { select: { name: true } },
        items: { include: { product: { select: { name: true, sku: true, images: true, price: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    // Fetch user info separately (not available through scoped extend)
    for (const o of orders) {
      const { db: rawDb } = await import("@/lib/db");
      const user = await rawDb.user.findUnique({ where: { id: o.userId }, select: { firstName: true, lastName: true, email: true, phone: true } });
      (o as any).user = user;
    }
    products = await tdb.product.findMany({ where: { isActive: true }, select: { id: true, name: true, sku: true, price: true, images: true, sizes: true, colors: true }, orderBy: { name: "asc" } });

    orders = orders.map((o: any) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      userId: o.userId,
      status: o.status,
      subtotal: Number(o.subtotal),
      shippingCost: Number(o.shippingCost),
      tax: Number(o.tax || 0),
      discount: Number(o.discount || 0),
      total: Number(o.total),
      totalWeightKg: Number(o.totalWeightKg),
      shippingMethod: o.shippingMethod,
      paymentProvider: o.paymentProvider,
      paymentStatus: o.paymentStatus,
      paymentRef: o.paymentRef || null,
      trackingNumber: o.trackingNumber || null,
      notes: o.notes || null,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
      shippedAt: o.shippedAt?.toISOString() || null,
      deliveredAt: o.deliveredAt?.toISOString() || null,
      user: o.user ? { firstName: o.user.firstName, lastName: o.user.lastName, email: o.user.email, phone: o.user.phone } : null,
      address: o.address ? { line1: o.address.line1, line2: o.address.line2 || null, city: o.address.city, postcode: o.address.postcode } : null,
      warehouse: o.warehouse ? { name: o.warehouse.name } : null,
      items: o.items.map((i: any) => ({
        id: i.id,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        totalPrice: Number(i.totalPrice),
        weightKg: Number(i.weightKg),
        size: i.size || null,
        color: i.color || null,
        product: i.product ? { name: i.product.name, sku: i.product.sku, images: i.product.images, price: Number(i.product.price) } : null,
      })),
    }));
    products = products.map((pr: any) => ({ id: pr.id, name: pr.name, sku: pr.sku, price: Number(pr.price), images: pr.images, sizes: pr.sizes || [], colors: pr.colors || [] }));
  } catch (err: any) {
    console.error("[orders] Error:", err.message);
  }

  return <OrdersManager orders={orders} products={products} tenantSlug={tenantSlug} />;
}
