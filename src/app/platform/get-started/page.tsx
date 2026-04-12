"use client";

import { Suspense, useState, useEffect, useCallback, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Store,
  Loader2,
  Sparkles,
  CircleCheck,
  Shield,
  Clock,
  CreditCard,
  Zap,
  Star,
  Lock,
  Globe,
  ArrowRight,
} from "lucide-react";
import { signupTenant, type SignupState } from "@/actions/signup";
import { BILLING_PLANS, type BillingPlanId } from "@/config/billingPlans";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { GlowCard } from "@/components/ui/glow-card";
import Link from "next/link";

/* ─── Motion ─── */
const ease = [0.16, 1, 0.3, 1] as const;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease },
  }),
};

/* ─── Plans Data ─── */
const plans = Object.values(BILLING_PLANS);

const currencies = [
  { value: "GBP", label: "GBP (£)" },
  { value: "NGN", label: "NGN (₦)" },
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GHS", label: "GHS (₵)" },
  { value: "KES", label: "KES (KSh)" },
];

const verticals = [
  { value: "", label: "What do you need? (optional)" },
  { value: "commerce", label: "Commerce & E-Commerce Platform" },
  { value: "saas", label: "SaaS & Platform Development" },
  { value: "web", label: "Web & Product Development" },
  { value: "ai", label: "AI Integration & Automation" },
  { value: "crm", label: "CRM & Lead Generation" },
  { value: "security", label: "Cyber Security & Compliance" },
  { value: "brand", label: "Brand Strategy & Digital Growth" },
  { value: "consulting", label: "Business Consulting & Strategy" },
  { value: "other", label: "Other / Multiple Services" },
];

const clientLogos = [
  "Taste of Motherland",
  "Styled by Maryam",
  "BowSea",
  "Clarity Conduct",
  "Careceutical",
  "Vibrant Minds",
];

const inputClass =
  "w-full rounded-xl bg-[#252525] px-4 py-3.5 text-sm text-white placeholder-white/30 outline-none transition-all focus:ring-2 focus:ring-[#2DD4A0]/20 focus:bg-[#2c2c2c]";
const labelClass = "block text-xs font-semibold uppercase tracking-[0.12em] text-white/40 mb-2";
const selectClass =
  "w-full rounded-xl bg-[#252525] px-4 py-3.5 text-sm text-white outline-none transition-all focus:ring-2 focus:ring-[#2DD4A0]/20";

/* ─── Plan tier icons ─── */
const planIcons: Record<string, React.ReactNode> = {
  accelerator: <Zap className="h-5 w-5" />,
  growth: <Star className="h-5 w-5" />,
  transformation: <Shield className="h-5 w-5" />,
};

function formatPrice(amount: number): string {
  return amount.toLocaleString("en-GB");
}

/* ─── Step config ─── */
const steps = [
  { label: "Choose Plan", icon: CreditCard },
  { label: "Your Business", icon: Store },
  { label: "Get Started", icon: Sparkles },
];

/* ─── Component ─── */
export default function GetStartedPage() {
  return (
    <Suspense>
      <GetStartedContent />
    </Suspense>
  );
}

