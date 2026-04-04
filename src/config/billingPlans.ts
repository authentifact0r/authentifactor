export type BillingPlanId = "basic" | "standard" | "premium";

export interface BillingPlan {
  id: BillingPlanId;
  name: string;
  stripePriceId: string;
  stripeProductId: string;
  priceMonthly: number;
  currency: "gbp";
  description: string;
  features: string[];
}

/**
 * Stripe Product + Price IDs.
 * Create these in Stripe Dashboard or via API, then paste IDs here.
 * These are placeholder IDs — replace with real ones before going live.
 */
export const BILLING_PLANS: Record<BillingPlanId, BillingPlan> = {
  basic: {
    id: "basic",
    name: "Basic",
    stripePriceId: process.env.STRIPE_PRICE_BASIC || "price_1TIOXA0UXmT8UaSajj68p0dp",
    stripeProductId: process.env.STRIPE_PRODUCT_BASIC || "prod_UGwQuFo4hlZrOQ",
    priceMonthly: 49,
    currency: "gbp",
    description: "Essential hosting, maintenance, and support for a single tenant storefront.",
    features: [
      "Managed hosting on Vercel",
      "SSL certificate + custom domain",
      "Monthly security updates",
      "Email support (48h response)",
      "Up to 100 products",
      "Basic analytics dashboard",
    ],
  },
  standard: {
    id: "standard",
    name: "Standard",
    stripePriceId: process.env.STRIPE_PRICE_STANDARD || "price_1TIOXB0UXmT8UaSaZm4pxf9Y",
    stripeProductId: process.env.STRIPE_PRODUCT_STANDARD || "prod_UGwQwhHudeI2Vs",
    priceMonthly: 99,
    currency: "gbp",
    description: "Full platform with SEO, automation, and priority support.",
    features: [
      "Everything in Basic",
      "SEO optimisation + sitemap",
      "Subscription & auto-ship engine",
      "Webhook automation pipelines",
      "Priority email support (24h response)",
      "Up to 500 products",
      "Advanced analytics + conversion tracking",
      "Monthly performance report",
    ],
  },
  premium: {
    id: "premium",
    name: "Premium",
    stripePriceId: process.env.STRIPE_PRICE_PREMIUM || "price_1TIOXC0UXmT8UaSaFaF3KBwU",
    stripeProductId: process.env.STRIPE_PRODUCT_PREMIUM || "prod_UGwQjvPYOryoPm",
    priceMonthly: 199,
    currency: "gbp",
    description: "Enterprise-grade with dedicated support, custom features, and SLA.",
    features: [
      "Everything in Standard",
      "Unlimited products",
      "Custom feature development (2h/mo included)",
      "Dedicated account manager",
      "Phone + Slack support",
      "99.9% uptime SLA",
      "Multi-warehouse inventory",
      "White-label mobile app shell",
      "Quarterly strategy review",
    ],
  },
};

export function getPlan(planId: BillingPlanId): BillingPlan {
  return BILLING_PLANS[planId];
}

export function getAllPlans(): BillingPlan[] {
  return Object.values(BILLING_PLANS);
}
