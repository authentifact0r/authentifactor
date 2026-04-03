import Stripe from "stripe";

// Lazy init — don't throw at import time so builds succeed without env vars
let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is required");
    _stripe = new Stripe(key, { typescript: true });
  }
  return _stripe;
}

// Proxy so callers can use `stripe.customers.create(...)` as normal
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop];
  },
});

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
