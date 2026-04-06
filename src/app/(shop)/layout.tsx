import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { TenantProvider, type TenantConfig } from "@/components/tenant-provider";
import { getTenant } from "@/lib/tenant";
import { getScopedDb } from "@/lib/db";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenant();

  // Get unique categories from this tenant's products
  let categories: string[] = [];
  try {
    const tdb = await getScopedDb();
    const products = await tdb.product.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ["category"],
    });
    categories = products.map((p) => p.category).filter(Boolean);
  } catch {}

  const tenantConfig: TenantConfig = {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    logo: tenant.logo,
    primaryColor: tenant.primaryColor,
    accentColor: tenant.accentColor,
    tagline: tenant.tagline,
    currency: tenant.currency,
    freeShippingMinimum: tenant.freeShippingMinimum,
    heroBannerTitle: tenant.heroBannerTitle,
    heroBannerSubtitle: tenant.heroBannerSubtitle,
    heroBannerImage: tenant.heroBannerImage,
    categories,
    fontFamily: tenant.fontFamily,
    headingFontFamily: tenant.headingFontFamily,
    backgroundColor: tenant.backgroundColor,
    textColor: tenant.textColor,
    enableMegaMenu: tenant.enableMegaMenu,
    enableScrollAnimations: tenant.enableScrollAnimations,
    instagramHandle: tenant.instagramHandle,
    brandStory: tenant.brandStory,
    brandStoryImage: tenant.brandStoryImage,
  };

  return (
    <TenantProvider tenant={tenantConfig}>
      <Header />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      <Footer />
    </TenantProvider>
  );
}
