"use client";

import { AlertTriangle, CreditCard, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function BillingIssuePage() {
  const openPortal = async () => {
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId: "current", returnUrl: window.location.href }),
      });
      const { url } = await res.json();
      if (url) window.open(url, "_blank");
    } catch {
      // fallback
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-white">Billing Issue</h1>
        <p className="mt-3 text-sm text-white/50 leading-relaxed">
          Your account has an outstanding payment. Please update your payment method
          to restore full access to your storefront and admin panel.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={openPortal}
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-gray-950 transition hover:bg-gray-100"
          >
            <CreditCard className="h-4 w-4" />
            Update Payment Method
          </button>
          <a
            href="mailto:hello@authentifactor.com"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 px-6 text-sm font-medium text-white/60 transition hover:border-white/20 hover:text-white"
          >
            Contact Support
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        <p className="mt-8 text-xs text-white/30">
          If you&apos;ve already resolved this, please refresh or{" "}
          <Link href="/admin" className="text-emerald-400 hover:underline">
            try accessing your dashboard
          </Link>.
        </p>
      </div>
    </div>
  );
}
