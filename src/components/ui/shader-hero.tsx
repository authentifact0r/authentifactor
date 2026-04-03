"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import dynamic from "next/dynamic";

// Render shaders only on client — avoids SSR hydration warnings from DOM props
const MeshGradient = dynamic(
  () => import("@paper-design/shaders-react").then((m) => m.MeshGradient),
  { ssr: false }
);

// Suppress shader library DOM prop warnings (backgroundColor, spotsPerColor etc.)
if (typeof window !== "undefined") {
  const _err = console.error;
  console.error = (...args: any[]) => {
    const s = String(args[0] || "");
    if (s.includes("does not recognize the") || s.includes("React does not recognize")) return;
    _err.apply(console, args);
  };
}

export default function ShaderHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleMouseEnter = () => setIsActive(true);
    const handleMouseLeave = () => setIsActive(false);
    const container = containerRef.current;
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
    }
    return () => {
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-black overflow-hidden">
      {/* SVG Filters */}
      <svg className="absolute inset-0 w-0 h-0" aria-hidden>
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02  0 1 0 0 0.02  0 0 1 0 0.05  0 0 0 0.9 0"
              result="tint"
            />
          </filter>
          <filter id="text-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* ── Shader Backgrounds ── */}
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={["#000000", "#059669", "#0891b2", "#064e3b", "#3b82f6"]}
        speed={0.25}
        backgroundColor="#000000"
      />
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-40"
        colors={["#000000", "#ffffff", "#10b981", "#3b82f6"]}
        speed={0.15}
        wireframe="true"
        backgroundColor="transparent"
      />

      {/* ── Dark scrims for text readability ── */}
      {/* Bottom-heavy gradient so text is always legible */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 pointer-events-none z-10" />
      {/* Left-side scrim for the text area */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent pointer-events-none z-10" />

      {/* ── Hero Content ── */}
      <main className="relative z-20 flex min-h-screen flex-col justify-end px-6 pb-16 pt-28 sm:px-10 md:px-16 lg:px-20 lg:pb-20">
        <div className="max-w-3xl">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center px-4 py-2 rounded-full bg-black/30 backdrop-blur-md mb-8 relative border border-white/[0.12]"
            style={{ filter: "url(#glass-effect)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="absolute top-0 left-1 right-1 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent rounded-full" />
            <span className="relative flex h-2 w-2 mr-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-white/90 text-sm font-medium relative z-10 tracking-wide">
              Now accepting new clients for Q3 2026
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="mb-8 leading-[1.05] tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.span
              className="block text-3xl sm:text-4xl md:text-5xl font-light mb-3 tracking-wider"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #10b981 40%, #3b82f6 70%, #ffffff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                backgroundSize: "200% auto",
                filter: "url(#text-glow) drop-shadow(0 2px 8px rgba(0,0,0,0.5))",
              }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              We architect
            </motion.span>
            <span
              className="block text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white"
              style={{ textShadow: "0 4px 24px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.4)" }}
            >
              Digital
            </span>
            <span
              className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-white/90 italic"
              style={{
                fontFamily: "var(--font-serif)",
                textShadow: "0 4px 24px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.4)",
              }}
            >
              Infrastructure
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            className="text-base sm:text-lg md:text-xl font-light text-white/70 mb-10 leading-relaxed max-w-xl"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            From commerce platforms to brand experiences — we design, engineer, and
            scale world-class digital products for ambitious businesses.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex items-center gap-4 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <motion.button
              onClick={() => window.dispatchEvent(new Event("open-contact-form"))}
              className="inline-flex items-center gap-2.5 px-10 py-4 rounded-full bg-white text-gray-950 font-semibold text-[15px] cursor-pointer shadow-[0_8px_32px_rgba(255,255,255,0.15)] hover:shadow-[0_8px_40px_rgba(255,255,255,0.25)] transition-shadow"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Start a Project
              <ArrowRight className="h-4 w-4" />
            </motion.button>
            <Link href="#work">
              <motion.span
                className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-black/30 border border-white/20 text-white font-medium text-[15px] cursor-pointer backdrop-blur-md hover:bg-white/10 hover:border-white/40 transition-all"
                style={{ textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                View Our Work
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </main>

    </div>
  );
}
