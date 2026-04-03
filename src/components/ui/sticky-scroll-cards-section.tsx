"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Store,
  Globe,
  Palette,
  Search,
  Smartphone,
  Code2,
} from "lucide-react";

interface ServiceCard {
  number: string;
  title: string;
  description: string;
  imageUrl: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
}

const services: ServiceCard[] = [
  {
    number: "01",
    title: "E-Commerce Platforms",
    description:
      "Full-featured online stores with inventory management, multi-warehouse routing, payment processing via Stripe and Paystack, and subscription engines. Built on our multi-tenant architecture so you scale from day one.",
    imageUrl:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2070&auto=format&fit=crop",
    icon: <Store className="h-6 w-6" />,
    bgColor: "bg-emerald-100",
    textColor: "text-gray-700",
  },
  {
    number: "02",
    title: "Custom Websites & Domains",
    description:
      "Bespoke web experiences with your own domain, SSL, and identity. Designed to convert visitors into loyal customers with editorial layouts, smooth animations, and premium typography.",
    imageUrl:
      "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=2069&auto=format&fit=crop",
    icon: <Globe className="h-6 w-6" />,
    bgColor: "bg-blue-100",
    textColor: "text-gray-700",
  },
  {
    number: "03",
    title: "Brand Identity & Design",
    description:
      "Custom branding, design systems, and visual identities that make your business instantly recognisable. From logo to full token architecture — your brand, systematised.",
    imageUrl:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop",
    icon: <Palette className="h-6 w-6" />,
    bgColor: "bg-purple-100",
    textColor: "text-gray-700",
  },
  {
    number: "04",
    title: "SEO & Digital Growth",
    description:
      "Built-in SEO tools, structured data, sitemaps, and analytics strategies engineered to grow your organic presence. We don't just build — we make sure you're found.",
    imageUrl:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
    icon: <Search className="h-6 w-6" />,
    bgColor: "bg-amber-100",
    textColor: "text-gray-800",
  },
  {
    number: "05",
    title: "Mobile Applications",
    description:
      "White-label iOS and Android apps. Your brand in your customers' pockets with push notifications, deep linking, and native performance powered by Capacitor or React Native.",
    imageUrl:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2070&auto=format&fit=crop",
    icon: <Smartphone className="h-6 w-6" />,
    bgColor: "bg-pink-100",
    textColor: "text-gray-700",
  },
  {
    number: "06",
    title: "Custom Development",
    description:
      "Bespoke features, API integrations, webhook pipelines, and technical architecture tailored to your unique business requirements. From Cloud Run APIs to real-time dashboards.",
    imageUrl:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop",
    icon: <Code2 className="h-6 w-6" />,
    bgColor: "bg-cyan-100",
    textColor: "text-gray-700",
  },
];

const useScrollAnimation = () => {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { root: null, rootMargin: "0px", threshold: 0.1 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, inView] as const;
};

export function StickyServiceSection() {
  const [headerRef, headerInView] = useScrollAnimation();
  const [pRef, pInView] = useScrollAnimation();

  return (
    <div id="services" className="bg-gray-50">
      <div className="px-[5%]">
        <div className="max-w-6xl mx-auto">
          <section className="py-20 md:py-28 flex flex-col items-center">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 mb-4">
                Services
              </p>
              <h2
                ref={headerRef as React.Ref<HTMLHeadingElement>}
                className={`text-4xl md:text-5xl font-bold transition-all duration-700 ease-out text-gray-900 ${
                  headerInView
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transformStyle: "preserve-3d" }}
              >
                End-to-end digital services,{" "}
                <span
                  className="font-light italic text-gray-400"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  obsessively crafted.
                </span>
              </h2>
              <p
                ref={pRef as React.Ref<HTMLParagraphElement>}
                className={`text-lg text-gray-600 mt-4 transition-all duration-700 ease-out delay-200 ${
                  pInView
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transformStyle: "preserve-3d" }}
              >
                We don&apos;t just build websites — we engineer the architecture
                that powers your business growth.
              </p>
            </div>

            {/* Sticky Cards — same pattern as the original */}
            <div className="w-full">
              {services.map((service, index) => (
                <div
                  key={index}
                  className={`${service.bgColor} grid grid-cols-1 md:grid-cols-2 items-center gap-4 md:gap-8 p-6 sm:p-8 md:p-10 rounded-3xl mb-12 sticky`}
                  style={{ top: "120px" }}
                >
                  {/* Card Content */}
                  <div className="flex flex-col justify-center py-2">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-sm text-gray-700">
                        {service.icon}
                      </div>
                      <span className="text-xs font-medium text-gray-400 tabular-nums tracking-wider uppercase">
                        Step {service.number}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 text-gray-900 tracking-tight">
                      {service.title}
                    </h3>
                    <p className={`${service.textColor} leading-relaxed text-sm sm:text-base`}>
                      {service.description}
                    </p>
                  </div>

                  {/* Card Image */}
                  <div className="mt-4 md:mt-0 overflow-hidden rounded-2xl">
                    <img
                      src={service.imageUrl}
                      alt={service.title}
                      loading="lazy"
                      className="w-full h-48 sm:h-56 md:h-64 rounded-2xl shadow-lg object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
