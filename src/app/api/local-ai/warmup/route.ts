import { NextResponse } from "next/server";
import { warmupLocalModels } from "@/lib/smart-llm";
import { embedText } from "@/lib/local-ai/embeddings";

export const runtime = "nodejs";

export async function POST() {
  const t0 = Date.now();
  const [chat, embed] = await Promise.allSettled([
    warmupLocalModels(),
    embedText("warmup"),
  ]);
  return NextResponse.json({
    durationMs: Date.now() - t0,
    chat: chat.status === "fulfilled" ? chat.value : { error: String(chat.reason) },
    embed:
      embed.status === "fulfilled"
        ? { ok: true, dim: embed.value.length }
        : { ok: false, error: String(embed.reason) },
  });
}
