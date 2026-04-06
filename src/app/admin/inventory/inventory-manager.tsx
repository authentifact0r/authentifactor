"use client";
import { apiUrl } from "@/lib/api";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box, Package, AlertTriangle, TrendingDown, Plus, Minus,
  ChevronDown, ChevronRight, Save, Warehouse, Image as ImageIcon,
  Banknote, Download, Upload, FileSpreadsheet, X, Check,
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
  const router = useRouter();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [restockProduct, setRestockProduct] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState(0);
  const [restockWarehouse, setRestockWarehouse] = useState(warehouses[0]?.id || "");
  const [showImport, setShowImport] = useState(false);
  const [importData, setImportData] = useState<any[] | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: string[] } | null>(null);

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
      await fetch(apiUrl("/api/admin/inventory/adjust"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId, delta }),
      });
      router.refresh();
    } catch {
      setSaving(null);
    }
  };

  const restock = async (productId: string) => {
    if (restockQty <= 0 || !restockWarehouse) return;
    setSaving(productId);
    try {
      await fetch(apiUrl("/api/admin/inventory/restock"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: restockQty, warehouseId: restockWarehouse }),
      });
      setRestockProduct(null);
      setRestockQty(0);
      router.refresh();
    } catch {
      setSaving(null);
    }
  };

  // ── Export CSV ──
  const exportCSV = () => {
    const headers = ["SKU", "Product Name", "Batch Number", "Warehouse", "Quantity", "Cost Price", "Expiry Date"];
    const rows: string[][] = [];
    for (const p of products) {
      if (p.batches.length === 0) {
        rows.push([p.sku, p.name, "", "", "0", String(p.price), ""]);
      }
      for (const b of p.batches) {
        rows.push([
          p.sku, p.name, b.batchNumber, b.warehouse,
          String(b.quantity), String(b.costPrice),
          b.expiryDate ? new Date(b.expiryDate).toISOString().split("T")[0] : "",
        ]);
      }
    }
    const csv = [headers, ...rows].map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-${tenantSlug || "export"}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Parse CSV file ──
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter(l => l.trim());
      if (lines.length < 2) { alert("CSV must have a header row and at least one data row"); return; }

      // Parse header
      const parseRow = (line: string): string[] => {
        const result: string[] = [];
        let current = "";
        let inQuotes = false;
        for (const ch of line) {
          if (ch === '"') { inQuotes = !inQuotes; continue; }
          if (ch === "," && !inQuotes) { result.push(current.trim()); current = ""; continue; }
          current += ch;
        }
        result.push(current.trim());
        return result;
      };

      const header = parseRow(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, "_"));
      const skuIdx = header.findIndex(h => h === "sku");
      const qtyIdx = header.findIndex(h => h.includes("quantity") || h === "qty" || h === "stock");
      const warehouseIdx = header.findIndex(h => h.includes("warehouse"));
      const costIdx = header.findIndex(h => h.includes("cost"));
      const expiryIdx = header.findIndex(h => h.includes("expiry") || h.includes("expire"));
      const batchIdx = header.findIndex(h => h.includes("batch"));

      if (skuIdx === -1 || qtyIdx === -1) { alert("CSV must have 'SKU' and 'Quantity' columns"); return; }

      const rows: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = parseRow(lines[i]);
        const sku = cols[skuIdx];
        if (!sku) continue;
        const product = products.find(p => p.sku.toLowerCase() === sku.toLowerCase());
        rows.push({
          sku,
          productName: product?.name || "— Not found —",
          productId: product?.id || null,
          quantity: parseInt(cols[qtyIdx]) || 0,
          warehouse: warehouseIdx >= 0 ? cols[warehouseIdx] || "" : "",
          warehouseId: warehouseIdx >= 0 ? (warehouses.find(w => w.name.toLowerCase() === (cols[warehouseIdx] || "").toLowerCase())?.id || null) : (warehouses[0]?.id || null),
          costPrice: costIdx >= 0 ? parseFloat(cols[costIdx]) || 0 : (product?.price || 0),
          expiryDate: expiryIdx >= 0 ? cols[expiryIdx] || null : null,
          batchNumber: batchIdx >= 0 ? cols[batchIdx] || "" : "",
          valid: !!product,
        });
      }
      setImportData(rows);
      setImportResult(null);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ── Execute Import ──
  const executeImport = async () => {
    if (!importData) return;
    const validRows = importData.filter(r => r.valid && r.quantity > 0);
    if (validRows.length === 0) { alert("No valid rows to import"); return; }
    setImporting(true);
    let success = 0;
    const errors: string[] = [];

    for (const row of validRows) {
      try {
        const res = await fetch(apiUrl("/api/admin/inventory/restock"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: row.productId,
            quantity: row.quantity,
            warehouseId: row.warehouseId || warehouses[0]?.id || null,
          }),
        });
        if (res.ok) { success++; } else {
          const e = await res.json();
          errors.push(`${row.sku}: ${e.error}`);
        }
      } catch {
        errors.push(`${row.sku}: Network error`);
      }
    }

    setImporting(false);
    setImportResult({ success, errors });
    if (success > 0) router.refresh();
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Box className="h-6 w-6 text-emerald-400" /> Inventory
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.06] border border-white/[0.1] px-3 py-2 text-xs font-medium text-white/70 hover:bg-white/[0.1] hover:text-white transition">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
          <button onClick={() => { setShowImport(!showImport); setImportData(null); setImportResult(null); }} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-black hover:bg-emerald-400 transition">
            <Upload className="h-3.5 w-3.5" /> Import CSV
          </button>
        </div>
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

      {/* Import Panel */}
      {showImport && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-emerald-400" /> Import Stock from CSV
            </h2>
            <button onClick={() => { setShowImport(false); setImportData(null); setImportResult(null); }} className="text-white/40 hover:text-white/60"><X className="h-4 w-4" /></button>
          </div>

          {!importData && !importResult && (
            <div className="space-y-3">
              <div className="rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02] p-6 text-center">
                <Upload className="h-8 w-8 text-white/20 mx-auto mb-2" />
                <p className="text-sm text-white/60 mb-1">Upload a CSV file with stock data</p>
                <p className="text-xs text-white/40 mb-3">Required columns: <span className="text-emerald-400 font-mono">SKU</span>, <span className="text-emerald-400 font-mono">Quantity</span>. Optional: <span className="text-white/50 font-mono">Warehouse</span>, <span className="text-white/50 font-mono">Cost Price</span>, <span className="text-white/50 font-mono">Expiry Date</span>, <span className="text-white/50 font-mono">Batch Number</span></p>
                <label className="inline-flex items-center gap-1.5 h-10 px-5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold cursor-pointer transition">
                  <Upload className="h-4 w-4" /> Choose File
                  <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3">
                <p className="text-xs text-white/50 mb-1">Example CSV format:</p>
                <pre className="text-xs text-emerald-400/80 font-mono overflow-x-auto">SKU,Quantity,Warehouse,Cost Price,Expiry Date{"\n"}SBM-BLZ-001,25,Main Warehouse,89.99,2027-06-01{"\n"}SBM-DRS-002,50,,45.00,</pre>
              </div>
            </div>
          )}

          {/* Preview parsed data */}
          {importData && !importResult && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-white">{importData.length} rows parsed</span>
                <span className="text-xs text-emerald-400">{importData.filter(r => r.valid).length} matched</span>
                {importData.some(r => !r.valid) && (
                  <span className="text-xs text-red-400">{importData.filter(r => !r.valid).length} not found</span>
                )}
              </div>

              <div className="max-h-64 overflow-auto rounded-xl border border-white/[0.06]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                      <th className="text-left px-3 py-2 text-white/50 font-medium">SKU</th>
                      <th className="text-left px-3 py-2 text-white/50 font-medium">Product</th>
                      <th className="text-right px-3 py-2 text-white/50 font-medium">Qty</th>
                      <th className="text-left px-3 py-2 text-white/50 font-medium">Warehouse</th>
                      <th className="text-center px-3 py-2 text-white/50 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {importData.map((row, i) => (
                      <tr key={i} className={row.valid ? "" : "opacity-50"}>
                        <td className="px-3 py-2 font-mono text-white/70">{row.sku}</td>
                        <td className="px-3 py-2 text-white/60">{row.productName}</td>
                        <td className="px-3 py-2 text-right text-white font-semibold tabular-nums">{row.quantity}</td>
                        <td className="px-3 py-2 text-white/50">{row.warehouse || "Default"}</td>
                        <td className="px-3 py-2 text-center">
                          {row.valid ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400"><Check className="h-3 w-3" /> Ready</span>
                          ) : (
                            <span className="text-red-400">SKU not found</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-2">
                <button onClick={executeImport} disabled={importing || !importData.some(r => r.valid)} className="inline-flex items-center gap-1.5 h-10 px-5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black text-sm font-semibold transition">
                  <Upload className="h-4 w-4" /> {importing ? `Importing...` : `Import ${importData.filter(r => r.valid).length} rows`}
                </button>
                <button onClick={() => setImportData(null)} className="h-10 px-4 rounded-lg bg-white/[0.06] text-white/50 text-sm hover:text-white transition">Back</button>
              </div>
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className="space-y-3">
              <div className="rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 p-4">
                <p className="text-sm text-emerald-400 font-semibold">{importResult.success} batches imported successfully</p>
                {importResult.errors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {importResult.errors.map((err, i) => (
                      <p key={i} className="text-xs text-red-400">{err}</p>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setImportData(null); setImportResult(null); }} className="h-9 px-4 rounded-lg bg-white/[0.06] text-white/60 text-xs hover:text-white transition">Import More</button>
                <button onClick={() => { setShowImport(false); setImportData(null); setImportResult(null); }} className="h-9 px-4 rounded-lg bg-white/[0.06] text-white/60 text-xs hover:text-white transition">Close</button>
              </div>
            </div>
          )}
        </div>
      )}

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
                  <p className="text-xs text-white/50 font-mono">{product.sku}</p>
                </div>
                <span className="hidden sm:inline text-xs text-white/50 tabular-nums">£{(product.price * product.totalStock).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold tabular-nums ${
                  isOut ? "bg-red-500/15 text-red-400" :
                  isLow ? "bg-amber-500/15 text-amber-400" :
                  "bg-emerald-500/15 text-emerald-400"
                }`}>
                  {product.totalStock} units
                </span>
                <span className="text-xs text-white/50">{product.batches.length} batch{product.batches.length !== 1 ? "es" : ""}</span>
                {isExpanded ? <ChevronDown className="h-4 w-4 text-white/50" /> : <ChevronRight className="h-4 w-4 text-white/50" />}
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
                            <p className="text-xs text-white/50 flex items-center gap-1">
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

