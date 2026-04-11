import { NextRequest, NextResponse } from "next/server";
import {
  createSession,
  listSessions,
  deleteSession,
  renameSession,
  getHistory,
} from "@/lib/local-ai/memory";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("id");
  if (sessionId) {
    const history = await getHistory(sessionId, Number(url.searchParams.get("limit") ?? 50));
    return NextResponse.json({ sessionId, history });
  }
  const sessions = await listSessions(Number(url.searchParams.get("limit") ?? 50));
  return NextResponse.json({ sessions });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const session = await createSession(body.title);
  return NextResponse.json(session);
}

export async function PATCH(req: NextRequest) {
  const { id, title } = await req.json();
  if (!id || !title) {
    return NextResponse.json({ error: "id and title required" }, { status: 400 });
  }
  await renameSession(id, title);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await deleteSession(id);
  return NextResponse.json({ ok: true });
}
