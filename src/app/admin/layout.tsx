import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { Package, BarChart3, Warehouse, ShoppingCart, Zap, Box, LogOut, CreditCard, Settings, Palette, Search, Users, Truck } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { DarkGradientBg } from "@/components/ui/dark-gradient-bg";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/billing", label: "Billing", icon: CreditCard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Box },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/flash-sales", label: "Flash Sales", icon: Zap },
  { href: "/admin/warehouses", label: "Warehouses", icon: Warehouse },
  { href: "/admin/shipping", label: "Shipping", icon: Truck },
  { href: "/admin/team", label: "Team", icon: Users },
  { href: "/admin/branding", label: "Branding", icon: Palette },
  { href: "/admin/seo", label: "SEO", icon: Search },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user: any;
  try {
    user = await requireAdmin();
  } catch {
    redirect("/login");
  }

  let tenantName = "Authentifactor";
  let tenantInitial = "A";
  let tenantColor = "#059669";

  try {
    const { getTenant } = await import("@/lib/tenant");
    const tenant = await getTenant();
    tenantName = tenant.name;
    tenantInitial = tenant.name.charAt(0).toUpperCase();
    tenantColor = tenant.primaryColor;
  } catch {
    // No tenant context — platform host
  }

  return (
    <DarkGradientBg>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-60 flex-shrink-0 border-r border-white/[0.06] bg-black/40 backdrop-blur-xl lg:block">
          <div className="flex h-16 items-center gap-2 border-b border-white/[0.06] px-6">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
              style={{ backgroundColor: tenantColor }}
            >
              {tenantInitial}
            </div>
            <span className="font-semibold text-white">{tenantName}</span>
          </div>
          <nav className="space-y-0.5 p-3">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto border-t border-white/[0.06] p-4">
            <form action={logoutAction}>
              <Button variant="ghost" size="sm" className="w-full justify-start text-white/40 hover:text-white hover:bg-white/[0.06]">
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </form>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto">
          {/* Mobile nav */}
          <div className="flex items-center gap-2 overflow-x-auto border-b border-white/[0.06] p-3 lg:hidden">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1 whitespace-nowrap rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/60"
              >
                <Icon className="h-3 w-3" />
                {label}
              </Link>
            ))}
          </div>
          {children}
        </main>
      </div>
    </DarkGradientBg>
  );
}
