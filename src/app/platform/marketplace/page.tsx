import { db } from "@/lib/db";
import { MarketplaceClient } from "./marketplace-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Marketplace — Authentifactor",
  description: "Discover stores powered by Authentifactor. African grocery, fashion, catering, beauty, and more.",
};

export default async function MarketplacePage() {
  const tenants = await db.tenant.findMany({
    where: {
      isActive: true,
      isPublicListing: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      tagline: true,
      logo: true,
      primaryColor: true,
      vertical: true,
      customDomain: true,
      _count: {
        select: { products: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return <MarketplaceClient tenants={tenants} />;
}
