import { NextRequest, NextResponse } from "next/server";
import { getScopedDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const tdb = await getScopedDb();
    const { id } = await request.json();

    const campaign = await tdb.campaign.findFirst({ where: { id } });
    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    if (campaign.status !== "draft") return NextResponse.json({ error: "Campaign already sent" }, { status: 400 });

    // Get matching subscribers
    const where: any = { unsubscribedAt: null };
    if (campaign.channel === "email" || campaign.audience === "email-only") {
      where.emailOptIn = true;
      where.email = { not: null };
    }
    if (campaign.channel === "sms" || campaign.audience === "sms-only") {
      where.smsOptIn = true;
      where.phone = { not: null };
    }

    const subscribers = await tdb.subscriber.findMany({ where });

    let sentCount = 0;
    let failedCount = 0;
    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Authentifactor <hello@authentifactor.com>";

    if (resendKey && (campaign.channel === "email" || campaign.channel === "both")) {
      const resend = new Resend(resendKey);
      const emailSubscribers = subscribers.filter((s) => s.email && s.emailOptIn);

      for (const sub of emailSubscribers) {
        try {
          await resend.emails.send({
            from: fromEmail,
            to: sub.email!,
            subject: campaign.subject || campaign.title,
            html: campaign.body,
          });
          sentCount++;
        } catch {
          failedCount++;
        }
      }
    } else {
      sentCount = subscribers.length;
    }

    await tdb.campaign.update({
      where: { id },
      data: { status: "sent", sentCount, failedCount, sentAt: new Date() },
    });

    return NextResponse.json({ success: true, sentCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
