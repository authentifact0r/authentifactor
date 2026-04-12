"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Store,
  Globe,
  Palette,
  Search,
  Brain,
  CreditCard,
  Users,
  BarChart3,
  ShieldCheck,
  Workflow,
  Briefcase,
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
    title: "Commerce & Platform Architecture",
    description:
      "Full-featured commerce platforms with multi-tenant architecture, inventory management, subscription engines, and marketplace capabilities. We engineer the infrastructure that lets you scale from one brand to many.",
    imageUrl:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2070&auto=format&fit=crop",
    icon: <Store className="h-6 w-6" />,
    bgColor: "bg-emerald-100",
    textColor: "text-gray-700",
  },
  {
    number: "02",
    title: "AI Integration & Automation",
    description:
      "AI-powered chatbots, recommendation engines, content generation, and intelligent workflow automation. We integrate frontier AI models into your business processes to reduce cost and increase velocity.",
    imageUrl:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop",
    icon: <Brain className="h-6 w-6" />,
    bgColor: "bg-violet-100",
    textColor: "text-gray-700",
  },
  {
    number: "03",
    title: "CRM & Customer Data Platforms",
    description:
      "CRM implementation, customer segmentation, lifecycle marketing, and unified data platforms. We connect every touchpoint so you understand your customers deeply and convert them consistently.",
    imageUrl:
      "https://images.unsplash.com/photo-1552581234-26160f608093?q=80&w=2070&auto=format&fit=crop",
    icon: <Users className="h-6 w-6" />,
    bgColor: "bg-blue-100",
    textColor: "text-gray-700",
  },
  {
    number: "04",
    title: "Payment & Fintech Integration",
    description:
      "Stripe, Paystack, Apple Pay, Google Pay, mobile money, multi-currency, and geo-aware pricing. We architect payment infrastructure that works from London to Lagos — and everywhere in between.",
    imageUrl:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070&auto=format&fit=crop",
    icon: <CreditCard className="h-6 w-6" />,
    bgColor: "bg-amber-100",
    textColor: "text-gray-800",
  },
  {
    number: "05",
    title: "Brand Strategy & Digital Storytelling",
    description:
      "Brand identity systems, content strategy, omnichannel brand building, and conversion-driven design. Your brand isn't just a logo — it's an experience we architect across every surface.",
    imageUrl:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop",
    icon: <Palette className="h-6 w-6" />,
    bgColor: "bg-pink-100",
    textColor: "text-gray-700",
  },
  {
    number: "06",
    title: "Lead Generation & Conversion",
    description:
      "Landing page optimisation, A/B testing, marketing automation, SEO strategy, and audience analytics. We engineer the funnel that turns traffic into revenue and visitors into loyal customers.",
    imageUrl:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
    icon: <Search className="h-6 w-6" />,
    bgColor: "bg-teal-100",
    textColor: "text-gray-700",
  },
  {
    number: "07",
    title: "Analytics & Business Intelligence",
    description:
      "Real-time dashboards, conversion tracking, customer behaviour analytics, and AI-driven insights. We give you the data infrastructure to make decisions with confidence, not guesswork.",
    imageUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    icon: <BarChart3 className="h-6 w-6" />,
    bgColor: "bg-indigo-100",
    textColor: "text-gray-700",
  },
  {
    number: "08",
    title: "Digital Operations & Automation",
    description:
      "Webhook pipelines, scheduled jobs, email triggers, inventory automation, and subscription lifecycle management. We automate the operational complexity so you focus on growth.",
    imageUrl:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop",
    icon: <Workflow className="h-6 w-6" />,
    bgColor: "bg-cyan-100",
    textColor: "text-gray-700",
  },
  {
    number: "09",
    title: "Cyber Security & Compliance",
    description:
      "Penetration testing, vulnerability assessments, security audits, SSL management, GDPR compliance, PCI-DSS, and incident response planning. We harden your digital assets so you operate with confidence.",
    imageUrl:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop",
    icon: <ShieldCheck className="h-6 w-6" />,
    bgColor: "bg-red-100",
    textColor: "text-gray-700",
  },
  {
    number: "10",
    title: "Business Consulting & Strategy",
    description:
      "Market research, competitive analysis, go-to-market strategy, revenue modelling, and digital transformation roadmaps. We sit at the table as co-founders, not just contractors — aligning technology with your business goals.",
    imageUrl:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop",
    icon: <Briefcase className="h-6 w-6" />,
    bgColor: "bg-orange-100",
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
                What We Do
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
                Full-spectrum digital consulting,{" "}
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
                We don&apos;t just build websites — we architect the digital
                infrastructure, strategy, and intelligence that powers your
                business growth.
              </p>
            </div>

            {/* Sticky Cards */}
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
                        {service.number}
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
