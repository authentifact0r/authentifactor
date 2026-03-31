export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toggleTenantActive } from "@/actions/tenants";
import Link from "next/link";
import { Building2, Plus } from "lucide-react";

export default async function TenantsListPage() {
  const tenants = await db.tenant.findMany({
    include: {
      _count: {
        select: {
          products: true,
          orders: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tenants</h1>
          <p className="text-sm text-gray-500">
            Manage all stores on the platform.
          </p>
        </div>
        <Link href="/superadmin/tenants/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Tenant
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            All Tenants
            <Badge variant="secondary">{tenants.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tenants.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No tenants yet. Create your first one.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {t.slug}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {t.customDomain || `${t.slug}.authentifactor.com`}
                      </TableCell>
                      <TableCell>{t._count.products}</TableCell>
                      <TableCell>{t._count.orders}</TableCell>
                      <TableCell>
                        <form
                          action={async () => {
                            "use server";
                            await toggleTenantActive(t.id);
                          }}
                        >
                          <button type="submit">
                            <Badge
                              variant={t.isActive ? "success" : "destructive"}
                              className="cursor-pointer"
                            >
                              {t.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </button>
                        </form>
                      </TableCell>
                      <TableCell>
                        <Link href={`/superadmin/tenants/${t.id}`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
