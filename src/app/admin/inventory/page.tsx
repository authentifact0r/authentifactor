export const dynamic = "force-dynamic";

import { getScopedDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Box, AlertTriangle, Package, TrendingDown } from "lucide-react";

export default async function AdminInventoryPage() {
  await requireAdmin();

  let batches: any[] = [];
  let products: any[] = [];
  try {
    const tdb = await getScopedDb();
    batches = await tdb.inventoryBatch.findMany({
      include: {
        product: { select: { name: true, sku: true, images: true } },
        warehouse: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    products = await tdb.product.findMany({
      include: { inventoryBatches: { select: { quantity: true } } },
    });
  } catch {
    // No tenant context
  }

  const totalStock = batches.reduce((s, b) => s + b.quantity, 0);
  const lowStock = products.filter((p) => {
    const stock = p.inventoryBatches.reduce((s: number, b: any) => s + b.quantity, 0);
    return stock > 0 && stock <= 5;
  }).length;
  const outOfStock = products.filter((p) => {
    const stock = p.inventoryBatches.reduce((s: number, b: any) => s + b.quantity, 0);
    return stock <= 0;
  }).length;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
        <Box className="h-6 w-6 text-emerald-400" /> Inventory
      </h1>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Batches", value: batches.length, icon: Package, color: "text-blue-400" },
          { label: "Total Units", value: totalStock, icon: Box, color: "text-emerald-400" },
          { label: "Low Stock", value: lowStock, icon: TrendingDown, color: lowStock > 0 ? "text-amber-400" : "text-white/40" },
          { label: "Out of Stock", value: outOfStock, icon: AlertTriangle, color: outOfStock > 0 ? "text-red-400" : "text-white/40" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
            <s.icon className={`h-5 w-5 ${s.color} mb-3`} />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-white/40 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Batches Table */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm overflow-hidden">
        {batches.length === 0 ? (
          <div className="p-12 text-center">
            <Box className="h-10 w-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">No inventory batches. Add products first.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/[0.06] bg-white/[0.02]">
                <tr>
                  <th className="px-5 py-3 text-left font-medium text-white/40">Product</th>
                  <th className="px-5 py-3 text-left font-medium text-white/40">Batch</th>
                  <th className="px-5 py-3 text-center font-medium text-white/40">Qty</th>
                  <th className="px-5 py-3 text-left font-medium text-white/40">Warehouse</th>
                  <th className="px-5 py-3 text-left font-medium text-white/40">Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {b.product?.images?.[0] ? (
                          <img src={b.product.images[0]} alt="" className="h-9 w-9 rounded-lg object-cover" />
                        ) : (
                          <div className="h-9 w-9 rounded-lg bg-white/[0.06] flex items-center justify-center">
                            <Package className="h-4 w-4 text-white/30" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-white">{b.product?.name}</p>
                          <p className="text-xs text-white/30 font-mono">{b.product?.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-white/50 font-mono">{b.batchNumber}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold tabular-nums ${
                        b.quantity <= 0 ? "bg-red-500/15 text-red-400" :
                        b.quantity <= 5 ? "bg-amber-500/15 text-amber-400" :
                        "bg-emerald-500/15 text-emerald-400"
                      }`}>
                        {b.quantity}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-white/50">{b.warehouse?.name || "—"}</td>
                    <td className="px-5 py-3 text-xs text-white/50">
                      {b.expiryDate ? new Date(b.expiryDate).toLocaleDateString("en-GB") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
