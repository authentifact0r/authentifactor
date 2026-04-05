"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Plus, X, Eye, EyeOff } from "lucide-react";

const CATEGORIES = ["GROCERIES", "SPICES", "DRINKS", "BEAUTY", "FASHION", "ACCESSORIES", "HOME", "OTHER"];

export function EditProductForm({ product }: { product: any }) {
  const router = useRouter();
  const sp = useSearchParams();
  const tp = sp.get("tenant") ? `?tenant=${sp.get("tenant")}` : "";
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>(product.images || []);
  const [newImage, setNewImage] = useState("");
  const [isActive, setIsActive] = useState(product.isActive);

  const addImage = () => {
    if (newImage.trim()) { setImages((prev) => [...prev, newImage.trim()]); setNewImage(""); }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      description: form.get("description"),
      category: form.get("category"),
      price: parseFloat(form.get("price") as string),
      compareAtPrice: form.get("compareAtPrice") ? parseFloat(form.get("compareAtPrice") as string) : null,
      tags: (form.get("tags") as string)?.split(",").map((t) => t.trim()).filter(Boolean) || [],
      images,
      isActive,
    };

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      router.push("/admin/products" + tp);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this product permanently?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
      router.push("/admin/products" + tp);
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <Link href={`/admin/products${tp}`} className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Products
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{product.name}</h1>
          <p className="text-sm text-white/40 mt-1">SKU: {product.sku} · Stock: {product.totalStock}</p>
        </div>
        <button
          onClick={() => setIsActive(!isActive)}
          className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition ${
            isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-white/[0.06] text-white/40"
          }`}
        >
          {isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          {isActive ? "Live" : "Draft"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 mb-6">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Product Name</label>
          <input name="name" defaultValue={product.name} required className="w-full h-12 px-4 rounded-xl bg-white/[0.06] border border-white/[0.12] text-base text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition" />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
          <textarea name="description" defaultValue={product.description} required rows={3} className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.12] text-base text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Price (£)</label>
            <input name="price" type="number" step="0.01" defaultValue={product.price} required className="w-full h-12 px-4 rounded-xl bg-white/[0.06] border border-white/[0.12] text-base text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Compare at Price</label>
            <input name="compareAtPrice" type="number" step="0.01" defaultValue={product.compareAtPrice || ""} className="w-full h-12 px-4 rounded-xl bg-white/[0.06] border border-white/[0.12] text-base text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Category</label>
          <select name="category" defaultValue={product.category} className="w-full h-12 px-4 rounded-xl bg-white/[0.06] border border-white/[0.12] text-base text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition">
            {CATEGORIES.map((c) => (<option key={c} value={c} className="bg-gray-900">{c.charAt(0) + c.slice(1).toLowerCase()}</option>))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Tags</label>
          <input name="tags" defaultValue={product.tags?.join(", ")} className="w-full h-12 px-4 rounded-xl bg-white/[0.06] border border-white/[0.12] text-base text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition" />
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Images</label>
          <div className="flex gap-2 mb-3">
            <input value={newImage} onChange={(e) => setNewImage(e.target.value)} placeholder="Paste image URL..." className="flex-1 h-10 px-4 rounded-xl bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition" />
            <button type="button" onClick={addImage} className="h-10 px-4 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm text-white/60 hover:bg-white/[0.1] transition">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative group">
                <img src={img} alt="" className="h-16 w-16 rounded-lg object-cover border border-white/[0.08]" />
                <button type="button" onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold transition flex items-center justify-center gap-2">
            <Save className="h-4 w-4" /> {loading ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={handleDelete} disabled={deleting} className="h-12 px-5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition flex items-center gap-2">
            <Trash2 className="h-4 w-4" /> {deleting ? "..." : "Delete"}
          </button>
        </div>
      </form>
    </div>
  );
}
