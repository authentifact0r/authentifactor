/**
 * Pre-warm the local AI stack.
 *
 * Called from Next.js `instrumentation.ts` so the first real user request
 * doesn't pay cold-load latency on any model. Fires:
 *   - llama3.1:8b  (1 token)
 *   - qwen2.5:14b  (1 token)
 *   - nomic-embed-text (1 short embedding)
 *
 * All calls are fail-soft — warmup should never crash the app. Uses a
 * module-level latch so we only warm once per process.
 */

import { warmupLocalModels } from "../smart-llm";
import { embedText } from "./embeddings";

let warmed: Promise<void> | null = null;

export function warmLocalAiOnce(): Promise<void> {
  if (warmed) return warmed;
  warmed = (async () => {
    const t0 = Date.now();
    const [chat, embed] = await Promise.allSettled([
      warmupLocalModels(),
      embedText("warmup"),
    ]);
    const chatInfo =
      chat.status === "fulfilled"
        ? `fast=${chat.value.fast} smart=${chat.value.smart}`
        : `err=${(chat.reason as Error)?.message ?? "unknown"}`;
    const embedInfo = embed.status === "fulfilled" ? "ok" : "err";
    console.log(
      `[local-ai] warmup ${Date.now() - t0}ms — chat: ${chatInfo}, embed: ${embedInfo}`
    );
  })();
  return warmed;
}
