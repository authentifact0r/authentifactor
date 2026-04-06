export const dynamic = "force-dynamic";

import { getScopedDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { headers } from "next/headers";
import { ShippingManager } from "./shipping-manager";

export default async function ShippingAdminPage() {
  await requireAdmin();
  const h = await headers();
  const tenantSlug = h.get("x-tenant-slug") || "";

  let rules: any[] = [];
  try {
    const tdb = await getScopedDb();
    rules = await tdb.shippingRule.findMany({ orderBy: { method: "asc" } });
    rules = rules.map((r: any) => ({
      id: r.id,
      name: r.name,
      method: r.method,
      minWeightKg: Number(r.minWeightKg),
      maxWeightKg: Number(r.maxWeightKg),
      baseCost: Number(r.baseCost),
      perKgCost: Number(r.perKgCost),
      estimatedDays: r.estimatedDays,
      isActive: r.isActive,
    }));
  } catch {}

  return <ShippingManager rules={rules} tenantSlug={tenantSlug} />;
}
