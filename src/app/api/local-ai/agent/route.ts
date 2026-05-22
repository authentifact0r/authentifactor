import { NextRequest, NextResponse } from "next/server";
import { runAgentLoop } from "@/lib/local-ai/agent-loop";
import { requireAdmin } from "@/lib/auth";
import { readJsonBody, PayloadTooLargeError } from "@/lib/read-body";

export const runtime = "nodejs";
export const maxDuration = 300;

// Hard caps so a prompt-injected `maxSteps: 9999` can't exhaust budgets.
const MAX_STEPS_HARD_CAP = 12;
const MAX_QUESTION_LEN = 4000;

export async function POST(req: NextRequest) {
  try {
    // 2026-05-20 hardening (audit CRITICAL #9): previously this route
    // was anonymously callable, and the agent loop exposes a
    // `callLocalApi` tool that loopbacks into the same API surface
    // (without the caller's cookies — so it reached every other
    // unauthenticated route in the codebase and returned the body to
    // the unauth caller). Gate the whole agent behind admin auth as
    // the minimal fix; the callLocalApi tool still needs to be
    // allow-listed (tracked as a separate remediation in
    // `src/lib/local-ai/tools.ts`).
    await requireAdmin();

    // 2026-05-22 hardening (audit MEDIUM — no body-size limits):
    // readJsonBody rejects oversized payloads (the agent body is small;
    // 256 KB is generous). A malformed-JSON body still degrades to {}.
    let body: Record<string, unknown> = {};
    try {
      body = await readJsonBody<Record<string, unknown>>(req, 256 * 1024);
    } catch (e) {
      if (e instanceof PayloadTooLargeError) {
        return NextResponse.json({ error: "Request body too large" }, { status: 413 });
      }
      // malformed JSON — fall through with an empty body
    }
    const question = typeof body?.question === "string" ? body.question.slice(0, MAX_QUESTION_LEN) : null;
    if (!question) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }
    const maxStepsRaw = Number(body?.maxSteps);
    const maxSteps = Number.isFinite(maxStepsRaw)
      ? Math.max(1, Math.min(MAX_STEPS_HARD_CAP, Math.floor(maxStepsRaw)))
      : undefined;

    const complexity =
      body?.complexity === "simple" ||
      body?.complexity === "medium" ||
      body?.complexity === "high"
        ? body.complexity
        : undefined;
    const result = await runAgentLoop(question, {
      maxSteps,
      complexity,
      sessionId: typeof body?.sessionId === "string" ? body.sessionId : undefined,
    });
    return NextResponse.json(result);
  } catch (error: any) {
    if (error?.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error?.message?.startsWith("Forbidden")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("local-ai agent error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
