export const dynamic = "force-dynamic";

import { requireAdmin } from "@/lib/auth";
import { getTenant } from "@/lib/tenant";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Palette,
  Globe,
  Warehouse,
  Package,
  Truck,
  Search,
  Users,
  CheckCircle2,
  Circle,
  Rocket,
} from "lucide-react";

const STEPS = [
  {
    key: "branding" as const,
    label: "Branding",
    description: "Upload your logo, set colors and hero banner",
    href: "/admin/branding",
    icon: Palette,
  },
  {
    key: "domain" as const,
    label: "Domain Setup",
    description: "Configure your custom domain or subdomain",
    href: "/admin/settings",
    icon: Globe,
  },
  {
    key: "warehouse" as const,
    label: "Warehouse Setup",
    description: "Add at least one warehouse for inventory",
    href: "/admin/warehouses",
    icon: Warehouse,
  },
  {
    key: "inventory" as const,
    label: "Import Inventory",
    description: "Add your first products to the catalog",
    href: "/admin/products",
    icon: Package,
  },
  {
    key: "shipping" as const,
    label: "Shipping Rules",
    description: "Set up shipping methods and pricing",
    href: "/admin/shipping",
    icon: Truck,
  },
  {
    key: "seo" as const,
    label: "SEO Settings",
    description: "Optimize your store for search engines",
    href: "/admin/seo",
    icon: Search,
  },
  {
    key: "adminUsers" as const,
    label: "Admin Users",
    description: "Invite team members to help manage your store",
    href: "/admin/team",
    icon: Users,
  },
];

export default async function OnboardingPage() {
  await requireAdmin();
  const tenant = await getTenant();

  let progress = await db.onboardingProgress.findUnique({
    where: { tenantId: tenant.id },
  });

  if (!progress) {
    progress = await db.onboardingProgress.create({
      data: { tenantId: tenant.id },
    });
  }

  const completedCount = STEPS.filter(
    (s) => progress![s.key as keyof typeof progress] === true
  ).length;
  const totalSteps = STEPS.length;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);
  const allDone = completedCount === totalSteps;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Store Setup</h1>
          <p className="text-sm text-gray-500">
            Complete these steps to get {tenant.name} up and running.
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          <Rocket className="h-5 w-5" />
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">
              {completedCount} of {totalSteps} steps completed
            </p>
            <Badge variant={allDone ? "success" : "secondary"}>
              {progressPercent}%
            </Badge>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {allDone && (
            <p className="mt-3 text-sm font-medium text-emerald-700">
              Your store is fully set up. You are ready to launch!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Checklist */}
      <div className="grid gap-4 sm:grid-cols-2">
        {STEPS.map((step, index) => {
          const isDone =
            progress![step.key as keyof typeof progress] === true;
          const Icon = step.icon;

          return (
            <Card
              key={step.key}
              className={
                isDone
                  ? "border-emerald-200 bg-emerald-50/50"
                  : "border-gray-200"
              }
            >
              <CardContent className="flex items-start gap-4 p-5">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs font-bold text-gray-400">
                    {index + 1}
                  </span>
                  {isDone ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  ) : (
                    <Circle className="h-6 w-6 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-gray-600" />
                    <h3
                      className={`text-sm font-semibold ${isDone ? "text-emerald-800" : "text-gray-900"}`}
                    >
                      {step.label}
                    </h3>
                    {isDone && (
                      <Badge variant="success" className="text-[10px]">
                        Done
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {step.description}
                  </p>
                  <Link href={step.href}>
                    <Button
                      variant={isDone ? "outline" : "default"}
                      size="sm"
                      className="mt-3"
                    >
                      {isDone ? "Review" : "Set Up"}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
