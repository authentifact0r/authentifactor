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
    const userId = payload.userId as string;

    const { items, customerName, customerEmail, customerPhone, address, shippingMethod, notes } = await request.json();

    if (!items?.length || !customerName || !customerEmail || !address?.line1 || !address?.city || !address?.postcode) {
      return NextResponse.json({ error: "Items, customer details, and address required" }, { status: 400 });
    }

    // Find or create customer user
    let customer = await db.user.findFirst({ where: { email: customerEmail } });
    if (!customer) {
      const bcrypt = await import("bcryptjs");
      customer = await db.user.create({
        data: {
          email: customerEmail,
          passwordHash: await bcrypt.hash(Math.random().toString(36), 12),
          firstName: customerName.split(" ")[0] || customerName,
          lastName: customerName.split(" ").slice(1).join(" ") || "",
          phone: customerPhone || null,
        },
      });
      // Link to tenant
      await db.tenantUser.create({ data: { userId: customer.id, tenantId, role: "CUSTOMER" } });
    }

    // Create address
    const addr = await db.address.create({
      data: {
        userId: customer.id,
        label: "Order",
        firstName: customerName.split(" ")[0] || customerName,
        lastName: customerName.split(" ").slice(1).join(" ") || "",
        line1: address.line1,
        line2: address.line2 || null,
        city: address.city,
        state: address.city,
        postcode: address.postcode,
        country: "GB",
        phone: customerPhone || null,
        latitude: 0,
        longitude: 0,
      },
    });

    // Get products and calculate totals
    const productIds = items.map((i: any) => i.productId);
    const products = await db.product.findMany({ where: { id: { in: productIds }, tenantId } });

    let subtotal = 0;
    let totalWeight = 0;
    const orderItems: { productId: string; quantity: number; unitPrice: number; totalPrice: number; weightKg: number }[] = [];

    for (const item of items) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) continue;
      const price = Number(prod.price);
      const weight = Number(prod.weightKg);
      const qty = item.qty || 1;
      subtotal += price * qty;
      totalWeight += weight * qty;
      orderItems.push({ productId: prod.id, quantity: qty, unitPrice: price, totalPrice: price * qty, weightKg: weight * qty });
    }

    const shippingCost = shippingMethod === "EXPRESS" ? 7.99 : shippingMethod === "LOCAL_FRESH" ? 2.99 : 3.99;
    const total = subtotal + shippingCost;

    // Get warehouse
    const warehouse = await db.warehouse.findFirst({ where: { tenantId, isActive: true } });

    // Generate order number
    const lastOrder = await db.order.findFirst({ where: { tenantId }, orderBy: { createdAt: "desc" } });
    const lastNum = lastOrder ? parseInt(lastOrder.orderNumber.split("-").pop() || "1000") : 1000;
    const orderNumber = `ORD-${lastNum + 1}`;

    // Create order
    const order = await db.order.create({
      data: {
        tenantId,
        userId: customer.id,
        addressId: addr.id,
        warehouseId: warehouse?.id || null,
        orderNumber,
        status: "CONFIRMED",
        paymentStatus: "PAID",
        paymentProvider: "MANUAL",
        shippingMethod,
        subtotal,
        shippingCost,
        total,
        totalWeightKg: totalWeight,
        notes: notes || null,
      },
    });

    // Create order items
    for (const item of orderItems) {
      await db.orderItem.create({ data: { orderId: order.id, ...item } });
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
