"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail, Phone, Plus, Trash2, ChevronDown, ChevronRight,
  Send, Users, Upload, Tag, Eye, Clock, CheckCircle,
  AlertTriangle, FileText, X, MessageSquare,
} from "lucide-react";

interface Subscriber {
  id: string; email: string; phone: string;
  firstName: string; lastName: string; source: string;
  emailOptIn: boolean; smsOptIn: boolean; tags: string[];
  createdAt: string; unsubscribedAt: string | null;
}

interface Campaign {
  id: string; title: string; subject: string; body: string;
  channel: string; status: string; audience: string;
  audienceTag: string; sentCount: number; failedCount: number;
  sentAt: string | null; createdAt: string;
}

interface Props {
  subscribers: Subscriber[];
  campaigns: Campaign[];
  tenantSlug: string;
}

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-white/10 text-white/50",
  sending: "bg-amber-500/15 text-amber-400",
  sent: "bg-emerald-500/15 text-emerald-400",
  failed: "bg-red-500/15 text-red-400",
};

export function NewsletterManager({ subscribers, campaigns, tenantSlug }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"campaigns" | "subscribers">("campaigns");
  const [showCreate, setShowCreate] = useState(false);
  const [showAddSub, setShowAddSub] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Campaign form
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [channel, setChannel] = useState("email");
  const [audience, setAudience] = useState("all");

  // Subscriber form
  const [subEmail, setSubEmail] = useState("");
  const [subPhone, setSubPhone] = useState("");
  const [subFirst, setSubFirst] = useState("");
  const [subLast, setSubLast] = useState("");
  const [subEmailOpt, setSubEmailOpt] = useState(true);
  const [subSmsOpt, setSubSmsOpt] = useState(false);

  const active = subscribers.filter(s => !s.unsubscribedAt);
  const emailSubs = active.filter(s => s.emailOptIn && s.email).length;
  const smsSubs = active.filter(s => s.smsOptIn && s.phone).length;

  const createCampaign = async () => {
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/newsletter/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, subject, body, channel, audience }),
      });
      if (!res.ok) { const e = await res.json(); alert(e.error || "Failed"); setSaving(false); return; }
      setShowCreate(false); setTitle(""); setSubject(""); setBody(""); setChannel("email"); setAudience("all");
      setSaving(false); router.refresh();
    } catch { setSaving(false); }
  };

  const sendCampaign = async (id: string) => {
    if (!confirm("Send this campaign to all matching subscribers now?")) return;
    await fetch("/api/admin/newsletter/campaigns/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm("Delete this campaign?")) return;
    await fetch("/api/admin/newsletter/campaigns/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  };

  const addSubscriber = async () => {
    if (!subEmail && !subPhone) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/newsletter/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subEmail, phone: subPhone, firstName: subFirst, lastName: subLast, emailOptIn: subEmailOpt, smsOptIn: subSmsOpt }),
      });
      if (!res.ok) { const e = await res.json(); alert(e.error || "Failed"); setSaving(false); return; }
      setShowAddSub(false); setSubEmail(""); setSubPhone(""); setSubFirst(""); setSubLast("");
      setSaving(false); router.refresh();
    } catch { setSaving(false); }
  };

  const removeSubscriber = async (id: string) => {
    if (!confirm("Remove this subscriber?")) return;
    await fetch("/api/admin/newsletter/subscribers/remove", {
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
            <Mail className="h-6 w-6 text-pink-400" /> Newsletter & Notifications
          </h1>
          <p className="text-sm text-white/60 mt-1">{active.length} subscribers · {emailSubs} email · {smsSubs} SMS</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Subscribers", value: active.length, icon: Users, color: "text-pink-400" },
          { label: "Email Opt-in", value: emailSubs, icon: Mail, color: "text-blue-400" },
          { label: "SMS Opt-in", value: smsSubs, icon: Phone, color: "text-emerald-400" },
          { label: "Campaigns Sent", value: campaigns.filter(c => c.status === "sent").length, icon: Send, color: "text-violet-400" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
            <s.icon className={`h-5 w-5 ${s.color} mb-3`} />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-white/40 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab("campaigns")} className={`rounded-lg px-4 py-2 text-xs font-medium transition ${tab === "campaigns" ? "bg-white/[0.1] text-white" : "bg-white/[0.04] text-white/40 hover:text-white/60"}`}>
          <Send className="h-3 w-3 inline mr-1.5" />Campaigns ({campaigns.length})
        </button>
        <button onClick={() => setTab("subscribers")} className={`rounded-lg px-4 py-2 text-xs font-medium transition ${tab === "subscribers" ? "bg-white/[0.1] text-white" : "bg-white/[0.04] text-white/40 hover:text-white/60"}`}>
          <Users className="h-3 w-3 inline mr-1.5" />Subscribers ({active.length})
        </button>
      </div>

      {/* ════════ CAMPAIGNS TAB ════════ */}
      {tab === "campaigns" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowCreate(!showCreate)} className="inline-flex items-center gap-1.5 rounded-xl bg-pink-500 px-4 py-2 text-xs font-semibold text-white hover:bg-pink-400 transition">
              <Plus className="h-3.5 w-3.5" /> New Campaign
            </button>
          </div>

          {/* Create Campaign */}
          {showCreate && (
            <div className="rounded-2xl border border-pink-500/20 bg-pink-500/[0.03] p-6 space-y-4">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider">New Campaign</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Campaign Name</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Spring Collection Launch" className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Channel</label>
                  <select value={channel} onChange={e => setChannel(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white focus:outline-none">
                    <option value="email" className="bg-gray-900">Email Only</option>
                    <option value="sms" className="bg-gray-900">SMS Only</option>
                    <option value="both" className="bg-gray-900">Email + SMS</option>
                  </select>
                </div>
              </div>

              {(channel === "email" || channel === "both") && (
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Email Subject Line</label>
                  <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. New arrivals you'll love 🔥" className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none" />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Message Body</label>
                <textarea value={body} onChange={e => setBody(e.target.value)} rows={5} placeholder="Write your message here... Supports basic formatting." className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none resize-none" />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Audience</label>
                <select value={audience} onChange={e => setAudience(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white focus:outline-none">
                  <option value="all" className="bg-gray-900">All subscribers</option>
                  <option value="email-only" className="bg-gray-900">Email subscribers only</option>
                  <option value="sms-only" className="bg-gray-900">SMS subscribers only</option>
                </select>
              </div>

              {/* Preview */}
              {(title || body) && (
                <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-white/40">Preview</p>
                  {subject && <p className="text-sm font-semibold text-white">{subject}</p>}
                  <p className="text-sm text-white/60 whitespace-pre-wrap">{body}</p>
                  <p className="text-xs text-white/30 mt-2">Will reach ~{
                    audience === "sms-only" ? smsSubs : audience === "email-only" ? emailSubs : active.length
                  } subscribers via {channel === "both" ? "email + SMS" : channel}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={createCampaign} disabled={saving || !title.trim() || !body.trim()} className="inline-flex items-center gap-1.5 h-10 px-5 rounded-lg bg-pink-500 hover:bg-pink-400 disabled:opacity-50 text-white text-sm font-semibold transition">
                  <FileText className="h-4 w-4" /> {saving ? "Saving..." : "Save as Draft"}
                </button>
                <button onClick={() => setShowCreate(false)} className="h-10 px-4 rounded-lg bg-white/[0.06] text-white/50 text-sm hover:text-white transition">Cancel</button>
              </div>
            </div>
          )}

          {/* Campaign List */}
          {campaigns.length > 0 ? campaigns.map(camp => {
            const isOpen = expanded === camp.id;
            return (
              <div key={camp.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
                <button onClick={() => setExpanded(isOpen ? null : camp.id)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors text-left">
                  <div className="h-10 w-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                    {camp.channel === "sms" ? <MessageSquare className="h-5 w-5 text-pink-400" /> : <Mail className="h-5 w-5 text-pink-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{camp.title}</p>
                    <p className="text-xs text-white/50">{camp.channel === "both" ? "Email + SMS" : camp.channel.toUpperCase()} · {new Date(camp.createdAt).toLocaleDateString("en-GB")}</p>
                  </div>
                  {camp.status === "sent" && <span className="text-xs text-white/50">{camp.sentCount} sent</span>}
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLE[camp.status] || STATUS_STYLE.draft}`}>
                    {camp.status.charAt(0).toUpperCase() + camp.status.slice(1)}
                  </span>
                  {isOpen ? <ChevronDown className="h-4 w-4 text-white/50" /> : <ChevronRight className="h-4 w-4 text-white/50" />}
                </button>

                {isOpen && (
                  <div className="border-t border-white/[0.04] bg-white/[0.01] p-5 space-y-3">
                    {camp.subject && <p className="text-sm text-white/70"><span className="text-xs text-white/40">Subject:</span> {camp.subject}</p>}
                    <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
                      <p className="text-sm text-white/60 whitespace-pre-wrap">{camp.body}</p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-white/40">
                      <span>Channel: <strong className="text-white/60">{camp.channel}</strong></span>
                      <span>Audience: <strong className="text-white/60">{camp.audience}</strong></span>
                      {camp.sentAt && <span>Sent: <strong className="text-white/60">{new Date(camp.sentAt).toLocaleString("en-GB")}</strong></span>}
                      {camp.sentCount > 0 && <span>Delivered: <strong className="text-emerald-400">{camp.sentCount}</strong></span>}
                      {camp.failedCount > 0 && <span>Failed: <strong className="text-red-400">{camp.failedCount}</strong></span>}
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
                      {camp.status === "draft" && (
                        <button onClick={() => sendCampaign(camp.id)} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold transition">
                          <Send className="h-3.5 w-3.5" /> Send Now
                        </button>
                      )}
                      <button onClick={() => deleteCampaign(camp.id)} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          }) : !showCreate && (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-12 text-center">
              <Send className="h-10 w-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/60">No campaigns yet.</p>
              <p className="text-xs text-white/50 mt-1">Create your first campaign to notify customers about new products or promotions.</p>
            </div>
          )}
        </div>
      )}

      {/* ════════ SUBSCRIBERS TAB ════════ */}
      {tab === "subscribers" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowAddSub(!showAddSub)} className="inline-flex items-center gap-1.5 rounded-xl bg-pink-500 px-4 py-2 text-xs font-semibold text-white hover:bg-pink-400 transition">
              <Plus className="h-3.5 w-3.5" /> Add Subscriber
            </button>
          </div>

          {/* Add Subscriber */}
          {showAddSub && (
            <div className="rounded-2xl border border-pink-500/20 bg-pink-500/[0.03] p-6 space-y-4">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Add Subscriber</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Email</label>
                  <input value={subEmail} onChange={e => setSubEmail(e.target.value)} type="email" placeholder="customer@example.com" className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Phone (SMS)</label>
                  <input value={subPhone} onChange={e => setSubPhone(e.target.value)} placeholder="+44 7700 900123" className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">First Name</label>
                  <input value={subFirst} onChange={e => setSubFirst(e.target.value)} placeholder="Sarah" className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Last Name</label>
                  <input value={subLast} onChange={e => setSubLast(e.target.value)} placeholder="Thompson" className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={subEmailOpt} onChange={e => setSubEmailOpt(e.target.checked)} className="h-4 w-4 rounded border-white/20 bg-white/[0.06] text-pink-500" />
                  <span className="text-sm text-white/70">Email opt-in</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={subSmsOpt} onChange={e => setSubSmsOpt(e.target.checked)} className="h-4 w-4 rounded border-white/20 bg-white/[0.06] text-pink-500" />
                  <span className="text-sm text-white/70">SMS opt-in</span>
                </label>
              </div>
              <div className="flex gap-2">
                <button onClick={addSubscriber} disabled={saving || (!subEmail && !subPhone)} className="inline-flex items-center gap-1.5 h-10 px-5 rounded-lg bg-pink-500 hover:bg-pink-400 disabled:opacity-50 text-white text-sm font-semibold transition">
                  <Plus className="h-4 w-4" /> {saving ? "Adding..." : "Add Subscriber"}
                </button>
                <button onClick={() => setShowAddSub(false)} className="h-10 px-4 rounded-lg bg-white/[0.06] text-white/50 text-sm hover:text-white transition">Cancel</button>
              </div>
            </div>
          )}

          {/* Subscriber List */}
          {active.length > 0 ? (
            <div className="space-y-1.5">
              {active.map(sub => (
                <div key={sub.id} className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-3">
                  <div className="h-9 w-9 rounded-xl bg-white/[0.06] flex items-center justify-center text-white/40 font-semibold text-sm">
                    {(sub.firstName?.[0] || sub.email?.[0] || "?").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{sub.firstName ? `${sub.firstName} ${sub.lastName}`.trim() : sub.email || sub.phone}</p>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      {sub.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{sub.email}</span>}
                      {sub.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{sub.phone}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {sub.emailOptIn && sub.email && <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-400">Email</span>}
                    {sub.smsOptIn && sub.phone && <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">SMS</span>}
                  </div>
                  <span className="hidden sm:inline rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-white/40">{sub.source}</span>
                  <button onClick={() => removeSubscriber(sub.id)} className="text-xs text-white/30 hover:text-red-400 transition">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : !showAddSub && (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-12 text-center">
              <Users className="h-10 w-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/60">No subscribers yet.</p>
              <p className="text-xs text-white/50 mt-1">Add subscribers manually or they'll be collected from checkout.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
