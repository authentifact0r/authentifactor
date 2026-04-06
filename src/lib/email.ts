import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) return null;
    _resend = new Resend(key);
  }
  return _resend;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Authentifactor <hello@authentifactor.com>";
const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || "admin@authentifactor.com";

// ─── Welcome Email to New Merchant ─────────────────────────

export async function sendWelcomeEmail(params: {
  to: string;
  firstName: string;
  storeName: string;
  storeSlug: string;
  planName: string;
  trialEndsAt: Date;
}) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping welcome email");
    return;
  }

  const storeUrl = `https://${params.storeSlug}.authentifactor.com`;
  const onboardingUrl = `${storeUrl}/admin/onboarding`;
  const trialEnd = params.trialEndsAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Welcome to Authentifactor — ${params.storeName} is live!`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 24px; font-weight: 700; color: #111; margin: 0;">Welcome to Authentifactor</h1>
          </div>

          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Hi ${params.firstName},
          </p>

          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Your store <strong>${params.storeName}</strong> is live on Authentifactor! Here's what you need to know:
          </p>

          <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 8px; font-size: 14px; color: #166534;"><strong>Store URL:</strong> <a href="${storeUrl}" style="color: #059669;">${storeUrl}</a></p>
            <p style="margin: 0 0 8px; font-size: 14px; color: #166534;"><strong>Plan:</strong> ${params.planName}</p>
            <p style="margin: 0; font-size: 14px; color: #166534;"><strong>Free trial ends:</strong> ${trialEnd}</p>
          </div>

          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            <strong>Next step:</strong> Complete your store setup to start selling.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${onboardingUrl}" style="display: inline-block; background: #059669; color: white; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 9999px; text-decoration: none;">
              Complete Store Setup
            </a>
          </div>

          <p style="font-size: 14px; color: #666; line-height: 1.6;">
            Your 14-day free trial gives you full access to all features on the ${params.planName} plan. No credit card needed during the trial.
          </p>

          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0;" />

          <p style="font-size: 12px; color: #9CA3AF; text-align: center;">
            Authentifactor — The commerce platform for ambitious brands.<br/>
            <a href="https://authentifactor.com" style="color: #6B7280;">authentifactor.com</a>
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send welcome email:", err);
  }
}

// ─── Superadmin Alert: New Tenant Signup ────────────────────

export async function sendNewTenantAlert(params: {
  tenantName: string;
  tenantSlug: string;
  ownerName: string;
  ownerEmail: string;
  plan: string;
  signupSource: string;
  vertical?: string | null;
}) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping superadmin alert");
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: SUPERADMIN_EMAIL,
      subject: `New tenant signup: ${params.tenantName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="font-size: 20px; font-weight: 700; color: #111;">New Tenant Signup</h2>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Store</td><td style="padding: 8px 0; font-size: 14px; font-weight: 600;">${params.tenantName}</td></tr>
            <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Slug</td><td style="padding: 8px 0; font-size: 14px;">${params.tenantSlug}.authentifactor.com</td></tr>
            <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Owner</td><td style="padding: 8px 0; font-size: 14px;">${params.ownerName} (${params.ownerEmail})</td></tr>
            <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Plan</td><td style="padding: 8px 0; font-size: 14px;">${params.plan}</td></tr>
            <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Source</td><td style="padding: 8px 0; font-size: 14px;">${params.signupSource}</td></tr>
            ${params.vertical ? `<tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Vertical</td><td style="padding: 8px 0; font-size: 14px;">${params.vertical}</td></tr>` : ""}
          </table>

          <a href="https://authentifactor.com/superadmin/tenants" style="display: inline-block; background: #111; color: white; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
            View in Superadmin
          </a>

          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0;" />
          <p style="font-size: 12px; color: #9CA3AF;">Authentifactor Platform Alert</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send superadmin alert:", err);
  }
}

// ─── Trial Expiry Reminder ──────────────────────────────────

export async function sendTrialExpiryReminder(params: {
  to: string;
  firstName: string;
  storeName: string;
  storeSlug: string;
  daysLeft: number;
  planName: string;
}) {
  const resend = getResend();
  if (!resend) return;

  const billingUrl = `https://${params.storeSlug}.authentifactor.com/admin/billing`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `${params.daysLeft} day${params.daysLeft !== 1 ? "s" : ""} left on your free trial — ${params.storeName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="font-size: 20px; font-weight: 700; color: #111;">Your trial is ending soon</h2>

          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Hi ${params.firstName},
          </p>

          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Your free trial for <strong>${params.storeName}</strong> ends in <strong>${params.daysLeft} day${params.daysLeft !== 1 ? "s" : ""}</strong>.
            To keep your store running uninterrupted, add a payment method before your trial expires.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${billingUrl}" style="display: inline-block; background: #059669; color: white; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 9999px; text-decoration: none;">
              Add Payment Method
            </a>
          </div>

          <p style="font-size: 14px; color: #666; line-height: 1.6;">
            Your ${params.planName} plan is £${params.planName === "Basic" ? "49" : params.planName === "Standard" ? "99" : "199"}/month. You can change plans or cancel anytime.
          </p>

          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0;" />
          <p style="font-size: 12px; color: #9CA3AF; text-align: center;">Authentifactor — authentifactor.com</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send trial reminder:", err);
  }
}
