"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Play,
  Crown,
  Star,
  ShoppingBag,
  Stethoscope,
  GraduationCap,
  Sparkles,
  Briefcase,
  Cookie,
  Brain,
  BarChart3,
  CreditCard,
  Users,
  Shield,
} from "lucide-react";

const CLIENTS = [
  { name: "Taste of Motherland", icon: ShoppingBag },
  { name: "Styled by Maryam", icon: Sparkles },
  { name: "Vibrant Minds", icon: GraduationCap },
  { name: "Toks Mimi", icon: Cookie },
  { name: "Careceutical", icon: Stethoscope },
  { name: "BowSea", icon: Briefcase },
];

const capabilities = [
  { icon: Brain, label: "AI Integration" },
  { icon: CreditCard, label: "Payment & Fintech" },
  { icon: Users, label: "CRM & Leads" },
  { icon: BarChart3, label: "Analytics & BI" },
  { icon: Shield, label: "Cyber Security" },
  { icon: Briefcase, label: "Business Consulting" },
];

export function SplitHero() {
  return (
    <div className="relative w-full bg-[#1e1e1e] text-white overflow-hidden font-sans">
      <style>{`
        @keyframes splitHeroFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes splitHeroMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .split-hero-fade {
          animation: splitHeroFadeIn 0.8s ease-out forwards;
          opacity: 0;
        }
        .split-hero-marquee {
          animation: splitHeroMarquee 40s linear infinite;
        }
        .split-hero-d1 { animation-delay: 0.1s; }
        .split-hero-d2 { animation-delay: 0.2s; }
        .split-hero-d3 { animation-delay: 0.3s; }
        .split-hero-d4 { animation-delay: 0.4s; }
        .split-hero-d5 { animation-delay: 0.5s; }
      `}</style>

      {/* Background gradient + radial accents */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] via-[#ff8f70]/10 to-[#1e1e1e]" />
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-[#ff8f70]/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-[#8ab4f8]/8 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-32 pb-16 sm:px-6 md:pt-40 md:pb-24 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-start">
          {/* ─── LEFT COLUMN ─── */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-8 pt-8">
            {/* Badge */}
            <div className="split-hero-fade split-hero-d1">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#262626] px-3 py-1.5 backdrop-blur-md transition-colors hover:bg-[#2c2c2c]">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#9e9a94] flex items-center gap-2">
                  Digital Solution Architects
                  <Star className="w-3.5 h-3.5 text-[#ff8f70] fill-[#ff8f70]" />
                </span>
              </div>
            </div>

            {/* Heading */}
            <h1 className="split-hero-fade split-hero-d2 text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-medium tracking-tighter leading-[0.9]">
              We don&apos;t just build.{" "}
              <br />
              <span className="bg-gradient-to-br from-white via-white to-[#ff8f70] bg-clip-text text-transparent">
                We architect
              </span>
              <br />
              <span
                className="font-light italic text-white/60"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                growth.
              </span>
            </h1>

            {/* Description */}
            <p className="split-hero-fade split-hero-d3 max-w-xl text-lg text-[#9e9a94] leading-relaxed">
              From commerce platforms to AI integration, CRM to payment
              infrastructure — we consult, design, engineer, and scale
              world-class digital products for ambitious brands.
            </p>

            {/* CTA Buttons */}
            <div className="split-hero-fade split-hero-d4 flex flex-col sm:flex-row gap-4">
              <Link
                href="/get-started"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-zinc-950 transition-all hover:scale-[1.02] hover:bg-zinc-200 active:scale-[0.98]"
              >
                Start a Project
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#work"
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10 hover:border-white/20"
              >
                <Play className="w-4 h-4 fill-current" />
                See Our Work
              </Link>
            </div>
          </div>

          {/* ─── RIGHT COLUMN ─── */}
          <div className="lg:col-span-5 space-y-6 lg:mt-12">
            {/* Capabilities Card */}
            <div className="split-hero-fade split-hero-d5 relative overflow-hidden rounded-3xl bg-[#201f1f] p-8 backdrop-blur-xl shadow-2xl">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-[#ff8f70]/10 blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff8f70]/20 ring-1 ring-[#ff8f70]/30">
                    <Brain className="h-6 w-6 text-[#ff8f70]" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#9e9a94]">What we do</div>
                    <div className="text-lg font-bold text-white">Full-Spectrum Digital</div>
                  </div>
                </div>

                {/* Capability pills */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                  {capabilities.map((cap) => (
                    <div
                      key={cap.label}
                      className="flex items-center gap-2.5 rounded-xl bg-[#262626] px-3.5 py-2.5 transition-all hover:bg-[#2c2c2c]"
                    >
                      <cap.icon className="h-4 w-4 text-[#ff8f70] shrink-0" />
                      <span className="text-xs font-medium text-white/70">{cap.label}</span>
                    </div>
                  ))}
                </div>

                <div className="h-px w-full bg-white/10 mb-6" />

                {/* Industries */}
                <div className="flex flex-wrap gap-2">
                  {["Commerce", "SaaS", "Healthcare", "Education", "Fashion", "Food & Bev"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#262626] px-3 py-1 text-[10px] font-medium tracking-wide text-[#9e9a94]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Tag Pills */}
                <div className="mt-6 flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#ff8f70]/10 px-3 py-1 text-[10px] font-medium tracking-wide text-[#ff8f70]">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff8f70] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff8f70]" />
                    </span>
                    ACCEPTING PROJECTS
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#262626] px-3 py-1 text-[10px] font-medium tracking-wide text-[#9e9a94]">
                    <Crown className="w-3 h-3 text-[#ff8f70]" />
                    GDPR + PCI COMPLIANT
                  </div>
                </div>
              </div>
            </div>

            {/* Marquee Card */}
            <div className="split-hero-fade split-hero-d5 relative overflow-hidden rounded-3xl bg-[#201f1f] py-8 backdrop-blur-xl">
              <h3 className="mb-6 px-8 text-sm font-medium text-[#9e9a94]">
                Powering ambitious brands
              </h3>
              <div
                className="relative flex overflow-hidden"
                style={{
                  maskImage:
                    "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
                }}
              >
                <div className="split-hero-marquee flex gap-12 whitespace-nowrap px-4">
                  {[...CLIENTS, ...CLIENTS, ...CLIENTS].map((client, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 opacity-60 transition-all hover:opacity-100 hover:scale-105 cursor-default"
                    >
                      <client.icon className="h-5 w-5 text-[#ff8f70]" />
                      <span className="text-base font-semibold text-white tracking-tight">
                        {client.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
