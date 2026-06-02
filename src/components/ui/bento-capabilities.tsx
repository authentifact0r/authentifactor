"use client";

import React, { useEffect, useState } from "react";
import { 
  Layers, 
  Zap, 
  ShieldCheck, 
  BarChart3, 
  Workflow, 
  Brain, 
  Globe, 
  Cpu, 
  Database, 
  Activity, 
  Terminal,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { BentoGridShowcase } from "./bento-grid-showcase";

export function BentoCapabilities() {
  const [dotsActive, setDotsActive] = useState(0);

  // Dynamic animation trigger for mini-diagram
  useEffect(() => {
    const timer = setInterval(() => {
      setDotsActive((prev) => (prev + 1) % 4);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  // ─── Slot 1: Tall Integration Hub (Multi-Tenant Gateway) ───
  const integrationSlot = (
    <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-[#141414] p-6 border border-white/10 shadow-2xl transition-all duration-300 hover:border-white/20 hover:bg-[#1a1a1a]">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_80%_at_50%_-20%,rgba(45,212,160,0.12),transparent_70%)]" />
      <div className="absolute inset-0 -z-10 bg-[#0e0e0e]/40 opacity-70" />
      
      <div className="space-y-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2DD4A0]/10 border border-[#2DD4A0]/20 text-[#2DD4A0]">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#2DD4A0]/80">Architecture</span>
          <h3 className="text-lg font-bold text-white mt-1">Multi-Tenant Gateway</h3>
          <p className="text-xs text-white/50 mt-1 leading-relaxed">
            Shared infrastructure, complete tenancy isolation. Scale from a single site to a multi-brand ecosystem instantly.
          </p>
        </div>
      </div>

      {/* Visual Diagram */}
      <div className="relative mt-6 flex-1 min-h-[180px] rounded-xl border border-white/5 bg-black/40 p-4 flex flex-col justify-between overflow-hidden">
        {/* Connection pipeline lines */}
        <div className="absolute left-[37px] top-8 bottom-8 w-[2px] bg-gradient-to-b from-[#2DD4A0]/60 via-[#38BDF8]/40 to-transparent" />
        
        {/* Node 1: Request In */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black border border-white/10 text-white/80">
            <Globe className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-semibold text-white/90">Global Request</div>
            <div className="text-[8px] text-white/40">platform.authentifactor.com</div>
          </div>
        </div>

        {/* Node 2: Router */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black border border-[#2DD4A0]/30 text-[#2DD4A0]">
            <Cpu className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-semibold text-white/90">Smart Tenant Router</div>
            <div className="text-[8px] text-[#2DD4A0]/70 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2DD4A0] animate-pulse" /> Active
            </div>
          </div>
        </div>

        {/* Node 3: Isolated Tenants */}
        <div className="pl-12 space-y-2">
          <div className={`flex items-center gap-2 text-[9px] transition-opacity duration-300 ${dotsActive === 1 ? "opacity-100 text-white font-medium" : "opacity-40 text-white/60"}`}>
            <span className={`h-2 w-2 rounded-full bg-[#38BDF8] ${dotsActive === 1 ? "animate-ping" : ""}`} />
            Taste of Motherland
          </div>
          <div className={`flex items-center gap-2 text-[9px] transition-opacity duration-300 ${dotsActive === 2 ? "opacity-100 text-white font-medium" : "opacity-40 text-white/60"}`}>
            <span className={`h-2 w-2 rounded-full bg-[#E11D48] ${dotsActive === 2 ? "animate-ping" : ""}`} />
            Styled by Maryam
          </div>
          <div className={`flex items-center gap-2 text-[9px] transition-opacity duration-300 ${dotsActive === 3 ? "opacity-100 text-white font-medium" : "opacity-40 text-white/60"}`}>
            <span className={`h-2 w-2 rounded-full bg-[#2DD4A0] ${dotsActive === 3 ? "animate-ping" : ""}`} />
            CareDocks
          </div>
        </div>
      </div>
    </article>
  );

  // ─── Slot 2: Ruflo Swarms (Trackers) ───
  const trackersSlot = (
    <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-[#141414] p-6 border border-white/10 shadow-2xl transition-all duration-300 hover:border-white/20 hover:bg-[#1a1a1a]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_80%_at_80%_20%,rgba(56,189,248,0.08),transparent_70%)]" />
      <div className="absolute inset-0 -z-10 bg-[#0e0e0e]/40 opacity-70" />
      
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#2DD4A0] animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#38BDF8]">Ruflo Swarms</span>
          </div>
          <h3 className="text-base font-bold text-white mt-1">Swarm Coordinator</h3>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-[#38BDF8]">
          <Activity className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/5 pt-3">
        <div className="space-y-1">
          <div className="text-[9px] text-white/40">Active Swarm</div>
          <div className="text-xs font-semibold text-white/90">Tenant Intelligence</div>
        </div>
        <div className="flex -space-x-1.5 overflow-hidden">
          <span className="inline-block h-5 w-5 rounded-full bg-[#202020] border border-white/10 text-[8px] flex items-center justify-center text-[#2DD4A0]">V</span>
          <span className="inline-block h-5 w-5 rounded-full bg-[#202020] border border-white/10 text-[8px] flex items-center justify-center text-[#38BDF8]">G</span>
          <span className="inline-block h-5 w-5 rounded-full bg-[#202020] border border-white/10 text-[8px] flex items-center justify-center text-[#E11D48]">B</span>
        </div>
      </div>
    </article>
  );

  // ─── Slot 3: Performance (Statistic) ───
  const statisticSlot = (
    <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-[#141414] p-6 border border-white/10 shadow-2xl transition-all duration-300 hover:border-white/20 hover:bg-[#1a1a1a]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_80%_at_20%_80%,rgba(45,212,160,0.08),transparent_70%)]" />
      <div className="absolute inset-0 -z-10 bg-[#0e0e0e]/40 opacity-70" />
      
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">Core Web Vitals</span>
          <div className="text-2xl font-black text-white tracking-tight mt-1 flex items-baseline gap-1">
            99.98%
          </div>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/80">
          <Zap className="h-4 w-4" />
        </div>
      </div>

      <div className="text-[10px] text-white/50 leading-relaxed mt-2">
        Sub-2s global page load latency via edge-optimized caching and serverless Cloud Run.
      </div>
    </article>
  );

  // ─── Slot 4: Scoped Vaults (Focus) ───
  const focusSlot = (
    <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-[#141414] p-6 border border-white/10 shadow-2xl transition-all duration-300 hover:border-white/20 hover:bg-[#1a1a1a]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,rgba(124,58,237,0.06),transparent_70%)]" />
      <div className="absolute inset-0 -z-10 bg-[#0e0e0e]/40 opacity-70" />
      
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#7C3AED]">Security</span>
          <h3 className="text-base font-bold text-white mt-1">Scoped Vaults</h3>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#7C3AED]">
          <Database className="h-4 w-4" />
        </div>
      </div>

      <p className="text-xs text-white/50 leading-relaxed mt-2">
        100% relational isolation via instance-per-project database routing. No shared credentials, schemas, or pools.
      </p>
    </article>
  );

  // ─── Slot 5: Cognitive Router (Productivity) ───
  const productivitySlot = (
    <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-[#141414] p-6 border border-white/10 shadow-2xl transition-all duration-300 hover:border-white/20 hover:bg-[#1a1a1a]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,rgba(225,29,72,0.06),transparent_70%)]" />
      <div className="absolute inset-0 -z-10 bg-[#0e0e0e]/40 opacity-70" />
      
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#E11D48]">AI Intelligence</span>
          <h3 className="text-base font-bold text-white mt-1">Cognitive Router</h3>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E11D48]/10 border border-[#E11D48]/20 text-[#E11D48]">
          <Brain className="h-4 w-4" />
        </div>
      </div>

      <p className="text-xs text-white/50 leading-relaxed mt-2">
        Frontier LLM router dynamically balancing tasks across local Ollama deployments and deep API fallback engines.
      </p>
    </article>
  );

  // ─── Slot 6: Developer CLI Console (Shortcuts - Wide) ───
  const shortcutsSlot = (
    <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-[#141414] p-6 border border-white/10 shadow-2xl transition-all duration-300 hover:border-white/20 hover:bg-[#1a1a1a]">
      {/* Background patterns */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_80%_at_0%_100%,rgba(56,189,248,0.06),transparent_70%)]" />
      <div className="absolute inset-0 -z-10 bg-[#0e0e0e]/40 opacity-70" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">Developer Panel</span>
            <span className="rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/20 px-2 py-0.5 text-[8px] text-[#38BDF8] font-mono">ruflo-cli v1.4</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">Command Suite Console</h3>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/80 shrink-0">
          <Terminal className="h-5 w-5" />
        </div>
      </div>

      {/* Code Console Simulation */}
      <div className="mt-4 flex-1 rounded-xl border border-white/5 bg-black/60 p-4 font-mono text-[10px] text-white/70 leading-relaxed space-y-1.5 relative overflow-hidden min-h-[90px]">
        <div className="flex items-center gap-1.5 text-white/30 border-b border-white/5 pb-2 mb-2">
          <span className="h-2 w-2 rounded-full bg-[#FF5F57]" />
          <span className="h-2 w-2 rounded-full bg-[#FEBC2E]" />
          <span className="h-2 w-2 rounded-full bg-[#28C840]" />
          <span className="ml-2 text-[8px] uppercase tracking-[0.1em]">ruflo.config.js</span>
        </div>
        <div className="text-white/40">$ ruflo run security-posture</div>
        <div className="text-[#38BDF8]">[ruflo] SSL scan completed ➔ GRADE A+</div>
        <div className="text-[#2DD4A0]">[ruflo] HTTP Headers: HSTS, CSP injection verified (100% OK)</div>
        <div className="text-white/70">[ruflo] Swarm completed successfully. <span className="h-3 w-1.5 bg-[#2DD4A0] inline-block animate-pulse align-middle ml-1" /></div>
      </div>
    </article>
  );

  return (
    <div className="relative w-full bg-[#0e0e0e] text-white overflow-hidden">
      {/* Ambient background lines & overlays */}
      <div className="absolute inset-0 -z-30 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 100% at 12% 0%, rgba(45,212,160,0.06), transparent 65%), radial-gradient(ellipse 40% 80% at 88% 0%, rgba(56,189,248,0.05), transparent 70%), #0e0e0e",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            maskImage:
              "repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px)",
            WebkitMaskImage:
              "repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px)",
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
            opacity: 0.6,
          }}
        />
      </div>

      <section className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
        {/* Header */}
        <header className="mb-12 flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.3em] text-[#2DD4A0] flex items-center gap-1.5 font-semibold">
              <Sparkles className="h-3 w-3" /> Capabilities
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
              Enterprise-grade scale,{" "}
              <span
                className="font-light italic text-white/40"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                startup velocity.
              </span>
            </h2>
          </div>
          <p className="max-w-sm text-sm text-white/50 md:text-base md:text-right">
            Battle-tested infrastructure with Ruflo AI swarm orchestrations, absolute data privacy, and intelligent cloud distribution.
          </p>
        </header>

        {/* Bento Grid Showcase Integration */}
        <BentoGridShowcase
          integration={integrationSlot}
          trackers={trackersSlot}
          statistic={statisticSlot}
          focus={focusSlot}
          productivity={productivitySlot}
          shortcuts={shortcutsSlot}
        />
      </section>
    </div>
  );
}

export default BentoCapabilities;