function GetStartedContent() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") ?? "";

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // Form state
  const [selectedPlan, setSelectedPlan] = useState<BillingPlanId>("growth");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [website, setWebsite] = useState("");
  const [slug, setSlug] = useState("");
  const [currency, setCurrency] = useState("GBP");
  const [vertical, setVertical] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Server action
  const [state, formAction, isPending] = useActionState<SignupState, FormData>(
    signupTenant,
    {}
  );

  // Auto-generate slug from business name for internal use
  useEffect(() => {
    if (storeName) {
      const generated = storeName
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  }, [storeName]);

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, 2));
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const canProceedStep1 = selectedPlan !== null;
  const canProceedStep2 =
    firstName &&
    lastName &&
    email &&
    phone &&
    password.length >= 8 &&
    storeName;
  const canSubmit = agreedToTerms && canProceedStep2;

  const progressPercent = step === 0 ? 33 : step === 1 ? 66 : 100;

  return (
    <div className="min-h-screen bg-[#1e1e1e] relative overflow-hidden">
      {/* ─── Background ambience ─── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#2DD4A0]/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#00BFFF]/[0.03] rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 pt-28 pb-20">
        <div className="mx-auto max-w-7xl px-6">
          {/* ═══ HEADER ═══ */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            {/* Trial badge */}
            {refCode ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-amber-400 mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                You were referred! Enjoy priority onboarding
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full bg-[#2DD4A0]/10 px-4 py-1.5 text-xs font-medium text-[#2DD4A0] mb-6">
                <Clock className="h-3.5 w-3.5" />
                30-day money-back guarantee — risk-free
              </div>
            )}

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Launch your{" "}
              <span className="font-[family-name:var(--font-serif)] italic text-[#2DD4A0]">
                digital presence
              </span>
            </h1>
            <p className="mt-4 text-lg text-white/50 max-w-xl mx-auto">
              Join ambitious brands powered by Authentifactor.
              Commerce, AI, CRM, payments — all from one platform.
            </p>

            {/* ─── Social proof logos ─── */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <span className="text-xs text-white/30 uppercase tracking-widest">Trusted by</span>
              {clientLogos.map((name) => (
                <span key={name} className="text-xs font-medium text-white/20">
                  {name}
                </span>
              ))}
            </div>
          </motion.div>

          {/* ═══ PROGRESS BAR ═══ */}
          <div className="mx-auto max-w-2xl mb-12">
            {/* Step pills */}
            <div className="flex items-center justify-between mb-4">
              {steps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.label}
                    onClick={() => {
                      if (i < step) {
                        setDirection(-1);
                        setStep(i);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                      i === step
                        ? "bg-[#2DD4A0]/20 text-[#2DD4A0]"
                        : i < step
                          ? "bg-[#252525] text-white cursor-pointer hover:bg-[#2c2c2c]"
                          : "bg-[#201f1f] text-white/30"
                    )}
                  >
                    {i < step ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      >
                        <Check className="h-4 w-4 text-[#2DD4A0]" />
                      </motion.div>
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Animated progress track */}
            <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#2DD4A0] to-[#00BFFF]"
                initial={{ width: "0%" }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.6, ease }}
              />
            </div>
          </div>

          {/* Error display */}
          {state.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 mx-auto max-w-4xl rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {state.error}
            </motion.div>
          )}

          {/* ═══ STEPS ═══ */}
          <AnimatePresence mode="wait" custom={direction}>
            {/* ─── Step 1: Plan Selection ─── */}
            {step === 0 && (
              <motion.div
                key="step-0"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease }}
              >
                <div className="mx-auto max-w-5xl">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-semibold text-white">
                      Choose the right plan for your brand
                    </h2>
                    <p className="mt-2 text-sm text-white/50">
                      All plans include a 30-day money-back guarantee. Upgrade or downgrade anytime — no lock-in.
                    </p>
                  </div>

                  {/* ─── Pricing cards grid ─── */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-10">
                    {plans.map((plan, i) => {
                      const isSelected = selectedPlan === plan.id;
                      const isRecommended = plan.id === "growth";

                      return (
                        <motion.div
                          key={plan.id}
                          custom={i}
                          variants={fadeUp}
                          initial="hidden"
                          animate="visible"
                        >
                          <GlowCard
                            glowColor={isSelected ? "jade" : "cyan"}
                            className={cn(
                              "transition-all duration-300 cursor-pointer group",
                              isSelected && "ring-2 ring-[#2DD4A0]/30 scale-[1.02]"
                            )}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedPlan(plan.id)}
                              className="w-full text-left"
                            >
                              {/* Most Popular badge */}
                              {isRecommended && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2DD4A0] px-3.5 py-1 text-[11px] font-bold text-[#1e1e1e] shadow-lg shadow-[#2DD4A0]/25 uppercase tracking-wider">
                                    <Star className="h-3 w-3 fill-current" />
                                    Most Popular
                                  </span>
                                </div>
                              )}

                              <div className="p-6 pt-8">
                                {/* Icon + name */}
                                <div className="flex items-center gap-3 mb-4">
                                  <div className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                                    isSelected
                                      ? "bg-[#2DD4A0]/20 text-[#2DD4A0]"
                                      : "bg-[#252525] text-white/40 group-hover:text-white/60"
                                  )}>
                                    {planIcons[plan.id]}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-white">{plan.name}</p>
                                    <p className="text-xs text-white/40">{plan.tagline}</p>
                                  </div>
                                </div>

                                {/* Price */}
                                <div className="mb-5">
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white">
                                      £{formatPrice(plan.priceMonthly)}
                                    </span>
                                    <span className="text-sm text-white/40">/month</span>
                                  </div>
                                  <div className="flex items-center gap-3 mt-1.5">
                                    <span className="text-xs text-[#2DD4A0]">{plan.hours} of expert time</span>
                                    <span className="text-xs text-white/20">|</span>
                                    <span className="text-xs text-white/30">30-day money-back guarantee</span>
                                  </div>
                                </div>

                                <Separator className="bg-white/[0.06] mb-5" />

                                {/* Features */}
                                <ul className="space-y-2.5">
                                  {plan.features.map((feature, idx) => (
                                    <li
                                      key={idx}
                                      className="flex items-start gap-2.5 text-sm text-white/60"
                                    >
                                      <Check
                                        className={cn(
                                          "h-4 w-4 mt-0.5 shrink-0",
                                          isSelected ? "text-[#2DD4A0]" : "text-white/20"
                                        )}
                                      />
                                      {feature}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Selection indicator */}
                              <div className={cn(
                                "flex items-center justify-center gap-2 rounded-b-2xl border-t py-3.5 text-sm font-medium transition-all",
                                isSelected
                                  ? "border-t-0 bg-[#2DD4A0]/10 text-[#2DD4A0]"
                                  : "border-t-0 bg-[#201f1f] text-white/30"
                              )}>
                                {isSelected ? (
                                  <>
                                    <CircleCheck className="h-4 w-4" />
                                    Selected
                                  </>
                                ) : (
                                  "Select this plan"
                                )}
                              </div>
                            </button>
                          </GlowCard>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* ─── Trust signals ─── */}
                  <motion.div
                    className="flex flex-wrap items-center justify-center gap-6 mb-8 text-white/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <Lock className="h-3.5 w-3.5" />
                      <span>256-bit SSL encrypted</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <CreditCard className="h-3.5 w-3.5" />
                      <span>Stripe + Paystack payments</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Shield className="h-3.5 w-3.5" />
                      <span>Cancel anytime, no lock-in</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Globe className="h-3.5 w-3.5" />
                      <span>Custom domain included</span>
                    </div>
                  </motion.div>

                  {/* CTA */}
                  <div className="flex justify-center">
                    <button
                      onClick={goNext}
                      disabled={!canProceedStep1}
                      className="group inline-flex items-center gap-2 rounded-full bg-[#2DD4A0] px-8 py-3.5 text-sm font-semibold text-[#1e1e1e] transition-all hover:bg-[#1FA87D] hover:shadow-lg hover:shadow-[#2DD4A0]/40 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Continue with {BILLING_PLANS[selectedPlan].name}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── Step 2: Account + Store Details ─── */}
            {step === 1 && (
              <motion.div
                key="step-1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease }}
              >
                <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Main form */}
                  <div className="lg:col-span-7">
                    <div className="rounded-2xl bg-[#201f1f] backdrop-blur-sm p-8">
                      <h2 className="text-xl font-semibold text-white mb-1">
                        Tell us about your business
                      </h2>
                      <p className="text-sm text-white/40 mb-8">
                        Your business details. You can update everything later.
                      </p>

                      <div className="space-y-6">
                        {/* Name row */}
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className={labelClass}>First Name</label>
                            <input
                              type="text"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              className={inputClass}
                              placeholder="Jane"
                            />
                            {state.fieldErrors?.firstName && (
                              <p className="mt-1 text-xs text-red-400">
                                {state.fieldErrors.firstName[0]}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className={labelClass}>Last Name</label>
                            <input
                              type="text"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              className={inputClass}
                              placeholder="Doe"
                            />
                          </div>
                        </div>

                        {/* Email + Phone */}
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className={labelClass}>Email</label>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className={inputClass}
                              placeholder="jane@mybrand.com"
                            />
                            {state.fieldErrors?.email && (
                              <p className="mt-1 text-xs text-red-400">
                                {state.fieldErrors.email[0]}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className={labelClass}>Phone Number</label>
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className={inputClass}
                              placeholder="+44 7700 900000"
                            />
                          </div>
                        </div>

                        {/* Password */}
                        <div>
                          <label className={labelClass}>Password</label>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={inputClass}
                            placeholder="Min. 8 characters"
                          />
                          {state.fieldErrors?.password && (
                            <p className="mt-1 text-xs text-red-400">
                              {state.fieldErrors.password[0]}
                            </p>
                          )}
                        </div>

                        <Separator className="bg-[#2a2826]" />

                        {/* Business Name */}
                        <div>
                          <label className={labelClass}>Business Name</label>
                          <input
                            type="text"
                            value={storeName}
                            onChange={(e) => setStoreName(e.target.value)}
                            className={inputClass}
                            placeholder="Taste of Motherland"
                          />
                        </div>

                        {/* Business Description */}
                        <div>
                          <label className={labelClass}>
                            Business Description{" "}
                            <span className="text-white/20 normal-case tracking-normal">(optional)</span>
                          </label>
                          <textarea
                            value={storeDescription}
                            onChange={(e) => setStoreDescription(e.target.value)}
                            rows={3}
                            className={cn(inputClass, "resize-y min-h-[80px]")}
                            placeholder="Tell us what your business does..."
                          />
                        </div>

                        {/* Website */}
                        <div>
                          <label className={labelClass}>
                            Current Website{" "}
                            <span className="text-white/20 normal-case tracking-normal">(if any)</span>
                          </label>
                          <input
                            type="url"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            className={inputClass}
                            placeholder="https://mybrand.com"
                          />
                          <p className="mt-1.5 text-xs text-[#6b6762]">
                            Your Authentifactor workspace URL will be generated after onboarding.
                          </p>
                        </div>

                        {/* Currency + Service Interest */}
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className={labelClass}>Currency</label>
                            <select
                              value={currency}
                              onChange={(e) => setCurrency(e.target.value)}
                              className={selectClass}
                            >
                              {currencies.map((c) => (
                                <option key={c.value} value={c.value} className="bg-gray-900">
                                  {c.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className={labelClass}>Service Interest</label>
                            <select
                              value={vertical}
                              onChange={(e) => setVertical(e.target.value)}
                              className={selectClass}
                            >
                              {verticals.map((v) => (
                                <option key={v.value} value={v.value} className="bg-gray-900">
                                  {v.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Nav */}
                      <div className="mt-8 flex items-center justify-between">
                        <button
                          onClick={goBack}
                          className="inline-flex items-center gap-2 rounded-full bg-[#252525] px-5 py-2.5 text-sm font-medium text-white/40 transition-colors hover:bg-[#2c2c2c] hover:text-white cursor-pointer"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Back
                        </button>
                        <button
                          onClick={goNext}
                          disabled={!canProceedStep2}
                          className="group inline-flex items-center gap-2 rounded-full bg-[#2DD4A0] px-6 py-3 text-sm font-semibold text-[#1e1e1e] transition-all hover:bg-[#1FA87D] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          Review & Launch
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ─── Sidebar ─── */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* Selected plan summary */}
                    <div className="rounded-2xl bg-[#201f1f] p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
                          Your Plan
                        </h4>
                        <button
                          onClick={() => { setDirection(-1); setStep(0); }}
                          className="text-xs text-[#2DD4A0] hover:underline cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2DD4A0]/20 text-[#2DD4A0]">
                          {planIcons[selectedPlan]}
                        </div>
                        <div>
                          <p className="font-semibold text-white">
                            {BILLING_PLANS[selectedPlan].name}
                          </p>
                          <p className="text-sm text-white/40">
                            £{formatPrice(BILLING_PLANS[selectedPlan].priceMonthly)}/mo
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* What you get */}
                    <div className="rounded-2xl bg-[#201f1f] p-6">
                      <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40 mb-4">
                        Included from day one
                      </h4>
                      <ul className="space-y-3">
                        {[
                          { icon: Zap, text: "Dedicated solution architect" },
                          { icon: CreditCard, text: "Stripe + Paystack integration" },
                          { icon: Globe, text: "AI, CRM & analytics included" },
                          { icon: Shield, text: "Cyber security & compliance" },
                          { icon: Lock, text: "30-day money-back guarantee" },
                        ].map((item) => (
                          <li key={item.text} className="flex items-center gap-3 text-sm text-white/60">
                            <item.icon className="h-4 w-4 text-[#2DD4A0] shrink-0" />
                            {item.text}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Social proof quote */}
                    <div className="rounded-2xl bg-[#201f1f] p-6">
                      <div className="flex gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-[#2DD4A0] text-[#2DD4A0]" />
                        ))}
                      </div>
                      <p className="text-sm text-white/60 leading-relaxed italic">
                        &ldquo;Authentifactor didn&apos;t just build our store — they architected
                        our entire digital strategy. Commerce, payments, brand, analytics,
                        all unified under one team.&rdquo;
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#2DD4A0] to-[#00BFFF]" />
                        <div>
                          <p className="text-xs font-medium text-white/70">Toks A.</p>
                          <p className="text-[11px] text-white/30">Taste of Motherland</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── Step 3: Confirm & Launch ─── */}
            {step === 2 && (
              <motion.div
                key="step-2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease }}
                className="mx-auto max-w-3xl"
              >
                <div className="rounded-2xl bg-[#201f1f] backdrop-blur-sm p-8">
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.2 }}
                      className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2DD4A0]/20 mb-4"
                    >
                      <Sparkles className="h-7 w-7 text-[#2DD4A0]" />
                    </motion.div>
                    <h2 className="text-2xl font-semibold text-white">
                      You&apos;re almost live
                    </h2>
                    <p className="mt-2 text-sm text-white/40">
                      Review your details and launch your store.
                    </p>
                  </div>

                  {/* Summary cards */}
                  <div className="grid gap-4 md:grid-cols-2 mb-8">
                    <div className="rounded-xl bg-[#252525] p-5">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-white/30 mb-3">
                        Plan
                      </h3>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2DD4A0]/20 text-[#2DD4A0]">
                          {planIcons[selectedPlan]}
                        </div>
                        <div>
                          <p className="font-semibold text-white">
                            {BILLING_PLANS[selectedPlan].name}
                          </p>
                          <p className="text-xs text-white/40">
                            £{formatPrice(BILLING_PLANS[selectedPlan].priceMonthly)}/mo
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-[#2DD4A0]">
                        30-day money-back guarantee
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#252525] p-5">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-white/30 mb-3">
                        Your Business
                      </h3>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2DD4A0]/20">
                          <Store className="h-4.5 w-4.5 text-[#2DD4A0]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {storeName || "—"}
                          </p>
                          {website && (
                            <p className="text-xs text-white/40">{website}</p>
                          )}
                        </div>
                      </div>
                      {storeDescription && (
                        <p className="mt-2 text-xs text-white/30 leading-relaxed line-clamp-2">
                          {storeDescription}
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl bg-[#252525] p-5">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-white/30 mb-3">
                        Contact
                      </h3>
                      <p className="text-sm font-medium text-white">
                        {firstName} {lastName}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">{email}</p>
                      {phone && <p className="text-xs text-white/40 mt-0.5">{phone}</p>}
                    </div>

                    <div className="rounded-xl bg-[#252525] p-5">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-white/30 mb-3">
                        Settings
                      </h3>
                      <p className="text-sm font-medium text-white">
                        {currencies.find((c) => c.value === currency)?.label}
                      </p>
                      {vertical && (
                        <p className="text-xs text-white/40 mt-0.5">
                          {verticals.find((v) => v.value === vertical)?.label}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Terms */}
                  <label className="flex items-start gap-3 mb-8 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-[#2DD4A0] focus:ring-[#2DD4A0]/30"
                    />
                    <span className="text-sm text-white/40 group-hover:text-white/60 transition-colors">
                      I agree to the{" "}
                      <Link
                        href="/legal/merchant-terms"
                        target="_blank"
                        className="text-[#2DD4A0] underline underline-offset-2 hover:text-[#1FA87D]"
                      >
                        Merchant Terms
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/legal/privacy"
                        target="_blank"
                        className="text-[#2DD4A0] underline underline-offset-2 hover:text-[#1FA87D]"
                      >
                        Privacy Policy
                      </Link>
                    </span>
                  </label>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={goBack}
                      className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] px-5 py-2.5 text-sm font-medium text-white/40 transition-colors hover:bg-white/[0.04] hover:text-white cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </button>
                    <form action={formAction}>
                      <input type="hidden" name="planId" value={selectedPlan} />
                      <input type="hidden" name="firstName" value={firstName} />
                      <input type="hidden" name="lastName" value={lastName} />
                      <input type="hidden" name="email" value={email} />
                      <input type="hidden" name="phone" value={phone} />
                      <input type="hidden" name="password" value={password} />
                      <input type="hidden" name="storeName" value={storeName} />
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="currency" value={currency} />
                      {website && (
                        <input type="hidden" name="website" value={website} />
                      )}
                      {vertical && (
                        <input type="hidden" name="vertical" value={vertical} />
                      )}
                      {storeDescription && (
                        <input type="hidden" name="storeDescription" value={storeDescription} />
                      )}
                      {refCode && (
                        <input type="hidden" name="referredBy" value={refCode} />
                      )}
                      <button
                        type="submit"
                        disabled={!canSubmit || isPending}
                        className="group inline-flex items-center gap-2.5 rounded-full bg-[#2DD4A0] px-8 py-3.5 text-sm font-bold text-[#1e1e1e] shadow-lg shadow-[#2DD4A0]/25 transition-all hover:bg-[#1FA87D] hover:shadow-[#2DD4A0]/40 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Setting up your project...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Start My Project
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Trust strip */}
                  <div className="mt-8 pt-6 flex flex-wrap items-center justify-center gap-6 text-white/20">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Lock className="h-3 w-3" />
                      <span>SSL Encrypted</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Shield className="h-3 w-3" />
                      <span>GDPR Compliant</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <CreditCard className="h-3 w-3" />
                      <span>30-day guarantee</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Bottom support line ─── */}
          <motion.p
            className="text-center text-xs text-white/20 mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Questions?{" "}
            <a
              href="mailto:cs@authentifactor.com"
              className="text-[#2DD4A0]/60 hover:text-[#2DD4A0] hover:underline transition-colors"
            >
              cs@authentifactor.com
            </a>
            {" "}— we typically reply within 2 hours.
          </motion.p>
        </div>
      </div>
    </div>
  );
}
