"use client";

import { useEffect, useState } from "react";
import { BILLING_PLANS, type BillingPlanId } from "@/config/billingPlans";

interface TenantBilling {
  id: string;
  name: string;
  slug: string;
  billingPlan: string;
  billingStatus: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  nextInvoiceDate: string | null;
  lastPaymentStatus: string | null;
  lastPaymentDate: string | null;
  billingEmail: string | null;
}

export default function SuperadminBillingPage() {
  const [tenants, setTenants] = useState<TenantBilling[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/superadmin/tenants")
      .then((r) => r.json())
      .then((data) => {
        setTenants(data.tenants || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const changePlan = async (tenantId: string, planId: string) => {
    await fetch("/api/billing/create-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId, planId }),
    });
    window.location.reload();
  };

  const openPortal = async (tenantId: string) => {
    const res = await fetch("/api/billing/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId, returnUrl: window.location.href }),
    });
    const { url } = await res.json();
    if (url) window.open(url, "_blank");
  };

  const statusColor = (status: string) => {
    if (status === "active") return "bg-emerald-100 text-emerald-700";
    if (status === "delinquent") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading billing data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-gray-900">Tenant Billing</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage billing plans, payment status, and Stripe subscriptions for all tenants.
        </p>

        <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500">Tenant</th>
                <th className="px-6 py-3 font-medium text-gray-500">Plan</th>
                <th className="px-6 py-3 font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 font-medium text-gray-500">Next Invoice</th>
                <th className="px-6 py-3 font-medium text-gray-500">Last Payment</th>
                <th className="px-6 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tenants.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.slug}</p>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={t.billingPlan}
                      onChange={(e) => changePlan(t.id, e.target.value)}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700"
                    >
                      {Object.keys(BILLING_PLANS).map((key) => (
                        <option key={key} value={key}>
                          {BILLING_PLANS[key as BillingPlanId].name} — £{BILLING_PLANS[key as BillingPlanId].priceMonthly}/mo
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor(t.billingStatus)}`}>
                      {t.billingStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {t.nextInvoiceDate ? new Date(t.nextInvoiceDate).toLocaleDateString("en-GB") : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs ${t.lastPaymentStatus === "succeeded" ? "text-emerald-600" : t.lastPaymentStatus === "failed" ? "text-red-600" : "text-gray-400"}`}>
                      {t.lastPaymentStatus || "—"}
                    </span>
                    {t.lastPaymentDate && (
                      <p className="text-[10px] text-gray-400">{new Date(t.lastPaymentDate).toLocaleDateString("en-GB")}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {t.stripeCustomerId && (
                        <button
                          onClick={() => openPortal(t.id)}
                          className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 transition"
                        >
                          Stripe Portal
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No tenants found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
