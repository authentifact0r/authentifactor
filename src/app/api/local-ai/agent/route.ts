import { NextRequest, NextResponse } from "next/server";
import { runAgentLoop } from "@/lib/local-ai/agent-loop";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const { question, maxSteps, complexity, sessionId } = await req.json();
  if (!question || typeof question !== "string") {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }
  const result = await runAgentLoop(question, { maxSteps, complexity, sessionId });
  return NextResponse.json(result);
}
