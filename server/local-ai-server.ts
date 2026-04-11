#!/usr/bin/env tsx
/**
 * Sovereign Local AI Server — standalone.
 *
 *   npm run ai:serve          # foreground
 *   pm2 start ecosystem.config.cjs --only local-ai-server
 *
 * Exposes the entire local-ai subsystem on a single Fastify process so
 * any app in your fleet (Bowsea, CitiesTroves, Careceutical, Agency in
 * the Box, …) can share one sovereign brain instead of each bundling
 * its own. Aligns with the infrastructure doctrine: one backend, many
 * frontends.
 *
 * This file is the only server-specific code in the repo — every route
 * delegates directly to the existing `src/lib/local-ai/*` modules, so
 * the Next.js routes and this standalone server stay in lockstep.
 */

import Fastify, { type FastifyRequest, type FastifyReply } from "fastify";
import cors from "@fastify/cors";
import { z, ZodError } from "zod";
import fs from "node:fs/promises";
import path from "node:path";

import {
  semanticSearch,
  hybridSearch,
  rerankedSearch,
  graphSearch,
  buildContext,
} from "../src/lib/local-ai/rag";
import { runKnowledgeAgent } from "../src/lib/local-ai/knowledge-agent";
import { runAgentLoop } from "../src/lib/local-ai/agent-loop";
import { listToolSchemas, runTool, ToolValidationError } from "../src/lib/local-ai/tools";
import { embedText } from "../src/lib/local-ai/embeddings";
import { readVaultIndex } from "../src/lib/local-ai/obsidian-loader";
import {
  createSession,
  listSessions,
  deleteSession,
  renameSession,
  getHistory,
} from "../src/lib/local-ai/memory";
import { smartLLM, smartLLMStream, warmupLocalModels } from "../src/lib/smart-llm";
import { startVaultWatcher } from "../src/lib/local-ai/watcher";
import { VAULT_PATH, MODELS } from "../src/lib/local-ai/config";

const PORT = Number(process.env.LOCAL_AI_PORT ?? 4100);
// Default to loopback-only. A Cloudflare Tunnel (or Tailscale Funnel)
// reaches us via the same localhost, so this is what you want in
// production. Override to "0.0.0.0" only if you deliberately need LAN
// access without a tunnel in front.
const HOST = process.env.LOCAL_AI_HOST ?? "127.0.0.1";
const WATCH_VAULT = (process.env.LOCAL_AI_WATCH ?? "true").toLowerCase() !== "false";
const AUTH_TOKEN = process.env.LOCAL_AI_TOKEN;

const app = Fastify({
  logger: { level: process.env.LOG_LEVEL ?? "info" },
  bodyLimit: 5 * 1024 * 1024,
});

// ─── Schemas ──────────────────────────────────────────────

const ChatBody = z.object({
  prompt: z.string().min(1),
  system: z.string().optional(),
  complexity: z.enum(["simple", "medium", "high", "auto"]).optional(),
  maxTokens: z.number().int().min(1).max(8192).optional(),
  jsonMode: z.boolean().optional(),
});

const RagBody = z.object({
  query: z.string().min(1),
  mode: z.enum(["answer", "semantic", "hybrid", "reranked", "context"]).default("answer"),
  topN: z.number().int().min(1).max(50).default(6),
  // nullish so clients can send `sessionId: null` for "start a new session"
  // in addition to omitting the field entirely.
  sessionId: z.string().nullish(),
});

const AgentBody = z.object({
  question: z.string().min(1),
  sessionId: z.string().nullish(),
  maxSteps: z.number().int().min(1).max(20).optional(),
  complexity: z.enum(["simple", "medium", "high"]).optional(),
});

const ToolBody = z.object({
  tool: z.string().min(1),
  args: z.record(z.string(), z.unknown()).optional(),
});

function parse<T>(schema: z.ZodType<T>, body: unknown): T {
  return schema.parse(body);
}

// ─── Routes ───────────────────────────────────────────────

