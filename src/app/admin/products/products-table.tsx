"use client";
import { apiUrl } from "@/lib/api";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search, Edit, Image as ImageIcon, AlertTriangle, Package,
  Eye, EyeOff, ChevronDown, ChevronRight, Save, Trash2,
  Plus, X, Tag,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  sku: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  category: string;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  isActive: boolean;
  totalStock: number;
  tags: string[];
  sizes: string[];
  colors: string[];
  material: string | null;
  brand: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  subcategory: string | null;
  collection: string | null;
  shortDescription: string | null;
}

export function ProductsTable({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tenantParam = searchParams.get("tenant") ? `?tenant=${searchParams.get("tenant")}` : "";
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Inline edit state
  const [editData, setEditData] = useState<Record<string, any>>({});

  const categories = [...new Set(products.map((p) => p.category))];
  const lowStockCount = products.filter((p) => p.totalStock > 0 && p.totalStock <= 5).length;
  const outOfStockCount = products.filter((p) => p.totalStock <= 0).length;

  const filtered = products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
    if (stockFilter === "low" && p.totalStock > 5) return false;
    if (stockFilter === "out" && p.totalStock > 0) return false;
    return true;
  });

  const toggleExpand = (id: string) => {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    const p = products.find((x) => x.id === id);
    if (p) {
      setEditData({
        name: p.name,
        description: p.description,
        shortDescription: p.shortDescription || "",
        category: p.category,
        price: p.price,
        compareAtPrice: p.compareAtPrice || "",
        isActive: p.isActive,
        tags: [...(p.tags || [])],
        images: [...(p.images || [])],
        material: p.material || "",
        subcategory: p.subcategory || "",
        collection: p.collection || "",
        brand: p.brand || "",
        metaTitle: p.metaTitle || "",
        metaDescription: p.metaDescription || "",
      });
    }
    setExpanded(id);
  };

  const updateField = (field: string, value: any) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(apiUrl(`/api/admin/products/${id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error("Save failed");
      router.refresh();
    } catch {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product permanently?")) return;
    setDeleting(true);
    try {
      await fetch(apiUrl(`/api/admin/products/${id}`), { method: "DELETE" });
      router.refresh();
    } catch {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    await fetch(apiUrl(`/api/admin/products/${id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    router.refresh();
  };

  return (
    <>
      {/* Alerts */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="flex gap-3">
          {lowStockCount > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 px-4 py-2 text-sm text-amber-400">
              <AlertTriangle className="h-4 w-4" /> {lowStockCount} low stock
            </div>
          )}
          {outOfStockCount > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-red-500/[0.08] border border-red-500/20 px-4 py-2 text-sm text-red-400">
              <Package className="h-4 w-4" /> {outOfStockCount} out of stock
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 h-10 flex-1 min-w-[200px] max-w-sm">
          <Search className="h-4 w-4 text-white/50" />
          <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none" />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 h-10 text-sm text-white/60 focus:outline-none">
          <option value="all">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className="rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 h-10 text-sm text-white/60 focus:outline-none">
          <option value="all">All Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      {/* Product Cards */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-12 text-center">
            <Package className="h-10 w-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">{search ? "No products match your search." : "No products yet."}</p>
          </div>
        ) : (
          filtered.map((p) => {
            const isOpen = expanded === p.id;
            return (
              <div key={p.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm overflow-hidden">
                {/* Product Row */}
                <button onClick={() => toggleExpand(p.id)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors text-left">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt="" className="h-12 w-12 rounded-xl object-cover" />
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-white/[0.06] flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-white/20" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-white/50">{p.sku}</span>
                      <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/50">{p.category}</span>
                      {p.collection && <span className="rounded bg-violet-500/10 px-1.5 py-0.5 text-[10px] text-violet-400">{p.collection}</span>}
                    </div>
                  </div>
                  <span className="text-white font-medium tabular-nums">{formatPrice(p.price)}</span>
                  {p.compareAtPrice && p.compareAtPrice > p.price && (
                    <span className="text-xs text-white/50 line-through tabular-nums">{formatPrice(p.compareAtPrice)}</span>
                  )}
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tabular-nums ${
                    p.totalStock <= 0 ? "bg-red-500/15 text-red-400" :
                    p.totalStock <= 5 ? "bg-amber-500/15 text-amber-400" :
                    "bg-emerald-500/15 text-emerald-400"
                  }`}>
                    {p.totalStock}
                  </span>
                  <span
                    role="button"
                    onClick={(e) => { e.stopPropagation(); handleToggleActive(p.id, p.isActive); }}
                    className={`inline-flex items-center gap-1 text-xs cursor-pointer ${p.isActive ? "text-emerald-400" : "text-white/50"}`}
                  >
                    {p.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {p.isActive ? "Live" : "Draft"}
                  </span>
                  {isOpen ? <ChevronDown className="h-4 w-4 text-white/50" /> : <ChevronRight className="h-4 w-4 text-white/50" />}
                </button>

                {/* Expanded Inline Edit */}
                {isOpen && (
                  <div className="border-t border-white/[0.04] bg-white/[0.01] p-5 space-y-5">

                    {/* ── BASIC INFO ── */}
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Product Info</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-white/60 mb-1">Name</label>
                          <input value={editData.name || ""} onChange={(e) => updateField("name", e.target.value)} className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-white/60 mb-1">Tagline</label>
                          <input value={editData.shortDescription || ""} onChange={(e) => updateField("shortDescription", e.target.value)} placeholder="One-liner for cards" className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-white/60 mb-1">Description</label>
                        <textarea value={editData.description || ""} onChange={(e) => updateField("description", e.target.value)} rows={3} placeholder="Full product description for the store page..." className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none resize-none" />
                      </div>
                    </div>

                    {/* ── PRICING ── */}
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Pricing</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-white/60 mb-1">Price (£)</label>
                          <input type="number" step="0.01" value={editData.price || ""} onChange={(e) => updateField("price", parseFloat(e.target.value))} className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-white/60 mb-1">Compare At <span className="text-white/30">(was)</span></label>
                          <input type="number" step="0.01" value={editData.compareAtPrice || ""} onChange={(e) => updateField("compareAtPrice", parseFloat(e.target.value) || null)} placeholder="—" className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-white/60 mb-1">Category</label>
                          <input value={editData.category || ""} onChange={(e) => updateField("category", e.target.value)} placeholder="e.g. Dresses" className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-white/60 mb-1">Brand</label>
                          <input value={editData.brand || ""} onChange={(e) => updateField("brand", e.target.value)} placeholder="Styled by Maryam" className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* ── CLASSIFICATION ── */}
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Classification</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-white/60 mb-1">Subcategory</label>
                          <input value={editData.subcategory || ""} onChange={(e) => updateField("subcategory", e.target.value)} placeholder="e.g. Mini Dresses" className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-white/60 mb-1">Collection</label>
                          <input value={editData.collection || ""} onChange={(e) => updateField("collection", e.target.value)} placeholder="e.g. Summer 2026" className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-white/60 mb-1">Material</label>
                          <input value={editData.material || ""} onChange={(e) => updateField("material", e.target.value)} placeholder="e.g. Cotton" className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-white/60 mb-1">Tags <span className="text-white/30">(comma)</span></label>
                          <input value={(editData.tags || []).join(", ")} onChange={(e) => updateField("tags", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))} placeholder="new, summer" className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* ── VARIANTS ── */}
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Variants</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-white/60 mb-1">Sizes <span className="text-white/30">(comma separated)</span></label>
                          <input value={(editData.sizes || []).join(", ")} onChange={(e) => updateField("sizes", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))} placeholder="XS, S, M, L, XL, XXL" className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none" />
                          {(editData.sizes || []).length > 0 && <div className="flex flex-wrap gap-1 mt-1.5">{(editData.sizes || []).map((s: string) => <span key={s} className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-400 font-medium">{s}</span>)}</div>}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-white/60 mb-1">Colors <span className="text-white/30">(comma separated)</span></label>
                          <input value={(editData.colors || []).join(", ")} onChange={(e) => updateField("colors", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))} placeholder="Black, Ivory, Yellow, Red" className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none" />
                          {(editData.colors || []).length > 0 && <div className="flex flex-wrap gap-1 mt-1.5">{(editData.colors || []).map((c: string) => <span key={c} className="rounded bg-cyan-500/15 px-2 py-0.5 text-[10px] text-cyan-400 font-medium">{c}</span>)}</div>}
                        </div>
                      </div>
                    </div>

                    {/* ── IMAGES ── */}
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Images</p>
                      <div className="flex flex-wrap gap-2">
                        {(editData.images || []).map((img: string, i: number) => (
                          <div key={i} className="relative group">
                            <img src={img} alt="" className="h-20 w-20 rounded-lg object-cover border border-white/[0.08]" />
                            <button onClick={() => updateField("images", editData.images.filter((_: any, idx: number) => idx !== i))} className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                              <X className="h-3 w-3 text-white" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const url = prompt("Paste image URL:");
                            if (url?.trim()) updateField("images", [...(editData.images || []), url.trim()]);
                          }}
                          className="h-20 w-20 rounded-lg border border-dashed border-white/[0.12] flex items-center justify-center text-white/30 hover:text-white/50 hover:border-white/[0.2] transition"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* ── SEO ── */}
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">SEO <span className="text-white/25 normal-case">— leave blank for auto-generated</span></p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-white/60 mb-1">SEO Title <span className="text-white/30">({(editData.metaTitle || "").length}/60)</span></label>
                          <input value={editData.metaTitle || ""} onChange={(e) => updateField("metaTitle", e.target.value)} maxLength={60} placeholder={`${p.name} | Styled by Maryam`} className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-white/60 mb-1">SEO Description <span className="text-white/30">({(editData.metaDescription || "").length}/160)</span></label>
                          <input value={editData.metaDescription || ""} onChange={(e) => updateField("metaDescription", e.target.value)} maxLength={160} placeholder={`Shop ${p.name} at our store. Fast delivery.`} className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* ── ACTIONS ── */}
                    <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06]">
                      <button onClick={() => handleSave(p.id)} disabled={saving} className="inline-flex items-center gap-1.5 h-9 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold transition">
                        <Save className="h-3.5 w-3.5" /> {saving ? "Saving..." : "Save Changes"}
                      </button>
                      <a href={`/admin/products/${p.id}${tenantParam}`} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-white/[0.06] text-white/60 text-xs font-medium hover:bg-white/[0.1] hover:text-white transition">
                        <Edit className="h-3.5 w-3.5" /> Full Editor
                      </a>
                      <button onClick={() => handleDelete(p.id)} disabled={deleting} className="ml-auto inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 disabled:opacity-50 transition">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <p className="text-xs text-white/20">Showing {filtered.length} of {products.length} products</p>
    </>
  );
}

