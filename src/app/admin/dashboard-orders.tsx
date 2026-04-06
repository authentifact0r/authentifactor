"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, User, MapPin, FileText, Truck } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  notes: string;
  trackingNumber: string;
  items: OrderItem[];
}

interface Props {
  orders: Order[];
  pendingOrders: number;
  tenantParam: string;
}

const statusStyle = (status: string) => {
  switch (status) {
    case "PENDING": return "bg-amber-500/20 text-amber-300";
    case "CONFIRMED": return "bg-blue-500/20 text-blue-300";
    case "PROCESSING": return "bg-purple-500/20 text-purple-300";
    case "SHIPPED": return "bg-cyan-500/20 text-cyan-300";
    case "DELIVERED": return "bg-emerald-500/20 text-emerald-300";
    case "CANCELLED": return "bg-red-500/20 text-red-300";
    default: return "bg-white/10 text-white/50";
  }
};

export function DashboardOrders({ orders, pendingOrders, tenantParam }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm">
      <div className="flex items-center justify-between p-5 pb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-white">Recent Orders</h2>
          {pendingOrders > 0 && (
            <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
              {pendingOrders} pending
            </span>
          )}
        </div>
        <Link href={`/admin/orders${tenantParam}`} className="text-xs font-medium text-white/40 hover:text-white/60 transition">
          View All →
        </Link>
      </div>

      <div className="px-5 pb-5 space-y-2">
        {orders.map((order) => {
          const isOpen = expanded === order.id;
          return (
            <div key={order.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : order.id)}
                className="w-full flex items-center justify-between p-3 text-sm hover:bg-white/[0.04] transition-all cursor-pointer text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-white/40 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-white/40 shrink-0" />}
                  <div className="min-w-0">
                    <p className="font-medium text-white">{order.orderNumber}</p>
                    <p className="text-xs text-white/50">{order.customerName} · {new Date(order.createdAt).toLocaleDateString("en-GB")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusStyle(order.status)}`}>
                    {order.status}
                  </span>
                  <p className="font-semibold text-white tabular-nums">{formatPrice(order.total)}</p>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-white/[0.04] bg-white/[0.01] p-4 space-y-3">
                  {/* Items */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5">Items</p>
                    <div className="space-y-1">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-white/70">{item.qty}× {item.name}</span>
                          <span className="text-white/60 tabular-nums">{formatPrice(item.price * item.qty)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer & Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/[0.04]">
                    {order.customerEmail && (
                      <div className="flex items-start gap-2">
                        <User className="h-3.5 w-3.5 text-white/30 mt-0.5 shrink-0" />
                        <div className="text-xs">
                          <p className="text-white/70">{order.customerName}</p>
                          <p className="text-white/40">{order.customerEmail}</p>
                          {order.customerPhone && <p className="text-white/40">{order.customerPhone}</p>}
                        </div>
                      </div>
                    )}
                    {order.shippingAddress && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 text-white/30 mt-0.5 shrink-0" />
                        <p className="text-xs text-white/50">{order.shippingAddress}</p>
                      </div>
                    )}
                    {order.trackingNumber && (
                      <div className="flex items-start gap-2">
                        <Truck className="h-3.5 w-3.5 text-white/30 mt-0.5 shrink-0" />
                        <p className="text-xs text-white/50">Tracking: {order.trackingNumber}</p>
                      </div>
                    )}
                    {order.notes && (
                      <div className="flex items-start gap-2">
                        <FileText className="h-3.5 w-3.5 text-white/30 mt-0.5 shrink-0" />
                        <p className="text-xs text-white/50">{order.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/[0.04]">
                    <Link
                      href={`/admin/orders${tenantParam}`}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition"
                    >
                      Manage in Orders →
                    </Link>
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
