import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db as prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { tenantId, paymentMethodId } = await request.json();

    if (!tenantId || !paymentMethodId) {
      return NextResponse.json({ error: "tenantId and paymentMethodId are required" }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant || !tenant.stripeCustomerId) {
      return NextResponse.json({ error: "Tenant not found or missing Stripe customer" }, { status: 404 });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: tenant.stripeCustomerId,
    });

    // Set as default
    await stripe.customers.update(tenant.stripeCustomerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update payment method error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
