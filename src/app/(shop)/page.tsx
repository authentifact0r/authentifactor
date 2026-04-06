export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { getScopedDb } from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import { homeMetadata } from "@/lib/seo";
import { formatPrice } from "@/lib/utils";
import { HomeCarousels } from "./home-carousel";

export async function generateMetadata(): Promise<Metadata> {
  try {
    return await homeMetadata();
  } catch {
    return { title: "Shop" };
  }
}

async function getFeaturedProducts() {
  const tdb = await getScopedDb();
  const products = await tdb.product.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      compareAtPrice: true,
      images: true,
      category: true,
    },
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    images: p.images,
    category: p.category,
  }));
}

async function getCategoryCarousels() {
  try {
    const tdb = await getScopedDb();
    const products = await tdb.product.findMany({
      where: { isActive: true },
      select: {
        id: true, name: true, slug: true, price: true, compareAtPrice: true, images: true, category: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Group by category, top 3 categories with most products
    const catMap = new Map<string, typeof products>();
    for (const p of products) {
      if (!catMap.has(p.category)) catMap.set(p.category, []);
      catMap.get(p.category)!.push(p);
    }

    return Array.from(catMap.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 3)
      .map(([name, prods]) => ({
        name,
        products: prods.slice(0, 12).map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: Number(p.price),
          compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
          image: p.images[0] || null,
          category: p.category,
        })),
      }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [products, tenant, categoryCarousels] = await Promise.all([
    getFeaturedProducts(),
    getTenant(),
    getCategoryCarousels(),
  ]);

  const heroImage = tenant.heroBannerImage;
  const heroTitle = tenant.heroBannerTitle || tenant.name;
  const heroSubtitle =
    tenant.heroBannerSubtitle ||
    "Timeless pieces, thoughtfully curated for the modern woman.";

  const fontSerif = `var(--font-display, Georgia), serif`;
  const fontBody = `var(--font-body, Inter), sans-serif`;
  const accent = tenant.accentColor || "#C5A059";
  const primary = tenant.primaryColor || "#F9F7F2";
  const bone = "#F9F7F2";
  const textPrimary = "#1a1a1a";
  const textMuted = "#777";

  return (
    <div style={{ fontFamily: fontBody, color: textPrimary }}>
      {/* Hover styles for product images (server component safe) */}
      <style
        dangerouslySetInnerHTML={{
          __html: `.product-img:hover { transform: scale(1.04) !important; }`,
        }}
      />

      {/* ── HERO ───────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          width: "100%",
          minHeight: "85vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: heroImage
            ? `url(${heroImage})`
            : `linear-gradient(135deg, #D4C5A9 0%, #E8DFD0 50%, #C5A059 100%)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: heroImage
              ? "rgba(0, 0, 0, 0.40)"
              : "rgba(0, 0, 0, 0.15)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            maxWidth: "700px",
            padding: "2rem 1.5rem",
          }}
        >
          <p
            style={{
              fontFamily: fontBody,
              fontSize: "0.7rem",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: accent,
              marginBottom: "1.5rem",
              fontWeight: 500,
            }}
          >
            {tenant.tagline || tenant.name}
          </p>

          <h1
            style={{
              fontFamily: fontSerif,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
              lineHeight: 1.15,
              color: "#fff",
              margin: "0 0 1.25rem",
            }}
          >
            {heroTitle}
          </h1>

          <p
            style={{
              fontFamily: fontBody,
              fontSize: "0.95rem",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.82)",
              maxWidth: "480px",
              margin: "0 auto 2.5rem",
            }}
          >
            {heroSubtitle}
          </p>

          <Link
            href="/products"
            style={{
              display: "inline-block",
              padding: "0.85rem 2.8rem",
              border: `1.5px solid ${accent}`,
              color: "#fff",
              fontFamily: fontBody,
              fontSize: "0.75rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              textDecoration: "none",
              transition: "all 0.3s ease",
              backgroundColor: "transparent",
            }}
          >
            Explore the Collection
          </Link>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ──────────────────────────────── */}
      <section
        style={{
          backgroundColor: bone,
          padding: "5rem 1.5rem",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <p
              style={{
                fontSize: "0.7rem",
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: accent,
                marginBottom: "0.75rem",
                fontWeight: 500,
              }}
            >
              New Arrivals
            </p>
            <h2
              style={{
                fontFamily: fontSerif,
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                color: textPrimary,
                margin: 0,
              }}
            >
              The Latest Edit
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "2rem",
            }}
          >
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div style={{ position: "relative" }}>
                  {/* Product image */}
                  <div
                    style={{
                      aspectRatio: "4/5",
                      overflow: "hidden",
                      backgroundColor: "#eee",
                      marginBottom: "1rem",
                    }}
                  >
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        loading="lazy"
                        className="product-img"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.5s ease",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: textMuted,
                          fontSize: "0.85rem",
                        }}
                      >
                        No image
                      </div>
                    )}
                  </div>

                  {/* Product info */}
                  <p
                    style={{
                      fontFamily: fontBody,
                      fontSize: "0.85rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: textPrimary,
                      margin: "0 0 0.35rem",
                      fontWeight: 400,
                    }}
                  >
                    {product.name}
                  </p>

                  <p
                    style={{
                      fontFamily: fontSerif,
                      fontStyle: "italic",
                      fontSize: "1rem",
                      color: textMuted,
                      margin: 0,
                    }}
                  >
                    {product.compareAtPrice &&
                    product.compareAtPrice > product.price ? (
                      <>
                        <span
                          style={{
                            textDecoration: "line-through",
                            marginRight: "0.5rem",
                            color: "#aaa",
                          }}
                        >
                          {formatPrice(product.compareAtPrice, tenant.currency)}
                        </span>
                        {formatPrice(product.price, tenant.currency)}
                      </>
                    ) : (
                      formatPrice(product.price, tenant.currency)
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* View all link */}
          <div style={{ textAlign: "center", marginTop: "3.5rem" }}>
            <Link
              href="/products"
              style={{
                display: "inline-block",
                padding: "0.8rem 2.5rem",
                border: `1.5px solid ${textPrimary}`,
                color: textPrimary,
                fontFamily: fontBody,
                fontSize: "0.7rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                textDecoration: "none",
                transition: "all 0.3s ease",
              }}
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* ── COLLECTION BANNER ──────────────────────────────── */}
      <section
        style={{
          backgroundColor: "#fff",
          padding: "5rem 1.5rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "650px", margin: "0 auto" }}>
          <p
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: accent,
              marginBottom: "0.75rem",
              fontWeight: 500,
            }}
          >
            {tenant.name}
          </p>
          <h2
            style={{
              fontFamily: fontSerif,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
              color: textPrimary,
              margin: "0 0 1rem",
            }}
          >
            The Collection
          </h2>
          <p
            style={{
              fontFamily: fontBody,
              fontSize: "0.95rem",
              lineHeight: 1.7,
              color: textMuted,
              maxWidth: "460px",
              margin: "0 auto 2.5rem",
            }}
          >
            Thoughtfully designed pieces that transition effortlessly from day to
            evening. Luxury you can feel, quality you can trust.
          </p>
          <Link
            href="/products"
            style={{
              display: "inline-block",
              padding: "0.85rem 2.8rem",
              border: `1.5px solid ${accent}`,
              color: accent,
              fontFamily: fontBody,
              fontSize: "0.75rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              textDecoration: "none",
              transition: "all 0.3s ease",
            }}
          >
            Shop the Collection
          </Link>
        </div>
      </section>

      {/* ── PRODUCT CAROUSELS ─────────────────────────────── */}
      <HomeCarousels
        newArrivals={products.slice(0, 12).map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          image: p.images[0] || null,
          category: p.category,
        }))}
        categories={categoryCarousels}
      />

      {/* ── INSTAGRAM SECTION ──────────────────────────────── */}
      <section
        style={{
          backgroundColor: bone,
          padding: "5rem 1.5rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "550px", margin: "0 auto" }}>
          <p
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: accent,
              marginBottom: "0.75rem",
              fontWeight: 500,
            }}
          >
            Follow the Journey
          </p>
          <h2
            style={{
              fontFamily: fontSerif,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
              color: textPrimary,
              margin: "0 0 0.75rem",
            }}
          >
            @{tenant.slug.replace(/-/g, "")}
          </h2>
          <p
            style={{
              fontFamily: fontBody,
              fontSize: "0.9rem",
              lineHeight: 1.7,
              color: textMuted,
              margin: "0 0 2rem",
            }}
          >
            Behind the scenes, styling tips, and new arrivals.
          </p>
          <a
            href={`https://instagram.com/${tenant.slug.replace(/-/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "0.8rem 2.5rem",
              border: `1.5px solid ${textPrimary}`,
              color: textPrimary,
              fontFamily: fontBody,
              fontSize: "0.7rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              textDecoration: "none",
              transition: "all 0.3s ease",
            }}
          >
            Follow on Instagram
          </a>
        </div>
      </section>
    </div>
  );
}
