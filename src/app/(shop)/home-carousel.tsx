"use client";

import {
  ProductCarousel,
  type CarouselProduct,
} from "@/components/shop/product-carousel";

interface Props {
  newArrivals: CarouselProduct[];
  categories: { name: string; products: CarouselProduct[] }[];
}

export function HomeCarousels({ newArrivals, categories }: Props) {
  return (
    <>
      {newArrivals.length > 0 && (
        <ProductCarousel
          title="New Arrivals"
          products={newArrivals}
          viewAllHref="/products"
        />
      )}
      {categories.map(
        (cat) =>
          cat.products.length > 0 && (
            <ProductCarousel
              key={cat.name}
              title={cat.name}
              products={cat.products}
              viewAllHref={`/products?category=${encodeURIComponent(cat.name)}`}
            />
          )
      )}
    </>
  );
}
