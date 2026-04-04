/**
 * Onboard Vibrant Minds as an Authentifactor tenant.
 * Run: npx tsx scripts/onboardVibrantMinds.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Onboarding Vibrant Minds...\n");

  const existing = await prisma.tenant.findUnique({ where: { slug: "vibrant-minds" } });
  if (existing) {
    console.log("  ✓ Already exists:", existing.id);
    console.log("  Name:", existing.name);
    console.log("  Plan:", existing.billingPlan);
    console.log("  Status:", existing.billingStatus);
    return;
  }

  const tenant = await prisma.tenant.create({
    data: {
      name: "Vibrant Minds",
      slug: "vibrant-minds",
      customDomain: "vibrantmindsasc.org.uk",
      logo: null,
      primaryColor: "#6C4BFF",
      accentColor: "#00D2A8",
      tagline: "Where Young Minds Thrive",
      currency: "GBP",
      isActive: true,

      // SEO
      defaultMetaTitle: "Vibrant Minds — Where Young Minds Thrive",
      defaultMetaDescription: "Interactive learning platform with H5P content, curated learning paths, and mentor matching.",

      // Hero
      heroBannerTitle: "Where Young Minds Thrive",
      heroBannerSubtitle: "Art & Craft, Coding, Team Games, Pottery, and more",

      // Billing
      billingPlan: "standard",
      billingStatus: "active",
      billingEmail: "hello@vibrantmindsasc.org.uk",
      hostingProvider: "vercel",
      vercelProjectId: "vibrant-minds", // Update with actual Vercel project ID

      // Stripe — will be set up when Stripe customer is created
      stripeCustomerId: null,
      stripeSubscriptionId: null,
    },
  });

  console.log("  ✓ Created tenant:", tenant.id);
  console.log("  Name:", tenant.name);
  console.log("  Slug:", tenant.slug);
  console.log("  Domain:", tenant.customDomain);
  console.log("  Plan:", tenant.billingPlan);
  console.log("  Provider:", tenant.hostingProvider);

  // Create onboarding progress
  await prisma.onboardingProgress.create({
    data: {
      tenantId: tenant.id,
      branding: true,
      domain: true,
      warehouse: false,
      inventory: false,
      shipping: false,
      seo: true,
      adminUsers: false,
    },
  });

  console.log("  ✓ Onboarding progress created");
  console.log("\nNext steps:");
  console.log("  1. Create Stripe customer: POST /api/billing/create-customer { tenantId: '" + tenant.id + "', email: 'hello@vibrantmindsasc.org.uk' }");
  console.log("  2. Create subscription: POST /api/billing/create-subscription { tenantId: '" + tenant.id + "', planId: 'standard' }");
  console.log("  3. Access billing: localhost:3000/admin/billing?tenant=vibrant-minds");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
