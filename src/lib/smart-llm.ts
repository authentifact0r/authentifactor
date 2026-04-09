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

const LOCAL_MODELS = {
  fast: process.env.OLLAMA_FAST_MODEL || "llama3.1:8b",      // Daily driver
  smart: process.env.OLLAMA_SMART_MODEL || "qwen2.5:14b",    // Heavier reasoning
};

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
  maxTokens: number
): Promise<string> {
  const messages: { role: string; content: string }[] = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: prompt });

  const res = await fetch(`${OLLAMA_URL}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      stream: false,
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    throw new Error(`Ollama error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
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
  } = options;

  // Determine actual complexity
  const complexity =
    requestedComplexity === "auto" ? detectComplexity(prompt) : requestedComplexity;

  // Determine provider
  let provider: "local" | "claude";
  if (forceProvider) {
    provider = forceProvider;
  } else if (complexity === "high") {
    provider = "claude";
  } else {
    provider = "local";
  }

  // Try the chosen provider, fall back to the other on failure
  if (provider === "local") {
    try {
      const model = complexity === "medium" ? LOCAL_MODELS.smart : LOCAL_MODELS.fast;
      const text = await callOllama(prompt, system, model, maxTokens);
      return { text, provider: "local", model, costUsd: 0 };
    } catch (err) {
      // Local failed — fall back to Claude if available
      if (process.env.ANTHROPIC_API_KEY) {
        console.warn("Local LLM failed, falling back to Claude:", err);
        provider = "claude";
      } else {
        throw err;
      }
    }
  }

  // Claude path
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
    // Claude failed — last resort fall back to local
    console.warn("Claude failed, falling back to local:", err);
    const text = await callOllama(prompt, system, LOCAL_MODELS.fast, maxTokens);
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
