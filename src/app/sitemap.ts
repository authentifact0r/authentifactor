export const dynamic = "force-dynamic";

import type { MetadataRoute } from "next";
import { getScopedDb } from "@/lib/db";
import { getTenant } from "@/lib/tenant";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let baseUrl = "";
  let products: { slug: string; updatedAt: Date }[] = [];
  let recipes: { slug: string; updatedAt: Date }[] = [];
  let categories: string[] = [];

  try {
    const tenant = await getTenant();
    baseUrl = tenant.customDomain
      ? `https://${tenant.customDomain}`
      : `https://${tenant.slug}.authentifactor.com`;

    const tdb = await getScopedDb();
    products = await tdb.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });
    recipes = await tdb.recipe.findMany({
      select: { slug: true, updatedAt: true },
    });

    // Get unique categories for category pages
    const allProducts = await tdb.product.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ["category"],
    });
    categories = allProducts.map(p => p.category).filter(Boolean);
  } catch {
    // No tenant context — return basic sitemap
    return [
      { url: "/", lastModified: new Date(), changeFrequency: "daily", priority: 1 },
      { url: "/products", lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    ];
  }

  const entries: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/recipes`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  // Category pages
  for (const cat of categories) {
    entries.push({
      url: `${baseUrl}/products?category=${encodeURIComponent(cat)}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  // Individual products
  for (const p of products) {
    entries.push({
      url: `${baseUrl}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // Individual recipes
  for (const r of recipes) {
    entries.push({
      url: `${baseUrl}/recipes/${r.slug}`,
      lastModified: r.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
