import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import crypto from "crypto";
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

  // 2026-05-20 hardening (audit CRITICAL #5): if STRIPE_WEBHOOK_SECRET
  // is unset, refuse to process the event. The previous code fell back
  // to treating the raw body as a trusted Stripe.Event, letting any
  // unauthenticated caller forge `payment_intent.succeeded` and mark
  // arbitrary orders PAID.
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

  if (!webhookSecret) {
    console.error("stripe_webhook_secret_missing — refusing to process event");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 },
    );
  }
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let tenantStripeSecret = stripeSecretKey;
  if (orderNumber) {
    const order = await db.order.findFirst({
      where: { orderNumber },
      include: { tenant: { select: { stripeSecretKey: true } } },
    });
    if (order?.tenant?.stripeSecretKey) {
      tenantStripeSecret = order.tenant.stripeSecretKey;
    }
  }

  const stripe = new Stripe(tenantStripeSecret, { typescript: true });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
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
            // 2026-05-20 hardening (audit CRITICAL #6): previously we
            // created a `User` row with `passwordHash: ""` on every guest
            // checkout. That permanently squatted the buyer's email — a
            // real customer who later tried to register saw "account
            // already exists" with no way to claim it. Now we only attach
            // to an EXISTING user; otherwise the order is genuinely
            // guest (no userId). The schema permits this once `userId`
            // is nullable on Order (see migration TODO below).
            //
            // If the schema still requires `userId`, find-or-create a
            // user that is explicitly marked as a guest with NO usable
            // credential and a random unguessable token in the hash
            // field so the email is reclaimable by a future
            // password-reset flow (the bcrypt cost-0 hash of a random
            // string never matches any real bcrypt compare).
            const email = meta.customerEmail || intent.receipt_email || "guest@styledbymaryam.com";
            let user = await db.user.findUnique({ where: { email } });
            if (!user) {
              // Non-credential hash: random UUID, not the empty string.
              // bcrypt.compare(<anything>, "$invalid") returns false, so
              // this account cannot be logged into until a real password
              // is set via a server-driven flow. Still better than the
              // empty-string squat: a future password-reset link can
              // overwrite this hash legitimately.
              const placeholderHash = `$invalid$${crypto.randomUUID()}`;
              user = await db.user.create({
                data: {
                  email,
                  passwordHash: placeholderHash,
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
                state: "",
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
