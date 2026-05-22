import { NextRequest, NextResponse } from "next/server";
import { db, getScopedDb, TENANT_ID } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getTenant } from "@/lib/tenant";
import { generateOrderNumber } from "@/lib/utils";
import { calculateShippingOptions, findClosestWarehouse } from "@/lib/shipping";
import { createPaystackClient } from "@/lib/paystack";
import type { ShippingMethod, PaymentProvider } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to place an order" }, { status: 401 });
    }

    const tdb = await getScopedDb();
    const tenant = await getTenant();

    const body = await req.json();
    const { address, shippingMethod, paymentProvider, items } = body;

    if (!address || !shippingMethod || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2026-05-20 hardening (audit HIGH — duplicate orders): accept an
    // idempotency key (header or body). A retry with the same key
    // returns the already-created order instead of creating a second
    // one and double-deducting stock.
    const idempotencyKey =
      req.headers.get("idempotency-key") ||
      (typeof body.idempotencyKey === "string" ? body.idempotencyKey : null);
    if (idempotencyKey) {
      const existing = await tdb.order.findFirst({
        where: { idempotencyKey },
        select: { id: true, orderNumber: true },
      });
      if (existing) {
        return NextResponse.json({
          orderId: existing.id,
          orderNumber: existing.orderNumber,
          duplicate: true,
        });
      }
    }

    // Create or find address (addresses are user-global)
    const savedAddress = await db.address.create({
      data: {
        userId: user.id,
        firstName: address.firstName,
        lastName: address.lastName,
        line1: address.line1,
        city: address.city,
        state: address.state,
        postcode: address.postcode,
        phone: address.phone,
      },
    });

    // Validate products and calculate totals
    const productIds = items.map((i: { productId: string }) => i.productId);
    const products = await tdb.product.findMany({
      where: { id: { in: productIds } },
      include: {
        inventoryBatches: { select: { id: true, quantity: true, warehouseId: true, expiryDate: true } },
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    let totalWeightKg = 0;
    const orderItems: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      weightKg: number;
    }> = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
      }

      const totalStock = product.inventoryBatches.reduce((s, b) => s + b.quantity, 0);
      if (totalStock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}. Only ${totalStock} available.` },
          { status: 400 }
        );
      }

      const unitPrice = Number(product.price);
      const weight = Number(product.weightKg);
      const itemTotal = unitPrice * item.quantity;

      subtotal += itemTotal;
      totalWeightKg += weight * item.quantity;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        totalPrice: itemTotal,
        weightKg: weight * item.quantity,
      });
    }

    // Calculate shipping cost
    const shippingOptions = await calculateShippingOptions({
      totalWeightKg,
      hasPerishable: products.some((p) => p.isPerishable),
      hasFragile: products.some((p) => p.isFragile),
      items: items.map((i: { productId: string; quantity: number }) => {
        const p = productMap.get(i.productId)!;
        return { weightKg: Number(p.weightKg), isPerishable: p.isPerishable, quantity: i.quantity };
      }),
    });

    const selectedShipping = shippingOptions.find((o) => o.method === shippingMethod);
    const shippingCost = selectedShipping?.cost ?? 0;
    const total = subtotal + shippingCost;

    // Platform fee
    const feePercent = tenant.applicationFeePercent ?? 2.0;
    const platformFee = Math.round(total * (feePercent / 100) * 100) / 100;

    // Find closest warehouse
    const warehouse = savedAddress.latitude && savedAddress.longitude
      ? await findClosestWarehouse(savedAddress.latitude, savedAddress.longitude, productIds)
      : null;

    // 2026-05-20 hardening (audit HIGH — non-atomic inventory deduction):
    // the order row + the FEFO stock deduction now run inside a single
    // `$transaction`. Each batch deduction is a CONDITIONAL `updateMany`
    // with `quantity: { gte: deduct }` — if a concurrent order already
    // consumed that batch, the update affects 0 rows and we throw, which
    // rolls the whole transaction back. Two parallel orders for the last
    // unit can no longer both succeed (oversell), and a partial deduction
    // can never leave a confirmed order with unbacked stock.
    const orderNumber = generateOrderNumber();

    class OutOfStockError extends Error {}

    let order: { id: string; orderNumber: string };
    try {
      order = await tdb.$transaction(async (tx) => {
        const created = await tx.order.create({
          data: {
            tenantId: TENANT_ID,
            orderNumber,
            idempotencyKey,
            userId: user.id,
            addressId: savedAddress.id,
            warehouseId: warehouse?.id,
            subtotal,
            shippingCost,
            total,
            platformFee,
            platformFeePercent: feePercent,
            totalWeightKg,
            shippingMethod: shippingMethod as ShippingMethod,
            paymentProvider: (paymentProvider || "PAYSTACK") as PaymentProvider,
            items: {
              create: orderItems,
            },
          },
        });

        // Deduct inventory (FEFO — First Expiry First Out)
        for (const item of orderItems) {
          let remaining = item.quantity;
          const batches = await tx.inventoryBatch.findMany({
            where: {
              productId: item.productId,
              quantity: { gt: 0 },
              ...(warehouse ? { warehouseId: warehouse.id } : {}),
            },
            orderBy: { expiryDate: "asc" },
          });

          for (const batch of batches) {
            if (remaining <= 0) break;
            const deduct = Math.min(remaining, batch.quantity);
            // Conditional deduction: only succeeds if the batch still
            // holds at least `deduct` units at write time.
            const result = await tx.inventoryBatch.updateMany({
              where: { id: batch.id, quantity: { gte: deduct } },
              data: { quantity: { decrement: deduct } },
            });
            if (result.count === 1) {
              remaining -= deduct;
            }
          }

          if (remaining > 0) {
            // A concurrent order drained the stock between our read and
            // our write — abort the whole transaction.
            throw new OutOfStockError(item.productId);
          }
        }

        return { id: created.id, orderNumber: created.orderNumber };
      });
    } catch (e) {
      if (e instanceof OutOfStockError) {
        return NextResponse.json(
          { error: "Sorry — one or more items just sold out. Please review your cart." },
          { status: 409 },
        );
      }
      throw e;
    }

    // Also sync to DB cart (clear it)
    await tdb.cartItem.deleteMany({ where: { userId: user.id } });

    // Initialize payment using tenant's Paystack key
    if ((paymentProvider || "PAYSTACK") === "PAYSTACK") {
      try {
        const paystackKey = tenant.paystackSecretKey || process.env.PAYSTACK_SECRET_KEY!;
        const paystack = createPaystackClient(paystackKey);

        const paymentResult = await paystack.initializePayment({
          email: user.email,
          amount: total,
          reference: orderNumber,
          callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?order=${orderNumber}`,
          metadata: { orderId: order.id, tenantId: tenant.id },
        });

        if (paymentResult.status) {
          return NextResponse.json({
            orderId: order.id,
            orderNumber,
            paymentUrl: paymentResult.data.authorization_url,
          });
        }
      } catch {
        // Paystack init failed — order still created, return success without payment URL
      }
    }

    return NextResponse.json({ orderId: order.id, orderNumber });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
