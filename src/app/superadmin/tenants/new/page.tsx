export const dynamic = "force-dynamic";

import { createTenant } from "@/actions/tenants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Building2, Save } from "lucide-react";
import Link from "next/link";

export default async function NewTenantPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/superadmin/tenants"
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          Tenants
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold">New Tenant</h1>
      </div>

      {params.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {params.error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Create Tenant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createTenant} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Store Name</label>
                <Input
                  name="name"
                  required
                  placeholder="My African Food Store"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Slug{" "}
                  <span className="text-gray-400">
                    (auto-generated if blank)
                  </span>
                </label>
                <Input name="slug" placeholder="my-store" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tagline</label>
              <Input
                name="tagline"
                placeholder="Authentic African groceries delivered"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="primaryColor"
                    defaultValue="#064E3B"
                    className="h-10 w-14 cursor-pointer rounded-lg border border-gray-300"
                  />
                  <span className="text-sm text-gray-500">#064E3B</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Accent Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="accentColor"
                    defaultValue="#F59E0B"
                    className="h-10 w-14 cursor-pointer rounded-lg border border-gray-300"
                  />
                  <span className="text-sm text-gray-500">#F59E0B</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Currency</label>
                <Select name="currency" defaultValue="NGN">
                  <option value="NGN">NGN - Nigerian Naira</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GHS">GHS - Ghanaian Cedi</option>
                  <option value="KES">KES - Kenyan Shilling</option>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Link href="/superadmin/tenants">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Create Tenant
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
