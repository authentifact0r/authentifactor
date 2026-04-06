import { NextRequest, NextResponse } from "next/server";
import { getScopedDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const tdb = await getScopedDb();
    const { id } = await request.json();
    const campaign = await tdb.campaign.findFirst({ where: { id } });
    if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await tdb.campaign.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
