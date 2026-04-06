import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getScopedDb } from "@/lib/db";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

const statusColors: Record<string, string> = {
  PENDING: "#C5A059",
  CONFIRMED: "#C5A059",
  PROCESSING: "#C5A059",
  SHIPPED: "#4a7c59",
  DELIVERED: "#4a7c59",
  CANCELLED: "#999",
  REFUNDED: "#999",
};

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tdb = await getScopedDb();

  const orders = await tdb.order.findMany({
    where: { userId: user.id },
    include: {
      items: { include: { product: { select: { name: true, images: true } } } },
      address: { select: { city: true, state: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h2
        className="text-xl text-[#1a1a1a]"
        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic", fontWeight: 400 }}
      >
        Order History
      </h2>

      {orders.length === 0 ? (
        <div className="bg-white border border-[#E5E5E5] p-12 text-center">
          <ShoppingBag className="h-8 w-8 text-[#C5A059] mx-auto mb-4" />
          <p className="text-sm text-[#999] mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
            You haven&apos;t placed any orders yet.
          </p>
          <Link
            href="https://styledbymaryam.com/shop"
            className="inline-block px-6 py-2.5 text-[0.65rem] font-medium uppercase tracking-widest text-white bg-[#C5A059] hover:bg-[#a88840] transition"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-[#E5E5E5]">
              {/* Order header */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-[#f0f0f0]">
                <div>
                  <p className="text-sm font-medium text-[#1a1a1a]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {order.orderNumber}
                  </p>
                  <p className="text-xs text-[#999] mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {order.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    {order.address?.city && ` \u00B7 ${order.address.city}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="inline-block text-[0.6rem] font-medium uppercase tracking-widest px-2.5 py-1"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      color: statusColors[order.status] || "#999",
                      background: `${statusColors[order.status] || "#999"}15`,
                    }}
                  >
                    {order.status}
                  </span>
                  <span
                    className="text-lg text-[#1a1a1a]"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic" }}
                  >
                    {"\u00A3"}{Number(order.total).toLocaleString("en-GB", { minimumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              {/* Order items */}
              <div className="p-5">
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {item.product?.images?.[0] && (
                          <img
                            src={item.product.images[0]}
                            alt={item.product?.name || ""}
                            className="h-12 w-12 object-cover bg-[#F5F0E8]"
                          />
                        )}
                        <div>
                          <p className="text-sm text-[#1a1a1a]" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {item.product?.name || "Product"} <span className="text-[#999]">x{item.quantity}</span>
                          </p>
                          {(item.color || item.size) && (
                            <p className="text-xs text-[#999]">{[item.color, item.size].filter(Boolean).join(" / ")}</p>
                          )}
                        </div>
                      </div>
                      <span
                        className="text-sm text-[#1a1a1a]"
                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic" }}
                      >
                        {"\u00A3"}{Number(item.totalPrice).toLocaleString("en-GB", { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#f0f0f0]">
                  <span className="text-xs text-[#999]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Shipping: {"\u00A3"}{Number(order.shippingCost).toLocaleString("en-GB", { minimumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
