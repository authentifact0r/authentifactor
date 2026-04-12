import Link from "next/link";
import {
  ArrowRight,
  Play,
  Target,
  Crown,
  Star,
  Hexagon,
  Triangle,
  Command,
  Ghost,
  Gem,
  Cpu,
} from "lucide-react";

type StatItemProps = {
  value: string;
  label: string;
};

type StorefrontHeroProps = {
  title?: string;
  subtitle?: string;
  tagline?: string;
};

const CLIENTS = [
  { name: "Acme Corp", icon: Hexagon },
  { name: "Quantum", icon: Triangle },
  { name: "Command+Z", icon: Command },
  { name: "Phantom", icon: Ghost },
  { name: "Ruby", icon: Gem },
  { name: "Chipset", icon: Cpu },
] as const;

function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="flex flex-col items-center justify-center cursor-default transition-transform hover:-translate-y-1">
      <span className="text-xl font-bold text-white sm:text-2xl">{value}</span>
      <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 sm:text-xs">
        {label}
      </span>
    </div>
  );
}

export function StorefrontHero({
  title = "Crafting Digital Experiences That Matter",
  subtitle = "We design interfaces that combine beauty with functionality, creating seamless experiences that users love and businesses thrive on.",
  tagline = "Award-Winning Design",
}: StorefrontHeroProps) {
  return (
    <section className="relative w-full overflow-hidden bg-zinc-950 font-sans text-white">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes storefrontFadeSlideIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes storefrontMarquee {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
            .storefront-animate-fade-in {
              animation: storefrontFadeSlideIn 0.8s ease-out forwards;
              opacity: 0;
            }
            .storefront-animate-marquee {
              animation: storefrontMarquee 40s linear infinite;
            }
            .storefront-delay-100 { animation-delay: 0.1s; }
            .storefront-delay-200 { animation-delay: 0.2s; }
            .storefront-delay-300 { animation-delay: 0.3s; }
            .storefront-delay-400 { animation-delay: 0.4s; }
            .storefront-delay-500 { animation-delay: 0.5s; }
          `,
        }}
      />

      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage:
            "url(https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/a72ca2f3-9dd1-4fe4-84ba-fe86468a5237_3840w.webp?w=800&q=80)",
          maskImage:
            "linear-gradient(180deg, transparent, black 0%, black 70%, transparent)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent, black 0%, black 70%, transparent)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6 md:pb-20 md:pt-32 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col justify-center space-y-8 pt-8 lg:col-span-7">
            <div className="storefront-animate-fade-in storefront-delay-100">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md transition-colors hover:bg-white/10">
                <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-300 sm:text-xs">
                  {tagline}
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                </span>
              </div>
            </div>

            <h1
              className="storefront-animate-fade-in storefront-delay-200 text-5xl font-medium leading-[0.9] tracking-tighter sm:text-6xl lg:text-7xl xl:text-8xl"
              style={{
                maskImage:
                  "linear-gradient(180deg, black 0%, black 80%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(180deg, black 0%, black 80%, transparent 100%)",
              }}
            >
              {title.includes("That Matter") ? (
                <>
                  Crafting Digital
                  <br />
                  <span className="bg-gradient-to-br from-white via-white to-[#ffcd75] bg-clip-text text-transparent">
                    Experiences
                  </span>
                  <br />
                  That Matter
                </>
              ) : (
                title
              )}
            </h1>

            <p className="storefront-animate-fade-in storefront-delay-300 max-w-xl text-lg leading-relaxed text-zinc-400">
              {subtitle}
            </p>

            <div className="storefront-animate-fade-in storefront-delay-400 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/products"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-zinc-950 transition-all hover:scale-[1.02] hover:bg-zinc-200 active:scale-[0.98]"
              >
                View Products
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/"
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/10"
              >
                <Play className="h-4 w-4 fill-current" />
                Explore Platform
              </Link>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-5 lg:mt-12">
            <div className="storefront-animate-fade-in storefront-delay-500 relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
              <div className="pointer-events-none absolute -mt-16 -mr-16 right-0 top-0 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-8 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold tracking-tight text-white">
                      150+
                    </div>
                    <div className="text-sm text-zinc-400">Projects Delivered</div>
                  </div>
                </div>

                <div className="mb-8 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Client Satisfaction</span>
                    <span className="font-medium text-white">98%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800/50">
                    <div className="h-full w-[98%] rounded-full bg-gradient-to-r from-white to-zinc-400" />
                  </div>
                </div>

                <div className="mb-6 h-px w-full bg-white/10" />

                <div className="grid grid-cols-5 items-center gap-4 text-center">
                  <StatItem value="5+" label="Years" />
                  <div className="mx-auto h-full w-px bg-white/10" />
                  <StatItem value="24/7" label="Support" />
                  <div className="mx-auto h-full w-px bg-white/10" />
                  <StatItem value="100%" label="Quality" />
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium tracking-wide text-zinc-300">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                    </span>
                    ACTIVE
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium tracking-wide text-zinc-300">
                    <Crown className="h-3 w-3 text-yellow-500" />
                    PREMIUM
                  </div>
                </div>
              </div>
            </div>

            <div className="storefront-animate-fade-in storefront-delay-500 relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 py-8 backdrop-blur-xl">
              <h3 className="mb-6 px-8 text-sm font-medium text-zinc-400">
                Trusted by Industry Leaders
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
                <div className="storefront-animate-marquee flex gap-12 whitespace-nowrap px-4">
                  {[...CLIENTS, ...CLIENTS, ...CLIENTS].map((client, i) => (
                    <div
                      key={`${client.name}-${i}`}
                      className="flex cursor-default items-center gap-2 grayscale transition-all hover:scale-105 hover:grayscale-0 hover:opacity-100 opacity-50"
                    >
                      <client.icon className="h-6 w-6 fill-current text-white" />
                      <span className="text-lg font-bold tracking-tight text-white">
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
    </section>
  );
}
