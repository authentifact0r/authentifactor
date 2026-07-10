"use client";
import { apiUrl } from "@/lib/api";

import { useCallback, useEffect, useState } from "react";
import {
  Receipt, Send, ExternalLink, RefreshCw, CheckCircle, AlertTriangle, Clock,
} from "lucide-react";

interface InvoiceRow {
  id: string;
  number: string | null;
  customerEmail: string | null;
  customerName: string | null;
  amountDue: number;
  amountPaid: number;
  currency: string;
  status: string | null;
  hostedInvoiceUrl: string | null;
  dueDate: number | null;
  created: number;
  memo: string | null;
  lineDescription: string | null;
  amendable: boolean;
}

const SYMBOLS: Record<string, string> = { gbp: "£", usd: "$", eur: "€" };
const money = (minor: number, currency: string) =>
  `${SYMBOLS[currency] || currency.toUpperCase() + " "}${(minor / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const STATUS_BADGE: Record<string, string> = {
  paid: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  open: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  draft: "bg-white/10 text-white/60 border-white/20",
  void: "bg-white/5 text-white/40 border-white/10 line-through",
  uncollectible: "bg-red-500/15 text-red-300 border-red-500/30",
};

// Quick-fill presets for common tenant invoice types — all fields stay editable.
const SUGGESTIONS = [
  { label: "Order — 50% deposit", description: "Custom order — 50% deposit", amount: "250.00", daysUntilDue: "7" },
  { label: "Order — balance", description: "Custom order — balance due", amount: "250.00", daysUntilDue: "7" },
  { label: "Wholesale order", description: "Wholesale order", amount: "500.00", daysUntilDue: "14" },
  { label: "Catering", description: "Event catering — balance due", amount: "350.00", daysUntilDue: "7" },
  { label: "Services", description: "Professional services", amount: "150.00", daysUntilDue: "14" },
];

const inputCls =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none";

export function InvoiceManager() {
  const [form, setForm] = useState({
    clientEmail: "", clientName: "", description: "", amount: "", currency: "gbp", daysUntilDue: "14", memo: "",
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ url: string | null; email: string; amount: string } | null>(null);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [amending, setAmending] = useState<{ id: string; number: string | null } | null>(null);
  const [voidingId, setVoidingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/admin/invoices"), { cache: "no-store" });
      const data = await res.json();
      setInvoices(data.invoices || []);
    } catch {
      // list is best-effort; composer still works
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const applySuggestion = (s: (typeof SUGGESTIONS)[number]) =>
    setForm((f) => ({ ...f, description: s.description, amount: s.amount, daysUntilDue: s.daysUntilDue }));

  // Stripe invoices can't be edited once sent — amending means: prefill the
  // form from the original, send the corrected invoice, void the original.
  const startAmend = (inv: InvoiceRow) => {
    setAmending({ id: inv.id, number: inv.number });
    setForm({
      clientEmail: inv.customerEmail || "",
      clientName: inv.customerName || "",
      description: inv.lineDescription || "",
      amount: inv.amountDue ? (inv.amountDue / 100).toFixed(2) : "",
      currency: inv.currency || "gbp",
      daysUntilDue: "14",
      memo: inv.memo || "",
    });
    setSuccess(null);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const voidInvoice = async (inv: InvoiceRow) => {
    if (!window.confirm(`Void invoice ${inv.number || inv.id} for ${money(inv.amountDue, inv.currency)}? The client's pay link will stop working.`)) return;
    setVoidingId(inv.id);
    setError("");
    try {
      const res = await fetch(apiUrl(`/api/admin/invoices/${inv.id}/void`), { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to void invoice");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to void invoice");
    } finally {
      setVoidingId(null);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(null);
    setSending(true);
    try {
      const res = await fetch(apiUrl("/api/admin/invoices"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount),
          daysUntilDue: parseInt(form.daysUntilDue, 10) || 14,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create invoice");
      if (amending) {
        try {
          const voidRes = await fetch(apiUrl(`/api/admin/invoices/${amending.id}/void`), { method: "POST" });
          if (!voidRes.ok) {
            const voidData = await voidRes.json();
            setError(`Corrected invoice sent, but voiding ${amending.number || amending.id} failed — void it manually. (${voidData.error || "unknown error"})`);
          }
        } catch {
          setError(`Corrected invoice sent, but voiding ${amending.number || amending.id} failed — void it manually.`);
        }
      }
      setSuccess({
        url: data.invoice.hostedInvoiceUrl,
        email: data.invoice.customerEmail,
        amount: money(data.invoice.amountDue, data.invoice.currency),
      });
      setAmending(null);
      setForm((f) => ({ ...f, clientEmail: "", clientName: "", description: "", amount: "", memo: "" }));
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invoice");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Receipt className="h-6 w-6 text-amber-400" /> Invoices
        </h1>
        <p className="text-sm text-white/60 mt-1">
          Request payment from a client — Stripe emails them a hosted invoice with a pay link.
        </p>
      </div>

      {/* Quick-fill suggestions */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-white/30">Quick fill</span>
        {SUGGESTIONS.map((s) => (
          <button key={s.label} type="button" onClick={() => applySuggestion(s)}
            title={`${s.description} — £${s.amount}`}
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-amber-300">
            {s.label}
          </button>
        ))}
      </div>

      {amending && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-300">
          <span>Amending invoice <strong>{amending.number || amending.id}</strong> — sending will void the original and email the corrected invoice.</span>
          <button type="button" onClick={() => setAmending(null)} className="shrink-0 font-medium hover:text-amber-100">
            Cancel amend
          </button>
        </div>
      )}

      {/* Composer */}
      <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-white/5 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1">Client email *</label>
          <input type="email" required value={form.clientEmail} onChange={set("clientEmail")}
            placeholder="finance@client.com" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1">Client / company name</label>
          <input type="text" value={form.clientName} onChange={set("clientName")}
            placeholder="Acme Ltd" className={inputCls} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-white/60 mb-1">What is this for? *</label>
          <input type="text" required value={form.description} onChange={set("description")}
            placeholder="Catering order #1042 — balance due" className={inputCls} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">Currency</label>
            <select value={form.currency} onChange={set("currency")} className={inputCls}>
              <option value="gbp">GBP £</option>
              <option value="usd">USD $</option>
              <option value="eur">EUR €</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-white/60 mb-1">Amount *</label>
            <input type="number" required min="1" step="0.01" value={form.amount} onChange={set("amount")}
              placeholder="250.00" className={inputCls} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1">Due in (days)</label>
          <input type="number" min="1" max="90" value={form.daysUntilDue} onChange={set("daysUntilDue")} className={inputCls} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-white/60 mb-1">Memo (shown on the invoice)</label>
          <input type="text" value={form.memo} onChange={set("memo")}
            placeholder="Thank you for your business." className={inputCls} />
        </div>

        {error && (
          <div className="md:col-span-2 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}
        {success && (
          <div className="md:col-span-2 flex items-center justify-between gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0" />
              Invoice for {success.amount} sent to {success.email}
            </span>
            {success.url && (
              <a href={success.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium hover:text-emerald-200">
                View <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )}

        <div className="md:col-span-2 flex justify-end">
          <button type="submit" disabled={sending}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-300 disabled:opacity-50 transition-colors">
            <Send className="h-4 w-4" />
            {sending ? "Sending…" : amending ? "Send corrected invoice" : "Create & send invoice"}
          </button>
        </div>
      </form>

      {/* Recent invoices */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Clock className="h-5 w-5 text-white/50" /> Recent invoices
          </h2>
          <button onClick={load} disabled={loading}
            className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
        {loading && invoices.length === 0 ? (
          <p className="py-6 text-center text-sm text-white/40">Loading invoices…</p>
        ) : invoices.length === 0 ? (
          <p className="py-6 text-center text-sm text-white/40">No invoices yet — send your first one above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-white/50">
                  <th className="py-2 pr-4 font-medium">Client</th>
                  <th className="py-2 pr-4 font-medium">Amount</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Due</th>
                  <th className="py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-white/5 last:border-0">
                    <td className="py-2.5 pr-4">
                      <div className="font-medium text-white">{inv.customerName || inv.customerEmail}</div>
                      {inv.customerName && <div className="text-xs text-white/40">{inv.customerEmail}</div>}
                    </td>
                    <td className="py-2.5 pr-4 font-medium text-white">{money(inv.amountDue, inv.currency)}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[inv.status || "draft"] || STATUS_BADGE.draft}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-white/60">
                      {inv.dueDate ? new Date(inv.dueDate * 1000).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-2.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-3">
                        {inv.amendable && (
                          <>
                            <button onClick={() => startAmend(inv)}
                              className="font-medium text-white/60 hover:text-amber-300"
                              title="Prefill the form with this invoice — sending voids the original">
                              Amend
                            </button>
                            <button onClick={() => voidInvoice(inv)} disabled={voidingId === inv.id}
                              className="font-medium text-white/60 hover:text-red-400 disabled:opacity-50"
                              title="Cancel this invoice — the pay link stops working">
                              {voidingId === inv.id ? "Voiding…" : "Void"}
                            </button>
                          </>
                        )}
                        {inv.hostedInvoiceUrl && (
                          <a href={inv.hostedInvoiceUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-medium text-amber-400 hover:text-amber-300">
                            Open <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
