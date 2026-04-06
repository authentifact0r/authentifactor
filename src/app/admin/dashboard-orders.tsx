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
    case "PENDING": return "bg-amber-100 text-amber-800 border border-amber-200";
    case "CONFIRMED": return "bg-blue-50 text-blue-700 border border-blue-200";
    case "PROCESSING": return "bg-purple-50 text-purple-700 border border-purple-200";
    case "SHIPPED": return "bg-cyan-50 text-cyan-700 border border-cyan-200";
    case "DELIVERED": return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "CANCELLED": return "bg-red-50 text-red-700 border border-red-200";
    default: return "bg-gray-100 text-gray-600 border border-gray-200";
  }
};

export function DashboardOrders({ orders, pendingOrders, tenantParam }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-none">
      <div className="flex items-center justify-between p-5 pb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-[#1a1a1a]">Recent Orders</h2>
          {pendingOrders > 0 && (
            <span className="rounded-full bg-amber-100 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
              {pendingOrders} pending
            </span>
          )}
        </div>
        <Link href={`/admin/orders${tenantParam}`} className="text-xs font-medium text-[#999] hover:text-[#C5A059] transition">
          View All →
        </Link>
      </div>

      <div className="px-5 pb-5 space-y-2">
        {orders.map((order) => {
          const isOpen = expanded === order.id;
          return (
            <div key={order.id} className="border border-[#E5E5E5] bg-[#fafaf8] overflow-hidden">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setExpanded(isOpen ? null : order.id)}
                onKeyDown={(e) => e.key === "Enter" && setExpanded(isOpen ? null : order.id)}
                className="w-full flex items-center justify-between p-3 text-sm hover:bg-[#f5f0e8] transition-all cursor-pointer text-left select-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-[#999] shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-[#999] shrink-0" />}
                  <div className="min-w-0">
                    <p className="font-medium text-[#1a1a1a]">{order.orderNumber}</p>
                    <p className="text-xs text-[#999]">{order.customerName} · {new Date(order.createdAt).toLocaleDateString("en-GB")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusStyle(order.status)}`}>
                    {order.status}
                  </span>
                  <p className="font-semibold text-[#1a1a1a] tabular-nums">{formatPrice(order.total)}</p>
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-[#E5E5E5] bg-white p-4 space-y-3">
                  {/* Items */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#999] mb-1.5">Items</p>
                    <div className="space-y-1">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-[#444]">{item.qty}× {item.name}</span>
                          <span className="text-[#666] tabular-nums">{formatPrice(item.price * item.qty)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer & Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#f0f0f0]">
                    {order.customerEmail && (
                      <div className="flex items-start gap-2">
                        <User className="h-3.5 w-3.5 text-[#bbb] mt-0.5 shrink-0" />
                        <div className="text-xs">
                          <p className="text-[#444]">{order.customerName}</p>
                          <p className="text-[#999]">{order.customerEmail}</p>
                          {order.customerPhone && <p className="text-[#999]">{order.customerPhone}</p>}
                        </div>
                      </div>
                    )}
                    {order.shippingAddress && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 text-[#bbb] mt-0.5 shrink-0" />
                        <p className="text-xs text-[#777]">{order.shippingAddress}</p>
                      </div>
                    )}
                    {order.trackingNumber && (
                      <div className="flex items-start gap-2">
                        <Truck className="h-3.5 w-3.5 text-[#bbb] mt-0.5 shrink-0" />
                        <p className="text-xs text-[#777]">Tracking: {order.trackingNumber}</p>
                      </div>
                    )}
                    {order.notes && (
                      <div className="flex items-start gap-2">
                        <FileText className="h-3.5 w-3.5 text-[#bbb] mt-0.5 shrink-0" />
                        <p className="text-xs text-[#777]">{order.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#f0f0f0]">
                    <Link
                      href={`/admin/orders${tenantParam}`}
                      className="text-xs text-[#C5A059] hover:text-[#a88840] font-medium transition"
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
