/**
 * Migration script: Add billing fields to all existing tenants.
 *
 * Run with: npx tsx scripts/migrateTenantBilling.ts
 *
 * After adding the billing columns to the Prisma schema, run:
 *   npx prisma db push
 *   npx tsx scripts/migrateTenantBilling.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Migrating tenant billing fields...\n");

  const tenants = await prisma.tenant.findMany();

  for (const tenant of tenants) {
    // Skip if already has billing plan set to non-default
    if (tenant.stripeCustomerId) {
      console.log(`  ✓ ${tenant.name} (${tenant.slug}) — already has Stripe customer, skipping`);
      continue;
    }

    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        billingPlan: "standard",
        billingStatus: "active",
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        nextInvoiceDate: null,
        lastPaymentStatus: null,
        lastPaymentDate: null,
        billingEmail: null,
      },
    });

    console.log(`  ✓ ${tenant.name} (${tenant.slug}) — set to standard plan, active`);
  }

  console.log(`\nDone. ${tenants.length} tenants updated.`);
  console.log("\nNext steps:");
  console.log("  1. Create Stripe Products + Prices in Dashboard");
  console.log("  2. Update STRIPE_PRICE_* env vars in .env.local");
  console.log("  3. Set up webhook endpoint in Stripe → /api/billing/webhook");
  console.log("  4. Run /api/billing/create-customer for each tenant");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
