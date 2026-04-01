import Link from "next/link";
import {
  Globe,
  CreditCard,
  Palette,
  RefreshCw,
  Smartphone,
  Store,
  ShieldCheck,
  Search,
  BarChart3,
  Layers,
  Code2,
  Truck,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle,
} from "lucide-react";

const services = [
  {
    icon: Store,
    title: "E-Commerce Platforms",
    description:
      "Full-featured online stores with inventory management, multi-warehouse routing, payment processing, and subscription engines.",
    gradient: "from-emerald-500/10 to-emerald-500/5",
    iconColor: "text-emerald-600",
  },
  {
    icon: Globe,
    title: "Custom Websites & Domains",
    description:
      "Bespoke web experiences with your own domain, SSL, and identity. Designed to convert visitors into loyal customers.",
    gradient: "from-blue-500/10 to-blue-500/5",
    iconColor: "text-blue-600",
  },
  {
    icon: Palette,
    title: "Brand Identity & Design",
    description:
      "Custom branding, design systems, and visual identities that make your business instantly recognisable.",
    gradient: "from-purple-500/10 to-purple-500/5",
    iconColor: "text-purple-600",
  },
  {
    icon: Search,
    title: "SEO & Digital Growth",
    description:
      "Built-in SEO tools, structured data, sitemaps, and analytics strategies engineered to grow your organic presence.",
    gradient: "from-amber-500/10 to-amber-500/5",
    iconColor: "text-amber-600",
  },
  {
    icon: Smartphone,
    title: "Mobile Applications",
    description:
      "White-label iOS and Android apps. Your brand in your customers' pockets with push notifications and deep linking.",
    gradient: "from-pink-500/10 to-pink-500/5",
    iconColor: "text-pink-600",
  },
  {
    icon: Code2,
    title: "Custom Development",
    description:
      "Bespoke features, API integrations, and technical architecture for your unique business requirements.",
    gradient: "from-cyan-500/10 to-cyan-500/5",
    iconColor: "text-cyan-600",
  },
];

const clients = [
  {
    name: "Taste of Motherland",
    industry: "Food Retail",
    domain: "tmfoods.co.uk",
    color: "#064E3B",
    description: "Authentic African foods delivered across the UK",
  },
  {
    name: "Toks Mimi Foods",
    industry: "Food Retail",
    domain: "toksmimi.com",
    color: "#7C3AED",
    description: "Premium West African cuisine and ingredients",
  },
  {
    name: "Vibrant Minds",
    industry: "Education",
    domain: "vibrantsminds.org.uk",
    color: "#2563EB",
    description: "Interactive learning platform for young minds",
  },
  {
    name: "Styled by Mariam",
    industry: "Fashion",
    domain: "styledbymaryam.com",
    color: "#BE185D",
    description: "Contemporary fashion brand and lookbook",
  },
];

const stats = [
  { value: "4+", label: "Active Clients" },
  { value: "99.9%", label: "Uptime" },
  { value: "3", label: "Industries" },
  { value: "24/7", label: "Support" },
];

