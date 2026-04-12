"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, setAuthCookies } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { slugify } from "@/lib/utils";
import { BILLING_PLANS, type BillingPlanId } from "@/config/billingPlans";
import { getTemplate } from "@/config/tenantTemplates";
import { rateLimit } from "@/lib/rateLimit";
import { sendWelcomeEmail, sendNewTenantAlert } from "@/lib/email";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

const signupSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  storeName: z.string().min(2, "Store name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  planId: z.enum(["accelerator", "growth", "transformation"]),
  currency: z.enum(["GBP", "NGN", "USD", "EUR", "GHS", "KES"]).default("GBP"),
  vertical: z
    .enum(["grocery", "fashion", "catering", "beauty", "education", "other"])
    .optional(),
  referredBy: z.string().optional(),
});

export type SignupState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function signupTenant(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  // Rate limit
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for") ?? "unknown";
  const { success: rateLimited } = rateLimit(`signup:${ip}`, 5, 3600_000);
  if (!rateLimited) {
    return { error: "Too many signup attempts. Please try again later." };
  }

  // Validate input
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    storeName: formData.get("storeName"),
    slug: formData.get("slug"),
    planId: formData.get("planId"),
    currency: formData.get("currency"),
    vertical: formData.get("vertical") || undefined,
    referredBy: formData.get("referredBy") || undefined,
  };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { email, password, firstName, lastName, storeName, planId, currency, vertical, referredBy } =
    parsed.data;
  const slug = slugify(parsed.data.slug);

  if (!slug) {
    return { error: "Invalid store slug." };
  }

  // Check uniqueness
  const [existingSlug, existingEmail] = await Promise.all([
    db.tenant.findUnique({ where: { slug }, select: { id: true } }),
    db.user.findUnique({ where: { email }, select: { id: true } }),
  ]);

  if (existingSlug) {
    return { error: "This store URL is already taken. Please choose another." };
  }
  if (existingEmail) {
    return { error: "An account with this email already exists. Please sign in instead." };
  }

  // Get billing plan
  const plan = BILLING_PLANS[planId as BillingPlanId];
  if (!plan) {
    return { error: "Invalid plan selected." };
  }

  // Validate referral code if provided
  let referrerTenantId: string | null = null;
  if (referredBy) {
    const referrer = await db.tenant.findUnique({
      where: { referralCode: referredBy },
      select: { id: true },
    });
    if (referrer) {
      referrerTenantId = referrer.id;
    }
  }

  // Generate referral code for the new tenant
  const referralCode = `${slug}-${Math.random().toString(36).substring(2, 6)}`;

  // Atomic DB provisioning
  const passwordHash = await hashPassword(password);
  const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

  let tenant;
  let user;

  try {
    const result = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
        },
      });

      // Apply template color scheme if vertical has a template
      const template = vertical ? getTemplate(vertical) : undefined;

      const newTenant = await tx.tenant.create({
        data: {
          name: storeName,
          slug,
          currency,
          billingPlan: planId,
          billingStatus: "active",
          signupSource: referrerTenantId ? "referral" : "self-service",
          trialEndsAt,
          vertical: vertical ?? null,
          referralCode,
          referredByTenantId: referrerTenantId,
          isPublicListing: false,
          ...(template && {
            primaryColor: template.colorScheme.primaryColor,
            accentColor: template.colorScheme.accentColor,
          }),
        },
      });

      await tx.tenantUser.create({
        data: {
          userId: newUser.id,
          tenantId: newTenant.id,
          role: "ADMIN",
        },
      });

      await tx.onboardingProgress.create({
        data: { tenantId: newTenant.id },
      });

      return { user: newUser, tenant: newTenant };
    });

    user = result.user;
    tenant = result.tenant;

    // Seed template data (shipping rules + sample products) — non-blocking
    if (template) {
      try {
        // Shipping rules
        if (template.shippingMethods.length > 0) {
          await db.shippingRule.createMany({
            data: template.shippingMethods.map((s) => ({
              tenantId: tenant.id,
              name: s.name,
              method: s.method,
              minWeightKg: s.minWeightKg,
              maxWeightKg: s.maxWeightKg,
              baseCost: s.baseCost,
              perKgCost: s.perKgCost,
              estimatedDays: s.estimatedDays,
            })),
          });
        }

        // Sample products
        if (template.sampleProducts.length > 0) {
          await db.product.createMany({
            data: template.sampleProducts.map((p) => ({
              tenantId: tenant.id,
              name: p.name,
              sku: p.sku,
              slug: p.slug,
              description: p.description,
              category: p.category,
              price: p.price,
              weightKg: p.weightKg,
              isPerishable: p.isPerishable,
              isSubscribable: p.isSubscribable,
              tags: p.tags,
              images: [],
            })),
          });
        }
      } catch (seedErr) {
        // Template seeding is non-critical — tenant is still usable
        console.error("Template seed error (non-fatal):", seedErr);
      }
    }
  } catch (err) {
    console.error("Signup DB error:", err);
    return { error: "Something went wrong creating your store. Please try again." };
  }

  // Create Stripe customer + subscription (non-atomic — failures are recoverable)
  try {
    const customer = await stripe.customers.create({
      email,
      name: `${firstName} ${lastName}`,
      metadata: {
        tenantId: tenant.id,
        tenantSlug: slug,
        signupSource: "self-service",
      },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: plan.stripePriceId }],
      trial_period_days: 14,
      trial_settings: {
        end_behavior: { missing_payment_method: "pause" },
      },
      metadata: {
        tenantId: tenant.id,
        tenantSlug: slug,
        planId,
      },
    });

    await db.tenant.update({
      where: { id: tenant.id },
      data: {
        stripeCustomerId: customer.id,
        stripeSubscriptionId: subscription.id,
        nextInvoiceDate: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : null,
      },
    });
  } catch (err) {
    console.error("Stripe setup error (non-fatal):", err);
    // Tenant is still usable during trial — mark billing as needing setup
    await db.tenant.update({
      where: { id: tenant.id },
      data: { billingStatus: "setup_pending" },
    });
  }

  // Send notification emails (non-blocking)
  const planLabel = plan.name;
  sendWelcomeEmail({
    to: email,
    firstName,
    storeName,
    storeSlug: slug,
    planName: planLabel,
    trialEndsAt,
  }).catch(() => {});

  sendNewTenantAlert({
    tenantName: storeName,
    tenantSlug: slug,
    ownerName: `${firstName} ${lastName}`,
    ownerEmail: email,
    plan: planLabel,
    signupSource: referrerTenantId ? "referral" : "self-service",
    vertical,
  }).catch(() => {});

  // Issue auth cookies and redirect to onboarding
  await setAuthCookies({
    userId: user.id,
    email: user.email,
    tenantId: tenant.id,
    tenantRole: "ADMIN",
  });

  redirect("/admin/onboarding");
}
