"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ExpandingCards, type CardItem } from "@/components/ui/expanding-cards";
import { ClientShowcaseCards } from "@/components/ui/client-showcase-cards";
import { SplitHero } from "@/components/ui/split-hero";
import { StickyServiceSection } from "@/components/ui/sticky-scroll-cards-section";
import { BentoCapabilities } from "@/components/ui/bento-capabilities";
import { FloatingCTABanner } from "@/components/ui/contact-section";
import { TechStackSection } from "@/components/ui/tech-stack-section";
import {
  Code2,
  Compass,
  Layers,
  Rocket,
} from "lucide-react";
import { TestimonialsSection } from "@/components/ui/testimonials-column";

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
const processCards: CardItem[] = [
  {
    id: "discovery",
    title: "Discovery & Strategy",
    description: "We map your business model, market, audience, and growth levers. No templates — every engagement starts with deep research and strategic clarity.",
    imgSrc: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
    icon: <Compass size={24} />,
    linkHref: "/get-started",
  },
  {
    id: "architecture",
    title: "Architecture & Design",
    description: "Brand identity, system design, integration mapping, and interactive prototypes. You see the solution before we build it.",
    imgSrc: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop",
    icon: <Layers size={24} />,
    linkHref: "/get-started",
  },
  {
    id: "engineering",
    title: "Engineering & Integration",
    description: "Full-stack development, AI integration, CRM wiring, payment infrastructure, and API orchestration. Production-grade from day one.",
    imgSrc: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop",
    icon: <Code2 size={24} />,
    linkHref: "/get-started",
  },
  {
    id: "launch",
    title: "Launch & Growth",
    description: "Deployment, analytics, SEO, lead generation, and ongoing optimisation. We don't disappear after launch — we partner on growth.",
    imgSrc: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
    icon: <Rocket size={24} />,
    linkHref: "/get-started",
  },
];

export default function PlatformLandingPage() {
  return (
    <div className="bg-white">
      {/* ═══ HERO ═══ */}
      <SplitHero />

      {/* ═══ SERVICES (sticky scroll) ═══ */}
      <StickyServiceSection />

      {/* ═══ CAPABILITIES (bento grid) ═══ */}
      <div id="capabilities">
        <BentoCapabilities />
      </div>

      {/* ═══ PROCESS (expanding cards) ═══ */}
      <section id="process" className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Our Process
            </motion.p>
            <motion.h2 variants={fadeUp} className="mt-4 max-w-2xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              How we{" "}
              <span className="font-light italic text-gray-400" style={{ fontFamily: "var(--font-serif)" }}>
                bring it to life.
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 max-w-xl text-base text-gray-500">
              From first conversation to live product — a proven methodology refined across dozens of projects.
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

      {/* ═══ TESTIMONIALS ═══ */}
      <TestimonialsSection
        title="Trusted by ambitious brands"
        subtitle="Hear from founders and businesses growing with Authentifactor."
        columns={[
          {
            duration: 12,
            testimonials: [
              { text: "Authentifactor didn't just build our store — they architected our entire digital strategy. Commerce, payments, brand identity, analytics, all unified.", name: "Adetola O.", role: "Founder, Taste of Motherland", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80&fit=crop&crop=face" },
              { text: "The AI integration into our customer workflows saved us 15 hours a week. They think like solution architects, not just developers.", name: "Maryam K.", role: "CEO, Styled by Maryam", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80&fit=crop&crop=face" },
              { text: "From CRM setup to payment gateway integration, they handled the entire digital transformation. We went from spreadsheets to a proper platform in weeks.", name: "Chioma N.", role: "Founder, Beauty by Chi", image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&q=80&fit=crop&crop=face" },
            ],
          },
          {
            duration: 15,
            testimonials: [
              { text: "Having Paystack and Stripe built in was a game-changer. My Nigerian customers pay with bank transfer, my UK customers pay with card. Seamless.", name: "Tunde A.", role: "Founder, Toks Mimi Foods", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80&fit=crop&crop=face" },
              { text: "The lead generation strategy they built for us tripled our inbound enquiries. Real consulting, not just code.", name: "Folake D.", role: "Managing Director, Spice Haven", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80&fit=crop&crop=face" },
              { text: "They integrated our brand story across every touchpoint — website, email, social, packaging. The consistency transformed how customers see us.", name: "James O.", role: "Brand Director", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80&fit=crop&crop=face" },
            ],
          },
          {
            duration: 11,
            testimonials: [
              { text: "The analytics dashboard gives me real-time insight into what's converting. I can see revenue trends, customer segments, and ROI at a glance.", name: "Ngozi E.", role: "COO, Fashion Brand", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80&fit=crop&crop=face" },
              { text: "GDPR compliance, PCI-DSS, security headers, cookie consent — all built in. Enterprise-grade without the enterprise price tag.", name: "David M.", role: "CTO, Tech Startup", image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&q=80&fit=crop&crop=face" },
              { text: "They don't just build and leave. The ongoing consulting and optimisation is what sets them apart. True partners, not vendors.", name: "Amina B.", role: "Founder, Grocery Brand", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80&fit=crop&crop=face" },
            ],
          },
        ]}
      />

      {/* ═══ Floating CTA Banner ═══ */}
      <FloatingCTABanner />
    </div>
  );
}
