import Link from "next/link";
import {
  Globe,
  CreditCard,
  Truck,
  Palette,
  RefreshCw,
  Smartphone,
  Store,
  ShieldCheck,
  Search,
  BarChart3,
  Layers,
  Code2,
} from "lucide-react";

const services = [
  {
    icon: Store,
    title: "E-Commerce",
    description:
      "Full-featured online stores with inventory, payments, shipping, and subscriptions built in.",
  },
  {
    icon: Globe,
    title: "Custom Domains & Websites",
    description:
      "Your brand, your domain, your identity. We design and build professional web experiences.",
  },
  {
    icon: Palette,
    title: "Brand Identity",
    description:
      "Custom branding, color schemes, logos, and design systems tailored to your business.",
  },
  {
    icon: CreditCard,
    title: "Payment Integration",
    description:
      "Accept payments via Paystack, Stripe, and more. Ready for African and global markets.",
  },
  {
    icon: Search,
    title: "SEO & Digital Marketing",
    description:
      "Built-in SEO tools, structured data, sitemaps, and analytics to grow your online presence.",
  },
  {
    icon: Truck,
    title: "Logistics & Shipping",
    description:
      "Weight-based shipping rules, local delivery, multi-warehouse routing, and carrier integration.",
  },
  {
    icon: Smartphone,
    title: "Mobile Apps",
    description:
      "White-label mobile experiences. Your brand in your customers' pockets across iOS and Android.",
  },
  {
    icon: RefreshCw,
    title: "Subscriptions & Recurring",
    description:
      "Auto-ship, subscription boxes, and recurring billing for predictable revenue.",
  },
  {
    icon: Layers,
    title: "Multi-Tenant Architecture",
    description:
      "Each client gets isolated data, admin dashboards, and custom configurations on shared infrastructure.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description:
      "Dashboards, order tracking, inventory alerts, and revenue reporting at your fingertips.",
  },
  {
    icon: ShieldCheck,
    title: "Security & Compliance",
    description:
      "JWT auth, encrypted payments, webhook verification, and role-based access control.",
  },
  {
    icon: Code2,
    title: "Custom Development",
    description:
      "Bespoke features, API integrations, and technical consulting for your unique business needs.",
  },
];

const clients = [
  { name: "Taste of Motherland", industry: "Food Retail", color: "#064E3B", domain: "tmfoods.co.uk" },
  { name: "Toks Mimi Foods", industry: "Food Retail", color: "#7C3AED", domain: "toksmimi.com" },
  { name: "Styled by Mariam", industry: "Fashion", color: "#BE185D", domain: "styledbymaryam.com" },
];

export default function PlatformLandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-28">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-700 bg-gray-800/50 px-4 py-1.5 text-sm text-gray-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Web Architecture &middot; Commerce &middot; Digital Presence
          </div>
          <h1 className="mt-8 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            We build the digital
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent">
              infrastructure for your business
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
            From e-commerce platforms to brand websites, fashion storefronts to
            food delivery — we architect, build, and scale your online presence.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/platform/onboard"
              className="inline-flex h-12 items-center rounded-lg bg-emerald-600 px-8 text-base font-medium text-white shadow-lg transition-colors hover:bg-emerald-500"
            >
              Start Your Project
            </Link>
            <Link
              href="#services"
              className="inline-flex h-12 items-center rounded-lg border border-gray-700 px-8 text-base font-medium text-gray-300 transition-colors hover:border-gray-500 hover:text-white"
            >
              Our Services
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Everything your business needs online
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-gray-500">
              We don&apos;t just build websites — we build the architecture that
              powers your business growth.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {services.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-gray-900">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {s.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="border-t bg-gray-50 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Built for every industry
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Fashion, food, beauty, services — if your business needs a digital
            presence, we build it.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Food & Grocery", emoji: "🛒", examples: "Online stores, delivery platforms, recipe hubs" },
              { label: "Fashion & Beauty", emoji: "👗", examples: "Lookbooks, e-commerce, brand sites" },
              { label: "Services & SaaS", emoji: "💼", examples: "Booking systems, dashboards, portals" },
            ].map((ind) => (
              <div key={ind.label} className="rounded-xl border bg-white p-6 text-left">
                <span className="text-2xl">{ind.emoji}</span>
                <h3 className="mt-3 font-semibold text-gray-900">{ind.label}</h3>
                <p className="mt-1 text-sm text-gray-500">{ind.examples}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Client Showcase */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Trusted by growing brands
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Businesses already powered by Authentifactor
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {clients.map((c) => (
              <div key={c.name} className="rounded-xl border p-6 text-center transition-shadow hover:shadow-md">
                <div
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl text-xl font-bold text-white"
                  style={{ backgroundColor: c.color }}
                >
                  {c.name[0]}
                </div>
                <h3 className="mt-3 font-semibold text-gray-900">{c.name}</h3>
                <p className="text-xs text-gray-500">{c.industry}</p>
                <p className="mt-1 text-xs font-medium text-emerald-700">{c.domain}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-gradient-to-b from-gray-950 to-gray-900 py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to build your digital presence?
          </h2>
          <p className="mt-4 text-gray-400">
            Whether you&apos;re launching a new brand or scaling an existing one —
            we architect the platform, you grow the business.
          </p>
          <Link
            href="/platform/onboard"
            className="mt-8 inline-flex h-12 items-center rounded-lg bg-emerald-600 px-8 text-base font-medium text-white shadow-lg transition-colors hover:bg-emerald-500"
          >
            Start Your Project
          </Link>
        </div>
      </section>
    </div>
  );
}
