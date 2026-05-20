import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db as prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // 2026-05-20 hardening (audit CRITICAL #7): auth-required + tenant
    // from JWT. Email defaults to the admin's own email so an attacker
    // can't redirect a tenant's billing to themselves.
    const user = await requireAdmin();
    const { email, name } = await request.json().catch(() => ({}));

    const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId } });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    if (tenant.stripeCustomerId) {
      return NextResponse.json({ customerId: tenant.stripeCustomerId });
    }

    const billingEmail = email || user.email;
    const customer = await stripe.customers.create({
      email: billingEmail,
      name: name || tenant.name,
      metadata: {
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
      },
    });

    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        stripeCustomerId: customer.id,
        billingEmail,
      },
    });

    return NextResponse.json({ customerId: customer.id });
  } catch (error: any) {
    if (error?.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error?.message?.startsWith("Forbidden")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Create customer error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
