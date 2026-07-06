import { NextRequest, NextResponse } from "next/server";
import { getScopedDb, TENANT_ID } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/api-error";
import { readJsonBody } from "@/lib/read-body";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const tdb = await getScopedDb();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = await readJsonBody<any>(request);

    if (!body.name || !body.price) return NextResponse.json({ error: "Name and price required" }, { status: 400 });

    const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const count = await tdb.product.count();
    const sku = body.sku || `PRD-${String(count + 1).padStart(4, "0")}`;

    const existing = await tdb.product.findFirst({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug;

    const product = await tdb.product.create({
      data: {
        tenantId: TENANT_ID, // real value injected by tenantDb extension (lib/db.ts)
        name: body.name,
        slug: finalSlug,
        sku,
        description: body.description || "",
        category: body.category || "General",
        price: body.price,
        compareAtPrice: body.compareAtPrice || null,
        weightKg: body.weightKg || 0.5,
        images: body.images || [],
        sizes: body.sizes || [],
        colors: body.colors || [],
        tags: body.tags || [],
        material: body.material || null,
        brand: body.brand || null,
        isActive: body.isActive ?? true,
        isPerishable: body.isPerishable ?? false,
        isSubscribable: body.isSubscribable ?? false,
      },
    });

    return NextResponse.json({ product: { id: product.id, name: product.name } }, { status: 201 });
  } catch (error: any) {
    return apiError(error, { context: "admin/products" });
  }
}
