export const dynamic = "force-dynamic";

import { requireAdmin } from "@/lib/auth";
import { getTenant } from "@/lib/tenant";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { TeamManager } from "./team-manager";

export default async function TeamPage() {
  await requireAdmin();
  const tenant = await getTenant();
  const h = await headers();
  const tenantSlug = h.get("x-tenant-slug") || "";

  const members = await db.tenantUser.findMany({
    where: { tenantId: tenant.id },
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true, phone: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const serialized = members.map((m) => ({
    id: m.id,
    role: m.role,
    createdAt: m.createdAt.toISOString(),
    firstName: m.user.firstName || "",
    lastName: m.user.lastName || "",
    email: m.user.email,
    phone: m.user.phone || "",
  }));

  return <TeamManager members={serialized} tenantSlug={tenantSlug} />;
}
