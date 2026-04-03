import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db as prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { tenantId, email, name } = await request.json();

    if (!tenantId || !email) {
      return NextResponse.json({ error: "tenantId and email are required" }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Return existing customer if already created
    if (tenant.stripeCustomerId) {
      return NextResponse.json({ customerId: tenant.stripeCustomerId });
    }

    const customer = await stripe.customers.create({
      email,
      name: name || tenant.name,
      metadata: {
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
      },
    });

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        stripeCustomerId: customer.id,
        billingEmail: email,
      },
    });

    return NextResponse.json({ customerId: customer.id });
  } catch (error: any) {
    console.error("Create customer error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