app.get("/health", async () => ({
  ok: true,
  vault: VAULT_PATH,
  models: MODELS,
  uptime: process.uptime(),
}));

// ─── Dashboard UI ────────────────────────────────────────
// Serves the static HTML dashboard at /. Anyone can load the page, but
// the embedded JS requires a bearer token before it talks to /rag, /agent,
// /sessions, etc. This way ai.linkolu.com shows a real UI instead of a
// JSON error when you hit it in a browser.

const UI_DIR = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  "ui"
);

async function serveFile(reply: FastifyReply, filePath: string, contentType: string) {
  try {
    const buf = await fs.readFile(filePath);
    reply
      .type(contentType)
      .header("Cache-Control", "no-cache")
      .send(buf);
  } catch {
    reply.code(404).send({ error: "not_found" });
  }
}

app.get("/", async (_req, reply) => {
  await serveFile(reply, path.join(UI_DIR, "index.html"), "text/html; charset=utf-8");
});

app.get("/ui", async (_req, reply) => {
  await serveFile(reply, path.join(UI_DIR, "index.html"), "text/html; charset=utf-8");
});

app.get("/favicon.ico", async (_req, reply) => {
  // Inline SVG brain emoji — no extra file needed
  reply
    .type("image/svg+xml")
    .header("Cache-Control", "public, max-age=86400")
    .send(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><text y="20" font-size="20">🧠</text></svg>`
    );
});

app.post("/chat", async (req) => {
  const body = parse(ChatBody, req.body);
  return smartLLM(body);
});

app.post("/stream", async (req: FastifyRequest, reply: FastifyReply) => {
  const body = parse(ChatBody, req.body);
  reply.raw.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  try {
    for await (const chunk of smartLLMStream(body)) {
      reply.raw.write(`data: ${JSON.stringify({ token: chunk })}\n\n`);
    }
    reply.raw.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  } catch (err) {
    reply.raw.write(
      `data: ${JSON.stringify({ error: (err as Error).message })}\n\n`
    );
  } finally {
    reply.raw.end();
  }
});

app.post("/rag", async (req) => {
  const { query, mode, topN, sessionId } = parse(RagBody, req.body);
  // Normalise null → undefined so the library funcs see a clean optional
  const sid = sessionId ?? undefined;
  switch (mode) {
    case "semantic":
      return { hits: await semanticSearch(query, topN) };
    case "hybrid":
      return { hits: await hybridSearch(query, topN) };
    case "reranked":
      return { hits: await rerankedSearch(query, topN) };
    case "context":
      return buildContext(query, topN);
    case "answer":
    default:
      return runKnowledgeAgent(query, { sessionId: sid });
  }
});

app.post("/agent", async (req) => {
  const body = parse(AgentBody, req.body);
  return runAgentLoop(body.question, {
    sessionId: body.sessionId ?? undefined,
    maxSteps: body.maxSteps,
    complexity: body.complexity,
  });
});

app.get("/graph", async (req) => {
  const q = req.query as { node?: string; depth?: string };
  if (q.node) return graphSearch(q.node, Number(q.depth ?? 1));
  const { graph } = await readVaultIndex();
  return {
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    sample: graph.nodes.slice(0, 20),
  };
});

app.get("/tools", async () => ({ tools: listToolSchemas() }));

app.post("/tools", async (req, reply) => {
  const { tool, args } = parse(ToolBody, req.body);
  try {
    const result = await runTool(tool, args ?? {});
    return { tool, result };
  } catch (err) {
    if (err instanceof ToolValidationError) {
      reply.status(400);
      return { error: err.message, issues: err.issues };
    }
    throw err;
  }
});

// Sessions
app.get("/sessions", async (req) => {
  const q = req.query as { id?: string; limit?: string };
  if (q.id) {
    return {
      sessionId: q.id,
      history: await getHistory(q.id, Number(q.limit ?? 50)),
    };
  }
  return { sessions: await listSessions(Number(q.limit ?? 50)) };
});

app.post("/sessions", async (req) => {
  const body = (req.body ?? {}) as { title?: string };
  return createSession(body.title);
});

app.patch("/sessions", async (req, reply) => {
  const { id, title } = (req.body ?? {}) as { id?: string; title?: string };
  if (!id || !title) {
    reply.status(400);
    return { error: "id and title required" };
  }
  await renameSession(id, title);
  return { ok: true };
});

app.delete("/sessions/:id", async (req) => {
  const { id } = req.params as { id: string };
  await deleteSession(id);
  return { ok: true };
});

app.post("/warmup", async () => {
  const [chat, embed] = await Promise.allSettled([
    warmupLocalModels(),
    embedText("warmup"),
  ]);
  return {
    chat: chat.status === "fulfilled" ? chat.value : { error: String(chat.reason) },
    embed:
      embed.status === "fulfilled"
        ? { ok: true, dim: embed.value.length }
        : { ok: false, error: String(embed.reason) },
  };
});

// ─── Global error handler ─────────────────────────────────

app.setErrorHandler((err, _req, reply) => {
  if (err instanceof ZodError) {
    reply.status(400).send({
      error: "validation_error",
      issues: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
    return;
  }
  if (err instanceof ToolValidationError) {
    reply.status(400).send({ error: err.message, issues: err.issues });
    return;
  }
  app.log.error(err);
  reply.status(500).send({ error: (err as Error).message });
});

// ─── Startup ──────────────────────────────────────────────

async function main() {
  await app.register(cors, { origin: true });

  // Bearer-token auth — belt-and-braces fallback behind Cloudflare Access
  // (or standalone if you don't use Access). Only enforced when the
  // LOCAL_AI_TOKEN env var is set, so pure-local dev stays friction-free.
  // /health is always public so tunnels and uptime monitors can probe it.
  if (AUTH_TOKEN) {
    // Public routes: /health (probes), / and /ui/* (the dashboard itself —
    // anyone can load the HTML, but the JS inside prompts for the token and
    // every subsequent API call is gated).
    const publicPrefixes = ["/health", "/ui"];
    const publicExact = new Set(["/", "/favicon.ico"]);
    app.addHook("onRequest", async (req, reply) => {
      const url = req.url.split("?")[0];
      if (publicExact.has(url)) return;
      if (publicPrefixes.some((p) => url === p || url.startsWith(p + "/") || url === p)) return;
      const header = req.headers.authorization ?? "";
      if (header !== `Bearer ${AUTH_TOKEN}`) {
        reply.code(401).send({ error: "unauthorized" });
      }
    });
    app.log.info("🔒 bearer-token auth enabled (/, /ui, /health are public)");
  } else {
    app.log.warn(
      "⚠️  LOCAL_AI_TOKEN not set — server is unauthenticated (fine on 127.0.0.1, do NOT expose)"
    );
  }

  await app.listen({ port: PORT, host: HOST });
  app.log.info(`🧠 local-ai-server listening on http://${HOST}:${PORT}`);

  // Fire-and-forget warmup so the first real request is hot.
  warmupLocalModels()
    .then((w) => app.log.info({ warmup: w }, "models warmed"))
    .catch((err) => app.log.warn({ err: err.message }, "warmup failed"));

  // Optionally start the file watcher in-process, so a single daemon
  // covers both the API and live indexing.
  if (WATCH_VAULT) {
    startVaultWatcher({
      onEvent: (e) => {
        if (e.type === "ready")
          app.log.info(`👁  watcher ready — tracking ${e.files} paths`);
        else if (e.type === "rebuild-done")
          app.log.info(
            `rebuild ${e.durationMs}ms — +${e.stats.added} ~${e.stats.updated} -${e.stats.removed}`
          );
        else if (e.type === "error")
          app.log.error({ err: e.error.message }, "watcher error");
      },
    });
  }
}

main().catch((err) => {
  app.log.error(err);
  process.exit(1);
});
