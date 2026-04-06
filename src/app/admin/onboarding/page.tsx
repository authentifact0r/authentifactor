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
  Sparkles,
  Clock,
} from "lucide-react";

// Template-aware descriptions per vertical
const verticalHints: Record<string, Record<string, string>> = {
  grocery: {
    branding: "Set your store colours and upload your logo. Tip: warm greens and golds work great for African grocery brands.",
    inventory: "Add your products — we've pre-loaded a few samples to get you started. Edit or replace them.",
    shipping: "We've set up local fresh delivery, standard, and express shipping. Adjust prices to match your area.",
  },
  fashion: {
    branding: "Upload your logo and set your brand colours. We've applied a luxury dark + gold palette for you.",
    inventory: "Add your collections — sizes, colours, and materials are all supported. We've added sample items.",
    shipping: "Standard, express, and international (DHL) shipping are pre-configured. Adjust as needed.",
  },
  catering: {
    branding: "Set your brand identity. Warm, appetising colours work best for catering businesses.",
    inventory: "Add party packs, meal prep boxes, and platters. Sample items are ready to customise.",
    shipping: "Local fresh delivery and van delivery are set up for catering volumes.",
  },
  beauty: {
    branding: "We've set a premium purple palette. Customise with your brand colours and logo.",
    inventory: "Add skincare, haircare, and beauty products. Sample items included.",
    shipping: "Standard and express shipping are configured. Add DHL for international orders.",
  },
  education: {
    branding: "Upload your school or academy branding. Blue tones are pre-applied.",
    inventory: "Add courses, workbooks, tutoring packages, or educational products.",
    shipping: "Standard and express shipping are ready. Digital products can use 0 weight.",
  },
};

function getStepDescription(key: string, vertical: string | null, defaultDesc: string): string {
  if (vertical && verticalHints[vertical]?.[key]) {
    return verticalHints[vertical][key];
  }
  return defaultDesc;
}

const STEPS = [
  {
    key: "branding" as const,
    label: "Branding",
    defaultDescription: "Upload your logo, set colors and hero banner",
    href: "/admin/branding",
    icon: Palette,
  },
  {
    key: "domain" as const,
    label: "Domain Setup",
    defaultDescription: "Your store is live at your subdomain. Add a custom domain in Settings.",
    href: "/admin/settings",
    icon: Globe,
  },
  {
    key: "warehouse" as const,
    label: "Warehouse Setup",
    defaultDescription: "Add at least one warehouse for inventory",
    href: "/admin/warehouses",
    icon: Warehouse,
  },
  {
    key: "inventory" as const,
    label: "Import Inventory",
    defaultDescription: "Add your first products to the catalog",
    href: "/admin/products",
    icon: Package,
  },
  {
    key: "shipping" as const,
    label: "Shipping Rules",
    defaultDescription: "Set up shipping methods and pricing",
    href: "/admin/shipping",
    icon: Truck,
  },
  {
    key: "seo" as const,
    label: "SEO Settings",
    defaultDescription: "Optimize your store for search engines",
    href: "/admin/seo",
    icon: Search,
  },
  {
    key: "adminUsers" as const,
    label: "Admin Users",
    defaultDescription: "Invite team members to help manage your store",
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

  // Trial info
  const isSelfService = tenant.signupSource === "self-service" || tenant.signupSource === "referral";
  const trialEndsAt = tenant.trialEndsAt ? new Date(tenant.trialEndsAt) : null;
  const daysLeft = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / 86400000)) : null;

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

      {/* Welcome banner for self-service signups */}
      {isSelfService && daysLeft !== null && daysLeft > 0 && (
        <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
              <Sparkles className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-emerald-900">
                Welcome to Authentifactor!
              </h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                Your store is live at <strong>{tenant.slug}.authentifactor.com</strong>.
                You have <strong>{daysLeft} day{daysLeft !== 1 ? "s" : ""}</strong> left on your free trial.
                Complete the steps below to start selling.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600 shrink-0">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-semibold">{daysLeft}d</span>
            </div>
          </CardContent>
        </Card>
      )}

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
                    {getStepDescription(step.key, tenant.vertical, step.defaultDescription)}
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
