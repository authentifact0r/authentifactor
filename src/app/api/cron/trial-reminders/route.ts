import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendTrialExpiryReminder } from "@/lib/email";

// Call this daily via Vercel Cron or external scheduler
// Sends reminders at 3 days and 1 day before trial expiry
export async function GET(request: NextRequest) {
  // Simple auth via secret header (for cron jobs)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find tenants whose trial ends in 1 or 3 days
  const reminderWindows = [1, 3];
  let sent = 0;

  for (const daysLeft of reminderWindows) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + daysLeft);
    const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const tenants = await db.tenant.findMany({
      where: {
        trialEndsAt: { gte: dayStart, lt: dayEnd },
        billingStatus: "active",
        stripeCustomerId: { not: null },
      },
      include: {
        tenantUsers: {
          where: { role: "ADMIN" },
          include: { user: { select: { email: true, firstName: true } } },
          take: 1,
        },
      },
    });

    for (const tenant of tenants) {
      const admin = tenant.tenantUsers[0];
      if (!admin) continue;

      const planNames: Record<string, string> = {
        accelerator: "Accelerator",
        growth: "Growth Partner",
        transformation: "Transformation",
      };

      await sendTrialExpiryReminder({
        to: admin.user.email,
        firstName: admin.user.firstName,
        storeName: tenant.name,
        storeSlug: tenant.slug,
        daysLeft,
        planName: planNames[tenant.billingPlan] ?? "Accelerator",
      });
      sent++;
    }
  }

  return NextResponse.json({ ok: true, sent });
}
