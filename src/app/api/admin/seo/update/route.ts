import { NextRequest, NextResponse } from "next/server";
import { getScopedDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const tdb = await getScopedDb();

    const { id, metaTitle, metaDescription, ogImage, canonicalUrl, noIndex } = await request.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const rule = await tdb.seoSettings.findFirst({ where: { id } });
    if (!rule) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await tdb.seoSettings.update({
      where: { id },
      data: {
        metaTitle: metaTitle ?? rule.metaTitle,
        metaDescription: metaDescription ?? rule.metaDescription,
        ogImage: ogImage ?? rule.ogImage,
        canonicalUrl: canonicalUrl ?? rule.canonicalUrl,
        noIndex: noIndex ?? rule.noIndex,
      },
    });

    return NextResponse.json({ rule: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
