"use client";

import { useCurrency } from "./currency-provider";

/**
 * Client component that displays a price converted to the customer's
 * detected/selected currency. Use this in server components where you
 * can't call useCurrency() directly.
 *
 * Usage: <PriceDisplay amount={65} />
 * Output: "£65.00" (UK) / "$82.55" (US) / "₦123,500" (NG)
 */
export function PriceDisplay({
  amount,
  className,
  compareAtPrice,
}: {
  amount: number;
  className?: string;
  compareAtPrice?: number | null;
}) {
  const { formatPrice, isConverted, baseCurrency } = useCurrency();

  return (
    <span className={className}>
      {formatPrice(amount)}
      {compareAtPrice && compareAtPrice > amount && (
        <span className="ml-2 text-gray-400 line-through text-sm">
          {formatPrice(compareAtPrice)}
        </span>
      )}
    </span>
  );
}

/**
 * Inline converted price text — for use in server-rendered product cards
 * where we need the price to update client-side.
 */
export function ConvertedPrice({
  amount,
  className,
}: {
  amount: number;
  className?: string;
}) {
  const { formatPrice } = useCurrency();
  return <span className={className}>{formatPrice(amount)}</span>;
}
