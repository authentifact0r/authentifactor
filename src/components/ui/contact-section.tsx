"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, X, MessageSquare } from "lucide-react";

const projectTypeOptions = [
  "E-Commerce",
  "Brand Website",
  "Mobile App",
  "Brand Identity",
  "SEO & Growth",
  "Custom Development",
  "Multi-Tenant Platform",
  "Consulting",
  "Other",
];

export function FloatingCTABanner() {
  const [bannerVisible, setBannerVisible] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    projectType: [] as string[],
  });

  // Auto-pop banner after 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!bannerDismissed && !formOpen) {
        setBannerVisible(true);
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, [bannerDismissed, formOpen]);

  // Listen for global "open-contact-form" event (from nav/hero buttons)
  useEffect(() => {
    const handler = () => openForm();
    window.addEventListener("open-contact-form", handler);
    return () => window.removeEventListener("open-contact-form", handler);
  }, []);

  const dismissBanner = () => {
    setBannerVisible(false);
    setBannerDismissed(true);
  };

  const openForm = () => {
    setBannerVisible(false);
    setBannerDismissed(true);
    setFormOpen(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (type: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      projectType: checked
        ? [...prev.projectType, type]
        : prev.projectType.filter((t) => t !== type),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setFormOpen(false);
  };

  return (
    <>
      {/* ─── Notion-style centered popup card ─── */}
      <AnimatePresence>
        {bannerVisible && !formOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-[3px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={dismissBanner}
            />

            {/* Card */}
            <motion.div
              className="fixed left-1/2 top-1/2 z-[61] w-[min(440px,92vw)] -translate-x-1/2 -translate-y-1/2"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="cta-pop-title"
            >
              <div className="overflow-hidden rounded-[28px] bg-[#0e0e0e] shadow-[0_28px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/[0.06]">
                {/* Close — neon-blue ring, top right */}
                <button
                  onClick={dismissBanner}
                  aria-label="Dismiss"
                  className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#0e0e0e] text-white/85 ring-2 ring-[#00BFFF] transition-colors hover:text-white"
                >
                  <X className="h-4 w-4" strokeWidth={2.5} />
                </button>

                {/* ── Top half: warm illustration ── */}
                <div className="relative h-[260px] overflow-hidden bg-gradient-to-b from-[#FAE2D2] to-[#F4CFB3]">
                  {/* Soft radial glow for depth */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.55),transparent_55%)]" />

                  {/* Tilted brief preview card */}
                  <motion.div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    initial={{ rotate: -3, y: 8, opacity: 0 }}
                    animate={{ rotate: -2, y: 0, opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  >
                    <div className="relative w-[280px] rounded-2xl bg-white px-4 py-3.5 shadow-[0_18px_40px_rgba(15,15,15,0.18)]">
                      {/* Notification badge */}
                      <span className="absolute -left-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF6A4D] text-[10px] font-bold text-white shadow-md">
                        3
                      </span>
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2DD4A0] to-[#00BFFF] text-[15px] font-semibold text-white">
                          A
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-semibold leading-tight text-[#1a1a1a]">
                            Adetola
                          </p>
                          <p className="mt-0.5 text-[12.5px] leading-snug text-[#3a3a3a]">
                            Need a launchpad for our Q3 product drop —
                            commerce + brand site.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Caption pill */}
                  <motion.div
                    className="absolute bottom-5 left-1/2 -translate-x-1/2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.4 }}
                  >
                    <span className="inline-block whitespace-nowrap rounded-md bg-[#0e0e0e] px-3 py-1.5 text-[12.5px] font-medium text-white">
                      every brand starts with a brief.
                    </span>
                  </motion.div>
                </div>

                {/* ── Bottom half: dark CTA ── */}
                <div className="relative px-7 pb-6 pt-7">
                  {/* "Studio openings" pill */}
                  <span className="inline-flex items-center rounded-md bg-[#00BFFF]/15 px-2.5 py-1 text-[12px] font-semibold tracking-tight text-[#5fcfff]">
                    Studio openings
                  </span>

                  <h3
                    id="cta-pop-title"
                    className="mt-4 text-[30px] font-bold leading-[1.05] tracking-tight text-white"
                  >
                    Ready to build
                    <br />
                    <span className="font-light italic text-white/55" style={{ fontFamily: "var(--font-serif)" }}>
                      something extraordinary?
                    </span>
                  </h3>

                  <p className="mt-3 text-[14px] leading-relaxed text-white/55">
                    Limited spots for Q3 2026 — tell us about your project.
                  </p>

                  <div className="mt-6 flex items-center justify-end gap-2">
                    <button
                      onClick={dismissBanner}
                      className="h-10 rounded-full px-4 text-sm font-semibold text-white/70 transition-colors hover:text-white"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={openForm}
                      className="group inline-flex h-10 items-center gap-1.5 rounded-full bg-[#00BFFF] px-5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,191,255,0.35)] transition-all hover:bg-[#19c8ff] hover:shadow-[0_10px_28px_rgba(0,191,255,0.5)]"
                    >
                      Show me
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Form Modal — triggered by banner or any "Start a Project" link ─── */}
      <AnimatePresence>
        {formOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFormOpen(false)}
            />

            {/* Form Card */}
            <motion.div
              className="fixed inset-x-4 top-[5vh] bottom-[5vh] z-[70] mx-auto max-w-xl overflow-y-auto rounded-3xl bg-[#131313]/95 p-8 shadow-[0_32px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:inset-x-auto sm:top-[8vh] sm:bottom-auto sm:max-h-[84vh]"
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                onClick={() => setFormOpen(false)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/50 transition-all hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2DD4A0]/10">
                  <MessageSquare className="h-5 w-5 text-[#2DD4A0]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Start your project
                  </h3>
                  <p className="text-xs text-white/40">
                    We&apos;ll get back within 24 hours.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cta-name" className="text-white/60">
                      Your name
                    </Label>
                    <Input
                      id="cta-name"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="border-transparent bg-[#181818] text-white placeholder:text-white/25 focus-visible:ring-[#2DD4A0]/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cta-email" className="text-white/60">
                      Email
                    </Label>
                    <Input
                      id="cta-email"
                      name="email"
                      type="email"
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="border-transparent bg-[#181818] text-white placeholder:text-white/25 focus-visible:ring-[#2DD4A0]/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cta-message" className="text-white/60">
                    Project details
                  </Label>
                  <Textarea
                    id="cta-message"
                    name="message"
                    placeholder="Briefly describe your project idea..."
                    className="min-h-[100px] border-transparent bg-[#181818] text-white placeholder:text-white/25 focus-visible:ring-[#2DD4A0]/50"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-white/40">I&apos;m looking for...</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2.5">
                    {projectTypeOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cta-${option.replace(/\s/g, "-").toLowerCase()}`}
                          checked={formData.projectType.includes(option)}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(option, checked as boolean)
                          }
                          className="border-white/20 data-[state=checked]:bg-[#2DD4A0] data-[state=checked]:border-[#2DD4A0]"
                        />
                        <Label
                          htmlFor={`cta-${option.replace(/\s/g, "-").toLowerCase()}`}
                          className="text-xs font-normal text-white/50 cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="group w-full inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white text-gray-950 font-semibold text-[15px] transition-all hover:bg-gray-100"
                >
                  Send a message
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
