import { NextRequest, NextResponse } from "next/server";
import { getScopedDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const tdb = await getScopedDb();
    const { title, subject, body, channel, audience } = await request.json();
    if (!title || !body) return NextResponse.json({ error: "Title and body required" }, { status: 400 });

    const campaign = await tdb.campaign.create({
      data: { title, subject: subject || null, body, channel: channel || "email", audience: audience || "all", status: "draft" },
    });
    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
