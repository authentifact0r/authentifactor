import type { Metadata } from "next";
import PlatformShell from "./platform-shell";

export const metadata: Metadata = {
  title: "Authentifactor — We Architect Digital Infrastructure",
  description:
    "Multi-tenant commerce and web platform powering ambitious brands. E-commerce, brand websites, mobile apps, and custom development.",
  openGraph: {
    title: "Authentifactor — We Architect Digital Infrastructure",
    description:
      "Multi-tenant commerce and web platform powering ambitious brands.",
  },
};

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PlatformShell>{children}</PlatformShell>;
}
