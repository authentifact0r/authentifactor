import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/auth";

// 2026-05-20 hardening (audit HIGH / LOW): a real server-side logout.
// `clearAuthCookies()` revokes the persisted RefreshToken row before
// deleting the browser cookies, so a previously-issued refresh token
// is dead immediately — not valid for the rest of its 7-day TTL.
export async function POST() {
  await clearAuthCookies();
  return NextResponse.json({ success: true });
}
