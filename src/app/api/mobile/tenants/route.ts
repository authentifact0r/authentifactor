import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const tenants = await db.tenant.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      primaryColor: true,
      accentColor: true,
      tagline: true,
      currency: true,
      mobileAppEnabled: true,
      mobileAppBrandName: true,
      mobileAppIcon: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ tenants });
}
