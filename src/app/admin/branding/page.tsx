export const dynamic = "force-dynamic";

import { requireAdmin } from "@/lib/auth";
import { getTenant } from "@/lib/tenant";
import { headers } from "next/headers";
import { BrandingManager } from "./branding-manager";

export default async function BrandingPage() {
  await requireAdmin();
  const tenant = await getTenant();
  const h = await headers();
  const tenantSlug = h.get("x-tenant-slug") || "";

  const data = {
    name: tenant.name,
    tagline: tenant.tagline || "",
    logo: tenant.logo || "",
    primaryColor: tenant.primaryColor,
    accentColor: tenant.accentColor,
    heroBannerImage: tenant.heroBannerImage || "",
    heroBannerTitle: tenant.heroBannerTitle || "",
    heroBannerSubtitle: tenant.heroBannerSubtitle || "",
  };

  return <BrandingManager branding={data} tenantSlug={tenantSlug} />;
}
