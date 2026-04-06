import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getTenantId } from "@/lib/tenant";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const tenantId = await getTenantId();

    const { email, role } = await request.json();
    if (!email || !role) return NextResponse.json({ error: "Email and role required" }, { status: 400 });
    if (!["ADMIN", "MANAGER", "CUSTOMER"].includes(role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });

    // Find or create user
    let user = await db.user.findUnique({ where: { email } });
    if (!user) {
      const { hashPassword } = await import("@/lib/auth");
      user = await db.user.create({
        data: {
          email,
          firstName: email.split("@")[0],
          lastName: "",
          passwordHash: await hashPassword(Math.random().toString(36).slice(2, 14)),
        },
      });
    }

    // Check not already a member
    const existing = await db.tenantUser.findUnique({
      where: { userId_tenantId: { userId: user.id, tenantId } },
    });
    if (existing) return NextResponse.json({ error: "User is already a team member" }, { status: 400 });

    const member = await db.tenantUser.create({
      data: { userId: user.id, tenantId, role },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
