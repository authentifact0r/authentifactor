"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleMarketplaceListing() {
  const user = await requireAdmin();

  const tenant = await db.tenant.findFirst({
    where: {
      tenantUsers: { some: { userId: user.id } },
    },
    select: { id: true, isPublicListing: true },
  });

  if (!tenant) throw new Error("Tenant not found");

  await db.tenant.update({
    where: { id: tenant.id },
    data: { isPublicListing: !tenant.isPublicListing },
  });

  revalidatePath("/admin/settings");
}

export async function updateVertical(formData: FormData) {
  const user = await requireAdmin();
  const vertical = formData.get("vertical") as string;

  const tenant = await db.tenant.findFirst({
    where: {
      tenantUsers: { some: { userId: user.id } },
    },
    select: { id: true },
  });

  if (!tenant) throw new Error("Tenant not found");

  await db.tenant.update({
    where: { id: tenant.id },
    data: { vertical: vertical || null },
  });

  revalidatePath("/admin/settings");
}
