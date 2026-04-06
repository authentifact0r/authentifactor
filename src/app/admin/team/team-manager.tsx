"use client";
import { apiUrl } from "@/lib/api";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users, UserPlus, Trash2, ChevronDown, ChevronRight,
  Shield, ShieldCheck, User, Mail, Phone, Crown,
} from "lucide-react";

interface Member {
  id: string;
  role: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Props {
  members: Member[];
  tenantSlug: string;
}

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  ADMIN: { label: "Admin", color: "bg-emerald-500/15 text-emerald-400", icon: Crown },
  MANAGER: { label: "Manager", color: "bg-blue-500/15 text-blue-400", icon: ShieldCheck },
  CUSTOMER: { label: "Customer", color: "bg-white/10 text-white/50", icon: User },
};

export function TeamManager({ members, tenantSlug }: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Invite form
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MANAGER");

  const admins = members.filter(m => m.role === "ADMIN").length;
  const managers = members.filter(m => m.role === "MANAGER").length;

  const invite = async () => {
    if (!email.trim()) return;
    setError(""); setSuccess("");
    setSaving(true);
    try {
      const res = await fetch(apiUrl("/api/admin/team/invite"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed"); setSaving(false); return; }
      setSuccess(`${email} added as ${role}`);
      setEmail(""); setRole("MANAGER"); setShowInvite(false);
      setSaving(false);
      router.refresh();
    } catch { setError("Network error"); setSaving(false); }
  };

  const changeRole = async (memberId: string, newRole: string) => {
    await fetch(apiUrl("/api/admin/team/update"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: memberId, role: newRole }),
    });
    router.refresh();
  };

  const removeMember = async (memberId: string, name: string) => {
    if (!confirm(`Remove ${name} from the team?`)) return;
    const res = await fetch(apiUrl("/api/admin/team/remove"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: memberId }),
    });
    if (!res.ok) { const e = await res.json(); alert(e.error || "Failed"); return; }
    router.refresh();
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-violet-400" /> Team
          </h1>
          <p className="text-sm text-white/60 mt-1">{members.length} members · {admins} admin{admins !== 1 ? "s" : ""} · {managers} manager{managers !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => { setShowInvite(!showInvite); setError(""); setSuccess(""); }} className="inline-flex items-center gap-1.5 rounded-xl bg-violet-500 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-400 transition">
          <UserPlus className="h-3.5 w-3.5" /> Invite Member
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4 text-sm text-red-400">{error}</div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4 text-sm text-emerald-400">{success}</div>
      )}

      {/* Invite Form */}
      {showInvite && (
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.03] p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Invite Team Member</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Email Address</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="colleague@example.com" className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition" />
              <p className="text-xs text-white/40 mt-1">User must have an existing account, or enter any email to create one.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Role</label>
              <select value={role} onChange={e => setRole(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition">
                <option value="MANAGER" className="bg-gray-900">Manager — can manage products, orders, inventory</option>
                <option value="ADMIN" className="bg-gray-900">Admin — full access including team & billing</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={invite} disabled={saving || !email.trim()} className="inline-flex items-center gap-1.5 h-10 px-5 rounded-lg bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white text-sm font-semibold transition">
              <UserPlus className="h-4 w-4" /> {saving ? "Inviting..." : "Add to Team"}
            </button>
            <button onClick={() => setShowInvite(false)} className="h-10 px-4 rounded-lg bg-white/[0.06] text-white/50 text-sm hover:text-white transition">Cancel</button>
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="space-y-2">
        {members.map(member => {
          const isOpen = expanded === member.id;
          const config = ROLE_CONFIG[member.role] || ROLE_CONFIG.CUSTOMER;
          const Icon = config.icon;
          const name = `${member.firstName} ${member.lastName}`.trim() || member.email;

          return (
            <div key={member.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : member.id)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors text-left">
                <div className="h-10 w-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-white/40 font-semibold text-sm">
                  {member.firstName?.[0]?.toUpperCase() || member.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{name}</p>
                  <p className="text-xs text-white/50">{member.email}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${config.color}`}>
                  <Icon className="h-3 w-3 inline mr-1" />{config.label}
                </span>
                <span className="hidden sm:inline text-xs text-white/40">{new Date(member.createdAt).toLocaleDateString("en-GB")}</span>
                {isOpen ? <ChevronDown className="h-4 w-4 text-white/50" /> : <ChevronRight className="h-4 w-4 text-white/50" />}
              </button>

              {isOpen && (
                <div className="border-t border-white/[0.04] bg-white/[0.01] p-5 space-y-4">
                  {/* Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-start gap-2">
                      <User className="h-3.5 w-3.5 text-white/30 mt-0.5" />
                      <div>
                        <p className="text-xs text-white/60">Name</p>
                        <p className="text-white">{name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mail className="h-3.5 w-3.5 text-white/30 mt-0.5" />
                      <div>
                        <p className="text-xs text-white/60">Email</p>
                        <p className="text-white/70">{member.email}</p>
                      </div>
                    </div>
                    {member.phone && (
                      <div className="flex items-start gap-2">
                        <Phone className="h-3.5 w-3.5 text-white/30 mt-0.5" />
                        <div>
                          <p className="text-xs text-white/60">Phone</p>
                          <p className="text-white/70">{member.phone}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <Shield className="h-3.5 w-3.5 text-white/30 mt-0.5" />
                      <div>
                        <p className="text-xs text-white/60">Joined</p>
                        <p className="text-white/70">{new Date(member.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/50">Change role:</span>
                      {["ADMIN", "MANAGER", "CUSTOMER"].map(r => {
                        const rc = ROLE_CONFIG[r] || ROLE_CONFIG.CUSTOMER;
                        const isCurrentRole = member.role === r;
                        return (
                          <button
                            key={r}
                            onClick={() => !isCurrentRole && changeRole(member.id, r)}
                            disabled={isCurrentRole}
                            className={`h-8 px-3 rounded-lg text-xs font-medium transition ${
                              isCurrentRole
                                ? `${rc.color} opacity-100 cursor-default`
                                : "bg-white/[0.06] text-white/40 hover:bg-white/[0.1] hover:text-white/70"
                            }`}
                          >
                            {rc.label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="ml-auto">
                      <button onClick={() => removeMember(member.id, name)} className="inline-flex items-center gap-1.5 h-8 px-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition">
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {members.length === 0 && !showInvite && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-12 text-center">
          <Users className="h-10 w-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/60">No team members yet.</p>
          <p className="text-xs text-white/50 mt-1">Invite people to help manage your store.</p>
        </div>
      )}
    </div>
  );
}

