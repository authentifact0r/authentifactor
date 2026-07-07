import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { db } from "@/lib/db";
import { stripe as platformStripe } from "@/lib/stripe";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/api-error";

/**
 * Tenant invoicing — create and send Stripe invoices to a tenant's clients.
 * Stripe emails the client a hosted invoice page with a pay link.
 *
 * Key selection: the tenant's own Stripe account (Tenant.stripeSecretKey)
 * when configured, else the platform account with `metadata.tenantId`
 * scoping. Paystack invoicing is NOT included — Stripe currencies only
 * (gbp/usd/eur); NGN collection stays on Paystack checkout.
 */

const INVOICE_CURRENCIES = ["gbp", "usd", "eur"] as const;

const createSchema = z.object({
  clientEmail: z.string().email().transform((v) => v.toLowerCase()),
  clientName: z.string().trim().max(120).optional().default(""),
  description: z.string().trim().min(1).max(500),
  memo: z.string().trim().max(500).optional().default(""),
  amount: z.number().min(1).max(100000),
  currency: z.enum(INVOICE_CURRENCIES).default("gbp"),
  daysUntilDue: z.number().int().min(1).max(90).default(14),
});

async function tenantStripe(tenantId: string): Promise<{ client: Stripe; ownAccount: boolean }> {
  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    select: { stripeSecretKey: true },
  });
  if (tenant?.stripeSecretKey) {
    return { client: new Stripe(tenant.stripeSecretKey, { typescript: true }), ownAccount: true };
  }
  return { client: platformStripe, ownAccount: false };
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    const parsed = createSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 },
      );
    }
    const d = parsed.data;
    const { client: stripe } = await tenantStripe(user.tenantId);

    const found = await stripe.customers.list({ email: d.clientEmail, limit: 1 });
    const customer =
      found.data[0] ||
      (await stripe.customers.create({
        email: d.clientEmail,
        name: d.clientName || d.clientEmail,
        metadata: { tenantId: user.tenantId, source: "tenant-invoicing" },
      }));

    // Invoice first, then attach the line item explicitly — a pending
    // invoice item could otherwise ride along on an unrelated invoice.
    const invoice = await stripe.invoices.create({
      customer: customer.id,
      collection_method: "send_invoice",
      days_until_due: d.daysUntilDue,
      ...(d.memo && { description: d.memo }),
      metadata: { tenantId: user.tenantId, createdBy: user.id, source: "tenant-invoicing" },
    });
    await stripe.invoiceItems.create({
      customer: customer.id,
      invoice: invoice.id,
      amount: Math.round(d.amount * 100),
      currency: d.currency,
      description: d.description,
    });
    const sent = await stripe.invoices.sendInvoice(invoice.id as string);

    return NextResponse.json(
      {
        invoice: {
          id: sent.id,
          status: sent.status,
          hostedInvoiceUrl: sent.hosted_invoice_url,
          amountDue: sent.amount_due,
          currency: sent.currency,
          dueDate: sent.due_date,
          customerEmail: d.clientEmail,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return apiError(error, { context: "admin/invoices POST" });
  }
}

export async function GET() {
  try {
    const user = await requireAdmin();
    const { client: stripe, ownAccount } = await tenantStripe(user.tenantId);

    const list = await stripe.invoices.list({ limit: ownAccount ? 25 : 100 });
    const invoices = list.data
      // Platform account is shared across tenants — scope by metadata.
      .filter((inv) => ownAccount || inv.metadata?.tenantId === user.tenantId)
      .slice(0, 25)
      .map((inv) => ({
        id: inv.id,
        number: inv.number,
        customerEmail: inv.customer_email,
        customerName: inv.customer_name,
        amountDue: inv.amount_due,
        amountPaid: inv.amount_paid,
        currency: inv.currency,
        status: inv.status,
        hostedInvoiceUrl: inv.hosted_invoice_url,
        dueDate: inv.due_date,
        created: inv.created,
      }));

    return NextResponse.json({ invoices });
  } catch (error) {
    return apiError(error, { context: "admin/invoices GET" });
  }
}
