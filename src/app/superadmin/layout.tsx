import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth";
import { BarChart3, Building2, Users, LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/superadmin", label: "Dashboard", icon: BarChart3 },
  { href: "/superadmin/tenants", label: "Tenants", icon: Building2 },
  { href: "/superadmin/users", label: "Users", icon: Users },
];

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireSuperAdmin();
  } catch {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-60 flex-shrink-0 border-r bg-gray-950 lg:block">
        <div className="flex h-16 items-center gap-2 border-b border-gray-800 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-sm font-bold text-white">
            A
          </div>
          <span className="font-semibold text-white">Super Admin</span>
        </div>
        <nav className="space-y-1 p-4">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-900 hover:text-white"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-gray-800 p-4">
          <form action={logoutAction}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-900"
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-gray-50">
        {/* Mobile nav */}
        <div className="flex items-center gap-2 overflow-x-auto border-b bg-gray-950 p-4 lg:hidden">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500 text-xs font-bold text-white mr-2">
            A
          </div>
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1 whitespace-nowrap rounded-full bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300"
            >
              <Icon className="h-3 w-3" />
              {label}
            </Link>
          ))}
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
