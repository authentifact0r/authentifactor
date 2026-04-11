import { NextRequest } from "next/server";
import { smartLLMStream } from "@/lib/smart-llm";

export const runtime = "nodejs";
export const maxDuration = 600;

/**
 * Server-Sent Events streaming chat.
 *
 * Request:
 *   POST /api/local-ai/stream { prompt, system?, complexity?, maxTokens? }
 *
 * Response: `text/event-stream` with two event types:
 *   data: {"token":"<chunk>"}   — per-token delta
 *   data: {"done":true}         — terminator
 */
export async function POST(req: NextRequest) {
  const { prompt, system, complexity, maxTokens } = await req.json();
  if (!prompt || typeof prompt !== "string") {
    return new Response(JSON.stringify({ error: "prompt is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      try {
        const iter = smartLLMStream({ prompt, system, complexity, maxTokens });
        for await (const chunk of iter) send({ token: chunk });
        send({ done: true });
      } catch (err) {
        send({ error: (err as Error).message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