export default function PlatformLandingPage() {
  return (
    <div>
      {/* Hero — Hyper-luxury */}
      <section className="relative overflow-hidden bg-gray-950 pb-32 pt-24">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        <div className="absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-blue-600/5 blur-3xl" />
        <div className="absolute left-0 bottom-0 h-[400px] w-[400px] rounded-full bg-emerald-600/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-5 py-2 text-sm font-medium text-emerald-400">
              <Sparkles className="h-4 w-4" />
              Web Architecture &middot; Commerce &middot; Digital Excellence
            </div>

            <h1 className="mt-10 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              We build digital
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                infrastructure
              </span>
              <br />
              that scales.
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-gray-400 sm:text-xl">
              From e-commerce platforms to brand websites, fashion storefronts to
              education portals — we architect, design, and engineer world-class
              digital experiences.
            </p>

            <div className="mt-12 flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
              <Link
                href="/platform/onboard"
                className="group inline-flex h-14 items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-blue-600 px-10 text-base font-semibold text-white shadow-2xl shadow-emerald-500/25 transition-all hover:shadow-3xl hover:shadow-emerald-500/40"
              >
                Start Your Project
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#services"
                className="inline-flex h-14 items-center gap-2 rounded-full border border-gray-700 px-10 text-base font-medium text-gray-300 transition-all hover:border-gray-500 hover:bg-white/5 hover:text-white"
              >
                Explore Services
              </Link>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
              What we deliver
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">
              Everything your business needs to
              <span className="text-emerald-600"> dominate online</span>
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              We don&apos;t just build websites — we engineer the architecture
              that powers your business growth.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className={`group relative rounded-2xl border border-gray-100 bg-gradient-to-br ${s.gradient} p-8 transition-all duration-300 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ${s.iconColor}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-gray-900">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    {s.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="bg-gray-950 py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
              Industries
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-white">
              Built for every ambition
            </h2>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Food & Grocery", icon: "🛒", desc: "Online stores, delivery platforms, recipe hubs, subscription boxes" },
              { label: "Fashion & Beauty", icon: "👗", desc: "Lookbooks, e-commerce, brand sites, seasonal collections" },
              { label: "Education & SaaS", icon: "🎓", desc: "Learning platforms, booking systems, member portals" },
              { label: "Services & Consulting", icon: "💼", desc: "Agency sites, dashboards, client portals, CRM integrations" },
            ].map((ind) => (
              <div
                key={ind.label}
                className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 transition-all hover:border-gray-700 hover:bg-gray-900"
              >
                <span className="text-3xl">{ind.icon}</span>
                <h3 className="mt-4 text-lg font-semibold text-white">{ind.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">{ind.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Authentifactor */}
      <section className="py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
                Why Authentifactor
              </p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">
                Enterprise-grade infrastructure,
                <br />
                <span className="text-emerald-600">startup speed.</span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-gray-500">
                We combine the reliability of enterprise architecture with the
                agility of a modern studio. Every project is built on our
                battle-tested multi-tenant platform — so you get production-ready
                infrastructure from day one.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {[
                { icon: Layers, title: "Multi-Tenant Architecture", desc: "Isolated data, shared infrastructure. Scale without limits." },
                { icon: Zap, title: "Lightning Performance", desc: "Server components, edge caching, optimised for speed." },
                { icon: ShieldCheck, title: "Enterprise Security", desc: "JWT auth, encrypted payments, role-based access control." },
                { icon: BarChart3, title: "Real-Time Analytics", desc: "Dashboards, alerts, and insights at your fingertips." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <Icon className="h-5 w-5 text-emerald-600" />
                  <h4 className="mt-3 text-sm font-semibold text-gray-900">{title}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Client Showcase */}
      <section id="clients" className="border-t bg-gray-50/50 py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
              Our Clients
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">
              Trusted by ambitious brands
            </h2>
            <p className="mt-4 text-gray-500">
              Businesses already powered by Authentifactor infrastructure
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {clients.map((c) => (
              <div
                key={c.name}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1"
              >
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg"
                  style={{
                    backgroundColor: c.color,
                    boxShadow: `0 8px 24px ${c.color}33`,
                  }}
                >
                  {c.name[0]}
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">{c.name}</h3>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-400">
                  {c.industry}
                </p>
                <p className="mt-3 text-sm text-gray-500">{c.description}</p>
                <p className="mt-4 text-xs font-semibold text-emerald-600">
                  {c.domain}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gray-950 py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Ready to build something
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              extraordinary?
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-gray-400">
            Whether you&apos;re launching a new brand or scaling an existing one —
            we architect the platform, you grow the business.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/platform/onboard"
              className="group inline-flex h-14 items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-blue-600 px-10 text-base font-semibold text-white shadow-2xl shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40"
            >
              Start Your Project
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="mailto:hello@authentifactor.com"
              className="inline-flex h-14 items-center rounded-full border border-gray-700 px-10 text-base font-medium text-gray-300 transition-all hover:border-gray-500 hover:text-white"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
