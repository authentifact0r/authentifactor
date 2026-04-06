export const dynamic = "force-dynamic";

import { requireAdmin } from "@/lib/auth";
import { headers } from "next/headers";
import { ImportManager } from "./import-manager";

export default async function ImportPage() {
  await requireAdmin();
  const h = await headers();
  const tenantSlug = h.get("x-tenant-slug") || "";
  return <ImportManager tenantSlug={tenantSlug} />;
}
