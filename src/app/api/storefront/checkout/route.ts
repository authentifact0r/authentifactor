import { NextRequest, NextResponse } from "next/server";
import { db, tenantDb } from "@/lib/db";
import { stripe } from "@/lib/stripe";

// 2026-05-20 hardening (audit CRITICAL #4 + MEDIUM CORS):
// Wildcard CORS replaced with an allowlist of known storefront
// origins (each tenant's custom domain + `*.authentifactor.com`).
// Cross-origin posts from any other site are now rejected at the
// browser-CORS layer; the server-side fail-closed price compute
// below is the substantive defense.
function buildCorsHeaders(tenantCustomDomain: string | null) {
  const headers = new Headers();
  // Per-tenant allowlist. Echoes back the caller's Origin only if it
  // matches; absent/unknown Origin gets no ACAO, which fails the CORS
  // check at the browser without leaking which origins are allowed.
  const allowed = new Set<string>([
    "https://authentifactor.com",
    "https://www.authentifactor.com",
  ]);
  if (tenantCustomDomain) {
    allowed.add(`https://${tenantCustomDomain}`);
    allowed.add(`https://www.${tenantCustomDomain}`);
  }
  headers.set("Vary", "Origin");
  return { headers, allowed };
}

function cors(response: NextResponse, origin: string | null, tenantCustomDomain: string | null) {
  const { headers, allowed } = buildCorsHeaders(tenantCustomDomain);
  if (origin && allowed.has(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
  // *.authentifactor.com subdomains (tenant storefronts) — accept any
  // https://*.authentifactor.com.
  if (origin && /^https:\/\/[a-z0-9-]+\.authentifactor\.com$/.test(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.forEach((v, k) => response.headers.set(k, v));
  return response;
}

// Creates a Stripe PaymentIntent for inline card payment
// POST /api/storefront/checkout?tenant=styled-by-maryam
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  try {
    const slug = request.nextUrl.searchParams.get("tenant");
    if (!slug) return cors(NextResponse.json({ error: "tenant param required" }, { status: 400 }), origin, null);

    const tenant = await db.tenant.findUnique({ where: { slug } });
    if (!tenant || !tenant.isActive) {
      return cors(NextResponse.json({ error: "Tenant not found" }, { status: 404 }), origin, null);
    }

    const body = await request.json();
    const { items, customer, shipping, giftWrap, giftNote } = body;

    if (!Array.isArray(items) || !items.length || !customer?.email) {
      return cors(NextResponse.json({ error: "Missing required fields" }, { status: 400 }), origin, tenant.customDomain);
    }

    // 2026-05-20 hardening (audit CRITICAL #4): server re-fetches every
    // product price + shipping cost from the DB. The client may supply
    // productId, qty, variant — never the price.
    const tdb = tenantDb(tenant.id);
    let totalPence = 0;
    const description: string[] = [];

    for (const item of items) {
      if (!item?.productId || typeof item.productId !== "string") {
        return cors(
          NextResponse.json({ error: "Each item must have a productId" }, { status: 400 }),
          origin,
          tenant.customDomain,
        );
      }
      const qty = Math.max(1, Math.min(99, parseInt(String(item.qty ?? 1), 10) || 1));
      const product = await tdb.product.findFirst({
        where: { id: item.productId, isActive: true },
        select: { id: true, name: true, price: true },
      });
      if (!product) {
        return cors(
          NextResponse.json({ error: `Unknown product: ${item.productId}` }, { status: 400 }),
          origin,
          tenant.customDomain,
        );
      }
      totalPence += Math.round(Number(product.price) * 100) * qty;
      description.push(
        `${product.name}${item.variant ? ` (${String(item.variant).slice(0, 64)})` : ""} x${qty}`,
      );
    }

    // Shipping: pull a tenant-defined ShippingOption by id (server
    // chooses the cost), fall back to 0 if none selected.
    if (shipping?.optionId && typeof shipping.optionId === "string") {
      const option = await tdb.shippingOption.findFirst({
        where: { id: shipping.optionId, isActive: true },
        select: { priceGbp: true, name: true },
      });
      if (option) {
        totalPence += Math.round(Number(option.priceGbp) * 100);
        description.push(`Shipping: ${option.name}`);
      }
    }

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
    }), origin, tenant.customDomain);
  } catch (error: any) {
    console.error("Storefront checkout error:", error);
    return cors(NextResponse.json({ error: "Checkout failed" }, { status: 500 }), origin, null);
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  const slug = request.nextUrl.searchParams.get("tenant");
  let customDomain: string | null = null;
  if (slug) {
    const tenant = await db.tenant.findUnique({
      where: { slug },
      select: { customDomain: true },
    });
    customDomain = tenant?.customDomain ?? null;
  }
  return cors(new NextResponse(null, { status: 204 }), origin, customDomain);
}
