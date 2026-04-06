export const dynamic = "force-dynamic";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toggleMarketplaceListing, updateVertical } from "@/actions/settings";
import { Globe, Tag } from "lucide-react";

export default async function SettingsPage() {
  const user = await requireAdmin();

  const tenant = await db.tenant.findFirst({
    where: {
      tenantUsers: { some: { userId: user.id } },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      isPublicListing: true,
      vertical: true,
      applicationFeePercent: true,
      referralCode: true,
    },
  });

  if (!tenant) return <p>Tenant not found.</p>;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Store Settings</h1>
        <p className="text-sm text-gray-500">
          Manage your store visibility and configuration.
        </p>
      </div>

      {/* Marketplace Listing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Marketplace Listing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                Show your store in the Authentifactor Marketplace
              </p>
              <p className="text-xs text-gray-500 mt-1">
                When enabled, your store appears in the public marketplace directory.
                Customers can discover your store and browse your products.
              </p>
            </div>
            <form action={toggleMarketplaceListing}>
              <button
                type="submit"
                className="cursor-pointer"
              >
                <Badge
                  variant={tenant.isPublicListing ? "success" : "secondary"}
                  className="text-sm px-4 py-1.5"
                >
                  {tenant.isPublicListing ? "Listed" : "Not Listed"}
                </Badge>
              </button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Industry / Vertical */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Industry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateVertical} className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1.5">
                Store Category
              </label>
              <select
                name="vertical"
                defaultValue={tenant.vertical ?? ""}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="">Not specified</option>
                <option value="grocery">Grocery & Food</option>
                <option value="fashion">Fashion & Textiles</option>
                <option value="catering">Catering & Meal Prep</option>
                <option value="beauty">Beauty & Cosmetics</option>
                <option value="education">Education & Learning</option>
                <option value="other">Other</option>
              </select>
            </div>
            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 cursor-pointer"
            >
              Save
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Referral Code */}
      {tenant.referralCode && (
        <Card>
          <CardHeader>
            <CardTitle>Referral Code</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-2">
              Share this code to refer other businesses to Authentifactor.
            </p>
            <code className="rounded bg-gray-100 px-3 py-1.5 text-sm font-mono">
              {tenant.referralCode}
            </code>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
