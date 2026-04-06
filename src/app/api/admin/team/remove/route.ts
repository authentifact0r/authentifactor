import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getTenantId } from "@/lib/tenant";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const tenantId = await getTenantId();

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    // Verify member belongs to this tenant
    const member = await db.tenantUser.findFirst({ where: { id, tenantId } });
    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

    await db.tenantUser.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
