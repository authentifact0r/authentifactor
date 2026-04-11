import { NextRequest, NextResponse } from "next/server";
import { smartLLM } from "@/lib/smart-llm";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { prompt, system, complexity, maxTokens, jsonMode } = await req.json();
  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }
  const res = await smartLLM({ prompt, system, complexity, maxTokens, jsonMode });
  return NextResponse.json(res);
}
