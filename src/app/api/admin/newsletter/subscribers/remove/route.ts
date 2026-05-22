import { NextRequest, NextResponse } from "next/server";
import { getScopedDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const tdb = await getScopedDb();
    const { id } = await request.json();
    const sub = await tdb.subscriber.findFirst({ where: { id } });
    if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await tdb.subscriber.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return apiError(error, { context: "admin/newsletter/subscribers/remove" });
  }
}
