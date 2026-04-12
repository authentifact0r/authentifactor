"use client";

import * as React from "react";
import {
  Briefcase,
  Palette,
  GraduationCap,
  Building2,
  Plane,
  Stethoscope,
  ArrowUpRight,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientCard {
  id: string;
  name: string;
  industry: string;
  domain: string;
  url: string;
  color: string;
  description: string;
  stat: string;
  icon: React.ReactNode;
  /** Local fallback screenshot path */
  screenshot: string;
  /** CSS object-position for the screenshot (default: "top") */
  imgPosition?: string;
  /** CSS object-fit override (default: "cover") */
  imgFit?: "cover" | "contain" | "fill";
}

/**
 * Build a live screenshot URL using thum.io.
 * Free, no API key, captures current state of any public URL.
 * https://www.thum.io/documentation
 */
function liveSnapshot(url: string, width = 1280): string {
  const clean = url.replace(/^https?:\/\//, "");
  return `https://image.thum.io/get/width/${width}/crop/900/noanimate/https://${clean}`;
}

const clientData: ClientCard[] = [
  {
    id: "bowsea",
    name: "BowSea",
    industry: "Career Tech",
    domain: "bowsea.com",
    url: "https://bowsea.com",
    color: "#1E40AF",
    description: "Career launchpad connecting students with placements, employers with talent, and coaches with impact.",
    stat: "4,200+ Jobs",
    icon: <Briefcase size={20} />,
    screenshot: "/images/screenshots/bowsea.png",
    imgPosition: "center center",
  },
  {
    id: "clarityconduct",
    name: "Clarity Conduct",
    industry: "Digital Agency",
    domain: "clarityconduct.com",
    url: "https://www.clarityconduct.com",
    color: "#0D9488",
    description: "AI-powered operational efficiency platform — voice agents, lead gen, and multi-tenant DaaS for agencies.",
    stat: "Active Clients",
    icon: <Building2 size={20} />,
    screenshot: "/images/screenshots/clarityconduct.png",
    imgPosition: "left top",
  },
  {
    id: "sbm",
    name: "Styled by Mariam",
    industry: "Fashion",
    domain: "styledbymaryam.com",
    url: "https://styledbymaryam.com",
    color: "#BE185D",
    description: "Contemporary fashion brand — editorial photography, lookbook, mega-menu navigation, and e-commerce.",
    stat: "12 Collections",
    icon: <Palette size={20} />,
    screenshot: "/images/screenshots/styledbymaryam.png",
    imgPosition: "top",
  },
  {
    id: "careceutical",
    name: "Careceutical",
    industry: "Healthcare",
    domain: "careceutical.co.uk",
    url: "https://careceutical.vercel.app",
    color: "#0891B2",
    description: "Enterprise clinical management — appointments, triage, patient records, and real-time analytics.",
    stat: "5 Roles",
    icon: <Stethoscope size={20} />,
    screenshot: "/images/screenshots/careceutical.png",
    imgPosition: "center center",
  },
  {
    id: "citiestroves",
    name: "CitiesTroves",
    industry: "Travel",
    domain: "citiestroves.com",
    url: "https://citiestroves.com",
    color: "#7C3AED",
    description: "Serviced apartment booking for African markets — Lagos, Accra, Nairobi, Cape Town.",
    stat: "4 Cities",
    icon: <Plane size={20} />,
    screenshot: "/images/screenshots/citiestroves.png",
    imgPosition: "top",
  },
  {
    id: "vm",
    name: "Vibrant Minds",
    industry: "Education",
    domain: "vibrantmindsasc.org.uk",
    url: "https://vibrantmindsasc.org.uk",
    color: "#6C4BFF",
    description: "Interactive learning platform with H5P content, curated learning paths, and mentor matching.",
    stat: "H5P Powered",
    icon: <GraduationCap size={20} />,
    screenshot: "/images/screenshots/vibrantminds.png",
    imgPosition: "left top",
  },
];

export function ClientShowcaseCards({ className }: { className?: string }) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const gridStyle = React.useMemo(() => {
    if (isDesktop) {
      const columns = clientData
        .map((_, i) => (i === activeIndex ? "4fr" : "1fr"))
        .join(" ");
      return { gridTemplateColumns: columns, gridTemplateRows: "1fr" };
    } else {
      const rows = clientData
        .map((_, i) => (i === activeIndex ? "4fr" : "1fr"))
        .join(" ");
      return { gridTemplateRows: rows, gridTemplateColumns: "1fr" };
    }
  }, [activeIndex, isDesktop]);

  return (
    <ul
      className={cn(
        "grid w-full gap-2",
        "h-[800px] md:h-[540px]",
        "transition-[grid-template-columns,grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        className,
      )}
      style={gridStyle}
    >
      {clientData.map((client, index) => {
        const isActive = index === activeIndex;
        return (
          <li
            key={client.id}
            className={cn(
              "group relative cursor-pointer overflow-hidden rounded-2xl border transition-all duration-500",
              "min-h-0 min-w-0 md:min-w-[60px]",
              isActive
                ? "border-white/[0.12] bg-white/[0.05]"
                : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.10]",
            )}
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => setActiveIndex(index)}
            tabIndex={0}
            onFocus={() => setActiveIndex(index)}
          >
            {/* Ambient glow */}
            <div
              className={cn(
                "absolute -right-12 -top-12 h-48 w-48 rounded-full blur-3xl transition-opacity duration-500",
                isActive ? "opacity-20" : "opacity-0",
              )}
              style={{ backgroundColor: client.color }}
            />

            {/* ─── Collapsed state: blurred thumbnail ─── */}
            <div
              className={cn(
                "absolute inset-0 z-10 transition-all duration-500",
                isActive ? "opacity-0 pointer-events-none" : "opacity-100",
              )}
            >
              {/* Thumbnail screenshot */}
              <img
                src={client.screenshot}
                alt={client.name}
                className="absolute inset-0 h-full w-full object-cover brightness-[0.35] saturate-50 transition-all duration-500 group-hover:brightness-[0.45] group-hover:saturate-75"
                style={{ objectPosition: client.imgPosition || "top" }}
              />
              {/* Overlay with name */}
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-5 md:justify-center md:pb-0">
                <div
                  className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg text-white/90"
                  style={{ backgroundColor: `${client.color}80` }}
                >
                  {React.cloneElement(client.icon as React.ReactElement, { size: 14 })}
                </div>
                <span
                  className="hidden text-[11px] font-semibold tracking-wider text-white/70 md:block"
                  style={{
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                    transform: "rotate(180deg)",
                  }}
                >
                  {client.name}
                </span>
                <span className="text-[11px] font-semibold text-white/70 md:hidden">
                  {client.name}
                </span>
              </div>
            </div>

            {/* ─── Expanded state ─── */}
            <div
              className={cn(
                "absolute inset-0 flex flex-col transition-all duration-500",
                isActive ? "opacity-100" : "opacity-0 pointer-events-none",
              )}
            >
              {/* Screenshot preview with browser chrome */}
              <div className="relative flex-1 overflow-hidden bg-gray-900">
                {/* Browser chrome bar */}
                <div className="absolute inset-x-0 top-0 z-10 flex h-9 items-center gap-1.5 border-b border-white/[0.06] bg-gray-900/95 px-3 backdrop-blur-sm">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                  <div className="ml-3 flex flex-1 items-center gap-1.5 rounded-md bg-gray-800/80 px-2.5 py-1">
                    <Globe className="h-2.5 w-2.5 text-gray-500" />
                    <span className="text-[10px] text-gray-400">{client.domain}</span>
                  </div>
                </div>

                {/* Screenshot image */}
                <img
                  src={client.screenshot}
                  alt={`${client.name} landing page`}
                  className="absolute inset-0 h-full w-full object-cover pt-9 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
                  style={{ objectPosition: client.imgPosition || "top" }}
                />

                {/* Bottom gradient */}
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />

                {/* Visit badge */}
                <a
                  href={client.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-14 right-4 z-10 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md transition-all hover:bg-black/80 hover:text-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  Visit Site
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>

              {/* Info bar */}
              <div className="relative shrink-0 border-t border-white/[0.06] bg-gray-950/90 px-5 py-4 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                      style={{ backgroundColor: client.color }}
                    >
                      {client.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-white">{client.name}</h3>
                      <p className="truncate text-xs text-gray-500">{client.description}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="hidden rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-medium text-gray-400 sm:block">
                      {client.industry}
                    </span>
                    <span
                      className="rounded-full px-2.5 py-1 text-[10px] font-semibold text-white/90"
                      style={{ backgroundColor: `${client.color}cc` }}
                    >
                      {client.stat}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
