import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth";
import { getTenant } from "@/lib/tenant";

/**
 * Creates a Stripe PaymentIntent for inline checkout with Payment Element.
 * This enables Apple Pay, Google Pay, Link, and card payments.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in" }, { status: 401 });
    }

    const tenant = await getTenant();
    const { amount, currency, orderId, orderNumber } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Convert to smallest currency unit (pence/kobo)
    const multiplier = ["NGN", "KES"].includes(currency?.toUpperCase()) ? 100 : 100;
    const amountInSmallest = Math.round(amount * multiplier);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallest,
      currency: (currency || tenant.currency || "GBP").toLowerCase(),
      automatic_payment_methods: {
        enabled: true, // Auto-enables Apple Pay, Google Pay, Link, card, etc.
      },
      metadata: {
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        userId: user.id,
        orderId: orderId || "",
        orderNumber: orderNumber || "",
      },
      receipt_email: user.email,
      description: `Order from ${tenant.name}`,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error("Create payment intent error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment" },
      { status: 500 }
    );
  }
}
