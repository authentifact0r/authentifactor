"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download, Search, Globe, Package, Tag, Image as ImageIcon,
  Check, AlertTriangle, Plus, X, ExternalLink, Loader2,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ScrapedProduct {
  title: string;
  description: string;
  images: string[];
  price: number;
  currency: string;
  supplier: string;
  sourceUrl: string;
  variants: { name: string; values: string[] }[];
}

export function ImportManager({ tenantSlug }: { tenantSlug: string }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [scraped, setScraped] = useState<ScrapedProduct | null>(null);
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState<{ name: string; sku: string } | null>(null);

  // Editable fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [retailPrice, setRetailPrice] = useState(0);
  const [costPrice, setCostPrice] = useState(0);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [material, setMaterial] = useState("");
  const [brand, setBrand] = useState("");

  const markup = costPrice > 0 ? Math.round(((retailPrice - costPrice) / costPrice) * 100) : 0;

  const fetchProduct = async () => {
    if (!url.trim()) return;
    setFetching(true); setError(""); setScraped(null); setImported(null);
    try {
      const res = await fetch("/api/admin/import/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to fetch"); setFetching(false); return; }

      setScraped(data);
      setName(data.title || "");
      setDescription(data.description || "");
      setCostPrice(data.price || 0);
      setRetailPrice(data.price ? Math.ceil(data.price * 2.5) : 0);
      setSelectedImages(data.images || []);
      setBrand(data.supplier !== "unknown" ? data.supplier.charAt(0).toUpperCase() + data.supplier.slice(1) : "");

      // Map variants to sizes/colors
      for (const v of data.variants || []) {
        const lower = v.name.toLowerCase();
        if (lower.includes("size")) setSizes(v.values);
        else if (lower.includes("color") || lower.includes("colour")) setColors(v.values);
      }

      // Show warning if scraping was limited
      if (data.manual && data.message) {
        setError(data.message);
      }

      setFetching(false);
    } catch { setError("Network error. Try again or enter product details manually."); setFetching(false); setScraped({ title: "", description: "", images: [], price: 0, currency: "USD", supplier: "manual", sourceUrl: url, variants: [] }); }
  };

  const importProduct = async () => {
    if (!name.trim() || retailPrice <= 0) return;
    setImporting(true);
    try {
      const res = await fetch("/api/admin/import/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, description, category, price: retailPrice, costPrice,
          images: selectedImages, sizes, colors, material, brand,
          sourceUrl: scraped?.sourceUrl || url, supplier: scraped?.supplier || "manual",
        }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Failed"); setImporting(false); return; }
      setImported(data.product);
      setImporting(false);
    } catch { setImporting(false); }
  };

  const resetAll = () => {
    setUrl(""); setScraped(null); setImported(null); setError("");
    setName(""); setDescription(""); setCategory(""); setRetailPrice(0); setCostPrice(0);
    setSelectedImages([]); setSizes([]); setColors([]); setMaterial(""); setBrand("");
  };

  const toggleImage = (img: string) => {
    setSelectedImages(prev => prev.includes(img) ? prev.filter(i => i !== img) : [...prev, img]);
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Download className="h-6 w-6 text-emerald-400" /> Import Products
          </h1>
          <p className="text-sm text-white/60 mt-1">Import from AliExpress, Amazon, Temu, or any supplier URL</p>
        </div>
      </div>

      {/* URL Input */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
          <Globe className="h-4 w-4 text-emerald-400" /> Paste Supplier URL
        </h2>
        <div className="flex gap-2">
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchProduct()}
            placeholder="https://www.aliexpress.com/item/..."
            className="flex-1 h-11 px-4 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
          />
          <button onClick={fetchProduct} disabled={fetching || !url.trim()} className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold transition">
            {fetching ? <><Loader2 className="h-4 w-4 animate-spin" /> Fetching...</> : <><Search className="h-4 w-4" /> Fetch Product</>}
          </button>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-white/40">
          <span className="rounded bg-white/[0.06] px-2 py-1">AliExpress</span>
          <span className="rounded bg-white/[0.06] px-2 py-1">Amazon</span>
          <span className="rounded bg-white/[0.06] px-2 py-1">Temu</span>
          <span className="rounded bg-white/[0.06] px-2 py-1">Alibaba</span>
          <span className="rounded bg-white/[0.06] px-2 py-1">CJ Dropshipping</span>
          <span className="rounded bg-white/[0.06] px-2 py-1">DHgate</span>
          <span className="rounded bg-white/[0.06] px-2 py-1">Any product URL</span>
        </div>
      </div>

      {error && (
        <div className={`rounded-xl border p-4 text-sm flex items-center gap-2 ${scraped ? "border-amber-500/20 bg-amber-500/[0.06] text-amber-400" : "border-red-500/20 bg-red-500/[0.06] text-red-400"}`}>
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* Success */}
      {imported && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-6 space-y-3">
          <div className="flex items-center gap-3">
            <Check className="h-6 w-6 text-emerald-400" />
            <div>
              <p className="text-white font-semibold">Product imported as draft!</p>
              <p className="text-sm text-white/60">{imported.name} · SKU: {imported.sku}</p>
            </div>
          </div>
          <p className="text-xs text-white/40">Go to Products to review, edit details, and publish when ready.</p>
          <div className="flex gap-2">
            <button onClick={resetAll} className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition">
              Import Another
            </button>
            <button onClick={() => router.push(`/admin/products${tenantSlug ? `?tenant=${tenantSlug}` : ""}`)} className="h-9 px-4 rounded-lg bg-white/[0.06] text-white/60 text-xs hover:text-white transition">
              Go to Products
            </button>
          </div>
        </div>
      )}

      {/* Scraped Product — Edit & Import */}
      {scraped && !imported && (
        <div className="space-y-4">
          {/* Source info */}
          <div className="flex items-center gap-3 px-1">
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 uppercase">{scraped.supplier}</span>
            <a href={scraped.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-white/40 hover:text-white/60 flex items-center gap-1 transition truncate">
              <ExternalLink className="h-3 w-3" /> {scraped.sourceUrl.slice(0, 60)}...
            </a>
          </div>

          {/* Images */}
          {scraped.images.length > 0 && (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 space-y-3">
              <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="h-3.5 w-3.5 text-emerald-400" /> Images — click to select/deselect
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {scraped.images.map((img, i) => {
                  const selected = selectedImages.includes(img);
                  return (
                    <div key={i} onClick={() => toggleImage(img)} className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition ${selected ? "border-emerald-400" : "border-transparent opacity-50 hover:opacity-80"}`}>
                      <img src={img} alt="" className="h-full w-full object-cover" />
                      {selected && <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center"><Check className="h-3 w-3 text-white" /></div>}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-white/40">{selectedImages.length} of {scraped.images.length} selected</p>
            </div>
          )}

          {/* Product Details */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 space-y-4">
            <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2">
              <Package className="h-3.5 w-3.5 text-emerald-400" /> Product Details
            </h3>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Product Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white focus:outline-none resize-none" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Category</label>
                <input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Dresses" className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Material</label>
                <input value={material} onChange={e => setMaterial(e.target.value)} placeholder="e.g. Cotton" className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Brand</label>
                <input value={brand} onChange={e => setBrand(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Supplier</label>
                <span className="flex items-center h-10 px-3 rounded-lg bg-white/[0.04] text-sm text-white/50">{scraped.supplier}</span>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Sizes <span className="text-white/40">(comma separated)</span></label>
              <input value={sizes.join(", ")} onChange={e => setSizes(e.target.value.split(",").map(s => s.trim()).filter(Boolean))} placeholder="S, M, L, XL" className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none" />
              {sizes.length > 0 && <div className="flex flex-wrap gap-1 mt-1.5">{sizes.map(s => <span key={s} className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-400">{s}</span>)}</div>}
            </div>

            {/* Colors */}
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Colors <span className="text-white/40">(comma separated)</span></label>
              <input value={colors.join(", ")} onChange={e => setColors(e.target.value.split(",").map(s => s.trim()).filter(Boolean))} placeholder="Black, White, Red" className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none" />
              {colors.length > 0 && <div className="flex flex-wrap gap-1 mt-1.5">{colors.map(c => <span key={c} className="rounded bg-cyan-500/15 px-2 py-0.5 text-[10px] text-cyan-400">{c}</span>)}</div>}
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 space-y-4">
            <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2">
              <Tag className="h-3.5 w-3.5 text-emerald-400" /> Pricing & Markup
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Supplier Cost ({scraped.currency})</label>
                <input type="number" step="0.01" value={costPrice} onChange={e => setCostPrice(parseFloat(e.target.value) || 0)} className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Your Retail Price (£)</label>
                <input type="number" step="0.01" value={retailPrice} onChange={e => setRetailPrice(parseFloat(e.target.value) || 0)} className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Markup</label>
                <div className={`flex items-center h-10 px-3 rounded-lg bg-white/[0.04] text-sm font-semibold ${markup >= 100 ? "text-emerald-400" : markup >= 50 ? "text-amber-400" : "text-red-400"}`}>
                  {markup > 0 ? `+${markup}%` : "0%"}
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 flex items-center justify-between text-sm">
              <span className="text-white/60">Profit per sale</span>
              <span className="font-semibold text-emerald-400">{formatPrice(retailPrice - costPrice)}</span>
            </div>
          </div>

          {/* Import Button */}
          <div className="flex gap-2">
            <button onClick={importProduct} disabled={importing || !name.trim() || retailPrice <= 0} className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold transition">
              {importing ? <><Loader2 className="h-4 w-4 animate-spin" /> Importing...</> : <><Download className="h-4 w-4" /> Import as Draft</>}
            </button>
            <button onClick={resetAll} className="h-11 px-4 rounded-lg bg-white/[0.06] text-white/50 text-sm hover:text-white transition">Cancel</button>
          </div>
          <p className="text-xs text-white/40">Product will be saved as draft. Go to Products to review and publish.</p>
        </div>
      )}

      {/* Empty state */}
      {!scraped && !imported && !fetching && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-12 text-center">
          <Download className="h-10 w-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/60">Paste a supplier URL to import a product</p>
          <p className="text-xs text-white/40 mt-1">Works with AliExpress, Amazon, Temu, Alibaba, CJ Dropshipping, DHgate, and more.</p>
          <div className="mt-4 text-xs text-white/30 space-y-1">
            <p>1. Find a product on your supplier's website</p>
            <p>2. Copy the product URL and paste it above</p>
            <p>3. Review details, set your markup price, and import</p>
            <p>4. Product saves as draft — publish when ready</p>
          </div>
        </div>
      )}
    </div>
  );
}
