import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public API — single product by slug
// Usage: GET /api/storefront/products/soleil-sculptural-tulip-mini-dress?tenant=styled-by-maryam
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const tenantSlug = request.nextUrl.searchParams.get("tenant");
    if (!tenantSlug) return NextResponse.json({ error: "tenant param required" }, { status: 400 });

    const tenant = await db.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

    const product = await db.product.findFirst({
      where: { slug, tenantId: tenant.id, isActive: true },
      include: {
        inventoryBatches: {
          select: { quantity: true, warehouse: { select: { name: true, city: true } } },
        },
        flashSale: true,
      },
    });

    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const now = new Date();
    const stock = product.inventoryBatches.reduce((s, b) => s + b.quantity, 0);
    const sale = product.flashSale && product.flashSale.isActive && product.flashSale.endsAt >= now ? product.flashSale : null;
    const price = Number(product.price);

    const data = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      shortDescription: product.shortDescription,
      category: product.category,
      subcategory: product.subcategory,
      collection: product.collection,
      price,
      salePrice: sale ? price * (1 - Number(sale.discountPercent) / 100) : null,
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
      currency: tenant.currency,
      images: product.images,
      sizes: product.sizes,
      colors: product.colors,
      material: product.material,
      careInstructions: product.careInstructions,
      brand: product.brand,
      tags: product.tags,
      inStock: stock > 0,
      stock,
      flashSale: sale ? { discountPercent: Number(sale.discountPercent), endsAt: sale.endsAt.toISOString() } : null,
      availability: product.inventoryBatches.map((b) => ({
        quantity: b.quantity,
        warehouse: b.warehouse?.name || null,
        city: b.warehouse?.city || null,
      })),
    };

    const response = NextResponse.json({ product: data });
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
