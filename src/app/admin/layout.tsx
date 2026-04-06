import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "./admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();
  } catch {
    redirect("/login");
  }

  let tenantName = "Dashboard";
  let tenantInitial = "A";
  let tenantColor = "#C5A059";
  let tenantSlug = "";

  try {
    const { getTenant } = await import("@/lib/tenant");
    const tenant = await getTenant();
    tenantName = tenant.name;
    tenantInitial = tenant.name.charAt(0).toUpperCase();
    tenantColor = tenant.accentColor || tenant.primaryColor || "#C5A059";
    tenantSlug = tenant.slug;
  } catch {
    // No tenant context
  }

  return (
    <div className="min-h-screen bg-[#F9F7F2]" data-theme="luxury">
      <div className="flex min-h-screen">
        <AdminSidebar tenantName={tenantName} tenantInitial={tenantInitial} tenantColor={tenantColor} tenantSlug={tenantSlug} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
