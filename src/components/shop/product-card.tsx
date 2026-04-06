"use client";

import Image from "next/image";
import Link from "next/link";
import { useCurrency } from "@/components/shop/currency-provider";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: string;
    compareAtPrice?: string | null;
    images: string[];
    category: string;
    weightKg: string;
    isPerishable: boolean;
    isSubscribable: boolean;
    totalStock: number;
    flashSale?: {
      discountPercent: string;
      endsAt: string;
    } | null;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { formatPrice } = useCurrency();
  const hasFlashSale = product.flashSale != null;
  const price = parseFloat(product.price);
  const salePrice = hasFlashSale
    ? price * (1 - parseFloat(product.flashSale!.discountPercent) / 100)
    : price;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/5", background: "linear-gradient(180deg, #f0ece6, #e5dfd6)" }}>
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04] group-hover:brightness-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center" style={{ color: "#ccc" }}>
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        )}

        {/* Badges */}
        {(hasFlashSale || product.totalStock <= 0) && (
          <div className="absolute top-0 left-0">
            {hasFlashSale && (
              <span className="inline-block px-3 py-1.5 text-[0.6rem] font-medium uppercase tracking-[0.15em] bg-black text-white">
                {product.flashSale!.discountPercent}% Off
              </span>
            )}
            {product.totalStock <= 0 && (
              <span className="inline-block px-3 py-1.5 text-[0.6rem] font-medium uppercase tracking-[0.15em] bg-[#1a1a1a] text-white">
                Sold Out
              </span>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex items-start justify-between pt-3 pb-1">
        <h3 className="text-[0.85rem] font-medium uppercase tracking-[0.04em] leading-snug" style={{ color: "#1a1a1a", fontFamily: "var(--font-body, Inter), sans-serif" }}>
          {product.name}
        </h3>
        <span className="text-[1.05rem] font-light italic shrink-0 ml-3" style={{ color: "#888", fontFamily: "var(--font-display, Georgia), serif" }}>
          {hasFlashSale || product.compareAtPrice ? (
            <>
              <span className="line-through mr-1 text-[0.85rem]">{formatPrice(product.compareAtPrice || product.price)}</span>
              {formatPrice(salePrice)}
            </>
          ) : (
            formatPrice(price)
          )}
        </span>
      </div>
    </Link>
  );
}
