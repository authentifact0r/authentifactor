import type { Metadata } from "next";
import { getScopedDb } from "./db";
import { getTenant } from "./tenant";

/**
 * Fetches tenant SEO override for a given page type + slug.
 * Returns null if no override exists — callers use auto-generated defaults.
 */
async function getSeoOverride(pageType: string, pageSlug?: string) {
  try {
    const tdb = await getScopedDb();
    const rule = await tdb.seoSettings.findFirst({
      where: { pageType, pageSlug: pageSlug || null },
    });
    // Also try without slug as fallback (e.g. "product" type covers all products)
    if (!rule && pageSlug) {
      return tdb.seoSettings.findFirst({ where: { pageType, pageSlug: null } });
    }
    return rule;
  } catch {
    return null;
  }
}

function getTenantUrl(tenant: { customDomain?: string | null; slug: string }) {
  if (tenant.customDomain) return `https://${tenant.customDomain}`;
  return `https://${tenant.slug}.authentifactor.com`;
}

/**
 * Generates metadata for the home page.
 */
export async function homeMetadata(): Promise<Metadata> {
  const tenant = await getTenant();
  const override = await getSeoOverride("home");
  const baseUrl = getTenantUrl(tenant);

  const title = override?.metaTitle || tenant.defaultMetaTitle || `${tenant.name} — Shop Online`;
  const description = override?.metaDescription || tenant.defaultMetaDescription || `Discover quality products at ${tenant.name}. Fast delivery, great prices.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: baseUrl,
      siteName: tenant.name,
      type: "website",
      images: override?.ogImage || tenant.defaultOgImage ? [{ url: (override?.ogImage || tenant.defaultOgImage)! }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: override?.canonicalUrl || baseUrl },
    robots: override?.noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

/**
 * Generates metadata for the products listing page.
 */
export async function productsListMetadata(category?: string): Promise<Metadata> {
  const tenant = await getTenant();
  const override = await getSeoOverride("category", category?.toLowerCase());
  const baseUrl = getTenantUrl(tenant);

  const categoryLabel = category ? category.charAt(0).toUpperCase() + category.slice(1).toLowerCase() : "All Products";
  const title = override?.metaTitle || `${categoryLabel} | ${tenant.name}`;
  const description = override?.metaDescription || `Browse ${categoryLabel.toLowerCase()} at ${tenant.name}. Quality products with fast delivery.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/products${category ? `?category=${category}` : ""}`,
      siteName: tenant.name,
      type: "website",
    },
    alternates: { canonical: override?.canonicalUrl || `${baseUrl}/products` },
    robots: override?.noIndex ? { index: false, follow: false } : undefined,
  };
}

/**
 * Generates metadata for a single product page.
 * Includes full Open Graph product tags and structured data.
 */
export async function productMetadata(slug: string): Promise<Metadata | null> {
  const tenant = await getTenant();
  const tdb = await getScopedDb();

  const product = await tdb.product.findFirst({
    where: { slug, isActive: true },
    select: {
      name: true, description: true, shortDescription: true,
      price: true, compareAtPrice: true, images: true,
      category: true, brand: true, sku: true, slug: true,
      metaTitle: true, metaDescription: true,
      inventoryBatches: { select: { quantity: true } },
      flashSale: true,
    },
  });

  if (!product) return null;

  const override = await getSeoOverride("product", slug);
  const baseUrl = getTenantUrl(tenant);
  const productUrl = `${baseUrl}/products/${slug}`;
  const price = Number(product.price);
  const stock = product.inventoryBatches.reduce((s, b) => s + b.quantity, 0);

  // Priority: admin SEO override > product-level meta > auto-generated
  const title = override?.metaTitle || product.metaTitle || `${product.name} | ${tenant.name}`;
  const description = override?.metaDescription || product.metaDescription || product.shortDescription || product.description?.slice(0, 160) || `Buy ${product.name} at ${tenant.name}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: productUrl,
      siteName: tenant.name,
      type: "website",
      images: product.images.length > 0
        ? product.images.map(img => ({ url: img, width: 1200, height: 630, alt: product.name }))
        : override?.ogImage ? [{ url: override.ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.images[0] ? [product.images[0]] : undefined,
    },
    alternates: { canonical: override?.canonicalUrl || productUrl },
    robots: override?.noIndex ? { index: false, follow: false } : undefined,
    other: {
      "product:price:amount": price.toFixed(2),
      "product:price:currency": "GBP",
      "product:availability": stock > 0 ? "in stock" : "out of stock",
    },
  };
}

/**
 * JSON-LD Product structured data for rich Google snippets.
 */
export function productJsonLd(product: {
  name: string;
  description: string;
  shortDescription?: string | null;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  sku: string;
  slug: string;
  brand?: string | null;
  category?: string | null;
  stock: number;
}, tenant: { name: string; customDomain?: string | null; slug: string }) {
  const baseUrl = getTenantUrl(tenant);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.description,
    image: product.images,
    sku: product.sku,
    url: `${baseUrl}/products/${product.slug}`,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : { "@type": "Brand", name: tenant.name },
    category: product.category || undefined,
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/products/${product.slug}`,
      priceCurrency: "GBP",
      price: product.price.toFixed(2),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: tenant.name },
      ...(product.compareAtPrice && product.compareAtPrice > product.price
        ? { priceValidUntil: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0] }
        : {}),
    },
  };
}

/**
 * JSON-LD Organization structured data.
 */
export function organizationJsonLd(tenant: {
  name: string;
  customDomain?: string | null;
  slug: string;
  logoUrl?: string | null;
  defaultOgImage?: string | null;
}) {
  const baseUrl = getTenantUrl(tenant);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: tenant.name,
    url: baseUrl,
    logo: tenant.logoUrl || tenant.defaultOgImage || undefined,
  };
}

/**
 * JSON-LD BreadcrumbList for navigation.
 */
export function breadcrumbJsonLd(
  items: { name: string; url: string }[],
  tenant: { customDomain?: string | null; slug: string }
) {
  const baseUrl = getTenantUrl(tenant);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
    })),
  };
}
