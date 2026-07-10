import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/api-error";
import { tenantStripe } from "@/lib/tenant-stripe";

/**
 * Void an unpaid tenant invoice. Stripe invoices cannot be edited once
 * sent — the amend flow sends a corrected invoice, then voids the
 * original here. Guarded to `tenant-invoicing` metadata (and to the
 * caller's tenant on the shared platform account) so subscription and
 * checkout invoices can never be voided from this endpoint.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> },
) {
  try {
    const user = await requireAdmin();
    const { invoiceId } = await params;
    if (!/^in_[A-Za-z0-9]+$/.test(invoiceId)) {
      return NextResponse.json({ error: "Valid invoiceId required" }, { status: 400 });
    }

    const { client: stripe, ownAccount } = await tenantStripe(user.tenantId);
    const invoice = await stripe.invoices.retrieve(invoiceId);

    if (invoice.metadata?.source !== "tenant-invoicing") {
      return NextResponse.json(
        { error: "Only invoices created by tenant invoicing can be voided" },
        { status: 403 },
      );
    }
    if (!ownAccount && invoice.metadata?.tenantId !== user.tenantId) {
      return NextResponse.json({ error: "Invoice belongs to another tenant" }, { status: 403 });
    }
    if (invoice.status !== "open") {
      return NextResponse.json(
        { error: `Only open invoices can be voided (this one is ${invoice.status})` },
        { status: 409 },
      );
    }

    const voided = await stripe.invoices.voidInvoice(invoiceId);
    return NextResponse.json({ invoiceId: voided.id, status: voided.status });
  } catch (error) {
    return apiError(error, { context: "admin/invoices/[invoiceId]/void POST" });
  }
}
