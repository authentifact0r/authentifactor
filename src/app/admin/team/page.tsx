export const dynamic = "force-dynamic";

import { requireAdmin } from "@/lib/auth";
import { getTenant } from "@/lib/tenant";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, UserPlus } from "lucide-react";

async function inviteTeamMember(formData: FormData) {
  "use server";
  await requireAdmin();
  const tenant = await (await import("@/lib/tenant")).getTenant();

  const email = (formData.get("email") as string).trim().toLowerCase();
  const role = formData.get("role") as string;

  if (!email || !role) {
    redirect("/admin/team?error=Email and role are required");
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    redirect(
      "/admin/team?error=" +
        encodeURIComponent("User must register an account first")
    );
  }

  const existing = await db.tenantUser.findUnique({
    where: {
      userId_tenantId: { userId: user.id, tenantId: tenant.id },
    },
  });

  if (existing) {
    redirect("/admin/team?error=User is already a team member");
  }

  await db.tenantUser.create({
    data: {
      userId: user.id,
      tenantId: tenant.id,
      role: role as "MANAGER" | "ADMIN",
    },
  });

  // Mark admin users onboarding step complete
  await db.onboardingProgress.upsert({
    where: { tenantId: tenant.id },
    update: { adminUsers: true },
    create: { tenantId: tenant.id, adminUsers: true },
  });

  revalidatePath("/admin/team");
  revalidatePath("/admin/onboarding");
  redirect("/admin/team?success=1");
}

async function removeMember(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = formData.get("id") as string;
  await db.tenantUser.delete({ where: { id } });
  revalidatePath("/admin/team");
}

const ROLE_VARIANTS: Record<string, "default" | "secondary" | "warning"> = {
  ADMIN: "default",
  MANAGER: "warning",
  CUSTOMER: "secondary",
};

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  await requireAdmin();
  const tenant = await getTenant();
  const params = await searchParams;

  const members = await db.tenantUser.findMany({
    where: { tenantId: tenant.id },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-sm text-gray-500">
            Manage who has access to your store admin.
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          <Users className="h-5 w-5" />
        </div>
      </div>

      {params.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {params.error}
        </div>
      )}

      {params.success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Team member added successfully.
        </div>
      )}

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Team Members
            <Badge variant="secondary">{members.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No team members found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">
                      {m.user.firstName} {m.user.lastName}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {m.user.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant={ROLE_VARIANTS[m.role] || "secondary"}>
                        {m.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {m.createdAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <form action={removeMember}>
                        <input type="hidden" name="id" value={m.id} />
                        <Button variant="ghost" size="sm" type="submit">
                          Remove
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invite Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Team Member
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={inviteTeamMember} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  name="email"
                  type="email"
                  required
                  placeholder="colleague@example.com"
                />
                <p className="text-xs text-gray-400">
                  The user must have an existing account.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select name="role" required>
                  <option value="">Select role...</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </Select>
              </div>
            </div>
            <Button type="submit">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
