import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getTenantId } from "@/lib/tenant";
import { apiError } from "@/lib/api-error";
import { readJsonBody } from "@/lib/read-body";
import type { TenantRole } from "@prisma/client";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const tenantId = await getTenantId();

    const { email, role } = await readJsonBody<{ email?: string; role?: string }>(request);
    if (!email || !role) return NextResponse.json({ error: "Email and role required" }, { status: 400 });
    if (!["ADMIN", "MANAGER", "CUSTOMER"].includes(role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });

    // Find or create user
    let user = await db.user.findUnique({ where: { email } });
    if (!user) {
      const { hashPassword } = await import("@/lib/auth");
      // 2026-05-22 hardening (audit MEDIUM — CWE-338 weak PRNG):
      // placeholder password for an invited account is now generated
      // with a CSPRNG (was Math.random()). It is never communicated;
      // the invitee should go through a password-set flow.
      user = await db.user.create({
        data: {
          email,
          firstName: email.split("@")[0],
          lastName: "",
          passwordHash: await hashPassword(crypto.randomBytes(32).toString("base64url")),
        },
      });
    }

    // Check not already a member
    const existing = await db.tenantUser.findUnique({
      where: { userId_tenantId: { userId: user.id, tenantId } },
    });
    if (existing) return NextResponse.json({ error: "User is already a team member" }, { status: 400 });

    const member = await db.tenantUser.create({
      // `role` is validated against the allow-list above.
      data: { userId: user.id, tenantId, role: role as TenantRole },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error: unknown) {
    return apiError(error, { context: "admin/team/invite" });
  }
}
