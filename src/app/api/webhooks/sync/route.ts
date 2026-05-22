import { NextRequest, NextResponse } from "next/server";
import {
  verifyInternalSecret,
  SecretMisconfiguredError,
} from "@/lib/internal-secret";

// 2026-05-20 hardening (audit HIGH — unauthenticated deploy-hook trigger):
// this route triggers a Vercel deploy hook. Previously anyone on the
// internet could POST a known tenant slug and spam deploys (build-budget
// burn / pipeline DoS). It now requires the `x-internal-secret` header
// to match `WEBHOOKS_SYNC_SECRET`, compared in constant time. Fails
// closed (500) if the secret env var is unset.
export async function POST(request: NextRequest) {
  try {
    let authorized: boolean;
    try {
      authorized = verifyInternalSecret(
        "WEBHOOKS_SYNC_SECRET",
        request.headers.get("x-internal-secret"),
      );
    } catch (e) {
      if (e instanceof SecretMisconfiguredError) {
        console.error("/api/webhooks/sync:", e.message);
        return NextResponse.json(
          { error: "Server misconfigured" },
          { status: 500 },
        );
      }
      throw e;
    }
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tenantSlug } = await request.json();

    const deployHooks: Record<string, string> = {
      "styled-by-maryam": process.env.DEPLOY_HOOK_STYLED_BY_MARYAM || "",
    };

    const hookUrl = deployHooks[tenantSlug];
    if (!hookUrl) return NextResponse.json({ message: "No deploy hook for this tenant" });

    await fetch(hookUrl, { method: "POST" });
    return NextResponse.json({ success: true, message: `Deploy triggered for ${tenantSlug}` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
