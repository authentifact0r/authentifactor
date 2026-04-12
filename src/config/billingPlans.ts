export type BillingPlanId = "accelerator" | "growth" | "transformation";

export interface BillingPlan {
  id: BillingPlanId;
  name: string;
  stripePriceId: string;
  stripeProductId: string;
  priceMonthly: number;
  currency: "gbp";
  tagline: string;
  description: string;
  hours: string;
  features: string[];
}

export const BILLING_PLANS: Record<BillingPlanId, BillingPlan> = {
  accelerator: {
    id: "accelerator",
    name: "Accelerator",
    stripePriceId: process.env.STRIPE_PRICE_BASIC ?? "",
    stripeProductId: process.env.STRIPE_PRODUCT_BASIC ?? "",
    priceMonthly: 1995,
    currency: "gbp",
    tagline: "Transform Your Digital Presence",
    description: "For founders and SMBs ready to professionalise their digital operations with expert guidance.",
    hours: "15 hrs/mo",
    features: [
      "15 hours of expert consulting per month",
      "Commerce platform audit + optimisation roadmap",
      "1 AI automation workflow (email, ops, or content)",
      "Lead generation audit + 2 campaign optimisations",
      "Monthly KPI dashboard + analytics reporting",
      "Dedicated Slack channel for async support",
      "48-hour response time SLA",
      "Quarterly strategy review",
    ],
  },
  growth: {
    id: "growth",
    name: "Growth Partner",
    stripePriceId: process.env.STRIPE_PRICE_STANDARD ?? "",
    stripeProductId: process.env.STRIPE_PRODUCT_STANDARD ?? "",
    priceMonthly: 4995,
    currency: "gbp",
    tagline: "Scale Your Revenue",
    description: "For scaling brands that need a full-spectrum digital team — commerce, AI, CRM, payments, and analytics integrated.",
    hours: "40 hrs/mo",
    features: [
      "40 hours of expert consulting per month",
      "Dedicated solution architect assigned",
      "Commerce + platform ongoing optimisation & A/B testing",
      "Up to 4 AI automation workflows per month",
      "Full CRM audit, segmentation & implementation",
      "Payment stack optimisation (Stripe, Paystack, Apple Pay)",
      "Funnel optimisation + monthly campaign iterations",
      "Custom BI dashboards + cohort analysis",
      "2 operational automations per month",
      "Annual security audit included",
      "Monthly strategy reviews + team training session",
      "24-hour priority response SLA",
    ],
  },
  transformation: {
    id: "transformation",
    name: "Transformation",
    stripePriceId: process.env.STRIPE_PRICE_PREMIUM ?? "",
    stripeProductId: process.env.STRIPE_PRODUCT_PREMIUM ?? "",
    priceMonthly: 9995,
    currency: "gbp",
    tagline: "Own Your Digital Future",
    description: "Enterprise-grade digital transformation with a dedicated team across all 10 service areas plus strategic advisory.",
    hours: "80 hrs/mo",
    features: [
      "80 hours of expert consulting per month",
      "Dedicated architect + full specialist team",
      "All 10 services, fully integrated",
      "Up to 10 custom AI workflows + personalisation engine",
      "Omnichannel CRM + predictive customer modelling",
      "Multi-currency payment & embedded finance setup",
      "Brand strategy audits + positioning refresh",
      "Unlimited lead gen campaigns + pipeline analysis",
      "Real-time BI platform + predictive analytics",
      "5+ operational automations per month",
      "Monthly cyber security reviews + GDPR/PCI compliance",
      "Quarterly board-level strategy sessions",
      "Annual 12-month digital transformation roadmap",
      "4-hour response SLA with 24/7 escalation",
      "Weekly standups + unlimited team training",
    ],
  },
};

export function getPlan(planId: BillingPlanId): BillingPlan {
  return BILLING_PLANS[planId];
}

export function getAllPlans(): BillingPlan[] {
  return Object.values(BILLING_PLANS);
}
