import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  {
    key: "Content-Security-Policy",
    // 2026-05-20 hardening (audit HIGH — CSP too permissive):
    // SAFE SUBSET applied now — `'unsafe-eval'` is DROPPED from
    // script-src (Next.js 16 + React 19 production builds do not need
    // it), which removes the most dangerous primitive. `'unsafe-inline'`
    // is RETAINED on script-src and style-src.
    //
    // DEFERRED — full nonce-based CSP: dropping `'unsafe-inline'` from
    // script-src requires a per-request nonce threaded through Google
    // Tag Manager, the Stripe.js loader, every JSON-LD block, the
    // tenant-provider `<style>`, and ~10 `dangerouslySetInnerHTML`
    // sites. That rework is too invasive to land safely in this pass
    // without risking the live Stripe checkout / storefront. Tracked
    // as a follow-up (see commit body).
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: http:",
      "connect-src 'self' https://api.stripe.com https://*.vercel.app https://*.neon.tech https://www.googletagmanager.com https://www.google-analytics.com wss:",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  // 2026-05-20 hardening (audit HIGH — open Image Optimization SSRF):
  // `hostname: "**"` let `/_next/image?url=...` fetch ANY https URL
  // server-side and cache it — an open proxy + cache-abuse / DoS
  // vector. Restricted to the hosts the platform actually serves
  // images from. Add new tenant custom domains / CDNs here as needed.
  images: {
    remotePatterns: [
      // Vercel Blob storage (product/branding uploads)
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "blob.vercel-storage.com" },
      // Platform + tenant storefront subdomains
      { protocol: "https", hostname: "authentifactor.com" },
      { protocol: "https", hostname: "*.authentifactor.com" },
      { protocol: "https", hostname: "*.vercel.app" },
      // Tenant custom domains
      { protocol: "https", hostname: "styledbymaryam.com" },
      { protocol: "https", hostname: "*.styledbymaryam.com" },
      // Legacy image dependency still referenced in seed/sample content
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
