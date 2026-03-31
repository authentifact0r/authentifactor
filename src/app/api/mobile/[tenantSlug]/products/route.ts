import { NextRequest, NextResponse } from "next/server";
import { db, tenantDb } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  const { tenantSlug } = await params;
  const tenant = await db.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const tdb = tenantDb(tenant.id);
  const url = req.nextUrl;
  const category = url.searchParams.get("category");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);

  const where: Record<string, unknown> = { isActive: true };
  if (category) where.category = category;

  const [products, total] = await Promise.all([
    tdb.product.findMany({
      where: where as Parameters<typeof tdb.product.findMany>[0] extends { where?: infer W } ? W : never,
      include: {
        inventoryBatches: { select: { quantity: true } },
        flashSale: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    tdb.product.count({
      where: where as Parameters<typeof tdb.product.count>[0] extends { where?: infer W } ? W : never,
    }),
  ]);

  const now = new Date();

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      weightKg: Number(p.weightKg),
      category: p.category,
      images: p.images,
      isPerishable: p.isPerishable,
      isSubscribable: p.isSubscribable,
      totalStock: p.inventoryBatches.reduce(
        (s: number, b: { quantity: number }) => s + b.quantity,
        0
      ),
      flashSale:
        p.flashSale &&
        p.flashSale.isActive &&
        p.flashSale.endsAt >= now
          ? { discountPercent: Number(p.flashSale.discountPercent) }
          : null,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
