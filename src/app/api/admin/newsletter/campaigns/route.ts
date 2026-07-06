import { NextRequest, NextResponse } from "next/server";
import { getScopedDb, TENANT_ID } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const tdb = await getScopedDb();
    const { title, subject, body, channel, audience } = await request.json();
    if (!title || !body) return NextResponse.json({ error: "Title and body required" }, { status: 400 });

    const campaign = await tdb.campaign.create({
      data: { tenantId: TENANT_ID, title, subject: subject || null, body, channel: channel || "email", audience: audience || "all", status: "draft" },
    });
    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error: any) {
    return apiError(error, { context: "admin/newsletter/campaigns" });
  }
}
