"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ExpandingCards, type CardItem } from "@/components/ui/expanding-cards";
import { ClientShowcaseCards } from "@/components/ui/client-showcase-cards";
import ShaderHero from "@/components/ui/shader-hero";
import { StickyServiceSection } from "@/components/ui/sticky-scroll-cards-section";
import { BentoCapabilities } from "@/components/ui/bento-capabilities";
import { FloatingCTABanner } from "@/components/ui/contact-section";
import { TechStackSection } from "@/components/ui/tech-stack-section";
import {
  Code2,
  Palette,
  Search,
  Zap,
} from "lucide-react";

/* ─── Motion ─── */
const ease = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease, delay: i * 0.1 },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

/* ─── Data ─── */
const metrics = [
  { value: "99.9%", label: "Uptime" },
  { value: "4+", label: "Live Clients" },
  { value: "<2s", label: "Load Time" },
  { value: "4", label: "Industries" },
];

const processCards: CardItem[] = [
  {
    id: "discovery",
    title: "Discovery",
    description: "We map your business model, audience, and goals. No templates — everything is architected from your needs.",
    imgSrc: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
    icon: <Search size={24} />,
    linkHref: "#",
  },
  {
    id: "design",
    title: "Design",
    description: "Brand identity, UI/UX design, and interactive prototypes. You see and feel the product before a line of code.",
    imgSrc: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop",
    icon: <Palette size={24} />,
    linkHref: "#",
  },
  {
    id: "engineering",
    title: "Engineering",
    description: "Full-stack development on our multi-tenant platform. Production-grade infrastructure from day one.",
    imgSrc: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop",
    icon: <Code2 size={24} />,
    linkHref: "#",
  },
  {
    id: "launch",
    title: "Launch & Scale",
    description: "Deployment, monitoring, SEO, and ongoing iteration. We don't disappear after launch — we help you grow.",
    imgSrc: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
    icon: <Zap size={24} />,
    linkHref: "#",
  },
];

/* ─── Animated counter ─── */
function AnimatedMetric({ value, label }: { value: string; label: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <div ref={ref} className="relative text-center">
      <motion.p
        className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease }}
      >
        {value}
      </motion.p>
      <motion.p
        className="mt-2 text-xs font-medium tracking-[0.15em] text-gray-400 uppercase"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.2, ease }}
      >
        {label}
      </motion.p>
    </div>
  );
}

export default function PlatformLandingPage() {
  return (
    <div className="bg-white">
      {/* ═══ HERO ═══ */}
      <ShaderHero />

      {/* ═══ METRICS ═══ */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 sm:grid-cols-4 sm:gap-12">
          {metrics.map((m) => (
            <AnimatedMetric key={m.label} value={m.value} label={m.label} />
          ))}
        </div>
      </section>

      {/* ═══ SERVICES (sticky scroll) ═══ */}
      <StickyServiceSection />

      {/* ═══ CAPABILITIES (bento grid) ═══ */}
      <BentoCapabilities />

      {/* ═══ PROCESS (expanding cards) ═══ */}
      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Process
            </motion.p>
            <motion.h2 variants={fadeUp} className="mt-4 max-w-2xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              How we{" "}
              <span className="font-light italic text-gray-400" style={{ fontFamily: "var(--font-serif)" }}>
                bring it to life.
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 max-w-xl text-base text-gray-500">
              Hover over each phase to explore our end-to-end delivery process.
            </motion.p>
          </motion.div>

          <motion.div
            className="mt-12 flex justify-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease }}
          >
            <ExpandingCards
              items={processCards}
              defaultActiveIndex={0}
              className="rounded-2xl"
            />
          </motion.div>
        </div>
      </section>

      {/* ═══ CLIENT SHOWCASE ═══ */}
      <section id="work" className="relative overflow-hidden bg-gray-950 py-20 md:py-28">
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Selected Work
            </motion.p>
            <motion.h2 variants={fadeUp} className="mt-4 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Brands we&apos;ve{" "}
              <span className="font-light italic text-gray-500" style={{ fontFamily: "var(--font-serif)" }}>
                brought to life.
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 max-w-lg text-base text-gray-500">
              Hover each card to preview the live website.
            </motion.p>
          </motion.div>

          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease }}
          >
            <ClientShowcaseCards />
          </motion.div>
        </div>
      </section>

      {/* ═══ TECH STACK ═══ */}
      <TechStackSection />

      {/* ═══ Floating CTA Banner ═══ */}
      <FloatingCTABanner />
    </div>
  );
}
