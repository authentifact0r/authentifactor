"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTenant } from "@/components/tenant-provider";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

export interface CarouselProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  image: string | null;
  category: string;
}

interface ProductCarouselProps {
  title: string;
  products: CarouselProduct[];
  viewAllHref?: string;
  className?: string;
}

function ProductCard({ product, currency }: { product: CarouselProduct; currency: string }) {
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      className="group relative w-52 flex-shrink-0"
    >
      <Link
        href={`/products/${product.slug}`}
        className="flex flex-col overflow-hidden rounded-xl border border-[var(--color-bg,#E5E5E5)] bg-white transition-all duration-300 hover:shadow-md"
        style={{ borderColor: "rgba(0,0,0,0.06)" }}
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-gray-50">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-300 text-xs">
              No image
            </div>
          )}
          {discount && discount > 0 && (
            <span className="absolute left-2 top-2 rounded-md bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
              -{discount}%
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-2 p-4">
          <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400">
            {product.category}
          </p>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug min-h-[2.5rem]">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-gray-900">
              {formatPrice(product.price, currency)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.compareAtPrice, currency)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export const ProductCarousel = React.forwardRef<HTMLDivElement, ProductCarouselProps>(
  ({ title, products, viewAllHref = "/products", className }, ref) => {
    const tenant = useTenant();
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = React.useState(false);
    const [canScrollRight, setCanScrollRight] = React.useState(false);

    const checkScroll = React.useCallback(() => {
      const el = scrollRef.current;
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollWidth - el.scrollLeft - el.clientWidth > 1);
    }, []);

    React.useEffect(() => {
      checkScroll();
      const el = scrollRef.current;
      el?.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      return () => {
        el?.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }, [checkScroll, products]);

    const scroll = (dir: "left" | "right") => {
      if (!scrollRef.current) return;
      const amount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: dir === "left" ? -amount : amount,
        behavior: "smooth",
      });
    };

    if (!products.length) return null;

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
    };

    return (
      <section className={cn("relative w-full py-10", className)} ref={ref}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 lg:px-8 mb-6">
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)",
              fontWeight: 400,
              fontStyle: "italic",
              color: "var(--color-text, #1a1a1a)",
            }}
          >
            {title}
          </h2>
          <Link
            href={viewAllHref}
            className="text-xs font-medium uppercase tracking-widest transition-colors hover:opacity-70"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--color-accent, #C5A059)",
            }}
          >
            View all
          </Link>
        </div>

        <div className="relative">
          {/* Scrollable row */}
          <motion.div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto px-5 lg:px-8 pb-2 scrollbar-hide"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {products.map((p) => (
              <ProductCard key={p.id} product={p} currency={tenant.currency} />
            ))}
          </motion.div>

          {/* Nav arrows */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-white p-2 shadow-md transition-opacity hover:bg-gray-50 cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-white p-2 shadow-md transition-opacity hover:bg-gray-50 cursor-pointer"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          )}
        </div>
      </section>
    );
  }
);

ProductCarousel.displayName = "ProductCarousel";
