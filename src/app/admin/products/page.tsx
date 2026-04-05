export const dynamic = "force-dynamic";

import Link from "next/link";
import { getScopedDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";
import { Plus } from "lucide-react";
import { ProductsTable } from "./products-table";

export default async function AdminProductsPage() {
  await requireAdmin();

  let tenantSlug = "";
  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    tenantSlug = h.get("x-tenant-slug") || "";
  } catch {}

  let products: any[] = [];
  try {
    const tdb = await getScopedDb();
    products = await tdb.product.findMany({
      include: { inventoryBatches: { select: { quantity: true } } },
      orderBy: { createdAt: "desc" },
    });
    products = products.map((p: any) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      slug: p.slug,
      description: p.description,
      shortDescription: p.shortDescription || null,
      category: p.category,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      weightKg: Number(p.weightKg),
      images: p.images || [],
      isActive: p.isActive,
      tags: p.tags || [],
      sizes: p.sizes || [],
      colors: p.colors || [],
      material: p.material || null,
      brand: p.brand || null,
      metaTitle: p.metaTitle || null,
      metaDescription: p.metaDescription || null,
      totalStock: p.inventoryBatches.reduce((s: number, b: any) => s + b.quantity, 0),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));
  } catch {
    // No tenant context
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Products</h1>
          <p className="text-sm text-white/40 mt-1">{products.length} items in catalogue</p>
        </div>
        <Link
          href={`/admin/products/new${tenantSlug ? `?tenant=${tenantSlug}` : ""}`}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      <ProductsTable products={products} />
    </div>
  );
}
