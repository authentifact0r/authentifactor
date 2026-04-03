"use client";

import React, { useEffect, useRef, useState } from "react";
import { Layers, Zap, ShieldCheck, BarChart3, Workflow, Database } from "lucide-react";

function BentoCapabilities() {
  const [sectionVisible, setSectionVisible] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const id = "bento-cap-animations";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = `
      @keyframes bento-cap-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-6%); }
      }
      @keyframes bento-cap-pulse {
        0%, 100% { transform: scale(1); opacity: 0.85; }
        50% { transform: scale(1.08); opacity: 1; }
      }
      @keyframes bento-cap-tilt {
        0% { transform: rotate(-2deg); }
        50% { transform: rotate(2deg); }
        100% { transform: rotate(-2deg); }
      }
      @keyframes bento-cap-drift {
        0%, 100% { transform: translate3d(0, 0, 0); }
        50% { transform: translate3d(6%, -6%, 0); }
      }
      @keyframes bento-cap-glow {
        0%, 100% { opacity: 0.6; filter: drop-shadow(0 0 0 rgba(255,255,255,0.2)); }
        50% { opacity: 1; filter: drop-shadow(0 0 6px rgba(255,255,255,0.15)); }
      }
      @keyframes bento-cap-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes bento-cap-intro {
        0% { opacity: 0; transform: translate3d(0, 28px, 0); }
        100% { opacity: 1; transform: translate3d(0, 0, 0); }
      }
      @keyframes bento-cap-card {
        0% { opacity: 0; transform: translate3d(0, 18px, 0) scale(0.96); }
        100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
      }
    `;
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, []);

  useEffect(() => {
    if (!sectionRef.current || typeof window === "undefined") return;
    const node = sectionRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setSectionVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      title: "Multi-Tenant Architecture",
      blurb: "Isolated data, shared infrastructure. Each tenant gets their own world within one platform — scale without limits.",
      meta: "Core",
      icon: Layers,
      animation: "bento-cap-float 6s ease-in-out infinite",
    },
    {
      title: "Edge Performance",
      blurb: "Server components, ISR, edge caching. Every page optimised for Core Web Vitals and sub-2s load times.",
      meta: "Speed",
      icon: Zap,
      animation: "bento-cap-pulse 4s ease-in-out infinite",
    },
    {
      title: "Enterprise Security",
      blurb: "JWT rotation, encrypted payments, RBAC, audit logging, and GDPR-ready data handling across every tenant.",
      meta: "Trust",
      icon: ShieldCheck,
      animation: "bento-cap-tilt 5.5s ease-in-out infinite",
    },
    {
      title: "Analytics & Insights",
      blurb: "Real-time dashboards, conversion tracking, inventory alerts, and revenue analytics at your fingertips.",
      meta: "Data",
      icon: BarChart3,
      animation: "bento-cap-drift 8s ease-in-out infinite",
    },
    {
      title: "Automation Engine",
      blurb: "Webhook pipelines, scheduled jobs, email triggers, and subscription lifecycle automation — hands-free ops.",
      meta: "Ops",
      icon: Workflow,
      animation: "bento-cap-glow 7s ease-in-out infinite",
    },
    {
      title: "Data Architecture",
      blurb: "PostgreSQL with Prisma ORM, multi-warehouse inventory, and tenant-scoped data isolation by default.",
      meta: "DB",
      icon: Database,
      animation: "bento-cap-spin 20s linear infinite",
    },
  ];

  const spans = [
    "md:col-span-4 md:row-span-2",
    "md:col-span-2 md:row-span-1",
    "md:col-span-2 md:row-span-1",
    "md:col-span-2 md:row-span-1",
    "md:col-span-2 md:row-span-1",
    "md:col-span-2 md:row-span-1",
  ];

  return (
    <div className="relative w-full bg-[#030303] text-white overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-30 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 100% at 12% 0%, rgba(16,185,129,0.12), transparent 65%), radial-gradient(ellipse 40% 80% at 88% 0%, rgba(59,130,246,0.08), transparent 70%), #030303",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            maskImage:
              "repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px)",
            WebkitMaskImage:
              "repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px)",
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
            opacity: 0.7,
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(circle at center, rgba(0,0,0,0) 55%, #030303 100%)",
            filter: "blur(40px)",
            opacity: 0.75,
          }}
        />
      </div>

      <section
        ref={sectionRef}
        className={`relative mx-auto max-w-6xl px-6 py-20 md:py-28 motion-safe:opacity-0 ${
          sectionVisible ? "motion-safe:animate-[bento-cap-intro_0.9s_ease-out_forwards]" : ""
        }`}
      >
        {/* Header */}
        <header className="mb-12 flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.3em] text-emerald-400/80">
              Capabilities
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
              Enterprise-grade platform,{" "}
              <span
                className="font-light italic text-white/40"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                startup velocity.
              </span>
            </h2>
          </div>
          <p className="max-w-sm text-sm text-white/50 md:text-base md:text-right">
            Battle-tested infrastructure with modular architecture, security by default, and real-time observability.
          </p>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-3 md:auto-rows-[minmax(140px,auto)] md:grid-cols-6">
          {features.map((feature, index) => (
            <BentoCard
              key={feature.title}
              span={spans[index]}
              feature={feature}
              index={index}
              isVisible={sectionVisible}
            />
          ))}
        </div>

        {/* Footer */}
      </section>
    </div>
  );
}

function BentoCard({
  feature,
  span = "",
  index = 0,
  isVisible = false,
}: {
  feature: {
    title: string;
    blurb: string;
    meta: string;
    icon: React.ElementType;
    animation: string;
  };
  span?: string;
  index?: number;
  isVisible?: boolean;
}) {
  const { icon: Icon, animation, title, blurb, meta } = feature;
  const animationDelay = `${Math.max(index * 0.12, 0)}s`;

  return (
    <article
      className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white/[0.15] hover:bg-white/[0.05] hover:shadow-[0_28px_70px_rgba(0,0,0,0.55)] motion-safe:opacity-0 ${
        isVisible ? "motion-safe:animate-[bento-cap-card_0.8s_ease-out_forwards]" : ""
      } ${span}`}
      style={{ animationDelay }}
    >
      {/* Gradient fill */}
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-white/[0.03]" />
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(ellipse 60% 120% at 12% 0%, rgba(16,185,129,0.15), transparent 72%)",
          }}
        />
      </div>

      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.06]">
          <Icon
            className="h-6 w-6 text-white"
            strokeWidth={1.5}
            style={{ animation }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <header className="flex items-start gap-3">
            <h3 className="text-base font-semibold tracking-wide text-white">
              {title}
            </h3>
            {meta && (
              <span className="ml-auto shrink-0 rounded-full border border-white/[0.1] px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] text-white/50">
                {meta}
              </span>
            )}
          </header>
          <p className="mt-2 text-sm leading-relaxed text-white/50">
            {blurb}
          </p>
        </div>
      </div>
    </article>
  );
}

export default BentoCapabilities;
export { BentoCapabilities };
