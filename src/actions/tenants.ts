"use server";

import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createTenant(formData: FormData): Promise<void> {
  await requireSuperAdmin();

  const name = formData.get("name") as string;
  const slugRaw = (formData.get("slug") as string) || slugify(name);
  const slug = slugify(slugRaw);
  const primaryColor = (formData.get("primaryColor") as string) || "#064E3B";
  const accentColor = (formData.get("accentColor") as string) || "#F59E0B";
  const currency = (formData.get("currency") as string) || "NGN";
  const tagline = (formData.get("tagline") as string) || null;

  if (!name || !slug) {
    redirect("/superadmin/tenants/new?error=Name and slug are required");
  }

  const existing = await db.tenant.findUnique({ where: { slug } });
  if (existing) {
    redirect("/superadmin/tenants/new?error=Slug already in use");
  }

  const tenant = await db.tenant.create({
    data: {
      name,
      slug,
      primaryColor,
      accentColor,
      currency,
      tagline,
    },
  });

  await db.onboardingProgress.create({
    data: { tenantId: tenant.id },
  });

  revalidatePath("/superadmin/tenants");
  redirect("/superadmin/tenants");
}

export async function updateTenant(
  tenantId: string,
  formData: FormData
): Promise<void> {
  await requireSuperAdmin();

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const primaryColor = formData.get("primaryColor") as string;
  const accentColor = formData.get("accentColor") as string;
  const currency = formData.get("currency") as string;
  const tagline = (formData.get("tagline") as string) || null;
  const customDomain = (formData.get("customDomain") as string) || null;
  const paystackSecretKey =
    (formData.get("paystackSecretKey") as string) || null;
  const paystackPublicKey =
    (formData.get("paystackPublicKey") as string) || null;
  const stripeSecretKey = (formData.get("stripeSecretKey") as string) || null;
  const stripePublicKey = (formData.get("stripePublicKey") as string) || null;

  await db.tenant.update({
    where: { id: tenantId },
    data: {
      name,
      slug,
      primaryColor,
      accentColor,
      currency,
      tagline,
      customDomain,
      paystackSecretKey,
      paystackPublicKey,
      stripeSecretKey,
      stripePublicKey,
    },
  });

  revalidatePath("/superadmin/tenants");
  revalidatePath(`/superadmin/tenants/${tenantId}`);
  redirect("/superadmin/tenants");
}

export async function toggleTenantActive(tenantId: string): Promise<void> {
  await requireSuperAdmin();

  const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    redirect("/superadmin/tenants?error=Tenant not found");
  }

  await db.tenant.update({
    where: { id: tenantId },
    data: { isActive: !tenant.isActive },
  });

  revalidatePath("/superadmin/tenants");
}
