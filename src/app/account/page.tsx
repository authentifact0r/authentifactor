import { getCurrentUser } from "@/lib/auth";
import { getScopedDb } from "@/lib/db";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, MapPin, RefreshCw } from "lucide-react";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tdb = await getScopedDb();

  const [orderCount, addressCount, subscriptionCount, recentOrders] =
    await Promise.all([
      tdb.order.count({ where: { userId: user.id } }),
      db.address.count({ where: { userId: user.id } }),
      tdb.subscription.count({
        where: { userId: user.id, status: "ACTIVE" },
      }),
      tdb.order.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

  const stats = [
    { label: "Total Orders", value: orderCount, icon: Package, href: "/account/orders" },
    { label: "Saved Addresses", value: addressCount, icon: MapPin, href: "/account/addresses" },
    { label: "Subscriptions", value: subscriptionCount, icon: RefreshCw, href: "/account/subscriptions" },
  ];

  const statusColors: Record<string, string> = {
    PENDING: "#C5A059",
    CONFIRMED: "#C5A059",
    PROCESSING: "#C5A059",
    SHIPPED: "#4a7c59",
    DELIVERED: "#4a7c59",
    CANCELLED: "#999",
    REFUNDED: "#999",
  };

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-4 p-5 bg-white border border-[#E5E5E5] hover:border-[#C5A059] transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center bg-[#F5F0E8]">
              <Icon className="h-5 w-5 text-[#C5A059]" />
            </div>
            <div>
              <p className="text-2xl font-light text-[#1a1a1a]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{value}</p>
              <p className="text-[0.65rem] font-medium uppercase tracking-widest text-[#999]" style={{ fontFamily: "'Inter', sans-serif" }}>{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xl text-[#1a1a1a]"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic", fontWeight: 400 }}
          >
            Recent Orders
          </h2>
          <Link
            href="/account/orders"
            className="text-[0.65rem] font-medium uppercase tracking-widest text-[#C5A059] hover:text-[#a88840] transition"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            View All
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="bg-white border border-[#E5E5E5] p-10 text-center">
            <p className="text-sm text-[#999]" style={{ fontFamily: "'Inter', sans-serif" }}>
              No orders yet. Start shopping to see your orders here.
            </p>
            <Link
              href="https://styledbymaryam.com/shop"
              className="inline-block mt-4 px-6 py-2.5 text-[0.65rem] font-medium uppercase tracking-widest text-white bg-[#C5A059] hover:bg-[#a88840] transition"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Browse Collection
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between bg-white border border-[#E5E5E5] p-5">
                <div>
                  <p className="text-sm font-medium text-[#1a1a1a]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {order.orderNumber}
                  </p>
                  <p className="text-xs text-[#999] mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {order.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="text-lg text-[#1a1a1a]"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic" }}
                  >
                    {"\u00A3"}{Number(order.total).toLocaleString("en-GB", { minimumFractionDigits: 0 })}
                  </p>
                  <span
                    className="inline-block text-[0.6rem] font-medium uppercase tracking-widest px-2 py-0.5 mt-0.5"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      color: statusColors[order.status] || "#999",
                      background: `${statusColors[order.status] || "#999"}15`,
                    }}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
