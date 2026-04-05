import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-dev-secret");

/**
 * POST /api/data/delete — GDPR Article 17 Right to Erasure
 * Deletes all personal data for the authenticated user.
 * Requires { confirm: true } in the body.
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("access_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    const body = await request.json();
    if (!body.confirm) {
      return NextResponse.json({
        error: "Confirmation required",
        message: "Send { confirm: true } to permanently delete all your data. This action cannot be undone.",
      }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Prevent superadmin self-deletion
    if (user.isSuperAdmin) {
      return NextResponse.json({ error: "Superadmin accounts cannot be self-deleted" }, { status: 403 });
    }

    // Delete in order: addresses → tenantUsers → user
    await db.address.deleteMany({ where: { userId } });
    await db.tenantUser.deleteMany({ where: { userId } });
    await db.user.delete({ where: { id: userId } });

    // Clear auth cookie
    const response = NextResponse.json({
      success: true,
      message: "All personal data has been permanently deleted.",
      deletedAt: new Date().toISOString(),
    });
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
