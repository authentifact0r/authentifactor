/**
 * Next.js instrumentation hook.
 *
 * Runs once per server process at startup. We use it to pre-warm the
 * local AI stack so the first real request doesn't pay cold-load
 * latency on any model. Fail-soft: warmup errors are logged but never
 * crash the app.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if ((process.env.LOCAL_AI_WARMUP ?? "true").toLowerCase() === "false") return;

  // Fire-and-forget. Don't block server startup on Ollama availability.
  import("./lib/local-ai/warmup")
    .then(({ warmLocalAiOnce }) => warmLocalAiOnce())
    .catch((err) => {
      console.warn("[local-ai] warmup skipped:", err);
    });
}
