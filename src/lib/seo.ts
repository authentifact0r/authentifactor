import { getTenant } from "./tenant";
import { getScopedDb } from "./db";
import type { Metadata } from "next";

// Generate Next.js Metadata for any page
export async function generateTenantMetadata(opts: {
  pageType: string;
  pageSlug?: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
}): Promise<Metadata> {
  const tenant = await getTenant();
  const tdb = await getScopedDb();

  // Try to find custom SEO settings
  const seo = await tdb.seoSettings.findFirst({
    where: { pageType: opts.pageType, pageSlug: opts.pageSlug ?? null },
  });

  const title =
    seo?.metaTitle ||
    opts.fallbackTitle ||
    tenant.defaultMetaTitle ||
    tenant.name;
  const description =
    seo?.metaDescription ||
    opts.fallbackDescription ||
    tenant.defaultMetaDescription ||
    "";
  const ogImage = seo?.ogImage || tenant.defaultOgImage || null;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
      siteName: tenant.name,
    },
    robots: seo?.noIndex ? { index: false, follow: false } : undefined,
    ...(seo?.canonicalUrl
      ? { alternates: { canonical: seo.canonicalUrl } }
      : {}),
  };
}

// Generate JSON-LD for products
export function generateProductJsonLd(product: {
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  sku: string;
  inStock: boolean;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.sku,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };
}

// Generate JSON-LD for recipes
export function generateRecipeJsonLd(recipe: {
  name: string;
  description: string;
  image?: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  instructions: string;
  ingredients: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.name,
    description: recipe.description,
    ...(recipe.image ? { image: recipe.image } : {}),
    prepTime: `PT${recipe.prepTime}M`,
    cookTime: `PT${recipe.cookTime}M`,
    recipeYield: `${recipe.servings} servings`,
    recipeInstructions: recipe.instructions,
    recipeIngredient: recipe.ingredients,
  };
}

// Generate JSON-LD for organization/store
export function generateStoreJsonLd(tenant: {
  name: string;
  tagline?: string | null;
  customDomain?: string | null;
  slug: string;
}) {
  const url = tenant.customDomain
    ? `https://${tenant.customDomain}`
    : `https://${tenant.slug}.authentifactor.com`;
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: tenant.name,
    description: tenant.tagline || "",
    url,
  };
}
