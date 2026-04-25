"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, Lock, Globe, Activity, AlertTriangle, CheckCircle,
  RefreshCw, Clock, Server, FileText, ExternalLink,
} from "lucide-react";

interface DomainResult {
  name: string;
  url: string;
  domain: string;
  ssl: { status: string; daysLeft: number | null; expiryDate: string | null };
  headers: { score: number; missing: string[]; present: string[] };
  uptime: { status: string; httpStatus: number; latencyMs: number };
}

interface ScanResult {
  score: number;
  grade: string;
  issues: { severity: string; message: string }[];
  domains: DomainResult[];
  scannedAt: string;
}

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

const gradeColor: Record<string, string> = {
  A: "text-emerald-400",
  B: "text-blue-400",
  C: "text-yellow-400",
  D: "text-orange-400",
  F: "text-red-400",
};

const gradeGlow: Record<string, string> = {
  A: "shadow-emerald-500/20",
  B: "shadow-blue-500/20",
  C: "shadow-yellow-500/20",
  D: "shadow-orange-500/20",
  F: "shadow-red-500/20",
};

export default function SecurityDashboard() {
  const [data, setData] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const runScan = async () => {
    setScanning(true);
    try {
      const res = await fetch("/api/security/scan");
      const result = await res.json();
      setData(result);
    } catch {
      // fail silently
    }
    setScanning(false);
    setLoading(false);
  };

  useEffect(() => { runScan(); }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8">
        <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin" />
        <p className="text-white/50 text-sm">Running security scan across all domains...</p>
        <p className="text-white/30 text-xs">Checking SSL, headers, uptime — this takes ~30s</p>
      </div>
    );
  }

  if (!data) return <p className="p-8 text-white/40">Scan failed.</p>;

  const sslOk = data.domains.filter((d) => d.ssl.status === "ok").length;
  const uptimeOk = data.domains.filter((d) => d.uptime.status === "up").length;
  const avgHeaders = Math.round(data.domains.reduce((s, d) => s + d.headers.score, 0) / data.domains.length);
  const avgLatency = Math.round(data.domains.filter((d) => d.uptime.status === "up").reduce((s, d) => s + d.uptime.latencyMs, 0) / (uptimeOk || 1));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-emerald-400" /> Security Posture
          </h1>
          <p className="text-sm text-white/40 mt-1">
            Scanned {data.scannedAt ? new Date(data.scannedAt).toLocaleString("en-GB") : "—"}
          </p>
        </div>
        <button
          onClick={runScan}
          disabled={scanning}
          className="inline-flex items-center gap-2 rounded-xl bg-white/[0.06] border border-white/[0.08] px-4 py-2 text-sm font-medium text-white/60 hover:bg-white/[0.1] hover:text-white transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${scanning ? "animate-spin" : ""}`} />
          {scanning ? "Scanning..." : "Re-scan"}
        </button>
      </div>

      {/* Score Hero */}
      <motion.div
        {...fade(0)}
        className={`rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-8 text-center shadow-lg ${gradeGlow[data.grade] || ""}`}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-2">Posture Score</p>
        <div className="flex items-center justify-center gap-4">
          <span className={`text-7xl font-black ${gradeColor[data.grade] || "text-white"}`}>{data.score}</span>
          <div className="text-left">
            <span className={`text-4xl font-bold ${gradeColor[data.grade] || "text-white"}`}>{data.grade}</span>
            <p className="text-xs text-white/40 mt-1">/100</p>
          </div>
        </div>
        <p className="text-sm text-white/50 mt-4">
          {data.score >= 80 ? "Security posture is strong." : data.score >= 60 ? "Posture needs attention." : "Critical issues detected."}
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "SSL Certs", value: `${sslOk}/${data.domains.length}`, icon: Lock, color: sslOk === data.domains.length ? "text-emerald-400" : "text-yellow-400" },
          { label: "Headers Avg", value: `${avgHeaders}/100`, icon: Shield, color: avgHeaders >= 70 ? "text-emerald-400" : "text-yellow-400" },
          { label: "Uptime", value: `${uptimeOk}/${data.domains.length}`, icon: Activity, color: uptimeOk === data.domains.length ? "text-emerald-400" : "text-red-400" },
          { label: "Avg Latency", value: `${avgLatency}ms`, icon: Clock, color: avgLatency < 500 ? "text-emerald-400" : "text-yellow-400" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            {...fade(0.05 + i * 0.05)}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-5"
          >
            <stat.icon className={`h-5 w-5 ${stat.color} mb-3`} />
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-white/40 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Issues */}
      {data.issues.length > 0 && (
        <motion.div {...fade(0.3)} className="rounded-2xl border border-yellow-500/20 bg-yellow-500/[0.04] p-6">
          <h3 className="text-sm font-semibold text-yellow-400 flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4" /> Issues ({data.issues.length})
          </h3>
          <div className="space-y-2">
            {data.issues.map((issue, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${issue.severity === "critical" ? "bg-red-400" : issue.severity === "warning" ? "bg-yellow-400" : "bg-blue-400"}`} />
                <span className="text-white/70">{issue.message}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Domain Table */}
      <motion.div {...fade(0.4)} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm overflow-hidden">
        <div className="p-5 border-b border-white/[0.06]">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Server className="h-4 w-4 text-white/50" /> Domain Status
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/[0.06] bg-white/[0.02]">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-white/40">Domain</th>
                <th className="px-5 py-3 text-center font-medium text-white/40">Uptime</th>
                <th className="px-5 py-3 text-center font-medium text-white/40">Latency</th>
                <th className="px-5 py-3 text-center font-medium text-white/40">SSL</th>
                <th className="px-5 py-3 text-center font-medium text-white/40">Headers</th>
                <th className="px-5 py-3 text-left font-medium text-white/40">Missing Headers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {data.domains.map((d) => (
                <tr key={d.domain} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 text-white/30" />
                      <div>
                        <p className="font-medium text-white">{d.name}</p>
                        <p className="text-[11px] text-white/30">{d.domain}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${d.uptime.status === "up" ? "text-emerald-400" : "text-red-400"}`}>
                      {d.uptime.status === "up" ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      {d.uptime.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs tabular-nums ${d.uptime.latencyMs < 500 ? "text-white/60" : "text-yellow-400"}`}>
                      {d.uptime.latencyMs}ms
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    {d.ssl.status === "ok" ? (
                      <span className="text-xs text-emerald-400">{d.ssl.daysLeft}d</span>
                    ) : d.ssl.status === "warning" ? (
                      <span className="text-xs text-yellow-400">{d.ssl.daysLeft}d ⚠</span>
                    ) : (
                      <span className="text-xs text-red-400">ERR</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs font-medium tabular-nums ${d.headers.score >= 70 ? "text-emerald-400" : d.headers.score >= 40 ? "text-yellow-400" : "text-red-400"}`}>
                      {d.headers.score}/100
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {d.headers.missing.length === 0 ? (
                      <span className="text-xs text-emerald-400">None</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {d.headers.missing.map((h) => (
                          <span key={h} className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] text-red-400">{h}</span>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div {...fade(0.5)} className="flex flex-wrap gap-3">
        <a
          href={`/api/security/scan`}
          target="_blank"
          className="inline-flex items-center gap-2 rounded-xl bg-white/[0.06] border border-white/[0.08] px-4 py-2 text-sm font-medium text-white/60 hover:bg-white/[0.1] hover:text-white transition"
        >
          <FileText className="h-4 w-4" /> Raw JSON
          <ExternalLink className="h-3 w-3" />
        </a>
      </motion.div>
    </div>
  );
}
