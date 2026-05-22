import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, setAuthCookies, type JWTPayload } from "@/lib/auth";

// 2026-05-20 hardening (audit HIGH — divergent auth paths): this route
// previously minted its own flat 7-day `access_token` signed with a
// fallback-able `JWT_SECRET`, with no refresh token and no server-side
// session row. It now funnels through `setAuthCookies()` — the single
// session-issuing path — which produces a 15m access token plus a
// rotating, revocable 7d refresh token persisted in `RefreshToken`.
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Find tenant context
    let tenantId = "";
    let tenantRole = "CUSTOMER";

    // Check x-tenant-slug header from middleware (set server-side; the
    // middleware strips any attacker-supplied value before this point).
    const slug = request.headers.get("x-tenant-slug");
    if (slug) {
      const tenant = await db.tenant.findUnique({ where: { slug } });
      if (tenant) {
        tenantId = tenant.id;
        let tenantUser = await db.tenantUser.findUnique({
          where: { userId_tenantId: { userId: user.id, tenantId: tenant.id } },
        });
        if (!tenantUser) {
          tenantUser = await db.tenantUser.create({
            data: { userId: user.id, tenantId: tenant.id, role: "CUSTOMER" },
          });
        }
        tenantRole = tenantUser.role;
      }
    }

    // Superadmin fallback — find first linked tenant
    if (!tenantId && user.isSuperAdmin) {
      const firstLink = await db.tenantUser.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
      });
      if (firstLink) {
        tenantId = firstLink.tenantId;
        tenantRole = firstLink.role;
      }
    }

    if (!tenantId && !user.isSuperAdmin) {
      return NextResponse.json({ error: "No tenant context. Access your storefront domain directly." }, { status: 403 });
    }

    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      tenantId,
      tenantRole,
    };
    await setAuthCookies(payload);

    const redirectTo = user.isSuperAdmin ? "/superadmin" : "/admin";
    return NextResponse.json({ success: true, redirectTo });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
