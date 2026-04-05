export const dynamic = "force-dynamic";

import { getScopedDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { updateOrderStatus } from "@/actions/orders";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react";

const statusConfig: Record<string, { color: string; icon: any }> = {
  PENDING: { color: "bg-amber-500/15 text-amber-400", icon: Clock },
  CONFIRMED: { color: "bg-blue-500/15 text-blue-400", icon: CheckCircle },
  PROCESSING: { color: "bg-violet-500/15 text-violet-400", icon: Package },
  SHIPPED: { color: "bg-cyan-500/15 text-cyan-400", icon: Truck },
  DELIVERED: { color: "bg-emerald-500/15 text-emerald-400", icon: CheckCircle },
  CANCELLED: { color: "bg-red-500/15 text-red-400", icon: XCircle },
  REFUNDED: { color: "bg-red-500/15 text-red-400", icon: XCircle },
};

type UpdatableStatus = "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
const nextStatus: Record<string, UpdatableStatus> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PROCESSING",
  PROCESSING: "SHIPPED",
  SHIPPED: "DELIVERED",
};

export default async function AdminOrdersPage() {
  await requireAdmin();

  let orders: any[] = [];
  try {
    const tdb = await getScopedDb();
    orders = await tdb.order.findMany({
      include: {
        address: { select: { city: true, state: true } },
        warehouse: { select: { name: true } },
        items: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    // No tenant context
  }

  const pending = orders.filter((o) => o.status === "PENDING").length;
  const processing = orders.filter((o) => ["CONFIRMED", "PROCESSING"].includes(o.status)).length;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-emerald-400" /> Orders
          </h1>
          <p className="text-sm text-white/40 mt-1">{orders.length} total orders</p>
        </div>
        <div className="flex gap-2">
          {pending > 0 && (
            <span className="rounded-xl bg-amber-500/[0.08] border border-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-400">
              {pending} pending
            </span>
          )}
          {processing > 0 && (
            <span className="rounded-xl bg-violet-500/[0.08] border border-violet-500/20 px-3 py-1.5 text-xs font-semibold text-violet-400">
              {processing} processing
            </span>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="h-10 w-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">No orders yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/[0.06] bg-white/[0.02]">
                <tr>
                  <th className="px-5 py-3 text-left font-medium text-white/40">Order</th>
                  <th className="px-5 py-3 text-center font-medium text-white/40">Items</th>
                  <th className="px-5 py-3 text-right font-medium text-white/40">Total</th>
                  <th className="px-5 py-3 text-left font-medium text-white/40">Shipping</th>
                  <th className="px-5 py-3 text-center font-medium text-white/40">Status</th>
                  <th className="px-5 py-3 text-right font-medium text-white/40">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {orders.map((order) => {
                  const next = nextStatus[order.status];
                  const config = statusConfig[order.status] || statusConfig.PENDING;
                  const Icon = config.icon;
                  return (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium text-white">{order.orderNumber}</p>
                        <p className="text-xs text-white/30">{order.createdAt.toLocaleDateString("en-GB")}</p>
                      </td>
                      <td className="px-5 py-4 text-center text-white/60">{order.items.length}</td>
                      <td className="px-5 py-4 text-right font-medium text-white tabular-nums">{formatPrice(Number(order.total))}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-white/50">
                          {order.shippingMethod?.replace(/_/g, " ")}
                        </span>
                        {order.address && (
                          <p className="text-xs text-white/30 mt-0.5">{order.address.city}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${config.color}`}>
                          <Icon className="h-3 w-3" /> {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {next && (
                          <form action={updateOrderStatus.bind(null, order.id, next)}>
                            <button type="submit" className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/60 hover:bg-white/[0.1] hover:text-white transition">
                              → {next.charAt(0) + next.slice(1).toLowerCase()}
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
