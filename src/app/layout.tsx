import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { CookieConsent } from "@/components/ui/cookie-consent";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { getTenant } = await import("@/lib/tenant");
    const tenant = await getTenant();
    return {
      title: tenant.defaultMetaTitle || `${tenant.name} — ${tenant.tagline || "Shop Online"}`,
      description:
        tenant.defaultMetaDescription ||
        `Shop quality products at ${tenant.name}. Fast delivery with subscribe-and-save options.`,
      icons: {
        icon: [
          { url: "/favicon.svg", type: "image/svg+xml" },
          { url: "/favicon.ico", sizes: "32x32" },
        ],
      },
      openGraph: tenant.defaultOgImage
        ? { images: [{ url: tenant.defaultOgImage }] }
        : undefined,
    };
  } catch {
    return {
      title: "Authentifactor — Multi-Tenant Commerce",
      description:
        "Shop quality products online. Fresh delivery with subscribe-and-save options.",
      icons: {
        icon: [
          { url: "/favicon.svg", type: "image/svg+xml" },
          { url: "/favicon.ico", sizes: "32x32" },
        ],
      },
    };
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${inter.variable} ${cormorant.variable} ${inter.className} min-h-screen bg-white text-gray-900 antialiased`}>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
