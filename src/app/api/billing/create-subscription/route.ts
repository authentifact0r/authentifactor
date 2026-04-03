import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { BILLING_PLANS, type BillingPlanId } from "@/config/billingPlans";

export async function POST(request: NextRequest) {
  try {
    const { tenantId, planId } = await request.json();

    if (!tenantId || !planId) {
      return NextResponse.json({ error: "tenantId and planId are required" }, { status: 400 });
    }

    const plan = BILLING_PLANS[planId as BillingPlanId];
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant || !tenant.stripeCustomerId) {
      return NextResponse.json({ error: "Tenant not found or missing Stripe customer" }, { status: 404 });
    }

    // If tenant already has a subscription, update it instead
    if (tenant.stripeSubscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(tenant.stripeSubscriptionId);
      const updated = await stripe.subscriptions.update(tenant.stripeSubscriptionId, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: plan.stripePriceId,
          },
        ],
        proration_behavior: "create_prorations",
      });

      await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          billingPlan: planId,
          stripeSubscriptionId: updated.id,
        },
      });

      return NextResponse.json({ subscriptionId: updated.id, action: "updated" });
    }

    // Create new subscription
    const subscription = await stripe.subscriptions.create({
      customer: tenant.stripeCustomerId,
      items: [{ price: plan.stripePriceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        planId,
      },
    });

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        billingPlan: planId,
        billingStatus: "active",
        stripeSubscriptionId: subscription.id,
        nextInvoiceDate: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : null,
      },
    });

    const invoice = subscription.latest_invoice as any;
    const clientSecret = invoice?.payment_intent?.client_secret;

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret,
      action: "created",
    });
  } catch (error: any) {
    console.error("Create subscription error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
