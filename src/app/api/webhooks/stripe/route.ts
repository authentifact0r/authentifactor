import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let rawEvent: { type: string; data: { object: Record<string, unknown> } };
  try {
    rawEvent = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const metadata = (rawEvent.data?.object as Record<string, unknown>)?.metadata as Record<string, string> | undefined;
  const orderNumber = metadata?.orderNumber;

  // Resolve Stripe key
  let stripeSecretKey = process.env.STRIPE_SECRET_KEY!;
  let webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  if (orderNumber) {
    const order = await db.order.findFirst({
      where: { orderNumber },
      include: { tenant: { select: { stripeSecretKey: true } } },
    });
    if (order?.tenant?.stripeSecretKey) {
      stripeSecretKey = order.tenant.stripeSecretKey;
    }
  }

  const stripe = new Stripe(stripeSecretKey, { typescript: true });

  let event: Stripe.Event;
  try {
    event = webhookSecret
      ? stripe.webhooks.constructEvent(body, sig!, webhookSecret)
      : rawEvent as unknown as Stripe.Event;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const meta = intent.metadata;

      // If this is a storefront payment, create an order record
      if (meta?.tenantSlug) {
        const tenant = await db.tenant.findUnique({ where: { slug: meta.tenantSlug } });
        if (tenant) {
          // Check if order already exists for this payment
          const existing = await db.order.findFirst({
            where: { paymentRef: intent.id },
          });

          if (!existing) {
            // Find or create guest user
            const email = meta.customerEmail || intent.receipt_email || "guest@styledbymaryam.com";
            let user = await db.user.findUnique({ where: { email } });
            if (!user) {
              user = await db.user.create({
                data: {
                  email,
                  passwordHash: "",
                  firstName: meta.customerName?.split(" ")[0] || "Guest",
                  lastName: meta.customerName?.split(" ").slice(1).join(" ") || "",
                  phone: meta.customerPhone || null,
                },
              });
            }

            // Create address
            const addressParts = (meta.shippingAddress || "").split(", ");
            const address = await db.address.create({
              data: {
                userId: user.id,
                firstName: meta.customerName?.split(" ")[0] || "",
                lastName: meta.customerName?.split(" ").slice(1).join(" ") || "",
                line1: addressParts[0] || "",
                city: addressParts[1] || "",
                postcode: addressParts[2] || "",
                phone: meta.customerPhone || null,
              },
            });

            // Generate order number
            const orderNum = `SBM-${Date.now().toString(36).toUpperCase()}`;

            // Create order
            await db.order.create({
              data: {
                tenantId: tenant.id,
                orderNumber: orderNum,
                userId: user.id,
                addressId: address.id,
                subtotal: intent.amount / 100,
                shippingCost: 0,
                total: intent.amount / 100,
                totalWeightKg: 0,
                shippingMethod: "STANDARD",
                paymentProvider: "STRIPE",
                paymentStatus: "PAID",
                paymentRef: intent.id,
                status: "CONFIRMED",
                notes: meta.items || null,
              },
            });
          }
        }
      }
      break;
    }

    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const ref = session.metadata?.orderNumber;
      if (ref) {
        await db.order.updateMany({
          where: { orderNumber: ref },
          data: {
            paymentStatus: "PAID",
            paymentRef: session.payment_intent as string,
            status: "CONFIRMED",
          },
        });
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const ref = intent.metadata?.orderNumber;
      if (ref) {
        await db.order.updateMany({
          where: { orderNumber: ref },
          data: { paymentStatus: "FAILED" },
        });
      }
      break;
    }

    default:
      console.log(`Unhandled Stripe event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
