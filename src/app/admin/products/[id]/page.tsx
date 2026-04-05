export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getScopedDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { EditProductForm } from "./edit-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  let product: any = null;
  try {
    const tdb = await getScopedDb();
    product = await tdb.product.findUnique({
      where: { id },
      include: { inventoryBatches: { select: { quantity: true } } },
    });
  } catch {
    return notFound();
  }

  if (!product) return notFound();

  return (
    <EditProductForm
      product={{
        ...product,
        price: Number(product.price),
        compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
        weightKg: Number(product.weightKg),
        totalStock: product.inventoryBatches.reduce((s: number, b: any) => s + b.quantity, 0),
      }}
    />
  );
}
