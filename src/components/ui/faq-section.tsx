"use client";

import React, { useEffect, useRef, useState } from "react";

const STYLE_ID = "af-faq-animations";

const faqs = [
  {
    question: "What's the difference between tiers beyond just hours?",
    answer:
      "Accelerator delivers targeted interventions in 1–2 core areas for rapid wins. Growth Partner provides holistic optimisation across 5+ services with a dedicated architect and custom roadmaps. Transformation drives enterprise-scale reinvention across all 10 services with board-level strategy and full specialist team.",
    meta: "Pricing",
  },
  {
    question: "Can I switch tiers mid-engagement?",
    answer:
      "Yes — upgrade or downgrade with 14 days' notice, prorated billing, and no penalties. We run a quick audit to align the transition so nothing drops.",
    meta: "Flexibility",
  },
  {
    question: "What happens after the 30-day money-back guarantee?",
    answer:
      "Your engagement rolls into the selected tier with full momentum. We designed it for zero-risk commitment — clients who continue typically see measurable ROI within 90 days.",
    meta: "Guarantee",
  },
  {
    question: "How quickly can we start?",
    answer:
      "We kick off within 48 hours of agreement. Onboarding takes one week — discovery call, goal alignment, initial roadmap. Your first value milestone lands by week two.",
    meta: "Onboarding",
  },
  {
    question: "Do you work with startups or only established brands?",
    answer:
      "Both. Accelerator is built for founders and early-stage businesses. Growth Partner suits scaling brands. Transformation powers mature enterprises. We tailor the engagement to your stage.",
    meta: "Fit",
  },
  {
    question: "What industries do you specialise in?",
    answer:
      "Commerce, SaaS, fashion, food & beverage, healthcare, education, and professional services. Our platform architecture means we move fast in any vertical — we've delivered across six industries in the last 12 months.",
    meta: "Industries",
  },
  {
    question: "How do you measure ROI and success?",
    answer:
      "Custom KPIs agreed upfront — revenue growth, lead conversion, cost savings, efficiency gains. We track everything via real-time BI dashboards with quarterly strategy reviews to optimise.",
    meta: "Results",
  },
  {
    question: "Can I add extra hours or services à la carte?",
    answer:
      "Yes — top up hours at £175/hr or add bespoke services like a security audit or AI workflow without changing tiers. Scale precisely without overcommitting.",
    meta: "Add-ons",
  },
  {
    question: "Do you replace my in-house team or augment them?",
    answer:
      "We augment. We embed as strategic partners alongside your team, amplifying capabilities in areas like AI, CRM, and ops. You keep control — we deliver the specialist firepower.",
    meta: "Team",
  },
  {
    question: "What makes you different from a typical dev agency?",
    answer:
      "Dev agencies ship code. We deliver business outcomes — strategy, AI integration, payment infrastructure, CRM, security, and consulting unified under one team. We architect growth, not just features.",
    meta: "Difference",
  },
];

export function FAQSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasEntered, setHasEntered] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.innerHTML = `
      @keyframes af-faq-fade-up {
        0% { transform: translate3d(0, 20px, 0); opacity: 0; filter: blur(6px); }
        60% { filter: blur(0); }
        100% { transform: translate3d(0, 0, 0); opacity: 1; filter: blur(0); }
      }
      .af-faq-fade {
        opacity: 0;
        transform: translate3d(0, 24px, 0);
        filter: blur(12px);
        transition: opacity 700ms ease, transform 700ms ease, filter 700ms ease;
      }
      .af-faq-fade--ready {
        animation: af-faq-fade-up 860ms cubic-bezier(0.22, 0.68, 0, 1) forwards;
      }
    `;
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setHasEntered(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const setCardGlow = (event: React.MouseEvent<HTMLLIElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty("--faq-x", `${event.clientX - rect.left}px`);
    target.style.setProperty("--faq-y", `${event.clientY - rect.top}px`);
  };

  const clearCardGlow = (event: React.MouseEvent<HTMLLIElement>) => {
    event.currentTarget.style.removeProperty("--faq-x");
    event.currentTarget.style.removeProperty("--faq-y");
  };

  return (
    <section
      ref={sectionRef}
      className={`relative z-10 mx-auto flex max-w-4xl flex-col gap-12 px-6 py-20 md:py-28 lg:max-w-5xl lg:px-12 ${
        hasEntered ? "af-faq-fade--ready" : "af-faq-fade"
      }`}
    >
      <header className="space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-400/80">
          Frequently Asked
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
          Everything you need to know{" "}
          <span
            className="font-light italic text-white/40"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            before we start.
          </span>
        </h2>
        <p className="max-w-xl text-base text-white/50">
          Clear answers about our tiers, process, and what it&apos;s like to
          partner with Authentifactor.
        </p>
      </header>

      <ul className="space-y-4">
        {faqs.map((item, index) => {
          const open = activeIndex === index;
          const panelId = `af-faq-panel-${index}`;
          const buttonId = `af-faq-trigger-${index}`;

          return (
            <li
              key={item.question}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl transition-all duration-500 hover:-translate-y-0.5 shadow-[0_36px_140px_-60px_rgba(10,10,10,0.95)]"
              onMouseMove={setCardGlow}
              onMouseLeave={clearCardGlow}
            >
              {/* Pointer glow */}
              <div
                className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
                  open ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
                style={{
                  background:
                    "radial-gradient(240px circle at var(--faq-x, 50%) var(--faq-y, 50%), rgba(16, 185, 129, 0.08), transparent 70%)",
                }}
              />

              <button
                type="button"
                id={buttonId}
                aria-controls={panelId}
                aria-expanded={open}
                onClick={() => setActiveIndex(prev => prev === index ? -1 : index)}
                className="relative flex w-full items-start gap-5 px-7 py-6 text-left transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-500/40 cursor-pointer"
              >
                {/* Icon */}
                <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.05] transition-all duration-500 group-hover:scale-105">
                  <span
                    className={`pointer-events-none absolute inset-0 rounded-full border border-white/[0.1] opacity-30 ${
                      open ? "animate-ping" : ""
                    }`}
                  />
                  <svg
                    className={`relative h-4.5 w-4.5 text-white transition-transform duration-500 ${
                      open ? "rotate-45" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path d="M12 5v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>

                <div className="flex flex-1 flex-col gap-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                    <h3 className="text-base font-medium leading-tight text-white sm:text-lg">
                      {item.question}
                    </h3>
                    {item.meta && (
                      <span className="inline-flex w-fit items-center rounded-full border border-white/[0.08] px-2.5 py-0.5 text-[10px] uppercase tracking-[0.3em] text-white/30 sm:ml-auto">
                        {item.meta}
                      </span>
                    )}
                  </div>

                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className={`overflow-hidden text-sm leading-relaxed text-white/50 transition-[max-height] duration-500 ease-out ${
                      open ? "max-h-48" : "max-h-0"
                    }`}
                  >
                    <p className="pr-2 pb-1">{item.answer}</p>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
