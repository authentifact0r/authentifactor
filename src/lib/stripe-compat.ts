import Stripe from "stripe";

/**
 * Stripe API-version compatibility helpers.
 *
 * Stripe API 2025-03-31 (stripe-node v18+) moved or removed fields this app
 * was originally built against:
 *   - `subscription.current_period_end` → now on each subscription item
 *   - `invoice.subscription`            → now `invoice.parent.subscription_details.subscription`
 *   - `subscriptionItems.createUsageRecord` → removed from the SDK (legacy
 *     usage-based billing); the REST endpoint still serves accounts on the
 *     legacy metered-price model.
 *
 * Every helper reads BOTH shapes so behavior stays correct whether the
 * account / webhook endpoint is pinned to the old or the new API version.
 * When billing is reworked, migrate metered usage to Billing Meters and
 * delete this file.
 */

export function subscriptionPeriodEnd(subscription: Stripe.Subscription): number | null {
  const legacy = (subscription as unknown as { current_period_end?: number }).current_period_end;
  if (typeof legacy === "number") return legacy;
  const fromItem = subscription.items?.data?.[0]?.current_period_end;
  return typeof fromItem === "number" ? fromItem : null;
}

type SubRef = string | { id: string } | null | undefined;

function subRefId(ref: SubRef): string | null {
  if (typeof ref === "string") return ref;
  if (ref && typeof ref === "object") return ref.id;
  return null;
}

export function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const legacy = (invoice as unknown as { subscription?: SubRef }).subscription;
  const fromLegacy = subRefId(legacy);
  if (fromLegacy) return fromLegacy;
  const parent = (
    invoice as unknown as {
      parent?: { subscription_details?: { subscription?: SubRef } | null } | null;
    }
  ).parent;
  return subRefId(parent?.subscription_details?.subscription);
}

/**
 * Legacy `line.price.metadata`. On the new API the line only carries a price
 * ID (`pricing.price_details.price`), so metadata is unavailable without an
 * extra fetch — callers must keep their `line.metadata` fallback.
 */
export function lineItemPriceMetadata(line: Stripe.InvoiceLineItem): Record<string, string> | null {
  const legacyPrice = (line as unknown as { price?: { metadata?: Record<string, string> } | null }).price;
  return legacyPrice?.metadata ?? null;
}

export interface UsageRecordParams {
  quantity: number;
  timestamp?: number;
  action?: "increment" | "set";
}

export async function createUsageRecord(
  stripe: Stripe,
  subscriptionItemId: string,
  params: UsageRecordParams,
) {
  return stripe.rawRequest(
    "POST",
    `/v1/subscription_items/${subscriptionItemId}/usage_records`,
    {
      quantity: params.quantity,
      ...(params.timestamp !== undefined ? { timestamp: params.timestamp } : {}),
      action: params.action ?? "set",
    },
  );
}
