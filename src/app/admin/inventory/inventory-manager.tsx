"use client";

import { useState } from "react";
import {
  Box, Package, AlertTriangle, TrendingDown, Plus, Minus,
  ChevronDown, ChevronRight, Save, Warehouse, Image as ImageIcon,
  Banknote,
} from "lucide-react";

interface Batch {
  id: string;
  batchNumber: string;
  quantity: number;
  warehouse: string;
  warehouseId: string | null;
  expiryDate: string | null;
  costPrice: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  image: string | null;
  isActive: boolean;
  totalStock: number;
  batches: Batch[];
}

interface Props {
  products: Product[];
  warehouses: { id: string; name: string }[];
  tenantSlug: string;
}

export function InventoryManager({ products, warehouses, tenantSlug }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [restockProduct, setRestockProduct] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState(0);
  const [restockWarehouse, setRestockWarehouse] = useState(warehouses[0]?.id || "");

  const totalStock = products.reduce((s, p) => s + p.totalStock, 0);
  const inventoryValue = products.reduce((s, p) => s + (p.price * p.totalStock), 0);
  const lowStock = products.filter((p) => p.totalStock > 0 && p.totalStock <= 5).length;
  const outOfStock = products.filter((p) => p.totalStock <= 0).length;

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const adjustStock = async (batchId: string, delta: number) => {
    const current = adjustments[batchId] || 0;
    setAdjustments((prev) => ({ ...prev, [batchId]: current + delta }));
  };

  const saveAdjustment = async (batchId: string) => {
    const delta = adjustments[batchId];
    if (!delta) return;
    setSaving(batchId);
    try {
      await fetch("/api/admin/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId, delta }),
      });
      window.location.reload();
    } catch {
      setSaving(null);
    }
  };

  const restock = async (productId: string) => {
    if (restockQty <= 0 || !restockWarehouse) return;
    setSaving(productId);
    try {
      await fetch("/api/admin/inventory/restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: restockQty, warehouseId: restockWarehouse }),
      });
      setRestockProduct(null);
      setRestockQty(0);
      window.location.reload();
    } catch {
      setSaving(null);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Box className="h-6 w-6 text-emerald-400" /> Inventory
        </h1>
        <p className="text-sm text-white/40">{products.length} products</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Products", value: products.length, icon: Package, color: "text-blue-400" },
          { label: "Total Units", value: totalStock, icon: Box, color: "text-emerald-400" },
          { label: "Inventory Value", value: `£${inventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: Banknote, color: "text-violet-400" },
          { label: "Low / Out", value: `${lowStock} / ${outOfStock}`, icon: AlertTriangle, color: (lowStock + outOfStock) > 0 ? "text-amber-400" : "text-white/40" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
            <s.icon className={`h-5 w-5 ${s.color} mb-3`} />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-white/40 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Products with expandable inventory */}
      <div className="space-y-2">
        {products.map((product) => {
          const isExpanded = expanded.has(product.id);
          const isLow = product.totalStock > 0 && product.totalStock <= 5;
          const isOut = product.totalStock <= 0;

          return (
            <div key={product.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm overflow-hidden">
              {/* Product Row */}
              <button
                onClick={() => toggle(product.id)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors text-left"
              >
                {product.image ? (
                  <img src={product.image} alt="" className="h-11 w-11 rounded-xl object-cover" />
                ) : (
                  <div className="h-11 w-11 rounded-xl bg-white/[0.06] flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-white/20" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{product.name}</p>
                  <p className="text-xs text-white/30 font-mono">{product.sku}</p>
                </div>
                <span className="hidden sm:inline text-xs text-white/30 tabular-nums">£{(product.price * product.totalStock).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold tabular-nums ${
                  isOut ? "bg-red-500/15 text-red-400" :
                  isLow ? "bg-amber-500/15 text-amber-400" :
                  "bg-emerald-500/15 text-emerald-400"
                }`}>
                  {product.totalStock} units
                </span>
                <span className="text-xs text-white/30">{product.batches.length} batch{product.batches.length !== 1 ? "es" : ""}</span>
                {isExpanded ? <ChevronDown className="h-4 w-4 text-white/30" /> : <ChevronRight className="h-4 w-4 text-white/30" />}
              </button>

              {/* Expanded: Batch Details + Actions */}
              {isExpanded && (
                <div className="border-t border-white/[0.04] bg-white/[0.01]">
                  {/* Batches */}
                  <div className="divide-y divide-white/[0.04]">
                    {product.batches.map((batch) => {
                      const adj = adjustments[batch.id] || 0;
                      return (
                        <div key={batch.id} className="flex items-center gap-4 px-5 py-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white/70 font-mono">{batch.batchNumber}</p>
                            <p className="text-xs text-white/30 flex items-center gap-1">
                              <Warehouse className="h-3 w-3" /> {batch.warehouse}
                              {batch.expiryDate && <span> · Expires {new Date(batch.expiryDate).toLocaleDateString("en-GB")}</span>}
                            </p>
                          </div>

                          {/* Stock adjuster */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => adjustStock(batch.id, -1)}
                              className="h-8 w-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/50 hover:bg-red-500/15 hover:text-red-400 transition"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className={`w-16 text-center text-sm font-semibold tabular-nums ${
                              adj > 0 ? "text-emerald-400" : adj < 0 ? "text-red-400" : "text-white"
                            }`}>
                              {batch.quantity + adj}
                              {adj !== 0 && <span className="text-xs ml-0.5">({adj > 0 ? "+" : ""}{adj})</span>}
                            </span>
                            <button
                              onClick={() => adjustStock(batch.id, 1)}
                              className="h-8 w-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/50 hover:bg-emerald-500/15 hover:text-emerald-400 transition"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                            {adj !== 0 && (
                              <button
                                onClick={() => saveAdjustment(batch.id)}
                                disabled={saving === batch.id}
                                className="h-8 px-3 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 disabled:opacity-50 transition flex items-center gap-1"
                              >
                                <Save className="h-3 w-3" /> {saving === batch.id ? "..." : "Save"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Restock */}
                  <div className="px-5 py-3 border-t border-white/[0.04]">
                    {restockProduct === product.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={restockQty}
                          onChange={(e) => setRestockQty(parseInt(e.target.value) || 0)}
                          placeholder="Qty"
                          className="h-8 w-20 px-2 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none"
                        />
                        {warehouses.length > 1 && (
                          <select
                            value={restockWarehouse}
                            onChange={(e) => setRestockWarehouse(e.target.value)}
                            className="h-8 px-2 rounded-lg bg-white/[0.06] border border-white/[0.12] text-xs text-white/60"
                          >
                            {warehouses.map((w) => (
                              <option key={w.id} value={w.id} className="bg-gray-900">{w.name}</option>
                            ))}
                          </select>
                        )}
                        <button
                          onClick={() => restock(product.id)}
                          disabled={restockQty <= 0 || saving === product.id}
                          className="h-8 px-3 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 disabled:opacity-50 transition"
                        >
                          {saving === product.id ? "Adding..." : "Add Batch"}
                        </button>
                        <button
                          onClick={() => { setRestockProduct(null); setRestockQty(0); }}
                          className="h-8 px-2 rounded-lg text-xs text-white/40 hover:text-white/60 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setRestockProduct(product.id); setRestockWarehouse(warehouses[0]?.id || ""); }}
                        className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add new batch / Restock
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
