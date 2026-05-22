"use client";
import { createContext, useContext } from "react";
import { safeHexColor } from "@/lib/brand-color";

const fontFamilyMap: Record<string, string> = {
  inter: "'Inter', sans-serif",
  "plus-jakarta": "'Plus Jakarta Sans', sans-serif",
  "dm-sans": "'DM Sans', sans-serif",
  cormorant: "'Cormorant Garamond', Georgia, serif",
  playfair: "'Playfair Display', Georgia, serif",
};

export interface TenantConfig {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  primaryColor: string;
  accentColor: string;
  tagline: string | null;
  currency: string;
  freeShippingMinimum: number | null;
  heroBannerTitle: string | null;
  heroBannerSubtitle: string | null;
  heroBannerImage: string | null;
  categories: string[];
  // Theme
  fontFamily: string;
  headingFontFamily: string;
  backgroundColor: string;
  textColor: string;
  enableMegaMenu: boolean;
  enableScrollAnimations: boolean;
  // Brand & social
  instagramHandle: string | null;
  brandStory: string | null;
  brandStoryImage: string | null;
}

const TenantContext = createContext<TenantConfig | null>(null);

export function TenantProvider({ tenant, children }: { tenant: TenantConfig; children: React.ReactNode }) {
  // 2026-05-20 hardening (audit HIGH — CSS-injection branding XSS):
  // brand colours are interpolated into this `<style>` block. Even
  // though the write path now validates, sanitize again at read time
  // so a row poisoned before that fix shipped cannot break out of the
  // tag. Anything that is not a strict hex colour falls back to the
  // schema default.
  const brand = safeHexColor(tenant.primaryColor, "#064E3B");
  const accent = safeHexColor(tenant.accentColor, "#F59E0B");
  const bg = safeHexColor(tenant.backgroundColor, "#FFFFFF");
  const text = safeHexColor(tenant.textColor, "#1a1a1a");

  return (
    <TenantContext.Provider value={tenant}>
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --color-brand: ${brand};
          --color-accent: ${accent};
          --color-bg: ${bg};
          --color-text: ${text};
          --font-body: ${fontFamilyMap[tenant.fontFamily] || fontFamilyMap.inter};
          --font-heading: ${fontFamilyMap[tenant.headingFontFamily] || fontFamilyMap.cormorant};
        }
      ` }} />
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within TenantProvider");
  return ctx;
}
