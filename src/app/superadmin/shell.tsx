"use client";

import { DarkGradientBg } from "@/components/ui/dark-gradient-bg";
import { Sidebar } from "@/components/superadmin/sidebar";
import { Topbar } from "@/components/superadmin/topbar";
import { QuickActions } from "@/components/superadmin/quick-actions";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/superadmin": "Overview",
  "/superadmin/tenants": "Tenants",
  "/superadmin/tenants/new": "New Tenant",
  "/superadmin/billing": "Billing",
  "/superadmin/billing/usage": "Usage Analytics",
  "/superadmin/revenue": "Platform Revenue",
  "/superadmin/users": "Users",
  "/superadmin/security": "Security Posture",
  "/superadmin/settings": "Settings",
};

export function SuperadminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Super Admin";

  return (
    <DarkGradientBg>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar title={title} />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
      <QuickActions />
    </DarkGradientBg>
  );
}
