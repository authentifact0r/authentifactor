/**
 * Smart LLM Router
 *
 * Routes requests between local Ollama (free, offline-capable) and
 * Claude API (paid, frontier intelligence) based on task complexity.
 *
 * Strategy:
 * - "simple"  → Local Ollama (free, instant)
 * - "medium"  → Local Ollama with larger model
 * - "high"    → Claude API (only when frontier intelligence needed)
 * - "auto"    → Smart heuristic based on prompt length and keywords
 *
 * Falls back gracefully:
 * - If local fails (Ollama down) → Claude API
 * - If Claude fails (no API key, offline) → Local Ollama
 */

import Anthropic from "@anthropic-ai/sdk";
import { Agent, setGlobalDispatcher } from "undici";

// Ollama first-token on cold model load can take minutes. Raise undici's
// per-request header/body timeouts so long local calls don't die early.
setGlobalDispatcher(
  new Agent({
    headersTimeout: 15 * 60 * 1000,
    bodyTimeout: 15 * 60 * 1000,
    connectTimeout: 30 * 1000,
  })
);

export type TaskComplexity = "simple" | "medium" | "high" | "auto";

export interface SmartLLMOptions {
  /** The user's prompt or question */
  prompt: string;
  /** Optional system message */
  system?: string;
  /** Task complexity — controls routing. Default "auto" */
  complexity?: TaskComplexity;
  /** Force a specific provider — overrides complexity routing */
  provider?: "local" | "claude";
  /** Maximum tokens to generate. Default 1024 */
  maxTokens?: number;
  /** Force JSON output (Ollama format:json). Used by the agent loop. */
  jsonMode?: boolean;
}

export interface SmartLLMResponse {
  /** The generated text */
  text: string;
  /** Which provider was actually used */
  provider: "local" | "claude";
  /** Which model was used */
  model: string;
  /** Approximate cost in USD (0 for local) */
  costUsd: number;
}

// ─── Configuration ─────────────────────────────────────────

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

// Ollama keep_alive: number = seconds, -1 = forever, string with unit ("30m")
// also accepted. Parse env so a bare "-1" becomes the number -1.
function parseKeepAlive(): number | string {
  const raw = process.env.OLLAMA_KEEP_ALIVE;
  if (raw === undefined) return -1;
  const n = Number(raw);
  return Number.isFinite(n) ? n : raw;
}
const KEEP_ALIVE = parseKeepAlive();

const LOCAL_MODELS = {
  fast: process.env.OLLAMA_FAST_MODEL || "llama3.1:8b",      // Daily driver
  smart: process.env.OLLAMA_SMART_MODEL || "qwen2.5:14b",    // Heavier reasoning
};

// Sovereign mode: when true, we never reach out to Claude. Complex tasks
// fall back to the smart local model instead.
const OFFLINE_MODE =
  (process.env.OFFLINE_MODE ?? "true").toLowerCase() !== "false";

const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-opus-4-6";

// Claude pricing (per million tokens, as of 2026)
const CLAUDE_INPUT_COST_PER_MTOK = 15;
const CLAUDE_OUTPUT_COST_PER_MTOK = 75;

// ─── Auto-Complexity Heuristic ─────────────────────────────

const HIGH_COMPLEXITY_KEYWORDS = [
  "legal", "contract", "compliance", "financial", "audit",
  "architecture", "refactor", "security analysis", "vulnerability",
  "strategy", "business plan", "competitive analysis",
  "diagnose", "medical", "regulatory",
];

function detectComplexity(prompt: string): TaskComplexity {
  const length = prompt.length;
  const lower = prompt.toLowerCase();

  // Long prompts (>2000 chars) suggest complex tasks
  if (length > 2000) return "high";

  // Keyword-based detection
  if (HIGH_COMPLEXITY_KEYWORDS.some((k) => lower.includes(k))) {
    return "high";
  }

  // Medium-length prompts use medium model
  if (length > 500) return "medium";

  return "simple";
}

// ─── Local Ollama Provider ─────────────────────────────────

