export const dynamic = "force-dynamic";

import { getScopedDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { headers } from "next/headers";
import { SeoManager } from "./seo-manager";

export default async function SeoAdminPage() {
  await requireAdmin();
  const h = await headers();
  const tenantSlug = h.get("x-tenant-slug") || "";

  let settings: any[] = [];
  try {
    const tdb = await getScopedDb();
    settings = await tdb.seoSettings.findMany({ orderBy: { pageType: "asc" } });
    settings = settings.map((s: any) => ({
      id: s.id,
      pageType: s.pageType,
      pageSlug: s.pageSlug || "",
      metaTitle: s.metaTitle || "",
      metaDescription: s.metaDescription || "",
      ogImage: s.ogImage || "",
      canonicalUrl: s.canonicalUrl || "",
      noIndex: s.noIndex,
      updatedAt: s.updatedAt.toISOString(),
    }));
  } catch {}

  return <SeoManager settings={settings} tenantSlug={tenantSlug} />;
}
