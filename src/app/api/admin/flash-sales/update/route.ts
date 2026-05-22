import { NextRequest, NextResponse } from "next/server";
import { getScopedDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const tdb = await getScopedDb();

    const { id, isActive } = await request.json();
    const sale = await tdb.flashSale.findFirst({ where: { id } });
    if (!sale) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await tdb.flashSale.update({ where: { id }, data: { isActive } });
    return NextResponse.json({ sale: updated });
  } catch (error: any) {
    return apiError(error, { context: "admin/flash-sales/update" });
  }
}
