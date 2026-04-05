import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-dev-secret");

/**
 * GET /api/data/export — GDPR Article 20 Data Portability
 * Returns all personal data for the authenticated user as JSON.
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("access_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
        addresses: true,
        tenantUsers: {
          select: {
            role: true,
            tenant: { select: { name: true, slug: true } },
          },
        },
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Get orders for this user across all tenants
    const tenantIds = user.tenantUsers.map((tu) => tu.tenant.slug);

    const exportData = {
      exportDate: new Date().toISOString(),
      format: "GDPR Article 20 Data Export",
      platform: "Authentifactor",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        accountCreated: user.createdAt,
      },
      addresses: user.addresses,
      tenantMemberships: user.tenantUsers.map((tu) => ({
        tenant: tu.tenant.name,
        role: tu.role,
      })),
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="authentifactor-data-export-${userId}.json"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
