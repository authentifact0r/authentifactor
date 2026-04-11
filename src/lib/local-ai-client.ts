/**
 * Local AI Client — zero-dependency TypeScript client for the sovereign
 * local AI server running on :4100.
 *
 * This file is the single source of truth. It is COPIED (not imported)
 * into each consuming app so those apps stay dependency-free:
 *
 *   Authentifactor/server/client/local-ai-client.ts   ← source of truth
 *   CitiesTroves/apps/web/src/lib/local-ai-client.ts  ← copy
 *   CitiesTroves/apps/api/src/lib/local-ai-client.ts  ← copy
 *   Careceutical/src/lib/local-ai-client.ts           ← copy
 *   bowsea/frontend/src/lib/local-ai-client.ts        ← copy
 *   bowsea/backend/src/lib/local-ai-client.ts         ← copy
 *
 * When you update this file, re-copy it into every app via:
 *   npm run ai:client:sync   (from Authentifactor)
 *
 * Usage (works in any TS environment with fetch — Next.js, Node, browser):
 *
 *   import { LocalAI } from "@/lib/local-ai-client";
 *   const ai = new LocalAI();
 *
 *   // Grounded Q&A over the shared Obsidian vault
 *   const { answer, citations } = await ai.rag("What is our infra doctrine?");
 *
 *   // Multi-turn conversation
 *   const first = await ai.rag("Who are our tenants?");
 *   const follow = await ai.rag("And which is the newest?", { sessionId: first.sessionId });
 *
 *   // Streaming chat
 *   for await (const token of ai.stream({ prompt: "write a haiku" })) {
 *     process.stdout.write(token);
 *   }
 *
 *   // Full autonomous agent
 *   const run = await ai.agent("summarize my active projects");
 *
 *   // Direct tool call
 *   const hits = await ai.tool("hybridKnowledgeSearch", { query: "authentifactor" });
 */

export type Complexity = "simple" | "medium" | "high" | "auto";

export interface ChatOptions {
  prompt: string;
  system?: string;
  complexity?: Complexity;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface ChatResponse {
  text: string;
  provider: "local" | "claude";
  model: string;
  costUsd: number;
}

export interface RagOptions {
  sessionId?: string;
  topN?: number;
  mode?: "answer" | "semantic" | "hybrid" | "reranked" | "context";
}

export interface Citation {
  noteId: string;
  heading?: string;
  score: number;
}

export interface RagAnswer {
  sessionId: string;
  answer: string;
  citations: Citation[];
  model: string;
  provider: string;
}

export interface AgentOptions {
  sessionId?: string;
  maxSteps?: number;
  complexity?: "simple" | "medium" | "high";
}

export interface AgentStep {
  thought?: string;
  action: "tool" | "finish";
  tool?: string;
  args?: Record<string, unknown>;
  observation?: unknown;
  answer?: string;
}

export interface AgentRun {
  sessionId: string;
  question: string;
  steps: AgentStep[];
  answer: string;
  model: string;
  provider: string;
}

export interface Session {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
}

export class LocalAIError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
    message: string
  ) {
    super(message);
    this.name = "LocalAIError";
  }
}

export interface LocalAIOptions {
  baseUrl?: string;
  timeoutMs?: number;
  /** Optional bearer token if you put the server behind auth. */
  token?: string;
  /** Custom fetch impl — defaults to globalThis.fetch. */
  fetch?: typeof fetch;
}

export class LocalAI {
  readonly baseUrl: string;
  readonly timeoutMs: number;
  readonly token?: string;
  private readonly _fetch: typeof fetch;

