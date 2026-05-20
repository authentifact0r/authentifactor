import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/**
 * 2026-05-20 hardening (audit HIGH — secret-key leak): previously this
 * returned `db.tenant.findUnique({ where: { id } })` which includes
 * `stripeSecretKey` and `paystackSecretKey` columns. Any logged-in
 * customer of a tenant could read the live payment-provider secret.
 * Now we project a strict allowlist of safe fields. The tenant is
 * always derived from the authenticated user's JWT; the previous
 * `x-tenant-slug` fall-through was the cross-tenant escalation surface
 * audited as CRITICAL #1.
 */
// Field names match prisma/schema.prisma Tenant model — explicitly EXCLUDES
// `paystackSecretKey`, `paystackPublicKey`, `stripeSecretKey`,
// `stripePublicKey`, `stripeCustomerId`, `stripeSubscriptionId`, billing
// internals, and `vercelProjectId` / `stripeHostingItemId` etc.
const TENANT_PUBLIC_FIELDS = {
  id: true,
  name: true,
  slug: true,
  customDomain: true,
  logo: true,
  favicon: true,
  primaryColor: true,
  accentColor: true,
  backgroundColor: true,
  textColor: true,
  tagline: true,
  currency: true,
  defaultMetaTitle: true,
  defaultMetaDescription: true,
  fontFamily: true,
  headingFontFamily: true,
  heroBannerImage: true,
  heroBannerTitle: true,
  heroBannerSubtitle: true,
  brandStory: true,
  brandStoryImage: true,
  billingPlan: true,
  billingStatus: true,
  isActive: true,
  createdAt: true,
} as const;

export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const tenant = await db.tenant.findUnique({
      where: { id: user.tenantId },
      select: TENANT_PUBLIC_FIELDS,
    });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    return NextResponse.json({ tenant });
  } catch (error: any) {
    if (error?.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("/api/tenant/me error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
