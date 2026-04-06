import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { rateLimit } from "@/lib/rateLimit";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = rateLimit(`slug-check:${ip}`, 30, 60_000);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  const rawSlug = request.nextUrl.searchParams.get("slug");
  if (!rawSlug) {
    return NextResponse.json(
      { error: "slug parameter is required" },
      { status: 400 }
    );
  }

  const slug = slugify(rawSlug);
  if (!slug) {
    return NextResponse.json(
      { available: false, slug: "", error: "Invalid slug" },
      { status: 400 }
    );
  }

  const existing = await db.tenant.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ available: true, slug });
  }

  // Suggest alternatives
  for (let i = 1; i <= 5; i++) {
    const suggestion = `${slug}-${i}`;
    const taken = await db.tenant.findUnique({
      where: { slug: suggestion },
      select: { id: true },
    });
    if (!taken) {
      return NextResponse.json({
        available: false,
        slug,
        suggestion,
      });
    }
  }

  return NextResponse.json({ available: false, slug });
}
