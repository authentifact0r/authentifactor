export const dynamic = "force-dynamic";

import { getScopedDb, TENANT_ID } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { formatPrice } from "@/lib/utils";
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
import { Truck, Plus } from "lucide-react";

async function addShippingRule(formData: FormData) {
  "use server";
  await requireAdmin();
  const tdb = await getScopedDb();

  const name = formData.get("name") as string;
  const method = formData.get("method") as string;
  const minWeightKg = parseFloat(formData.get("minWeightKg") as string);
  const maxWeightKg = parseFloat(formData.get("maxWeightKg") as string);
  const baseCost = parseFloat(formData.get("baseCost") as string);
  const perKgCost = parseFloat(formData.get("perKgCost") as string);
  const estimatedDays = parseInt(formData.get("estimatedDays") as string, 10);

  await tdb.shippingRule.create({
    data: {
      tenantId: TENANT_ID,
      name,
      method: method as "LOCAL_FRESH" | "STANDARD" | "EXPRESS" | "LOCAL_VAN" | "DHL",
      minWeightKg,
      maxWeightKg,
      baseCost,
      perKgCost,
      estimatedDays,
      isActive: true,
    },
  });

  revalidatePath("/admin/shipping");
}

async function toggleShippingRule(formData: FormData) {
  "use server";
  await requireAdmin();
  const tdb = await getScopedDb();
  const id = formData.get("id") as string;
  const current = formData.get("isActive") === "true";

  await tdb.shippingRule.update({
    where: { id },
    data: { isActive: !current },
  });

  revalidatePath("/admin/shipping");
}

async function deleteShippingRule(formData: FormData) {
  "use server";
  await requireAdmin();
  const tdb = await getScopedDb();
  const id = formData.get("id") as string;
  await tdb.shippingRule.delete({ where: { id } });
  revalidatePath("/admin/shipping");
}

const METHOD_LABELS: Record<string, string> = {
  LOCAL_FRESH: "Local Fresh",
  STANDARD: "Standard",
  EXPRESS: "Express",
  LOCAL_VAN: "Local Van",
  DHL: "DHL International",
};

export default async function ShippingAdminPage() {
  await requireAdmin();
  const tdb = await getScopedDb();

  const rules = await tdb.shippingRule.findMany({
    orderBy: { method: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shipping Rules</h1>
          <p className="text-sm text-gray-500">
            Configure shipping methods, weight ranges, and pricing.
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          <Truck className="h-5 w-5" />
        </div>
      </div>

      {/* Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Current Rules
            <Badge variant="secondary">{rules.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No shipping rules configured. Add your first rule below.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Weight Range</TableHead>
                    <TableHead>Base Cost</TableHead>
                    <TableHead>Per Kg</TableHead>
                    <TableHead>Est. Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">
                        {rule.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {METHOD_LABELS[rule.method] || rule.method}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {Number(rule.minWeightKg)}kg -{" "}
                        {Number(rule.maxWeightKg)}kg
                      </TableCell>
                      <TableCell>{formatPrice(Number(rule.baseCost))}</TableCell>
                      <TableCell>
                        {formatPrice(Number(rule.perKgCost))}
                      </TableCell>
                      <TableCell>{rule.estimatedDays}d</TableCell>
                      <TableCell>
                        <form action={toggleShippingRule}>
                          <input type="hidden" name="id" value={rule.id} />
                          <input
                            type="hidden"
                            name="isActive"
                            value={String(rule.isActive)}
                          />
                          <button type="submit">
                            <Badge
                              variant={rule.isActive ? "success" : "destructive"}
                              className="cursor-pointer"
                            >
                              {rule.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </button>
                        </form>
                      </TableCell>
                      <TableCell>
                        <form action={deleteShippingRule}>
                          <input type="hidden" name="id" value={rule.id} />
                          <Button variant="ghost" size="sm" type="submit">
                            Remove
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Shipping Rule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addShippingRule} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rule Name</label>
                <Input
                  name="name"
                  required
                  placeholder="e.g. Standard National"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Shipping Method</label>
                <Select name="method" required>
                  <option value="">Select method...</option>
                  <option value="LOCAL_FRESH">Local Fresh (same-day)</option>
                  <option value="STANDARD">Standard</option>
                  <option value="EXPRESS">Express</option>
                  <option value="LOCAL_VAN">Local Van</option>
                  <option value="DHL">DHL International</option>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Weight (kg)</label>
                <Input
                  name="minWeightKg"
                  type="number"
                  step="0.001"
                  min="0"
                  required
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Weight (kg)</label>
                <Input
                  name="maxWeightKg"
                  type="number"
                  step="0.001"
                  min="0"
                  required
                  placeholder="30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Base Cost</label>
                <Input
                  name="baseCost"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="1500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Per Kg Cost</label>
                <Input
                  name="perKgCost"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="200"
                />
              </div>
            </div>

            <div className="w-full sm:w-48">
              <div className="space-y-2">
                <label className="text-sm font-medium">Estimated Days</label>
                <Input
                  name="estimatedDays"
                  type="number"
                  min="1"
                  required
                  placeholder="3"
                />
              </div>
            </div>

            <Button type="submit">
              <Plus className="mr-2 h-4 w-4" />
              Add Rule
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
