"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Plus, X, ImageIcon } from "lucide-react";

const CATEGORIES = [
  "GROCERIES", "SPICES", "DRINKS", "BEAUTY",
  "FASHION", "ACCESSORIES", "HOME", "OTHER",
];

export default function NewProductPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const tp = sp.get("tenant") ? `?tenant=${sp.get("tenant")}` : "";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [newImage, setNewImage] = useState("");

  const addImage = () => {
    if (newImage.trim()) {
      setImages((prev) => [...prev, newImage.trim()]);
      setNewImage("");
    }
  };

  const removeImage = (i: number) => setImages((prev) => prev.filter((_, idx) => idx !== i));

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
      weightKg: parseFloat(form.get("weightKg") as string) || 0.1,
      tags: (form.get("tags") as string)?.split(",").map((t) => t.trim()).filter(Boolean) || [],
      images,
      isActive: form.get("isActive") === "on",
      isPerishable: form.get("isPerishable") === "on",
      isSubscribable: form.get("isSubscribable") === "on",
      stock: parseInt(form.get("stock") as string) || 0,
    };

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create product");
      router.push("/admin/products" + tp);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <Link href={`/admin/products${tp}`} className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Products
      </Link>

      <h1 className="text-2xl font-bold text-white tracking-tight">Add Product</h1>
      <p className="text-sm text-white/40 mt-1 mb-8">Create a new product in your catalogue.</p>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 mb-6">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Product Name</label>
          <input name="name" required placeholder="e.g. Cashmere Wrap Coat" className="w-full h-12 px-4 rounded-xl bg-white/[0.06] border border-white/[0.12] text-base text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
          <textarea name="description" required rows={3} placeholder="Describe the product..." className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.12] text-base text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition resize-none" />
        </div>

        {/* Price + Compare */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Price (£)</label>
            <input name="price" type="number" step="0.01" required placeholder="49.99" className="w-full h-12 px-4 rounded-xl bg-white/[0.06] border border-white/[0.12] text-base text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Compare at Price <span className="text-white/30">(optional)</span></label>
            <input name="compareAtPrice" type="number" step="0.01" placeholder="79.99" className="w-full h-12 px-4 rounded-xl bg-white/[0.06] border border-white/[0.12] text-base text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition" />
          </div>
        </div>

        {/* Category + Weight */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Category</label>
            <select name="category" required className="w-full h-12 px-4 rounded-xl bg-white/[0.06] border border-white/[0.12] text-base text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition">
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-gray-900">{c.charAt(0) + c.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Stock Quantity</label>
            <input name="stock" type="number" required placeholder="50" className="w-full h-12 px-4 rounded-xl bg-white/[0.06] border border-white/[0.12] text-base text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition" />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Tags <span className="text-white/30">(comma separated)</span></label>
          <input name="tags" placeholder="luxury, cashmere, winter" className="w-full h-12 px-4 rounded-xl bg-white/[0.06] border border-white/[0.12] text-base text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition" />
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Images</label>
          <div className="flex gap-2 mb-3">
            <input value={newImage} onChange={(e) => setNewImage(e.target.value)} placeholder="Paste image URL..." className="flex-1 h-10 px-4 rounded-xl bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition" />
            <button type="button" onClick={addImage} className="h-10 px-4 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm font-medium text-white/60 hover:bg-white/[0.1] transition">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={img} alt="" className="h-16 w-16 rounded-lg object-cover border border-white/[0.08]" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hidden weight */}
        <input type="hidden" name="weightKg" value="0.5" />

        {/* Toggles */}
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
            <input type="checkbox" name="isActive" defaultChecked className="rounded border-white/20 bg-white/[0.06] text-emerald-500 focus:ring-emerald-500/50" />
            Active (visible in store)
          </label>
          <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
            <input type="checkbox" name="isPerishable" className="rounded border-white/20 bg-white/[0.06] text-emerald-500 focus:ring-emerald-500/50" />
            Perishable
          </label>
          <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
            <input type="checkbox" name="isSubscribable" className="rounded border-white/20 bg-white/[0.06] text-emerald-500 focus:ring-emerald-500/50" />
            Subscribable
          </label>
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-base transition flex items-center justify-center gap-2">
          <Save className="h-4 w-4" />
          {loading ? "Creating..." : "Create Product"}
        </button>
      </form>
    </div>
  );
}
