import { NextRequest, NextResponse } from "next/server";
import { getScopedDb, db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    const tdb = await getScopedDb();

    const { items, customerName, customerEmail, customerPhone, address, shippingMethod, notes } = await request.json();

    if (!items?.length || !customerName || !customerEmail || !address?.line1 || !address?.city || !address?.postcode) {
      return NextResponse.json({ error: "Items, customer details, and address required" }, { status: 400 });
    }

    // Find or create user for the customer
    let customer = await db.user.findUnique({ where: { email: customerEmail } });
    if (!customer) {
      const nameParts = customerName.trim().split(" ");
      const { hashPassword } = await import("@/lib/auth");
      customer = await db.user.create({
        data: {
          email: customerEmail,
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          phone: customerPhone || null,
          passwordHash: await hashPassword(Math.random().toString(36).slice(2)),
        },
      });
    }

    // Create address
    const nameParts = customerName.trim().split(" ");
    const newAddress = await db.address.create({
      data: {
        userId: customer.id,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        line1: address.line1,
        line2: address.line2 || null,
        city: address.city,
        state: address.state || "",
        postcode: address.postcode,
        country: address.country || "GB",
        phone: customerPhone || null,
      },
    });

    // Fetch products and calculate totals
    let subtotal = 0;
    let totalWeight = 0;
    const orderItems: { productId: string; quantity: number; unitPrice: number; totalPrice: number; weightKg: number; size: string | null; color: string | null }[] = [];

    for (const item of items) {
      const product = await tdb.product.findFirst({ where: { id: item.productId } });
      if (!product) continue;
      const price = Number(product.price);
      const qty = item.qty || 1;
      const weight = Number(product.weightKg || 0);
      subtotal += price * qty;
      totalWeight += weight * qty;
      orderItems.push({
        productId: item.productId, quantity: qty, unitPrice: price, totalPrice: price * qty, weightKg: weight,
        size: item.size || null, color: item.color || null,
      });
    }

    if (orderItems.length === 0) {
      return NextResponse.json({ error: "No valid products found" }, { status: 400 });
    }

    // Generate order number
    const count = await tdb.order.count();
    const orderNumber = `ORD-${String(count + 1).padStart(5, "0")}`;

    const order = await tdb.order.create({
      data: {
        userId: customer.id,
        addressId: newAddress.id,
        orderNumber,
        subtotal,
        shippingCost: 0,
        tax: 0,
        discount: 0,
        total: subtotal,
        totalWeightKg: totalWeight,
        shippingMethod: shippingMethod || "STANDARD",
        paymentProvider: "STRIPE",
        paymentStatus: "PAID",
        notes: notes || null,
        items: { create: orderItems },
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