async function callOllama(
  prompt: string,
  system: string | undefined,
  model: string,
  maxTokens: number,
  jsonMode = false
): Promise<string> {
  const messages: { role: string; content: string }[] = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: prompt });

  // Use the native /api/chat endpoint so we can pass format:"json" for
  // strict JSON output — required by the agent loop.
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      format: jsonMode ? "json" : undefined,
      // Keep the model resident in VRAM forever so repeated calls never
      // pay the cold-load cost. Override with OLLAMA_KEEP_ALIVE if you
      // want to reclaim VRAM on an idle box.
      keep_alive: KEEP_ALIVE,
      options: { num_predict: maxTokens },
    }),
    signal: AbortSignal.timeout(
      Number(process.env.OLLAMA_TIMEOUT_MS ?? 600000)
    ),
  });

  if (!res.ok) {
    throw new Error(`Ollama error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.message?.content ?? "";
}

// ─── Claude Provider ────────────────────────────────────────

let _anthropic: Anthropic | null = null;
function getAnthropic(): Anthropic {
  if (!_anthropic) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error("ANTHROPIC_API_KEY not set");
    _anthropic = new Anthropic({ apiKey: key });
  }
  return _anthropic;
}

async function callClaude(
  prompt: string,
  system: string | undefined,
  maxTokens: number
): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
  const client = getAnthropic();
  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    system: system,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("\n");

  return {
    text,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
}

// ─── Public API ────────────────────────────────────────────

/**
 * Generate a response using the optimal provider based on task complexity.
 * Free local model for simple tasks, Claude for complex ones.
 */
export async function smartLLM(
  options: SmartLLMOptions
): Promise<SmartLLMResponse> {
  const {
    prompt,
    system,
    complexity: requestedComplexity = "auto",
    provider: forceProvider,
    maxTokens = 1024,
    jsonMode = false,
  } = options;

  const complexity =
    requestedComplexity === "auto" ? detectComplexity(prompt) : requestedComplexity;

  // Pick local model: simple → fast, medium/high → smart.
  const localModel =
    complexity === "simple" ? LOCAL_MODELS.fast : LOCAL_MODELS.smart;

  // Routing:
  // - explicit provider wins
  // - OFFLINE_MODE forces local, no matter the complexity
  // - otherwise high-complexity goes to Claude
  let provider: "local" | "claude";
  if (forceProvider) provider = forceProvider;
  else if (OFFLINE_MODE) provider = "local";
  else provider = complexity === "high" ? "claude" : "local";

  if (provider === "local") {
    try {
      const text = await callOllama(prompt, system, localModel, maxTokens, jsonMode);
      return { text, provider: "local", model: localModel, costUsd: 0 };
    } catch (err) {
      if (OFFLINE_MODE || !process.env.ANTHROPIC_API_KEY) throw err;
      console.warn("Local LLM failed, falling back to Claude:", err);
      provider = "claude";
    }
  }

  // Claude path (only reached if OFFLINE_MODE is false)
  try {
    const { text, inputTokens, outputTokens } = await callClaude(
      prompt,
      system,
      maxTokens
    );
    const costUsd =
      (inputTokens / 1_000_000) * CLAUDE_INPUT_COST_PER_MTOK +
      (outputTokens / 1_000_000) * CLAUDE_OUTPUT_COST_PER_MTOK;
    return { text, provider: "claude", model: CLAUDE_MODEL, costUsd };
  } catch (err) {
    console.warn("Claude failed, falling back to local:", err);
    const text = await callOllama(prompt, system, LOCAL_MODELS.fast, maxTokens, jsonMode);
    return { text, provider: "local", model: LOCAL_MODELS.fast, costUsd: 0 };
  }
}

// ─── Convenience Helpers ───────────────────────────────────

/** Quick local-only call for simple tasks */
export async function localLLM(prompt: string, system?: string): Promise<string> {
  const result = await smartLLM({ prompt, system, provider: "local" });
  return result.text;
}

/** Force Claude for complex reasoning */
export async function claudeLLM(prompt: string, system?: string): Promise<string> {
  const result = await smartLLM({ prompt, system, provider: "claude" });
  return result.text;
}

// ─── Streaming ─────────────────────────────────────────────

export interface SmartLLMStreamOptions extends Omit<SmartLLMOptions, "jsonMode"> {
  /** Called once per token chunk as the model emits them. */
  onToken?: (chunk: string) => void;
}

/**
 * Stream tokens from a local Ollama model.
 *
 * Returns an async iterable of string chunks AND a promise that resolves
 * to the full text once generation finishes. Errors are thrown from the
 * iterator. Uses the same routing rules as `smartLLM` but is local-only —
 * Claude streaming would need a different code path and we're sovereign
 * by default.
 */
export async function* smartLLMStream(
  options: SmartLLMStreamOptions
): AsyncGenerator<string, { text: string; model: string }, void> {
  const {
    prompt,
    system,
    complexity: requestedComplexity = "auto",
    maxTokens = 1024,
    onToken,
  } = options;

  const complexity =
    requestedComplexity === "auto" ? detectComplexity(prompt) : requestedComplexity;
  const model = complexity === "simple" ? LOCAL_MODELS.fast : LOCAL_MODELS.smart;

  const messages: { role: string; content: string }[] = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: prompt });

  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      keep_alive: KEEP_ALIVE,
      options: { num_predict: maxTokens },
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Ollama stream error: ${res.status} ${await res.text()}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Ollama emits newline-delimited JSON objects.
    let nl: number;
    while ((nl = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line) continue;
      try {
        const msg = JSON.parse(line);
        const chunk: string = msg.message?.content ?? "";
        if (chunk) {
          full += chunk;
          onToken?.(chunk);
          yield chunk;
        }
        if (msg.done) return { text: full, model };
      } catch {
        // Partial JSON mid-buffer — skip, it'll arrive on the next read.
      }
    }
  }
  return { text: full, model };
}

// ─── Warmup ────────────────────────────────────────────────

/**
 * Pre-load the hot local models into VRAM so the first real request
 * doesn't pay the cold-load tax. Fires a 1-token call at each model and
 * one embedding call. Safe to call repeatedly; cheap no-op if already
 * warm. Fail-soft: a failure here should never crash the app.
 */
export async function warmupLocalModels(): Promise<{
  fast: boolean;
  smart: boolean;
  durationMs: number;
}> {
  const start = Date.now();
  const ping = async (model: string): Promise<boolean> => {
    try {
      await fetch(`${OLLAMA_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: "ok" }],
          stream: false,
          keep_alive: KEEP_ALIVE,
          options: { num_predict: 1 },
        }),
      });
      return true;
    } catch {
      return false;
    }
  };
  const [fast, smart] = await Promise.all([
    ping(LOCAL_MODELS.fast),
    ping(LOCAL_MODELS.smart),
  ]);
  return { fast, smart, durationMs: Date.now() - start };
}

/** Check if local LLM is available */
export async function isLocalAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/version`, {
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
