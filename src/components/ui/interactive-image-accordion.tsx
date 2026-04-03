"use client";

import React, { useState } from "react";
import { Search, Palette, Code2, Rocket } from "lucide-react";

export interface AccordionItemData {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  icon: React.ElementType;
}

const defaultItems: AccordionItemData[] = [
  {
    id: 1,
    title: "Discovery",
    subtitle: "We map your business model, audience, and goals. No templates — everything is architected from your needs.",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
    icon: Search,
  },
  {
    id: 2,
    title: "Design",
    subtitle: "Brand identity, UI/UX design, and interactive prototypes. You see and feel the product before a line of code.",
    imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop",
    icon: Palette,
  },
  {
    id: 3,
    title: "Engineering",
    subtitle: "Full-stack development on our multi-tenant platform. Production-grade infrastructure from day one.",
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop",
    icon: Code2,
  },
  {
    id: 4,
    title: "Launch & Scale",
    subtitle: "Deployment, monitoring, SEO, and ongoing iteration. We don't disappear after launch — we help you grow.",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
    icon: Rocket,
  },
];

function AccordionPanel({
  item,
  index,
  isActive,
  onMouseEnter,
  total,
}: {
  item: AccordionItemData;
  index: number;
  isActive: boolean;
  onMouseEnter: () => void;
  total: number;
}) {
  const Icon = item.icon;
  const stepNumber = String(index + 1).padStart(2, "0");

  return (
    <div
      className={`
        relative overflow-hidden cursor-pointer
        transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
        rounded-3xl
        h-[500px]
        ${isActive ? "flex-[4]" : "flex-[0.6]"}
      `}
      onMouseEnter={onMouseEnter}
    >
      {/* Background Image */}
      <img
        src={item.imageUrl}
        alt={item.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ transform: isActive ? "scale(1)" : "scale(1.1)" }}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
      {!isActive && (
        <div className="absolute inset-0 bg-black/50 transition-opacity duration-500" />
      )}

      {/* Step number — top left when active */}
      <div
        className={`
          absolute top-6 left-6 z-10
          transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isActive ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}
        `}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
            <Icon className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-medium text-white/70 tracking-wider">
            STEP {stepNumber}
          </span>
        </div>
      </div>

      {/* Content — bottom when active */}
      <div
        className={`
          absolute bottom-0 left-0 right-0 p-8
          transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"}
        `}
      >
        <h3 className="text-3xl font-bold text-white tracking-tight">
          {item.title}
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
          {item.subtitle}
        </p>
      </div>

      {/* Vertical label — when collapsed */}
      <div
        className={`
          absolute inset-0 flex items-center justify-center
          transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isActive ? "opacity-0" : "opacity-100"}
        `}
      >
        <span
          className="text-white text-base font-semibold whitespace-nowrap tracking-wide"
          style={{
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            transform: "rotate(180deg)",
          }}
        >
          {stepNumber} — {item.title}
        </span>
      </div>
    </div>
  );
}

export function ProcessAccordion({
  items = defaultItems,
  defaultActive = 0,
}: {
  items?: AccordionItemData[];
  defaultActive?: number;
}) {
  const [activeIndex, setActiveIndex] = useState(defaultActive);

  return (
    <div className="flex gap-3 w-full" role="tablist">
      {items.map((item, index) => (
        <AccordionPanel
          key={item.id}
          item={item}
          index={index}
          isActive={index === activeIndex}
          onMouseEnter={() => setActiveIndex(index)}
          total={items.length}
        />
      ))}
    </div>
  );
}
