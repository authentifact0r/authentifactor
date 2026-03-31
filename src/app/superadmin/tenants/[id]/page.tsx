export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { updateTenant } from "@/actions/tenants";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, Save } from "lucide-react";
import Link from "next/link";

export default async function EditTenantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const tenant = await db.tenant.findUnique({
    where: { id },
    include: {
      _count: { select: { products: true, orders: true, tenantUsers: true } },
    },
  });

  if (!tenant) notFound();

  const boundUpdate = updateTenant.bind(null, tenant.id);

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
        <h1 className="text-2xl font-bold">{tenant.name}</h1>
        <Badge variant={tenant.isActive ? "success" : "destructive"}>
          {tenant.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{tenant._count.products}</p>
            <p className="text-sm text-gray-500">Products</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{tenant._count.orders}</p>
            <p className="text-sm text-gray-500">Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{tenant._count.tenantUsers}</p>
            <p className="text-sm text-gray-500">Users</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Edit Tenant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={boundUpdate} className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Store Name</label>
                <Input name="name" defaultValue={tenant.name} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Slug</label>
                <Input name="slug" defaultValue={tenant.slug} required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tagline</label>
              <Input
                name="tagline"
                defaultValue={tenant.tagline || ""}
                placeholder="Authentic African groceries"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Domain</label>
              <Input
                name="customDomain"
                defaultValue={tenant.customDomain || ""}
                placeholder="store.example.com"
              />
            </div>

            {/* Colors & Currency */}
            <div className="grid gap-4 sm:grid-cols-3">
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Currency</label>
                <Select name="currency" defaultValue={tenant.currency}>
                  <option value="NGN">NGN - Nigerian Naira</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GHS">GHS - Ghanaian Cedi</option>
                  <option value="KES">KES - Kenyan Shilling</option>
                </Select>
              </div>
            </div>

            {/* Payment Keys */}
            <div className="border-t pt-6">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Payment Integration
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Paystack Secret Key
                  </label>
                  <Input
                    name="paystackSecretKey"
                    type="password"
                    defaultValue={tenant.paystackSecretKey || ""}
                    placeholder="sk_..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Paystack Public Key
                  </label>
                  <Input
                    name="paystackPublicKey"
                    defaultValue={tenant.paystackPublicKey || ""}
                    placeholder="pk_..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Stripe Secret Key
                  </label>
                  <Input
                    name="stripeSecretKey"
                    type="password"
                    defaultValue={tenant.stripeSecretKey || ""}
                    placeholder="sk_..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Stripe Public Key
                  </label>
                  <Input
                    name="stripePublicKey"
                    defaultValue={tenant.stripePublicKey || ""}
                    placeholder="pk_..."
                  />
                </div>
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
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
