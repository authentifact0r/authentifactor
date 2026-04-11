"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ExpandingCards, type CardItem } from "@/components/ui/expanding-cards";
import { ClientShowcaseCards } from "@/components/ui/client-showcase-cards";
import { SplitHero } from "@/components/ui/split-hero";
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
      <SplitHero />

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

      {/* ═══ TESTIMONIALS ═══ */}
      <TestimonialsSection
        title="Trusted by ambitious brands"
        subtitle="Hear from merchants and businesses growing on Authentifactor."
        columns={[
          {
            duration: 12,
            testimonials: [
              { text: "Authentifactor transformed our online presence. We went from zero to a fully functioning e-commerce store in under a week.", name: "Adetola O.", role: "Founder, Taste of Motherland", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80&fit=crop&crop=face" },
              { text: "The multi-tenant architecture means I can manage all my brands from one dashboard. Billing, inventory, analytics — everything in one place.", name: "Maryam K.", role: "CEO, Styled by Maryam", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80&fit=crop&crop=face" },
              { text: "The self-service signup blew my mind. I picked a plan, set up my store, and was selling within 20 minutes. No developer needed.", name: "Chioma N.", role: "Merchant, Beauty by Chi", image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&q=80&fit=crop&crop=face" },
            ],
          },
          {
            duration: 15,
            testimonials: [
              { text: "Having Paystack and Stripe built in was a game-changer. My Nigerian customers pay with bank transfer, my UK customers pay with card. Seamless.", name: "Tunde A.", role: "Founder, Toks Mimi Foods", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80&fit=crop&crop=face" },
              { text: "The marketplace feature drives organic traffic to my store. I got my first customer through the Authentifactor marketplace within days of listing.", name: "Folake D.", role: "Merchant, Spice Haven", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80&fit=crop&crop=face" },
              { text: "Apple Pay and Google Pay on checkout increased my conversion rate by 23%. Customers love the one-tap experience.", name: "James O.", role: "Store Owner", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80&fit=crop&crop=face" },
            ],
          },
          {
            duration: 11,
            testimonials: [
              { text: "The analytics dashboard gives me real-time insight into what's selling. I can see revenue trends, top products, and order status at a glance.", name: "Ngozi E.", role: "Fashion Merchant", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80&fit=crop&crop=face" },
              { text: "GDPR compliance, security headers, cookie consent — all built in. I didn't have to worry about any of it.", name: "David M.", role: "Tech Consultant", image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&q=80&fit=crop&crop=face" },
              { text: "The referral program is genius. I shared my code with 3 other business owners and they all signed up. Authentic word-of-mouth growth.", name: "Amina B.", role: "Grocery Merchant", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80&fit=crop&crop=face" },
            ],
          },
        ]}
      />

      {/* ═══ Floating CTA Banner ═══ */}
      <FloatingCTABanner />
    </div>
  );
}
