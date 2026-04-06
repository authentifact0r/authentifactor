import { NextRequest, NextResponse } from "next/server";
import { getScopedDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { triggerStorefrontSync } from "@/lib/sync";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const tdb = await getScopedDb();
    const { id } = await params;
    const body = await request.json();

    const product = await tdb.product.findFirst({ where: { id } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    // Build update data — only include fields that were sent
    const data: Record<string, any> = {};
    const fields = [
      "name", "description", "shortDescription", "category", "subcategory",
      "collection", "material", "careInstructions", "brand", "metaTitle", "metaDescription",
      "isActive",
    ];
    for (const f of fields) {
      if (body[f] !== undefined) data[f] = body[f];
    }
    // Numeric fields
    if (body.price !== undefined) data.price = parseFloat(body.price);
    if (body.compareAtPrice !== undefined) data.compareAtPrice = body.compareAtPrice ? parseFloat(body.compareAtPrice) : null;
    // Array fields
    if (body.images !== undefined) data.images = body.images;
    if (body.sizes !== undefined) data.sizes = body.sizes;
    if (body.colors !== undefined) data.colors = body.colors;
    if (body.tags !== undefined) data.tags = body.tags;
    if (body.seoKeywords !== undefined) data.seoKeywords = body.seoKeywords;

    // Update slug if name changed
    if (body.name && body.name !== product.name) {
      const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const existing = await tdb.product.findFirst({ where: { slug, id: { not: id } } });
      data.slug = existing ? `${slug}-${Date.now().toString(36)}` : slug;
    }

    const updated = await tdb.product.update({ where: { id }, data });

    // Auto-sync storefront
    const tenantSlug = request.nextUrl.searchParams.get("tenant");
    if (tenantSlug) triggerStorefrontSync(tenantSlug);

    return NextResponse.json({ product: { id: updated.id, name: updated.name } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const tdb = await getScopedDb();
    const { id } = await params;

    const product = await tdb.product.findFirst({ where: { id } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    await tdb.product.delete({ where: { id } });

    const tenantSlug = request.nextUrl.searchParams.get("tenant");
    if (tenantSlug) triggerStorefrontSync(tenantSlug);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
