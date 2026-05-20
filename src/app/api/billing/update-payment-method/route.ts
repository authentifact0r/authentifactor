import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db as prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // 2026-05-20 hardening (audit CRITICAL #7): auth-required, tenant
    // from JWT — previously any unauthenticated caller could attach an
    // attacker-controlled payment method to any tenant's Stripe customer.
    const user = await requireAdmin();
    const { paymentMethodId } = await request.json().catch(() => ({}));

    if (!paymentMethodId) {
      return NextResponse.json({ error: "paymentMethodId is required" }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId } });
    if (!tenant || !tenant.stripeCustomerId) {
      return NextResponse.json({ error: "Tenant not found or missing Stripe customer" }, { status: 404 });
    }

    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: tenant.stripeCustomerId,
    });

    await stripe.customers.update(tenant.stripeCustomerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error?.message?.startsWith("Forbidden")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Update payment method error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
