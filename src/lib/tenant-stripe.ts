import Stripe from "stripe";
import { db } from "@/lib/db";
import { stripe as platformStripe } from "@/lib/stripe";

/**
 * Stripe client selection for tenant-scoped billing: the tenant's own
 * Stripe account (Tenant.stripeSecretKey) when configured, else the
 * platform account — callers must scope platform-account reads/writes
 * by `metadata.tenantId`.
 */
export async function tenantStripe(
  tenantId: string,
): Promise<{ client: Stripe; ownAccount: boolean }> {
  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    select: { stripeSecretKey: true },
  });
  if (tenant?.stripeSecretKey) {
    return { client: new Stripe(tenant.stripeSecretKey, { typescript: true }), ownAccount: true };
  }
  return { client: platformStripe, ownAccount: false };
}
