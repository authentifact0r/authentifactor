"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Edit, Image as ImageIcon, AlertTriangle, Package, Eye, EyeOff } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  sku: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  isActive: boolean;
  totalStock: number;
  tags: string[];
}

export function ProductsTable({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  const categories = [...new Set(products.map((p) => p.category))];

  const filtered = products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
    if (stockFilter === "low" && p.totalStock > 5) return false;
    if (stockFilter === "out" && p.totalStock > 0) return false;
    return true;
  });

  const lowStockCount = products.filter((p) => p.totalStock > 0 && p.totalStock <= 5).length;
  const outOfStockCount = products.filter((p) => p.totalStock <= 0).length;

  return (
    <>
      {/* Alerts */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="flex gap-3">
          {lowStockCount > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 px-4 py-2 text-sm text-amber-400">
              <AlertTriangle className="h-4 w-4" /> {lowStockCount} low stock items
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
          <Search className="h-4 w-4 text-white/30" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 h-10 text-sm text-white/60 focus:outline-none"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 h-10 text-sm text-white/60 focus:outline-none"
        >
          <option value="all">All Stock</option>
          <option value="low">Low Stock (&le; 5)</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/[0.06] bg-white/[0.02]">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-white/40">Product</th>
                <th className="px-5 py-3 text-left font-medium text-white/40">SKU</th>
                <th className="px-5 py-3 text-left font-medium text-white/40">Category</th>
                <th className="px-5 py-3 text-right font-medium text-white/40">Price</th>
                <th className="px-5 py-3 text-center font-medium text-white/40">Stock</th>
                <th className="px-5 py-3 text-center font-medium text-white/40">Status</th>
                <th className="px-5 py-3 text-right font-medium text-white/40"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-white/30">
                    {search ? "No products match your search." : "No products yet. Add your first product."}
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.06]">
                            <ImageIcon className="h-4 w-4 text-white/30" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-white truncate">{p.name}</p>
                          <p className="text-xs text-white/30 truncate max-w-[200px]">{p.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-white/50">{p.sku}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-white/50 capitalize">
                        {p.category.toLowerCase().replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-white font-medium tabular-nums">{formatPrice(p.price)}</span>
                      {p.compareAtPrice && p.compareAtPrice > p.price && (
                        <span className="ml-1 text-xs text-white/30 line-through tabular-nums">{formatPrice(p.compareAtPrice)}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold tabular-nums ${
                        p.totalStock <= 0 ? "bg-red-500/15 text-red-400" :
                        p.totalStock <= 5 ? "bg-amber-500/15 text-amber-400" :
                        "bg-emerald-500/15 text-emerald-400"
                      }`}>
                        {p.totalStock}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      {p.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400"><Eye className="h-3 w-3" /> Live</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-white/30"><EyeOff className="h-3 w-3" /> Draft</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/60 hover:bg-white/[0.1] hover:text-white transition"
                      >
                        <Edit className="h-3 w-3" /> Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-white/20">Showing {filtered.length} of {products.length} products</p>
    </>
  );
}
