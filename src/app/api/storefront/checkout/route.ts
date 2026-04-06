import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

// Public storefront checkout — no auth required (guest checkout)
// Creates a Stripe Checkout Session and returns the URL
// POST /api/storefront/checkout?tenant=styled-by-maryam
export async function POST(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get("tenant");
    if (!slug) return NextResponse.json({ error: "tenant param required" }, { status: 400 });

    const tenant = await db.tenant.findUnique({ where: { slug } });
    if (!tenant || !tenant.isActive) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const body = await request.json();
    const { items, customer, shipping, successUrl, cancelUrl, giftWrap, giftNote } = body;

    if (!items?.length || !customer?.email || !successUrl) {
      return NextResponse.json({ error: "Missing required fields: items, customer.email, successUrl" }, { status: 400 });
    }

    // Build Stripe line items
    const lineItems: Array<{
      price_data: {
        currency: string;
        product_data: { name: string; images?: string[]; description?: string };
        unit_amount: number;
      };
      quantity: number;
    }> = [];

    for (const item of items) {
      const unitAmount = Math.round(item.price * 100); // convert to pence

      lineItems.push({
        price_data: {
          currency: (tenant.currency || "GBP").toLowerCase(),
          product_data: {
            name: item.name,
            ...(item.image && item.image.startsWith("http") ? { images: [item.image] } : {}),
            ...(item.variant ? { description: item.variant } : {}),
          },
          unit_amount: unitAmount,
        },
        quantity: item.qty || 1,
      });
    }

    // Shipping cost line item
    const shippingCost = shipping?.cost || 0;
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: (tenant.currency || "GBP").toLowerCase(),
          product_data: { name: `${shipping.method || "Express"} Delivery` },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    // Gift wrap
    if (giftWrap) {
      lineItems.push({
        price_data: {
          currency: (tenant.currency || "GBP").toLowerCase(),
          product_data: { name: "Gift Wrap" },
          unit_amount: 500,
        },
        quantity: 1,
      });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: customer.email,
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ["GB", "US", "FR", "DE", "IT", "AE", "NG", "GH"],
      },
      metadata: {
        tenantId: tenant.id,
        tenantSlug: slug,
        customerName: `${customer.firstName || ""} ${customer.lastName || ""}`.trim(),
        customerEmail: customer.email,
        customerPhone: customer.phone || "",
        shippingMethod: shipping?.method || "standard",
        giftNote: giftNote || "",
      },
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || successUrl.replace("/success", ""),
    });

    const response = NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });

    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");

    return response;
  } catch (error: any) {
    console.error("Storefront checkout error:", error);
    return NextResponse.json({ error: error.message || "Checkout failed" }, { status: 500 });
  }
}

// CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}
