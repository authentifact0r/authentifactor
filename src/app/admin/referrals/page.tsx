export const dynamic = "force-dynamic";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Gift, Users, Link2, Copy } from "lucide-react";

export default async function ReferralsPage() {
  const user = await requireAdmin();

  const tenant = await db.tenant.findFirst({
    where: {
      tenantUsers: { some: { userId: user.id } },
    },
    select: {
      id: true,
      referralCode: true,
    },
  });

  if (!tenant) return <p>Tenant not found.</p>;

  // Find tenants referred by this tenant
  const referrals = await db.tenant.findMany({
    where: { referredByTenantId: tenant.id },
    select: {
      id: true,
      name: true,
      slug: true,
      vertical: true,
      billingPlan: true,
      billingStatus: true,
      createdAt: true,
      trialEndsAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const referralUrl = tenant.referralCode
    ? `https://authentifactor.com/get-started?ref=${tenant.referralCode}`
    : null;

  const activeReferrals = referrals.filter(
    (r) => r.billingStatus === "active"
  ).length;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Referral Program</h1>
        <p className="text-sm text-gray-500">
          Refer other businesses and earn rewards.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referrals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Referrals</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeReferrals}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Code</CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <code className="text-lg font-bold font-mono">
              {tenant.referralCode ?? "—"}
            </code>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link */}
      {referralUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Share this link with other business owners. When they sign up using your link, they get listed as your referral.
            </p>
            <div className="flex items-center gap-2 rounded-lg border bg-gray-50 p-3">
              <code className="flex-1 text-sm text-gray-700 truncate">
                {referralUrl}
              </code>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referral List */}
      <Card>
        <CardHeader>
          <CardTitle>Referred Stores</CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No referrals yet. Share your referral link to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{r.name}</span>
                        <span className="block text-xs text-gray-500">
                          {r.slug}.authentifactor.com
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {r.vertical ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{r.billingPlan}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={r.billingStatus === "active" ? "success" : "destructive"}
                      >
                        {r.billingStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(r.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
