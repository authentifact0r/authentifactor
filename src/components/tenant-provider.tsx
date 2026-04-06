"use client";
import { createContext, useContext } from "react";

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
  return (
    <TenantContext.Provider value={tenant}>
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --color-brand: ${tenant.primaryColor};
          --color-accent: ${tenant.accentColor};
          --color-bg: ${tenant.backgroundColor};
          --color-text: ${tenant.textColor};
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