  constructor(opts: LocalAIOptions = {}) {
    this.baseUrl = (
      opts.baseUrl ??
      (typeof process !== "undefined" ? process.env?.LOCAL_AI_URL : undefined) ??
      "http://localhost:4100"
    ).replace(/\/$/, "");
    this.timeoutMs = opts.timeoutMs ?? 180_000;
    this.token = opts.token ?? (typeof process !== "undefined" ? process.env?.LOCAL_AI_TOKEN : undefined);
    this._fetch = opts.fetch ?? (globalThis.fetch as typeof fetch);
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (this.token) h["Authorization"] = `Bearer ${this.token}`;
    return h;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), this.timeoutMs);
    try {
      const res = await this._fetch(`${this.baseUrl}${path}`, {
        method,
        headers: this.headers(),
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: ctrl.signal,
      });
      const text = await res.text();
      const parsed = text ? safeParse(text) : undefined;
      if (!res.ok) {
        throw new LocalAIError(res.status, parsed, `${method} ${path} → ${res.status}`);
      }
      return parsed as T;
    } finally {
      clearTimeout(timer);
    }
  }

  // ─── Health / warmup ────────────────────────────────────

  health(): Promise<{ ok: boolean; vault: string; models: Record<string, string>; uptime: number }> {
    return this.request("GET", "/health");
  }

  warmup(): Promise<unknown> {
    return this.request("POST", "/warmup");
  }

  // ─── Raw chat ───────────────────────────────────────────

  chat(options: ChatOptions): Promise<ChatResponse> {
    return this.request("POST", "/chat", options);
  }

  /**
   * Streaming chat. Yields one string per token chunk from the server's
   * SSE stream. Throws on errors from the remote.
   */
  async *stream(options: ChatOptions): AsyncGenerator<string, void, void> {
    const res = await this._fetch(`${this.baseUrl}/stream`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(options),
    });
    if (!res.ok || !res.body) {
      throw new LocalAIError(res.status, await res.text(), `stream failed: ${res.status}`);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) return;
      buf += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = buf.indexOf("\n\n")) !== -1) {
        const event = buf.slice(0, nl);
        buf = buf.slice(nl + 2);
        const dataLine = event.split("\n").find((l) => l.startsWith("data:"));
        if (!dataLine) continue;
        const payload = safeParse(dataLine.slice(5).trim());
        if (!payload || typeof payload !== "object") continue;
        const p = payload as { token?: string; done?: boolean; error?: string };
        if (p.error) throw new LocalAIError(500, p, p.error);
        if (p.done) return;
        if (typeof p.token === "string") yield p.token;
      }
    }
  }

  // ─── RAG ────────────────────────────────────────────────

  /** Grounded Q&A over the vault. Defaults to mode="answer". */
  rag(query: string, options: RagOptions = {}): Promise<RagAnswer> {
    return this.request("POST", "/rag", {
      query,
      mode: options.mode ?? "answer",
      topN: options.topN,
      sessionId: options.sessionId,
    });
  }

  // ─── Autonomous agent ───────────────────────────────────

  agent(question: string, options: AgentOptions = {}): Promise<AgentRun> {
    return this.request("POST", "/agent", { question, ...options });
  }

  // ─── Tools ──────────────────────────────────────────────

  listTools(): Promise<{ tools: Array<{ name: string; description: string; parameters: Record<string, unknown> }> }> {
    return this.request("GET", "/tools");
  }

  tool<T = unknown>(name: string, args: Record<string, unknown> = {}): Promise<T> {
    return this.request<{ tool: string; result: T }>("POST", "/tools", { tool: name, args }).then(
      (r) => r.result
    );
  }

  // ─── Sessions ───────────────────────────────────────────

  listSessions(limit = 50): Promise<{ sessions: Session[] }> {
    return this.request("GET", `/sessions?limit=${limit}`);
  }

  createSession(title?: string): Promise<Session> {
    return this.request("POST", "/sessions", { title });
  }

  getHistory(sessionId: string, limit = 50): Promise<{ sessionId: string; history: unknown[] }> {
    return this.request("GET", `/sessions?id=${encodeURIComponent(sessionId)}&limit=${limit}`);
  }

  deleteSession(sessionId: string): Promise<unknown> {
    return this.request("DELETE", `/sessions/${encodeURIComponent(sessionId)}`);
  }
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// Default export for ergonomic `import LocalAI from ...`
export default LocalAI;
