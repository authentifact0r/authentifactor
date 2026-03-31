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
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);

  const [recipes, total] = await Promise.all([
    tdb.recipe.findMany({
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: true,
              },
            },
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    tdb.recipe.count(),
  ]);

  return NextResponse.json({
    recipes: recipes.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      description: r.description,
      image: r.image,
      prepTime: r.prepTime,
      cookTime: r.cookTime,
      servings: r.servings,
      instructions: r.instructions,
      ingredients: r.items.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        productSlug: item.product.slug,
        price: Number(item.product.price),
        image: item.product.images[0] || null,
        quantity: item.quantity,
        measurement: item.measurement,
      })),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
