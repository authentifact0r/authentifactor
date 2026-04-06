import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

function cors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

// Creates a Stripe PaymentIntent for inline card payment
// POST /api/storefront/checkout?tenant=styled-by-maryam
export async function POST(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get("tenant");
    if (!slug) return cors(NextResponse.json({ error: "tenant param required" }, { status: 400 }));

    const tenant = await db.tenant.findUnique({ where: { slug } });
    if (!tenant || !tenant.isActive) {
      return cors(NextResponse.json({ error: "Tenant not found" }, { status: 404 }));
    }

    const body = await request.json();
    const { items, customer, shipping, giftWrap, giftNote } = body;

    if (!items?.length || !customer?.email) {
      return cors(NextResponse.json({ error: "Missing required fields" }, { status: 400 }));
    }

    let totalPence = 0;
    const description: string[] = [];

    for (const item of items) {
      totalPence += Math.round(item.price * 100) * (item.qty || 1);
      description.push(`${item.name}${item.variant ? ` (${item.variant})` : ''} x${item.qty || 1}`);
    }

    if (shipping?.cost > 0) totalPence += Math.round(shipping.cost * 100);
    if (giftWrap) totalPence += 500;

    // Platform fee
    const feePercent = tenant.applicationFeePercent ?? 2.0;
    const platformFeePence = Math.round(totalPence * (feePercent / 100));

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPence,
      currency: (tenant.currency || "GBP").toLowerCase(),
      metadata: {
        tenantId: tenant.id,
        tenantSlug: slug,
        platformFeePence: platformFeePence.toString(),
        platformFeePercent: feePercent.toString(),
        customerName: `${customer.firstName || ""} ${customer.lastName || ""}`.trim(),
        customerEmail: customer.email,
        customerPhone: customer.phone || "",
        shippingAddress: [customer.address, customer.city, customer.postcode, customer.country].filter(Boolean).join(", "),
        shippingMethod: shipping?.method || "standard",
        giftNote: giftNote || "",
        items: description.join("; ").slice(0, 500),
      },
      receipt_email: customer.email,
      description: `Order from ${tenant.name}: ${description.join(", ")}`.slice(0, 1000),
    });

    return cors(NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: totalPence,
    }));
  } catch (error: any) {
    console.error("Storefront checkout error:", error);
    return cors(NextResponse.json({ error: error.message || "Checkout failed" }, { status: 500 }));
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}
