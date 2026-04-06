"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Palette, Save, Eye, Image as ImageIcon, Type, Paintbrush,
} from "lucide-react";

interface BrandingData {
  name: string;
  tagline: string;
  logo: string;
  primaryColor: string;
  accentColor: string;
  heroBannerImage: string;
  heroBannerTitle: string;
  heroBannerSubtitle: string;
}

interface Props {
  branding: BrandingData;
  tenantSlug: string;
}

export function BrandingManager({ branding, tenantSlug }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState(branding.name);
  const [tagline, setTagline] = useState(branding.tagline);
  const [logo, setLogo] = useState(branding.logo);
  const [primaryColor, setPrimaryColor] = useState(branding.primaryColor);
  const [accentColor, setAccentColor] = useState(branding.accentColor);
  const [heroBannerImage, setHeroBannerImage] = useState(branding.heroBannerImage);
  const [heroBannerTitle, setHeroBannerTitle] = useState(branding.heroBannerTitle);
  const [heroBannerSubtitle, setHeroBannerSubtitle] = useState(branding.heroBannerSubtitle);

  const saveBranding = async () => {
    setSaving(true); setSaved(false);
    try {
      const res = await fetch("/api/admin/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, tagline, logo, primaryColor, accentColor, heroBannerImage, heroBannerTitle, heroBannerSubtitle }),
      });
      if (!res.ok) { const e = await res.json(); alert(e.error || "Failed"); setSaving(false); return; }
      setSaving(false); setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } catch { setSaving(false); }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Palette className="h-6 w-6 text-fuchsia-400" /> Branding
          </h1>
          <p className="text-sm text-white/60 mt-1">Customize your store's look and feel.</p>
        </div>
        <button onClick={saveBranding} disabled={saving} className="inline-flex items-center gap-1.5 rounded-xl bg-fuchsia-500 px-4 py-2 text-xs font-semibold text-white hover:bg-fuchsia-400 disabled:opacity-50 transition">
          <Save className="h-3.5 w-3.5" /> {saving ? "Saving..." : saved ? "Saved!" : "Save Branding"}
        </button>
      </div>

      {saved && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4 text-sm text-emerald-400">Branding updated successfully.</div>
      )}

      {/* Store Identity */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-5">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2"><Type className="h-4 w-4 text-fuchsia-400" /> Store Identity</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Store Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition" />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Tagline</label>
            <input value={tagline} onChange={e => setTagline(e.target.value)} placeholder="Contemporary Fashion & Lookbook" className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-white/70 mb-1">Logo URL</label>
          <input value={logo} onChange={e => setLogo(e.target.value)} type="url" placeholder="https://..." className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none" />
          {logo && (
            <div className="mt-2 inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-white/[0.1] bg-white/[0.04]">
              <img src={logo} alt="Logo" className="h-full w-full object-contain" />
            </div>
          )}
        </div>
      </div>

      {/* Colors */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-5">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2"><Paintbrush className="h-4 w-4 text-fuchsia-400" /> Brand Colors</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Primary Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border border-white/[0.12] bg-transparent" />
              <input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="flex-1 h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white font-mono focus:outline-none" />
              <div className="h-10 w-10 rounded-lg border border-white/[0.12]" style={{ backgroundColor: primaryColor }} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Accent Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border border-white/[0.12] bg-transparent" />
              <input value={accentColor} onChange={e => setAccentColor(e.target.value)} className="flex-1 h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white font-mono focus:outline-none" />
              <div className="h-10 w-10 rounded-lg border border-white/[0.12]" style={{ backgroundColor: accentColor }} />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-5">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2"><ImageIcon className="h-4 w-4 text-fuchsia-400" /> Hero Banner</h2>

        <div>
          <label className="block text-xs font-medium text-white/70 mb-1">Banner Image URL</label>
          <input value={heroBannerImage} onChange={e => setHeroBannerImage(e.target.value)} type="url" placeholder="https://..." className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Banner Title</label>
            <input value={heroBannerTitle} onChange={e => setHeroBannerTitle(e.target.value)} placeholder={name} className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Banner Subtitle</label>
            <input value={heroBannerSubtitle} onChange={e => setHeroBannerSubtitle(e.target.value)} placeholder={tagline} className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none" />
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2">
          <Eye className="h-4 w-4 text-fuchsia-400" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Live Preview</h2>
        </div>

        {/* Storefront Header Preview */}
        <div className="p-4">
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: primaryColor }}>
            {/* Nav bar */}
            <div className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              {logo ? (
                <img src={logo} alt="" className="h-8 w-8 rounded-lg object-contain" />
              ) : (
                <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center text-white text-xs font-bold">{name[0]}</div>
              )}
              <span className="font-semibold text-white text-sm">{name}</span>
              <div className="ml-auto flex gap-4 text-xs text-white/60">
                <span>Shop</span><span>Collections</span><span>About</span>
              </div>
            </div>

            {/* Hero */}
            <div className="relative px-8 py-12" style={{
              backgroundImage: heroBannerImage ? `url(${heroBannerImage})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}>
              {heroBannerImage && <div className="absolute inset-0 bg-black/40" />}
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white">{heroBannerTitle || name}</h3>
                <p className="text-sm text-white/80 mt-1">{heroBannerSubtitle || tagline}</p>
                <button className="mt-4 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: accentColor }}>
                  Shop Now
                </button>
              </div>
            </div>

            {/* Product cards mock */}
            <div className="px-5 py-4 bg-white/[0.03]">
              <div className="grid grid-cols-3 gap-3">
                {["Featured 1", "Featured 2", "Featured 3"].map(label => (
                  <div key={label} className="rounded-lg bg-white/10 p-3">
                    <div className="aspect-square rounded-lg bg-white/10 mb-2" />
                    <p className="text-xs text-white/70">{label}</p>
                    <p className="text-xs font-semibold mt-0.5" style={{ color: accentColor }}>£99.00</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
