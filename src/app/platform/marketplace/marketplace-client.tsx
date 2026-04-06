"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ExternalLink, ShoppingBag, Sparkles } from "lucide-react";
import Image from "next/image";

interface TenantListing {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  logo: string | null;
  primaryColor: string;
  vertical: string | null;
  customDomain: string | null;
  _count: { products: number };
}

const ease = [0.16, 1, 0.3, 1];

const verticalLabels: Record<string, string> = {
  grocery: "Grocery & Food",
  fashion: "Fashion & Textiles",
  catering: "Catering & Meal Prep",
  beauty: "Beauty & Cosmetics",
  education: "Education & Learning",
  other: "Other",
};

const verticalFilters = [
  { value: "", label: "All Stores" },
  { value: "grocery", label: "Grocery" },
  { value: "fashion", label: "Fashion" },
  { value: "catering", label: "Catering" },
  { value: "beauty", label: "Beauty" },
  { value: "education", label: "Education" },
];

export function MarketplaceClient({ tenants }: { tenants: TenantListing[] }) {
  const [search, setSearch] = useState("");
  const [verticalFilter, setVerticalFilter] = useState("");

  const filtered = tenants.filter((t) => {
    const matchesSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.tagline?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesVertical = !verticalFilter || t.vertical === verticalFilter;
    return matchesSearch && matchesVertical;
  });

  return (
    <div className="min-h-screen bg-gray-950 pt-28 pb-20">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-400 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            {tenants.length} stores and growing
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Marketplace
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-xl mx-auto">
            Discover stores powered by Authentifactor. From African grocery to fashion, catering to beauty.
          </p>
        </motion.div>

        {/* Search + Filter */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.1 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stores..."
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-11 pr-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {verticalFilters.map((v) => (
              <button
                key={v.value}
                onClick={() => setVerticalFilter(v.value)}
                className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-medium transition-all cursor-pointer ${
                  verticalFilter === v.value
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-white/[0.04] text-gray-400 border border-white/[0.06] hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-700 mb-4" />
            <p className="text-gray-500">No stores match your search.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t, i) => {
              const storeUrl = t.customDomain
                ? `https://${t.customDomain}`
                : `https://${t.slug}.authentifactor.com`;

              return (
                <motion.a
                  key={t.id}
                  href={storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease, delay: i * 0.05 }}
                  className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
                >
                  {/* Logo + Name */}
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-white text-lg font-bold"
                      style={{ backgroundColor: t.primaryColor + "20" }}
                    >
                      {t.logo ? (
                        <Image
                          src={t.logo}
                          alt={t.name}
                          width={40}
                          height={40}
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <span style={{ color: t.primaryColor }}>
                          {t.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">
                        {t.name}
                      </h3>
                      {t.tagline && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {t.tagline}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-gray-700 group-hover:text-emerald-400 transition-colors" />
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-3">
                    {t.vertical && (
                      <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[10px] font-medium text-gray-400">
                        {verticalLabels[t.vertical] ?? t.vertical}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-600">
                      {t._count.products} product{t._count.products !== 1 ? "s" : ""}
                    </span>
                  </div>
                </motion.a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
