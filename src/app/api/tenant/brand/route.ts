import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/tenant/brand — returns tenant branding for the current domain.
 * Used by login/register pages to show tenant-specific branding.
 */
export async function GET(request: NextRequest) {
  try {
    const slug = request.headers.get("x-tenant-slug");
    if (!slug) {
      return NextResponse.json({ tenant: null });
    }

    const tenant = await db.tenant.findUnique({
      where: { slug },
      select: {
        name: true,
        logo: true,
        primaryColor: true,
        accentColor: true,
        tagline: true,
        customDomain: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ tenant: null });
    }

    return NextResponse.json({ tenant });
  } catch {
    return NextResponse.json({ tenant: null });
  }
}
