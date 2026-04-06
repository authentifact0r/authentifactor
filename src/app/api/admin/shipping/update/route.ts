import { NextRequest, NextResponse } from "next/server";
import { getScopedDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const tdb = await getScopedDb();

    const { id, isActive } = await request.json();
    const rule = await tdb.shippingRule.findFirst({ where: { id } });
    if (!rule) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await tdb.shippingRule.update({ where: { id }, data: { isActive } });
    return NextResponse.json({ rule: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
