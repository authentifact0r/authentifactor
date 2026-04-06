"use client";
import { apiUrl } from "@/lib/api";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Globe, Plus, Trash2, ChevronDown, ChevronRight,
  Eye, EyeOff, FileText, Link2, Image as ImageIcon, Edit, X, Save,
} from "lucide-react";

interface SeoRule {
  id: string;
  pageType: string;
  pageSlug: string;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  canonicalUrl: string;
  noIndex: boolean;
  updatedAt: string;
}

interface Props {
  settings: SeoRule[];
  tenantSlug: string;
}

const PAGE_TYPES = [
  { value: "home", label: "Home Page" },
  { value: "category", label: "Category Page" },
  { value: "product", label: "Product Page" },
  { value: "recipe", label: "Recipe Page" },
  { value: "collection", label: "Collection Page" },
  { value: "custom", label: "Custom Page" },
];

const PAGE_TYPE_LABELS: Record<string, string> = Object.fromEntries(PAGE_TYPES.map(t => [t.value, t.label]));

export function SeoManager({ settings, tenantSlug }: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  // Create form
  const [pageType, setPageType] = useState("home");
  const [pageSlug, setPageSlug] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [noIndex, setNoIndex] = useState(false);

  // Edit form
  const [editData, setEditData] = useState<Partial<SeoRule>>({});

  const resetForm = () => {
    setPageType("home"); setPageSlug(""); setMetaTitle(""); setMetaDescription("");
    setOgImage(""); setCanonicalUrl(""); setNoIndex(false);
  };

  const createRule = async () => {
    if (!pageType) return;
    setSaving(true);
    try {
      const res = await fetch(apiUrl("/api/admin/seo"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageType, pageSlug, metaTitle, metaDescription, ogImage, canonicalUrl, noIndex }),
      });
      if (!res.ok) { const e = await res.json(); alert(e.error || "Failed"); setSaving(false); return; }
      setShowCreate(false); resetForm(); setSaving(false);
      router.refresh();
    } catch { setSaving(false); }
  };

  const updateRule = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(apiUrl("/api/admin/seo/update"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...editData }),
      });
      if (!res.ok) { const e = await res.json(); alert(e.error || "Failed"); setSaving(false); return; }
      setEditing(null); setEditData({}); setSaving(false);
      router.refresh();
    } catch { setSaving(false); }
  };

  const deleteRule = async (id: string) => {
    if (!confirm("Remove this SEO rule?")) return;
    await fetch(apiUrl("/api/admin/seo/delete"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  };

  const startEdit = (rule: SeoRule) => {
    setEditing(rule.id);
    setEditData({
      metaTitle: rule.metaTitle,
      metaDescription: rule.metaDescription,
      ogImage: rule.ogImage,
      canonicalUrl: rule.canonicalUrl,
      noIndex: rule.noIndex,
    });
    setExpanded(rule.id);
  };

  const indexed = settings.filter(s => !s.noIndex).length;
  const hidden = settings.filter(s => s.noIndex).length;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Search className="h-6 w-6 text-orange-400" /> SEO Settings
          </h1>
          <p className="text-sm text-white/60 mt-1">{settings.length} rules · {indexed} indexed · {hidden} hidden</p>
        </div>
        <button onClick={() => { setShowCreate(!showCreate); resetForm(); }} className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-black hover:bg-orange-400 transition">
          <Plus className="h-3.5 w-3.5" /> Add Rule
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/[0.03] p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">New SEO Rule</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Page Type</label>
              <select value={pageType} onChange={e => setPageType(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition">
                {PAGE_TYPES.map(t => <option key={t.value} value={t.value} className="bg-gray-900">{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Page Slug <span className="text-white/40">(optional)</span></label>
              <input value={pageSlug} onChange={e => setPageSlug(e.target.value)} placeholder="e.g. silk-evening-gown" className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Meta Title <span className="text-white/40">({metaTitle.length}/60)</span></label>
            <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} maxLength={70} placeholder="Page title for search engines (50-60 chars ideal)" className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Meta Description <span className="text-white/40">({metaDescription.length}/160)</span></label>
            <textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)} maxLength={170} rows={3} placeholder="Short description for search results (150-160 chars ideal)" className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none resize-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">OG Image URL</label>
              <input value={ogImage} onChange={e => setOgImage(e.target.value)} type="url" placeholder="https://..." className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Canonical URL</label>
              <input value={canonicalUrl} onChange={e => setCanonicalUrl(e.target.value)} type="url" placeholder="https://..." className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none" />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={noIndex} onChange={e => setNoIndex(e.target.checked)} className="h-4 w-4 rounded border-white/20 bg-white/[0.06] text-orange-500 focus:ring-orange-500/50" />
            <span className="text-sm text-white/70">No Index — hide from search engines</span>
          </label>

          {/* SERP Preview */}
          {metaTitle && (
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 space-y-1">
              <p className="text-xs text-white/40 mb-2">Google Search Preview</p>
              <p className="text-blue-400 text-base font-medium truncate">{metaTitle}</p>
              <p className="text-emerald-400 text-xs truncate">https://{tenantSlug || "yourstore"}.com/{pageSlug || ""}</p>
              <p className="text-sm text-white/50 line-clamp-2">{metaDescription || "No description set."}</p>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={createRule} disabled={saving || !pageType} className="inline-flex items-center gap-1.5 h-10 px-5 rounded-lg bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-black text-sm font-semibold transition">
              <Plus className="h-4 w-4" /> {saving ? "Saving..." : "Save SEO Rule"}
            </button>
            <button onClick={() => setShowCreate(false)} className="h-10 px-4 rounded-lg bg-white/[0.06] text-white/50 text-sm hover:text-white transition">Cancel</button>
          </div>
        </div>
      )}

      {/* Rules List */}
      {settings.length > 0 ? (
        <div className="space-y-2">
          {settings.map(rule => {
            const isOpen = expanded === rule.id;
            const isEditing = editing === rule.id;

            return (
              <div key={rule.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
                <button onClick={() => setExpanded(isOpen ? null : rule.id)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors text-left">
                  <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{rule.metaTitle || `${PAGE_TYPE_LABELS[rule.pageType] || rule.pageType}${rule.pageSlug ? ` — ${rule.pageSlug}` : ""}`}</p>
                    <p className="text-xs text-white/50">{PAGE_TYPE_LABELS[rule.pageType] || rule.pageType}{rule.pageSlug ? ` / ${rule.pageSlug}` : ""}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${rule.noIndex ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400"}`}>
                    {rule.noIndex ? <><EyeOff className="h-3 w-3 inline mr-1" />Hidden</> : <><Eye className="h-3 w-3 inline mr-1" />Indexed</>}
                  </span>
                  <span className="hidden sm:inline text-xs text-white/40">{new Date(rule.updatedAt).toLocaleDateString("en-GB")}</span>
                  {isOpen ? <ChevronDown className="h-4 w-4 text-white/50" /> : <ChevronRight className="h-4 w-4 text-white/50" />}
                </button>

                {isOpen && (
                  <div className="border-t border-white/[0.04] bg-white/[0.01] p-5 space-y-4">
                    {isEditing ? (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-white/70 mb-1">Meta Title <span className="text-white/40">({(editData.metaTitle || "").length}/60)</span></label>
                          <input value={editData.metaTitle || ""} onChange={e => setEditData(p => ({ ...p, metaTitle: e.target.value }))} maxLength={70} className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-white/70 mb-1">Meta Description <span className="text-white/40">({(editData.metaDescription || "").length}/160)</span></label>
                          <textarea value={editData.metaDescription || ""} onChange={e => setEditData(p => ({ ...p, metaDescription: e.target.value }))} maxLength={170} rows={3} className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white focus:outline-none resize-none" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-white/70 mb-1">OG Image URL</label>
                            <input value={editData.ogImage || ""} onChange={e => setEditData(p => ({ ...p, ogImage: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-white/70 mb-1">Canonical URL</label>
                            <input value={editData.canonicalUrl || ""} onChange={e => setEditData(p => ({ ...p, canonicalUrl: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white focus:outline-none" />
                          </div>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={editData.noIndex || false} onChange={e => setEditData(p => ({ ...p, noIndex: e.target.checked }))} className="h-4 w-4 rounded border-white/20 bg-white/[0.06] text-orange-500" />
                          <span className="text-sm text-white/70">No Index</span>
                        </label>
                        <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
                          <button onClick={() => updateRule(rule.id)} disabled={saving} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-black text-xs font-semibold transition">
                            <Save className="h-3.5 w-3.5" /> {saving ? "Saving..." : "Save Changes"}
                          </button>
                          <button onClick={() => { setEditing(null); setEditData({}); }} className="h-9 px-3 rounded-lg bg-white/[0.06] text-white/50 text-xs hover:text-white transition">Cancel</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-start gap-2">
                            <FileText className="h-3.5 w-3.5 text-white/30 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs text-white/60">Meta Title</p>
                              <p className="text-white/80">{rule.metaTitle || "—"}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <FileText className="h-3.5 w-3.5 text-white/30 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs text-white/60">Meta Description</p>
                              <p className="text-white/60 text-xs">{rule.metaDescription || "—"}</p>
                            </div>
                          </div>
                          {rule.ogImage && (
                            <div className="flex items-start gap-2">
                              <ImageIcon className="h-3.5 w-3.5 text-white/30 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-xs text-white/60">OG Image</p>
                                <p className="text-white/50 text-xs truncate">{rule.ogImage}</p>
                              </div>
                            </div>
                          )}
                          {rule.canonicalUrl && (
                            <div className="flex items-start gap-2">
                              <Link2 className="h-3.5 w-3.5 text-white/30 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-xs text-white/60">Canonical</p>
                                <p className="text-white/50 text-xs truncate">{rule.canonicalUrl}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* SERP Preview */}
                        {rule.metaTitle && (
                          <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 space-y-0.5">
                            <p className="text-[10px] text-white/40 mb-1">Google Search Preview</p>
                            <p className="text-blue-400 text-sm font-medium truncate">{rule.metaTitle}</p>
                            <p className="text-emerald-400 text-xs truncate">https://{tenantSlug || "yourstore"}.com/{rule.pageSlug || ""}</p>
                            <p className="text-xs text-white/50 line-clamp-2">{rule.metaDescription || "No description set."}</p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
                          <button onClick={() => startEdit(rule)} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-white/[0.06] text-white/60 text-xs font-medium hover:bg-white/[0.1] transition">
                            <Edit className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button onClick={() => deleteRule(rule.id)} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition">
                            <Trash2 className="h-3.5 w-3.5" /> Remove
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : !showCreate && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-12 text-center">
          <Search className="h-10 w-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/60">No SEO rules configured.</p>
          <p className="text-xs text-white/50 mt-1">Add rules to optimize how your pages appear in search results.</p>
        </div>
      )}
    </div>
  );
}

