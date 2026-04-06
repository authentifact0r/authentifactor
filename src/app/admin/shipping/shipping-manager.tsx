"use client";
import { apiUrl } from "@/lib/api";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Truck, Plus, Trash2, ChevronDown, ChevronRight,
  Pause, Play, Package, Zap, Globe, MapPin,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Rule {
  id: string;
  name: string;
  method: string;
  minWeightKg: number;
  maxWeightKg: number;
  baseCost: number;
  perKgCost: number;
  estimatedDays: number;
  isActive: boolean;
}

interface Props {
  rules: Rule[];
  tenantSlug: string;
}

const METHOD_LABELS: Record<string, string> = {
  LOCAL_FRESH: "Local Fresh",
  STANDARD: "Standard",
  EXPRESS: "Express",
  LOCAL_VAN: "Local Van",
  DHL: "DHL International",
};

const METHOD_ICONS: Record<string, any> = {
  LOCAL_FRESH: Zap,
  STANDARD: Package,
  EXPRESS: Truck,
  LOCAL_VAN: MapPin,
  DHL: Globe,
};

export function ShippingManager({ rules, tenantSlug }: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [method, setMethod] = useState("STANDARD");
  const [minWeight, setMinWeight] = useState(0);
  const [maxWeight, setMaxWeight] = useState(30);
  const [baseCost, setBaseCost] = useState(0);
  const [perKgCost, setPerKgCost] = useState(0);
  const [estimatedDays, setEstimatedDays] = useState(3);

  const activeRules = rules.filter(r => r.isActive);
  const inactiveRules = rules.filter(r => !r.isActive);

  const createRule = async () => {
    if (!name.trim() || baseCost < 0) return;
    setSaving(true);
    try {
      const res = await fetch(apiUrl("/api/admin/shipping"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, method, minWeightKg: minWeight, maxWeightKg: maxWeight, baseCost, perKgCost, estimatedDays }),
      });
      if (!res.ok) { const e = await res.json(); alert(e.error || "Failed"); setSaving(false); return; }
      setShowCreate(false);
      setName(""); setMethod("STANDARD"); setMinWeight(0); setMaxWeight(30); setBaseCost(0); setPerKgCost(0); setEstimatedDays(3);
      setSaving(false);
      router.refresh();
    } catch { setSaving(false); }
  };

  const toggleActive = async (id: string, current: boolean) => {
    await fetch(apiUrl("/api/admin/shipping/update"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !current }),
    });
    router.refresh();
  };

  const deleteRule = async (id: string) => {
    if (!confirm("Remove this shipping rule?")) return;
    await fetch(apiUrl("/api/admin/shipping/delete"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Truck className="h-6 w-6 text-cyan-400" /> Shipping Rules
          </h1>
          <p className="text-sm text-white/60 mt-1">{activeRules.length} active · {inactiveRules.length} inactive</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-black hover:bg-cyan-400 transition">
          <Plus className="h-3.5 w-3.5" /> Add Rule
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.03] p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">New Shipping Rule</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Rule Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Standard National" className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition" />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Shipping Method</label>
              <select value={method} onChange={e => setMethod(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition">
                <option value="LOCAL_FRESH" className="bg-gray-900">Local Fresh (same-day)</option>
                <option value="STANDARD" className="bg-gray-900">Standard</option>
                <option value="EXPRESS" className="bg-gray-900">Express</option>
                <option value="LOCAL_VAN" className="bg-gray-900">Local Van</option>
                <option value="DHL" className="bg-gray-900">DHL International</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Min Weight (kg)</label>
              <input type="number" min="0" step="0.1" value={minWeight} onChange={e => setMinWeight(parseFloat(e.target.value) || 0)} className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Max Weight (kg)</label>
              <input type="number" min="0" step="0.1" value={maxWeight} onChange={e => setMaxWeight(parseFloat(e.target.value) || 0)} className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Base Cost</label>
              <input type="number" min="0" step="0.01" value={baseCost} onChange={e => setBaseCost(parseFloat(e.target.value) || 0)} className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Per Kg Cost</label>
              <input type="number" min="0" step="0.01" value={perKgCost} onChange={e => setPerKgCost(parseFloat(e.target.value) || 0)} className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Est. Days</label>
              <input type="number" min="1" value={estimatedDays} onChange={e => setEstimatedDays(parseInt(e.target.value) || 1)} className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white focus:outline-none" />
            </div>
          </div>

          {/* Preview */}
          {name && (
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 flex items-center gap-3">
              <Truck className="h-5 w-5 text-cyan-400" />
              <div className="flex-1">
                <p className="text-sm text-white">{name}</p>
                <p className="text-xs text-white/60">
                  {METHOD_LABELS[method]} · {minWeight}–{maxWeight}kg · {formatPrice(baseCost)} base + {formatPrice(perKgCost)}/kg · ~{estimatedDays} day{estimatedDays !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={createRule} disabled={saving || !name.trim()} className="inline-flex items-center gap-1.5 h-10 px-5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black text-sm font-semibold transition">
              <Plus className="h-4 w-4" /> {saving ? "Adding..." : "Add Rule"}
            </button>
            <button onClick={() => setShowCreate(false)} className="h-10 px-4 rounded-lg bg-white/[0.06] text-white/50 text-sm hover:text-white transition">Cancel</button>
          </div>
        </div>
      )}

      {/* Active Rules */}
      {activeRules.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/60">Active Rules</h2>
          {activeRules.map(rule => {
            const isOpen = expanded === rule.id;
            const Icon = METHOD_ICONS[rule.method] || Truck;
            return (
              <div key={rule.id} className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.03] overflow-hidden">
                <button onClick={() => setExpanded(isOpen ? null : rule.id)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors text-left">
                  <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{rule.name}</p>
                    <p className="text-xs text-white/50">{METHOD_LABELS[rule.method] || rule.method}</p>
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="text-sm text-white/70">{rule.minWeightKg}–{rule.maxWeightKg}kg</p>
                    <p className="text-xs text-white/50">weight range</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-cyan-400">{formatPrice(rule.baseCost)}</p>
                    <p className="text-xs text-white/50">+{formatPrice(rule.perKgCost)}/kg</p>
                  </div>
                  <span className="hidden sm:inline rounded-full bg-cyan-500/15 px-2.5 py-1 text-[11px] font-semibold text-cyan-400">~{rule.estimatedDays}d</span>
                  {isOpen ? <ChevronDown className="h-4 w-4 text-white/50" /> : <ChevronRight className="h-4 w-4 text-white/50" />}
                </button>

                {isOpen && (
                  <div className="border-t border-white/[0.04] bg-white/[0.01] p-5 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div><span className="text-xs text-white/60">Method</span><p className="text-white font-medium">{METHOD_LABELS[rule.method]}</p></div>
                      <div><span className="text-xs text-white/60">Weight Range</span><p className="text-white/70">{rule.minWeightKg}kg – {rule.maxWeightKg}kg</p></div>
                      <div><span className="text-xs text-white/60">Base Cost</span><p className="text-cyan-400 font-bold">{formatPrice(rule.baseCost)}</p></div>
                      <div><span className="text-xs text-white/60">Per Kg</span><p className="text-white/70">{formatPrice(rule.perKgCost)}</p></div>
                    </div>
                    <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3">
                      <p className="text-xs text-white/50">Example: A 5kg package costs <span className="text-cyan-400 font-semibold">{formatPrice(rule.baseCost + rule.perKgCost * 5)}</span> ({formatPrice(rule.baseCost)} base + 5 × {formatPrice(rule.perKgCost)})</p>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
                      <button onClick={() => toggleActive(rule.id, rule.isActive)} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-white/[0.06] text-white/60 text-xs font-medium hover:bg-white/[0.1] transition">
                        <Pause className="h-3.5 w-3.5" /> Disable Rule
                      </button>
                      <button onClick={() => deleteRule(rule.id)} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition">
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Inactive Rules */}
      {inactiveRules.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/50">Inactive Rules</h2>
          {inactiveRules.map(rule => {
            const Icon = METHOD_ICONS[rule.method] || Truck;
            return (
              <div key={rule.id} className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-3 opacity-60">
                <div className="h-9 w-9 rounded-lg bg-white/[0.06] flex items-center justify-center">
                  <Icon className="h-4 w-4 text-white/30" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/60 truncate">{rule.name}</p>
                  <p className="text-xs text-white/50">{METHOD_LABELS[rule.method]} · {formatPrice(rule.baseCost)} + {formatPrice(rule.perKgCost)}/kg</p>
                </div>
                <button onClick={() => toggleActive(rule.id, rule.isActive)} className="text-xs text-cyan-400 hover:text-cyan-300 transition mr-2">
                  <Play className="h-3.5 w-3.5 inline mr-1" />Enable
                </button>
                <button onClick={() => deleteRule(rule.id)} className="text-xs text-white/50 hover:text-red-400 transition">Remove</button>
              </div>
            );
          })}
        </div>
      )}

      {rules.length === 0 && !showCreate && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-12 text-center">
          <Truck className="h-10 w-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/60">No shipping rules configured.</p>
          <p className="text-xs text-white/50 mt-1">Add rules to define shipping costs by method and weight range.</p>
        </div>
      )}
    </div>
  );
}

