import { NextRequest, NextResponse } from "next/server";
import { getScopedDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const tdb = await getScopedDb();

    const { name, description, category, price, costPrice, images, sizes, colors, material, brand, sourceUrl, supplier } = await request.json();
    if (!name || !price) return NextResponse.json({ error: "Name and price required" }, { status: 400 });

    // Generate slug and SKU
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const count = await tdb.product.count();
    const sku = `IMP-${String(count + 1).padStart(4, "0")}`;

    // Check slug uniqueness
    const existing = await tdb.product.findFirst({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug;

    const product = await tdb.product.create({
      data: {
        name,
        slug: finalSlug,
        sku,
        description: description || "",
        shortDescription: description?.slice(0, 120) || null,
        category: category || "Imported",
        price,
        compareAtPrice: costPrice && costPrice < price ? price : null,
        weightKg: 0.5,
        images: images || [],
        sizes: sizes || [],
        colors: colors || [],
        material: material || null,
        brand: brand || null,
        tags: [supplier || "imported", "dropship", sourceUrl ? "has-supplier-url" : ""].filter(Boolean),
        isActive: false,
        metaTitle: null,
        metaDescription: description?.slice(0, 160) || null,
      },
    });

    return NextResponse.json({ product: { id: product.id, name: product.name, slug: product.slug, sku: product.sku } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
