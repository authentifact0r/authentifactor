import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { TenantProvider, type TenantConfig } from "@/components/tenant-provider";
import { logoutAction } from "@/actions/auth";
import { Package, MapPin, RefreshCw, User, LogOut } from "lucide-react";

const navItems = [
  { href: "/account", label: "Overview", icon: User },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/subscriptions", label: "Subscriptions", icon: RefreshCw },
];

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [dbUser, tenant] = await Promise.all([
    db.user.findUnique({
      where: { id: user.id },
      select: { firstName: true },
    }),
    getTenant(),
  ]);

  const tenantConfig: TenantConfig = {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    logo: tenant.logo,
    primaryColor: tenant.primaryColor,
    accentColor: tenant.accentColor,
    tagline: tenant.tagline,
    currency: tenant.currency,
    freeShippingMinimum: tenant.freeShippingMinimum,
    heroBannerTitle: tenant.heroBannerTitle,
    heroBannerSubtitle: tenant.heroBannerSubtitle,
  };

  const accent = tenant.accentColor || "#C5A059";

  return (
    <TenantProvider tenant={tenantConfig}>
      <Header />
      <div className="min-h-screen bg-[#F9F7F2]">
        <div className="mx-auto max-w-6xl px-4 py-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1
                className="text-3xl text-[#1a1a1a] mb-1"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic", fontWeight: 400 }}
              >
                My Account
              </h1>
              <p className="text-sm text-[#999] tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>
                Welcome back, {dbUser?.firstName || user.email}
              </p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium uppercase tracking-widest text-[#999] hover:text-[#1a1a1a] transition"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </button>
            </form>
          </div>

          <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
            {/* Sidebar */}
            <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:border-r lg:border-[#E5E5E5] lg:pr-6">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium uppercase tracking-widest text-[#888] transition-colors hover:text-[#1a1a1a] rounded-none border-b border-transparent hover:border-[#C5A059]"
                  style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "0.15em" }}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>

            {/* Content */}
            <div>{children}</div>
          </div>
        </div>
      </div>
      <Footer />
    </TenantProvider>
  );
}
