import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db as prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { tenantId, returnUrl } = await request.json();

    if (!tenantId) {
      return NextResponse.json({ error: "tenantId is required" }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant || !tenant.stripeCustomerId) {
      return NextResponse.json({ error: "Tenant not found or missing Stripe customer" }, { status: 404 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: tenant.stripeCustomerId,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/admin/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Billing portal error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
