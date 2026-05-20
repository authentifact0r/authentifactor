import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db as prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // 2026-05-20 hardening (audit CRITICAL #7): this route was
    // anonymously callable from the internet — anyone could mint a
    // Stripe billing-portal URL for any tenant's customer. Now the
    // tenant is derived from the authenticated admin's JWT and any
    // body-supplied tenantId is ignored.
    const user = await requireAdmin();
    const { returnUrl } = await request.json().catch(() => ({}));

    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
    });
    if (!tenant || !tenant.stripeCustomerId) {
      return NextResponse.json({ error: "Tenant not found or missing Stripe customer" }, { status: 404 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: tenant.stripeCustomerId,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/admin/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    if (error?.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error?.message?.startsWith("Forbidden")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Billing portal error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
