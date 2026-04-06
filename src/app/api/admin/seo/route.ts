import { NextRequest, NextResponse } from "next/server";
import { getScopedDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const tdb = await getScopedDb();

    const { pageType, pageSlug, metaTitle, metaDescription, ogImage, canonicalUrl, noIndex } = await request.json();
    if (!pageType) return NextResponse.json({ error: "Page type required" }, { status: 400 });

    const rule = await tdb.seoSettings.create({
      data: {
        pageType,
        pageSlug: pageSlug || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        ogImage: ogImage || null,
        canonicalUrl: canonicalUrl || null,
        noIndex: noIndex || false,
      },
    });

    return NextResponse.json({ rule }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") return NextResponse.json({ error: "A rule for this page type + slug already exists" }, { status: 400 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
