import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
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
