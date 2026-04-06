import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public API — no auth required. Serves product data for a tenant's storefront.
// Usage: GET /api/storefront/products?tenant=styled-by-maryam
export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get("tenant");
    if (!slug) return NextResponse.json({ error: "tenant param required" }, { status: 400 });

    const tenant = await db.tenant.findUnique({ where: { slug } });
    if (!tenant || !tenant.isActive) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

    const products = await db.product.findMany({
      where: { tenantId: tenant.id, isActive: true },
      include: {
        inventoryBatches: { select: { quantity: true } },
        flashSale: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();
    const data = products.map((p) => {
      const stock = p.inventoryBatches.reduce((s, b) => s + b.quantity, 0);
      const sale = p.flashSale && p.flashSale.isActive && p.flashSale.endsAt >= now ? p.flashSale : null;
      const price = Number(p.price);
      const salePrice = sale ? price * (1 - Number(sale.discountPercent) / 100) : price;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        description: p.description,
        shortDescription: p.shortDescription,
        category: p.category,
        subcategory: p.subcategory,
        collection: p.collection,
        price,
        salePrice: sale ? salePrice : null,
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
        currency: tenant.currency,
        images: p.images,
        sizes: p.sizes,
        colors: p.colors,
        material: p.material,
        careInstructions: p.careInstructions,
        brand: p.brand,
        tags: p.tags,
        inStock: stock > 0,
        stock,
        flashSale: sale ? { discountPercent: Number(sale.discountPercent), endsAt: sale.endsAt.toISOString() } : null,
      };
    });

    const response = NextResponse.json({
      tenant: { name: tenant.name, slug: tenant.slug, currency: tenant.currency },
      products: data,
      count: data.length,
    });

    // Allow cross-origin requests from the Astro site
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET");
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
