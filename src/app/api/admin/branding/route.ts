import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getTenantId } from "@/lib/tenant";
import { assertBrandColor, BrandColorError } from "@/lib/brand-color";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const tenantId = await getTenantId();

    const { name, tagline, logo, primaryColor, accentColor, heroBannerImage, heroBannerTitle, heroBannerSubtitle } = await request.json();
    if (!name) return NextResponse.json({ error: "Store name required" }, { status: 400 });

    // 2026-05-20 hardening (audit HIGH — CSS-injection branding XSS):
    // brand colours are interpolated into a server-rendered <style>
    // block. Reject anything that is not a strict hex colour so an
    // admin cannot write a `</style><script>` breakout payload that
    // would XSS every storefront visitor.
    const safePrimary = assertBrandColor("primaryColor", primaryColor) ?? "#064E3B";
    const safeAccent = assertBrandColor("accentColor", accentColor) ?? "#F59E0B";

    await db.tenant.update({
      where: { id: tenantId },
      data: {
        name,
        tagline: tagline || null,
        logo: logo || null,
        primaryColor: safePrimary,
        accentColor: safeAccent,
        heroBannerImage: heroBannerImage || null,
        heroBannerTitle: heroBannerTitle || null,
        heroBannerSubtitle: heroBannerSubtitle || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof BrandColorError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
