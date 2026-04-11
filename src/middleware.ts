import { NextResponse, type NextRequest } from "next/server";

// Known platform domains (not tenant custom domains)
const PLATFORM_HOSTS = ["vercel.app", "localhost", "authentifactor.com"];

// Routes that belong to the platform itself (not tenant storefronts)
const PLATFORM_ROUTES = [
  "/platform",
  "/login",
  "/register",
  "/superadmin",
  "/api",
];

function isPlatformHost(host: string): boolean {
  return PLATFORM_HOSTS.some((ph) => host.includes(ph));
}

// Map admin subdomains to tenant slugs
// admin.styledbymaryam.com → styled-by-maryam
const ADMIN_DOMAIN_MAP: Record<string, string> = {
  "admin.styledbymaryam.com": "styled-by-maryam",
  // Add more tenant admin subdomains here
};

function resolveTenantSlug(request: NextRequest): string | null {
  // Dev/preview override via query param
  const paramSlug = request.nextUrl.searchParams.get("tenant");
  if (paramSlug) return paramSlug;

  const host = (request.headers.get("host") ?? "").replace(/:\d+$/, "");

  // Check admin subdomain map first
  if (ADMIN_DOMAIN_MAP[host]) return ADMIN_DOMAIN_MAP[host];

  // Platform hosts don't have tenants (unless using ?tenant= override)
  if (isPlatformHost(host)) return null;

  // Subdomain extraction (e.g., tom.authentifactor.com → tom)
  // Skip "admin" subdomain — handled by ADMIN_DOMAIN_MAP above
  const parts = host.split(".");
  if (parts.length >= 3 && parts[0] !== "admin") return parts[0];

  // Custom domain — pass full host, tenant.ts will resolve from DB
  return host;
}

const protectedPrefixes = ["/account", "/admin"];

const publicPaths = [
  "/api/webhooks",
  "/api/billing/webhook",
  "/api/auth",
  "/api/admin/sales-snapshot",
  "/api/superadmin",
  "/api/tenant",
  "/api/billing",
  "/api/security",
  "/login",
  "/register",
  "/billing-issue",
  "/_next",
  "/favicon.ico",
  "/images",
  "/platform",
  "/legal",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") ?? "";

  // ── Platform host hitting root "/" → rewrite (not redirect) to /platform ──
  // This keeps the URL as authentifactor.com while serving platform content.
  // But not for admin subdomains (admin.styledbymaryam.com should go to /admin)
  const isAdminSubdomain = !!ADMIN_DOMAIN_MAP[host.replace(/:\d+$/, "")];
  if (isPlatformHost(host) && pathname === "/" && !isAdminSubdomain) {
    const url = request.nextUrl.clone();
    url.pathname = "/platform";
    return NextResponse.rewrite(url);
  }
  // Admin subdomain root → redirect to /admin
  if (isAdminSubdomain && pathname === "/") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // ── Resolve tenant ──
  const tenantSlug = resolveTenantSlug(request);
  const requestHeaders = new Headers(request.headers);

  if (tenantSlug) {
    requestHeaders.set("x-tenant-slug", tenantSlug);
  }

  // Allow public paths, static assets, platform routes
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // Protect /superadmin/* routes
  if (pathname.startsWith("/superadmin")) {
    const token = request.cookies.get("access_token")?.value;
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // Protect /account/* and /admin/* routes
  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected) {
    const token = request.cookies.get("access_token")?.value;
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Tenant custom domain hitting "/" → serve their storefront ──
  // ── Platform host hitting tenant routes (e.g., /shop) without tenant → redirect to /platform ──
  if (isPlatformHost(host) && !tenantSlug) {
    const isPlatformRoute = PLATFORM_ROUTES.some((r) => pathname.startsWith(r));
    if (!isPlatformRoute && pathname !== "/") {
      // Non-platform route on platform host with no tenant → redirect
      return NextResponse.redirect(new URL("/platform", request.url));
    }
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots\\.txt|sitemap.*\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
