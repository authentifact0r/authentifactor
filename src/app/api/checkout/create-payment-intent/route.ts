import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Creates a Stripe PaymentIntent for inline checkout with Payment Element.
 *
 * 2026-05-20 hardening (audit CRITICAL #4): the amount is now derived
 * server-side from the existing Order row referenced by `orderId`. The
 * caller no longer chooses the amount — the previous version multiplied
 * a client-supplied `amount` into `paymentIntents.create()`, allowing
 * any logged-in user to pay 1p for any cart total.
 *
 * The tenant is derived from the user's JWT (via getCurrentUser), NOT
 * from the previously-used getTenant() header path — closing the
 * cross-tenant attack surface from audit CRITICAL #1.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in" }, { status: 401 });
    }

    const { orderId, orderNumber } = (await req.json().catch(() => ({}))) as {
      orderId?: string;
      orderNumber?: string;
    };
    if (!orderId && !orderNumber) {
      return NextResponse.json(
        { error: "orderId or orderNumber is required" },
        { status: 400 },
      );
    }

    const order = await db.order.findFirst({
      where: {
        tenantId: user.tenantId,
        userId: user.id,
        ...(orderId ? { id: orderId } : {}),
        ...(orderNumber ? { orderNumber } : {}),
      },
      include: { tenant: { select: { id: true, slug: true, name: true, currency: true } } },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ error: "Order already paid" }, { status: 409 });
    }

    const totalGbp = Number(order.total);
    if (!(totalGbp > 0)) {
      return NextResponse.json({ error: "Order has no positive total" }, { status: 400 });
    }
    const amountInSmallest = Math.round(totalGbp * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallest,
      currency: (order.tenant.currency || "GBP").toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: {
        tenantId: order.tenant.id,
        tenantSlug: order.tenant.slug,
        userId: user.id,
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
      receipt_email: user.email,
      description: `Order ${order.orderNumber} from ${order.tenant.name}`,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error("Create payment intent error:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 },
    );
  }
}
