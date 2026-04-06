import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getTenantId } from "@/lib/tenant";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const tenantId = await getTenantId();

    const { name, tagline, logo, primaryColor, accentColor, heroBannerImage, heroBannerTitle, heroBannerSubtitle } = await request.json();
    if (!name) return NextResponse.json({ error: "Store name required" }, { status: 400 });

    await db.tenant.update({
      where: { id: tenantId },
      data: {
        name,
        tagline: tagline || null,
        logo: logo || null,
        primaryColor: primaryColor || "#064E3B",
        accentColor: accentColor || "#F59E0B",
        heroBannerImage: heroBannerImage || null,
        heroBannerTitle: heroBannerTitle || null,
        heroBannerSubtitle: heroBannerSubtitle || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
