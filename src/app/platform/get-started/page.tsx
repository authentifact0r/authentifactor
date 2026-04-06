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
} from "lucide-react";
import { signupTenant, type SignupState } from "@/actions/signup";
import { BILLING_PLANS, type BillingPlanId } from "@/config/billingPlans";
import Link from "next/link";

/* ─── Motion ─── */
const ease = [0.16, 1, 0.3, 1];

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
  { value: "", label: "Select your industry (optional)" },
  { value: "grocery", label: "Grocery & Food" },
  { value: "fashion", label: "Fashion & Textiles" },
  { value: "catering", label: "Catering & Meal Prep" },
  { value: "beauty", label: "Beauty & Cosmetics" },
  { value: "education", label: "Education & Learning" },
  { value: "other", label: "Other" },
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
  const [selectedPlan, setSelectedPlan] = useState<BillingPlanId>("standard");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [slug, setSlug] = useState("");
  const [currency, setCurrency] = useState("GBP");
  const [vertical, setVertical] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Slug availability
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugSuggestion, setSlugSuggestion] = useState<string | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  // Server action
  const [state, formAction, isPending] = useActionState<SignupState, FormData>(
    signupTenant,
    {}
  );

  // Auto-generate slug from store name
  useEffect(() => {
    if (storeName) {
      const generated = storeName
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
      setSlugAvailable(null);
      setSlugSuggestion(null);
    }
  }, [storeName]);

  // Debounced slug check
  useEffect(() => {
    if (!slug || slug.length < 2) {
      setSlugAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingSlug(true);
      try {
        const res = await fetch(
          `/api/platform/check-slug?slug=${encodeURIComponent(slug)}`
        );
        const data = await res.json();
        setSlugAvailable(data.available);
        setSlugSuggestion(data.suggestion ?? null);
      } catch {
        setSlugAvailable(null);
      } finally {
        setCheckingSlug(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [slug]);

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
    firstName && lastName && email && password.length >= 8 && storeName && slug && slugAvailable === true;
  const canSubmit = agreedToTerms && canProceedStep2;

  return (
    <div className="min-h-screen bg-gray-950 pt-28 pb-20">
      <div className="mx-auto max-w-4xl px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
        >
          {refCode ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-amber-400 mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              You were referred! Enjoy your 14-day free trial
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-400 mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              14-day free trial — no card required
            </div>
          )}
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Launch your store
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            From zero to live storefront in under 5 minutes.
          </p>
        </motion.div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-3 mb-12">
          {["Choose Plan", "Your Details", "Launch"].map((label, i) => (
            <button
              key={label}
              onClick={() => {
                if (i < step) {
                  setDirection(-1);
                  setStep(i);
                }
              }}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                i === step
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : i < step
                    ? "bg-white/5 text-white border border-white/10 cursor-pointer hover:bg-white/10"
                    : "bg-white/[0.02] text-gray-600 border border-white/[0.04]"
              }`}
            >
              {i < step ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                    i === step
                      ? "bg-emerald-500 text-white"
                      : "bg-white/10 text-gray-500"
                  }`}
                >
                  {i + 1}
                </span>
              )}
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Error display */}
        {state.error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          >
            {state.error}
          </motion.div>
        )}

        {/* Steps */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm min-h-[500px]">
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
                className="p-8"
              >
                <h2 className="text-xl font-semibold text-white mb-2">
                  Choose your plan
                </h2>
                <p className="text-sm text-gray-400 mb-8">
                  All plans include a 14-day free trial. Upgrade or downgrade
                  anytime.
                </p>

                <div className="grid gap-4 md:grid-cols-3">
                  {plans.map((plan) => {
                    const isSelected = selectedPlan === plan.id;
                    return (
                      <button
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`relative rounded-xl border p-6 text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-emerald-500/50 bg-emerald-500/[0.08] ring-1 ring-emerald-500/30"
                            : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
                        }`}
                      >
                        {plan.id === "standard" && (
                          <span className="absolute -top-2.5 right-4 rounded-full bg-emerald-500 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                            Popular
                          </span>
                        )}
                        <h3 className="text-lg font-semibold text-white">
                          {plan.name}
                        </h3>
                        <div className="mt-2 flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-white">
                            £{plan.priceMonthly}
                          </span>
                          <span className="text-sm text-gray-500">/mo</span>
                        </div>
                        <p className="mt-3 text-xs text-gray-400 leading-relaxed">
                          {plan.description}
                        </p>
                        <ul className="mt-5 space-y-2">
                          {plan.features.map((feature) => (
                            <li
                              key={feature}
                              className="flex items-start gap-2 text-xs text-gray-300"
                            >
                              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        {isSelected && (
                          <motion.div
                            layoutId="plan-selected"
                            className="absolute inset-0 rounded-xl border-2 border-emerald-500/50 pointer-events-none"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={goNext}
                    disabled={!canProceedStep1}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-950 transition-all hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </button>
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
                className="p-8"
              >
                <h2 className="text-xl font-semibold text-white mb-2">
                  Your details
                </h2>
                <p className="text-sm text-gray-400 mb-8">
                  Set up your account and store.
                </p>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* First Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                      placeholder="Jane"
                    />
                    {state.fieldErrors?.firstName && (
                      <p className="mt-1 text-xs text-red-400">
                        {state.fieldErrors.firstName[0]}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                      placeholder="Doe"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                      placeholder="jane@mybrand.com"
                    />
                    {state.fieldErrors?.email && (
                      <p className="mt-1 text-xs text-red-400">
                        {state.fieldErrors.email[0]}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                      placeholder="Min. 8 characters"
                    />
                    {state.fieldErrors?.password && (
                      <p className="mt-1 text-xs text-red-400">
                        {state.fieldErrors.password[0]}
                      </p>
                    )}
                  </div>

                  {/* Store Name — full width */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      Store Name
                    </label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                      placeholder="Taste of Motherland"
                    />
                  </div>

                  {/* Store URL */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      Store URL
                    </label>
                    <div className="flex items-center rounded-lg border border-white/[0.08] bg-white/[0.04] overflow-hidden focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/30">
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => {
                          setSlug(e.target.value);
                          setSlugAvailable(null);
                          setSlugSuggestion(null);
                        }}
                        className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-gray-600 outline-none"
                        placeholder="my-store"
                      />
                      <span className="px-4 text-xs text-gray-500 shrink-0 border-l border-white/[0.06]">
                        .authentifactor.com
                      </span>
                    </div>
                    {/* Slug status */}
                    <div className="mt-1.5 h-4">
                      {checkingSlug && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Checking availability...
                        </span>
                      )}
                      {!checkingSlug && slugAvailable === true && (
                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          {slug}.authentifactor.com is available
                        </span>
                      )}
                      {!checkingSlug && slugAvailable === false && (
                        <span className="text-xs text-red-400">
                          Not available.
                          {slugSuggestion && (
                            <>
                              {" "}Try{" "}
                              <button
                                type="button"
                                onClick={() => {
                                  setSlug(slugSuggestion);
                                  setSlugAvailable(null);
                                  setSlugSuggestion(null);
                                }}
                                className="underline hover:text-red-300 cursor-pointer"
                              >
                                {slugSuggestion}
                              </button>
                              ?
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Currency */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                    >
                      {currencies.map((c) => (
                        <option
                          key={c.value}
                          value={c.value}
                          className="bg-gray-900"
                        >
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Vertical */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      Industry
                    </label>
                    <select
                      value={vertical}
                      onChange={(e) => setVertical(e.target.value)}
                      className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                    >
                      {verticals.map((v) => (
                        <option
                          key={v.value}
                          value={v.value}
                          className="bg-gray-900"
                        >
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <button
                    onClick={goBack}
                    className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] px-5 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-white/[0.04] hover:text-white cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                  <button
                    onClick={goNext}
                    disabled={!canProceedStep2}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-950 transition-all hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </button>
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
                className="p-8"
              >
                <h2 className="text-xl font-semibold text-white mb-2">
                  Ready to launch
                </h2>
                <p className="text-sm text-gray-400 mb-8">
                  Review your details and launch your store.
                </p>

                {/* Summary cards */}
                <div className="grid gap-4 md:grid-cols-2 mb-8">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                    <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-3">
                      Plan
                    </h3>
                    <p className="text-lg font-semibold text-white">
                      {BILLING_PLANS[selectedPlan].name}
                    </p>
                    <p className="text-sm text-gray-400">
                      £{BILLING_PLANS[selectedPlan].priceMonthly}/mo after trial
                    </p>
                    <p className="mt-2 text-xs text-emerald-400">
                      14-day free trial — no card required
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                    <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-3">
                      Your Store
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                        <Store className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {storeName || "—"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {slug}.authentifactor.com
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                    <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-3">
                      Account
                    </h3>
                    <p className="text-sm text-white">
                      {firstName} {lastName}
                    </p>
                    <p className="text-xs text-gray-400">{email}</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                    <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-3">
                      Settings
                    </h3>
                    <p className="text-sm text-white">
                      {currencies.find((c) => c.value === currency)?.label}
                    </p>
                    {vertical && (
                      <p className="text-xs text-gray-400">
                        {verticals.find((v) => v.value === vertical)?.label}
                      </p>
                    )}
                  </div>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-3 mb-8 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/30"
                  />
                  <span className="text-sm text-gray-400">
                    I agree to the{" "}
                    <Link
                      href="/legal/merchant-terms"
                      target="_blank"
                      className="text-emerald-400 underline hover:text-emerald-300"
                    >
                      Merchant Terms
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/legal/privacy"
                      target="_blank"
                      className="text-emerald-400 underline hover:text-emerald-300"
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </label>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={goBack}
                    className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] px-5 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-white/[0.04] hover:text-white cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                  <form action={formAction}>
                    <input type="hidden" name="planId" value={selectedPlan} />
                    <input type="hidden" name="firstName" value={firstName} />
                    <input type="hidden" name="lastName" value={lastName} />
                    <input type="hidden" name="email" value={email} />
                    <input type="hidden" name="password" value={password} />
                    <input type="hidden" name="storeName" value={storeName} />
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="currency" value={currency} />
                    {vertical && (
                      <input type="hidden" name="vertical" value={vertical} />
                    )}
                    {refCode && (
                      <input type="hidden" name="referredBy" value={refCode} />
                    )}
                    <button
                      type="submit"
                      disabled={!canSubmit || isPending}
                      className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/40 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Launching your store...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Launch My Store
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
