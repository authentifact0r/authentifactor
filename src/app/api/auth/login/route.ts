import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-dev-secret");

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

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Find tenant context
    let tenantId = "";
    let tenantRole = "CUSTOMER";

    // Check x-tenant-slug header from middleware
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

    // Create JWT
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      tenantId,
      tenantRole,
      isSuperAdmin: user.isSuperAdmin,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    const redirectTo = user.isSuperAdmin ? "/superadmin" : "/admin";

    const response = NextResponse.json({ success: true, redirectTo });
    response.cookies.set("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
