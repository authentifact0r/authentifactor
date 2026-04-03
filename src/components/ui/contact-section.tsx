"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, X, MessageSquare, Sparkles } from "lucide-react";

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
      {/* ─── Floating Banner — slides up from bottom ─── */}
      <AnimatePresence>
        {bannerVisible && !formOpen && (
          <motion.div
            className="fixed bottom-6 left-4 right-4 z-[60] mx-auto max-w-xl"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-gray-950/95 px-6 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
              {/* Accent glow */}
              <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/20 blur-3xl" />

              <button
                onClick={dismissBanner}
                className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              <div className="relative flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <Sparkles className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">
                    Ready to build something extraordinary?
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    Limited spots for Q3 2026 — tell us about your project.
                  </p>
                </div>
                <button
                  onClick={openForm}
                  className="shrink-0 inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-5 text-xs font-semibold text-gray-950 transition-all hover:bg-gray-100"
                >
                  Let&apos;s talk
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </motion.div>
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
              className="fixed inset-x-4 top-[5vh] bottom-[5vh] z-[70] mx-auto max-w-xl overflow-y-auto rounded-3xl border border-white/[0.1] bg-gray-950/95 p-8 shadow-[0_32px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:inset-x-auto sm:top-[8vh] sm:bottom-auto sm:max-h-[84vh]"
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
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                  <MessageSquare className="h-5 w-5 text-emerald-400" />
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
                      className="border-white/10 bg-white/[0.04] text-white placeholder:text-white/25 focus-visible:ring-emerald-500/50"
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
                      className="border-white/10 bg-white/[0.04] text-white placeholder:text-white/25 focus-visible:ring-emerald-500/50"
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
                    className="min-h-[100px] border-white/10 bg-white/[0.04] text-white placeholder:text-white/25 focus-visible:ring-emerald-500/50"
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
                          className="border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
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
