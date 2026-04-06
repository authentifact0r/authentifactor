import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getTenantId } from "@/lib/tenant";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const tenantId = await getTenantId();

    const { id, role } = await request.json();
    if (!id || !role) return NextResponse.json({ error: "id and role required" }, { status: 400 });

    // Verify member belongs to this tenant
    const member = await db.tenantUser.findFirst({ where: { id, tenantId } });
    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

    const updated = await db.tenantUser.update({ where: { id }, data: { role } });
    return NextResponse.json({ member: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
