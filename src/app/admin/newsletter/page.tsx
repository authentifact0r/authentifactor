export const dynamic = "force-dynamic";

import { getScopedDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { headers } from "next/headers";
import { NewsletterManager } from "./newsletter-manager";

export default async function NewsletterPage() {
  await requireAdmin();
  const h = await headers();
  const tenantSlug = h.get("x-tenant-slug") || "";

  let subscribers: any[] = [];
  let campaigns: any[] = [];
  try {
    const tdb = await getScopedDb();
    subscribers = await tdb.subscriber.findMany({ orderBy: { createdAt: "desc" } });
    campaigns = await tdb.campaign.findMany({ orderBy: { createdAt: "desc" } });

    subscribers = subscribers.map((s: any) => ({
      id: s.id, email: s.email || "", phone: s.phone || "",
      firstName: s.firstName || "", lastName: s.lastName || "",
      source: s.source, emailOptIn: s.emailOptIn, smsOptIn: s.smsOptIn,
      tags: s.tags || [], createdAt: s.createdAt.toISOString(),
      unsubscribedAt: s.unsubscribedAt?.toISOString() || null,
    }));
    campaigns = campaigns.map((c: any) => ({
      id: c.id, title: c.title, subject: c.subject || "", body: c.body,
      channel: c.channel, status: c.status, audience: c.audience,
      audienceTag: c.audienceTag || "", sentCount: c.sentCount, failedCount: c.failedCount,
      sentAt: c.sentAt?.toISOString() || null, createdAt: c.createdAt.toISOString(),
    }));
  } catch {}

  return <NewsletterManager subscribers={subscribers} campaigns={campaigns} tenantSlug={tenantSlug} />;
}
