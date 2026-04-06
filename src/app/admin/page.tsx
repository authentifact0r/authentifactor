export const dynamic = "force-dynamic";

import { getScopedDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Package, ShoppingCart, AlertTriangle, TrendingUp, Clock, Box, Banknote } from "lucide-react";
import { SalesDashboardWrapper } from "./sales-dashboard-wrapper";
import { DashboardOrders } from "./dashboard-orders";
import Link from "next/link";
import { headers } from "next/headers";

export default async function AdminDashboard() {
  await requireAdmin();
  const h = await headers();
  const tenantSlug = h.get("x-tenant-slug") || "";
  const tp = tenantSlug ? `?tenant=${tenantSlug}` : "";

  let totalProducts = 0;
  let totalOrders = 0;
  let pendingOrders = 0;
  let lowStockProducts: any[] = [];
  let expiringBatches = 0;
  let recentOrders: any[] = [];
  let totalRevenue = 0;
  let totalStock = 0;
  let inventoryValue = 0;
  let topProducts: any[] = [];

  try {
    const tdb = await getScopedDb();
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const results = await Promise.all([
      tdb.product.count({ where: { isActive: true } }),
      tdb.order.count(),
      tdb.order.count({ where: { status: "PENDING" } }),
      tdb.inventoryBatch.findMany({
        where: { quantity: { lte: 10, gt: 0 } },
        include: { product: { select: { name: true, sku: true } }, warehouse: { select: { name: true } } },
      }),
      tdb.inventoryBatch.count({ where: { expiryDate: { lte: thirtyDaysFromNow, gte: now } } }),
      tdb.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          address: { select: { firstName: true, lastName: true, line1: true, line2: true, city: true, postcode: true, phone: true } },
          items: { include: { product: { select: { name: true, price: true } } } },
        },
      }),
      tdb.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { total: true } }),
      tdb.product.findMany({
        include: { inventoryBatches: { select: { quantity: true } } },
        where: { isActive: true },
        orderBy: { name: "asc" },
      }),
    ]);

    totalProducts = results[0];
    totalOrders = results[1];
    pendingOrders = results[2];
    const lowBatches = results[3] as any[];
    lowStockProducts = lowBatches.map((b: any) => ({
      productName: b.product?.name || "Unknown",
      sku: b.product?.sku || "",
      warehouse: b.warehouse?.name || "—",
      quantity: b.quantity,
      batchNumber: b.batchNumber,
    }));
    expiringBatches = results[4];
    // Fetch user names for recent orders
    const rawOrders = results[5] as any[];
    const { db: rawDb } = await import("@/lib/db");
    recentOrders = [];
    for (const o of rawOrders) {
      const usr = await rawDb.user.findUnique({ where: { id: o.userId }, select: { firstName: true, lastName: true, email: true, phone: true } });
      const addr = o.address;
      recentOrders.push({
        id: o.id,
        orderNumber: o.orderNumber,
        total: Number(o.total),
        status: o.status,
        createdAt: o.createdAt.toISOString(),
        customerName: usr ? `${usr.firstName} ${usr.lastName}`.trim() : addr ? `${addr.firstName} ${addr.lastName}`.trim() : "—",
        customerEmail: usr?.email || "",
        customerPhone: usr?.phone || addr?.phone || "",
        shippingAddress: addr ? `${addr.line1}${addr.line2 ? ", " + addr.line2 : ""}, ${addr.city} ${addr.postcode}` : "",
        notes: o.notes || "",
        trackingNumber: o.trackingNumber || "",
        items: o.items.map((i: any) => ({ name: i.product?.name || "Product", qty: i.quantity, price: Number(i.product?.price || i.unitPrice) })),
      });
    }
    totalRevenue = Number(results[6]._sum.total ?? 0);

    const products = results[7] as any[];
    totalStock = products.reduce((s, p) => s + p.inventoryBatches.reduce((ss: number, b: any) => ss + b.quantity, 0), 0);
    inventoryValue = products.reduce((s, p) => {
      const stock = p.inventoryBatches.reduce((ss: number, b: any) => ss + b.quantity, 0);
      return s + (Number(p.price) * stock);
    }, 0);

    // Top products by stock value
    topProducts = products
      .map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        image: p.images?.[0] || null,
        price: Number(p.price),
        stock: p.inventoryBatches.reduce((ss: number, b: any) => ss + b.quantity, 0),
        value: Number(p.price) * p.inventoryBatches.reduce((ss: number, b: any) => ss + b.quantity, 0),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  } catch {
    // No tenant context
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      {/* Stats — each card links to its page */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Products", value: totalProducts, icon: Package, color: "text-emerald-400 bg-emerald-500/10", href: `/admin/products${tp}` },
          { label: "Total Orders", value: totalOrders, icon: ShoppingCart, color: "text-blue-400 bg-blue-500/10", href: `/admin/orders${tp}` },
          { label: "Revenue", value: formatPrice(totalRevenue), icon: TrendingUp, color: "text-green-400 bg-green-500/10", href: `/admin/orders${tp}` },
          { label: "Stock Units", value: totalStock.toLocaleString(), icon: Box, color: "text-cyan-400 bg-cyan-500/10", href: `/admin/inventory${tp}` },
          { label: "Inventory Value", value: formatPrice(inventoryValue), icon: Banknote, color: "text-violet-400 bg-violet-500/10", href: `/admin/inventory${tp}` },
        ].map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href}>
            <Card className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm hover:bg-white/[0.06] hover:border-white/[0.12] transition-all cursor-pointer">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{value}</p>
                  <p className="text-xs text-white/50">{label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Alerts */}
      {(lowStockProducts.length > 0 || expiringBatches > 0) && (
        <div className="space-y-3">
          {lowStockProducts.length > 0 && (
            <Card className="border-amber-500/20 bg-amber-500/[0.06]">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-amber-400" />
                  <p className="font-semibold text-amber-300">{lowStockProducts.length} low stock batches</p>
                </div>
                <div className="space-y-1.5">
                  {lowStockProducts.map((p: any, i: number) => (
                    <Link key={i} href={`/admin/inventory${tp}`}>
                      <div className="flex items-center justify-between rounded-lg bg-amber-500/[0.06] border border-amber-500/10 px-3 py-2 text-sm hover:bg-amber-500/[0.1] transition cursor-pointer">
                        <div>
                          <p className="text-white font-medium">{p.productName}</p>
                          <p className="text-xs text-amber-400/60">{p.sku} · {p.warehouse}{p.batchNumber ? ` · Batch ${p.batchNumber}` : ""}</p>
                        </div>
                        <span className="text-amber-400 font-bold">{p.quantity} left</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {expiringBatches > 0 && (
            <Link href={`/admin/inventory${tp}`}>
              <Card className="border-red-500/20 bg-red-500/[0.06] hover:bg-red-500/[0.1] transition cursor-pointer">
                <CardContent className="flex items-center gap-4 p-5">
                  <Clock className="h-7 w-7 text-red-400" />
                  <div>
                    <p className="font-semibold text-red-300">{expiringBatches} batches expiring soon</p>
                    <p className="text-sm text-red-400/60">Within the next 30 days</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      )}

      {/* Top Products by Inventory Value */}
      {topProducts.length > 0 && (
        <Card className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-white">
              <span className="flex items-center gap-2"><Banknote className="h-5 w-5 text-violet-400" /> Top Products by Value</span>
              <Link href={`/admin/inventory${tp}`} className="text-xs font-medium text-white/40 hover:text-white/60 transition">View Inventory →</Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topProducts.map((p: any, i: number) => (
                <Link key={i} href={`/admin/products/${p.id}${tp}`}>
                  <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all cursor-pointer">
                    {p.image ? (
                      <img src={p.image} alt="" className="h-9 w-9 rounded-lg object-cover" />
                    ) : (
                      <div className="h-9 w-9 rounded-lg bg-white/[0.06] flex items-center justify-center"><Package className="h-4 w-4 text-white/20" /></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{p.name}</p>
                      <p className="text-xs text-white/30">{p.sku} · {p.stock} units × {formatPrice(p.price)}</p>
                    </div>
                    <span className="text-sm font-semibold text-violet-400 tabular-nums">{formatPrice(p.value)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders — quick view */}
      {recentOrders.length > 0 && (
        <DashboardOrders orders={recentOrders} pendingOrders={pendingOrders} tenantParam={tp} />
      )}

      {/* Real-time Sales Dashboard */}
      <SalesDashboardWrapper />
    </div>
  );
}
