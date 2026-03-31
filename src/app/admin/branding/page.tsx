export const dynamic = "force-dynamic";

import { requireAdmin } from "@/lib/auth";
import { getTenant } from "@/lib/tenant";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Palette, Save } from "lucide-react";

async function saveBranding(formData: FormData) {
  "use server";
  await requireAdmin();
  const tenantData = await (await import("@/lib/tenant")).getTenant();

  const name = formData.get("name") as string;
  const tagline = (formData.get("tagline") as string) || null;
  const logo = (formData.get("logo") as string) || null;
  const primaryColor = (formData.get("primaryColor") as string) || "#064E3B";
  const accentColor = (formData.get("accentColor") as string) || "#F59E0B";
  const heroBannerImage = (formData.get("heroBannerImage") as string) || null;
  const heroBannerTitle = (formData.get("heroBannerTitle") as string) || null;
  const heroBannerSubtitle =
    (formData.get("heroBannerSubtitle") as string) || null;

  await db.tenant.update({
    where: { id: tenantData.id },
    data: {
      name,
      tagline,
      logo,
      primaryColor,
      accentColor,
      heroBannerImage,
      heroBannerTitle,
      heroBannerSubtitle,
    },
  });

  // Mark branding step as complete
  await db.onboardingProgress.upsert({
    where: { tenantId: tenantData.id },
    update: { branding: true },
    create: { tenantId: tenantData.id, branding: true },
  });

  revalidatePath("/admin/branding");
  revalidatePath("/admin/onboarding");
  revalidatePath("/");
  redirect("/admin/branding?saved=1");
}

export default async function BrandingPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdmin();
  const tenant = await getTenant();
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Branding</h1>
          <p className="text-sm text-gray-500">
            Customize your store&apos;s look and feel.
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          <Palette className="h-5 w-5" />
        </div>
      </div>

      {params.saved && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Branding updated successfully.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Store Identity</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveBranding} className="space-y-6">
            {/* Name & Tagline */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Store Name</label>
                <Input
                  name="name"
                  defaultValue={tenant.name}
                  required
                  placeholder="My African Food Store"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tagline</label>
                <Input
                  name="tagline"
                  defaultValue={tenant.tagline || ""}
                  placeholder="Authentic African groceries delivered"
                />
              </div>
            </div>

            {/* Logo */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Logo URL</label>
              <Input
                name="logo"
                type="url"
                defaultValue={tenant.logo || ""}
                placeholder="https://your-cdn.com/logo.png"
              />
              {tenant.logo && (
                <div className="mt-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tenant.logo}
                    alt="Current logo"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
            </div>

            {/* Colors */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="primaryColor"
                    defaultValue={tenant.primaryColor}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-gray-300"
                  />
                  <span className="text-sm text-gray-500">
                    {tenant.primaryColor}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Accent Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="accentColor"
                    defaultValue={tenant.accentColor}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-gray-300"
                  />
                  <span className="text-sm text-gray-500">
                    {tenant.accentColor}
                  </span>
                </div>
              </div>
            </div>

            {/* Hero Banner */}
            <div className="border-t pt-6">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Hero Banner
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Banner Image URL
                  </label>
                  <Input
                    name="heroBannerImage"
                    type="url"
                    defaultValue={tenant.heroBannerImage || ""}
                    placeholder="https://your-cdn.com/hero.jpg"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Banner Title</label>
                    <Input
                      name="heroBannerTitle"
                      defaultValue={tenant.heroBannerTitle || ""}
                      placeholder="Welcome to our store"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Banner Subtitle
                    </label>
                    <Input
                      name="heroBannerSubtitle"
                      defaultValue={tenant.heroBannerSubtitle || ""}
                      placeholder="Fresh African ingredients delivered to your door"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Branding
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="rounded-lg p-6"
            style={{ backgroundColor: tenant.primaryColor }}
          >
            <div className="flex items-center gap-3">
              {tenant.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tenant.logo}
                  alt=""
                  className="h-10 w-10 rounded-lg object-contain"
                />
              )}
              <div>
                <h3 className="text-lg font-bold text-white">{tenant.name}</h3>
                {tenant.tagline && (
                  <p className="text-sm text-white/80">{tenant.tagline}</p>
                )}
              </div>
            </div>
            <div className="mt-4">
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-sm font-medium"
                style={{
                  backgroundColor: tenant.accentColor,
                  color: "#fff",
                }}
              >
                Sample Button
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
