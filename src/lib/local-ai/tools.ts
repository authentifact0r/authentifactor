/**
 * Tool registry for the local agent loop.
 *
 * Every tool declares a Zod schema for its input. Arguments from the
 * model are validated before the tool runs — on failure we throw a
 * `ToolValidationError` carrying the Zod issue list, which the agent
 * loop feeds back to the model for a single corrective retry. The
 * human-readable schema for the system prompt is derived from the Zod
 * shape, so there's one source of truth per tool.
 */

import { z, ZodError, type ZodTypeAny, type ZodObject } from "zod";
import { semanticSearch, graphSearch, hybridSearch, rerankedSearch } from "./rag";

export interface ToolSchema {
  name: string;
  description: string;
  parameters: Record<string, { type: string; description: string; required: boolean }>;
}

export interface Tool<S extends ZodObject<Record<string, ZodTypeAny>> = ZodObject<Record<string, ZodTypeAny>>> {
  name: string;
  description: string;
  input: S;
  run: (args: z.infer<S>) => Promise<unknown>;
}

export class ToolValidationError extends Error {
  constructor(
    public readonly toolName: string,
    public readonly issues: { path: string; message: string }[]
  ) {
    super(
      `Invalid args for tool "${toolName}": ${issues
        .map((i) => `${i.path}: ${i.message}`)
        .join("; ")}`
    );
    this.name = "ToolValidationError";
  }
}

function defineTool<S extends ZodObject<Record<string, ZodTypeAny>>>(t: {
  name: string;
  description: string;
  input: S;
  run: (args: z.infer<S>) => Promise<unknown>;
}): Tool<S> {
  return t;
}

// ─── Tool implementations ─────────────────────────────────

const searchObsidian = defineTool({
  name: "searchObsidian",
  description:
    "Semantic search across the Obsidian vault. Returns the most relevant note chunks.",
  input: z.object({
    query: z.string().min(1).describe("natural language query"),
    topN: z.number().int().min(1).max(50).optional().describe("max results (default 5)"),
  }),
  run: async ({ query, topN = 5 }) => {
    const hits = await semanticSearch(query, topN);
    return hits.map((h) => ({
      noteId: h.noteId,
      heading: h.heading,
      score: Number(h.score.toFixed(3)),
      text: h.text.slice(0, 500),
    }));
  },
});

const getGraphContext = defineTool({
  name: "getGraphContext",
  description: "Get neighboring notes (outgoing links and backlinks) for a given note id.",
  input: z.object({
    nodeId: z.string().min(1).describe("the note id to explore"),
    depth: z.number().int().min(1).max(3).optional().describe("how many hops (default 1)"),
  }),
  run: async ({ nodeId, depth = 1 }) => graphSearch(nodeId, depth),
});

const hybridKnowledgeSearch = defineTool({
  name: "hybridKnowledgeSearch",
  description:
    "Retrieve vault passages via semantic + graph search and LLM rerank. Use for anything about the user's notes.",
  input: z.object({
    query: z.string().min(1).describe("natural language query"),
    topN: z.number().int().min(1).max(20).optional().describe("max results (default 6)"),
  }),
  run: async ({ query, topN = 6 }) => {
    const hits = await rerankedSearch(query, topN);
    return hits.map((h) => ({
      noteId: h.noteId,
      heading: h.heading,
      score: Number(h.score.toFixed(3)),
      text: h.text.slice(0, 500),
    }));
  },
});

const fastHybridSearch = defineTool({
  name: "fastHybridSearch",
  description: "Fast semantic + graph search without LLM rerank. Use when latency matters.",
  input: z.object({
    query: z.string().min(1).describe("natural language query"),
    topN: z.number().int().min(1).max(20).optional().describe("max results (default 6)"),
  }),
  run: async ({ query, topN = 6 }) => {
    const hits = await hybridSearch(query, topN);
    return hits.map((h) => ({
      noteId: h.noteId,
      heading: h.heading,
      score: Number(h.score.toFixed(3)),
      text: h.text.slice(0, 500),
    }));
  },
});

// ─── Authentifactor domain tools ──────────────────────────

async function callLocalRoute(
  method: string,
  route: string,
  body?: object
): Promise<unknown> {
  const base = process.env.LOCAL_APP_URL || "http://localhost:3000";
  const res = await fetch(`${base}${route}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30000),
  });
  const text = await res.text();
  try {
    return { status: res.status, data: JSON.parse(text) };
  } catch {
    return { status: res.status, data: text };
  }
}

const fetchProduct = defineTool({
  name: "fetchProduct",
  description: "Fetch a product by id or slug from the Authentifactor catalog.",
  input: z.object({
    idOrSlug: z.string().min(1).describe("product id or slug"),
  }),
  run: async ({ idOrSlug }) => callLocalRoute("GET", `/api/products/${idOrSlug}`),
});

const updateProduct = defineTool({
  name: "updateProduct",
  description: "Update a product's fields. Requires admin context.",
  input: z.object({
    id: z.string().min(1).describe("product id"),
    patch: z.record(z.string(), z.unknown()).describe("fields to update"),
  }),
  run: async ({ id, patch }) => callLocalRoute("PATCH", `/api/products/${id}`, patch),
});

const generateDescription = defineTool({
  name: "generateDescription",
  description: "Generate a product description locally. Prefer this over hand-writing copy.",
  input: z.object({
    productName: z.string().min(1).describe("product name"),
    notes: z.string().optional().describe("optional extra context"),
  }),
  run: async ({ productName, notes }) => {
    const { smartLLM } = await import("../smart-llm");
    const res = await smartLLM({
      prompt: `Write a compelling 2-sentence product description for "${productName}". Context: ${notes ?? "none"}.`,
      complexity: "simple",
    });
    return { description: res.text.trim(), model: res.model };
  },
});

const callLocalApi = defineTool({
  name: "callLocalApi",
  description: "Call any local Next.js API route. Use sparingly.",
  input: z.object({
    method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).describe("HTTP method"),
    route: z.string().startsWith("/api").describe("route path starting with /api"),
    payload: z.record(z.string(), z.unknown()).optional().describe("optional JSON body"),
  }),
  run: async ({ method, route, payload }) => callLocalRoute(method, route, payload),
});

// ─── Registry ─────────────────────────────────────────────

export const TOOLS: Record<string, Tool> = {
  searchObsidian,
  getGraphContext,
  hybridKnowledgeSearch,
  fastHybridSearch,
  fetchProduct,
  updateProduct,
  generateDescription,
  callLocalApi,
};

// ─── Zod → ToolSchema (for the system prompt) ─────────────

// Zod 4 exposes `.def.type` as a lowercase string ("string", "number",
// "optional", "enum", …). Unwrap one layer of optional so the type
// label reads as the underlying primitive.
function describeZodType(t: ZodTypeAny): string {
  // @ts-expect-error — Zod 4 runtime shape
  const def = t.def;
  if (!def) return "any";
  if (def.type === "optional") {
    // @ts-expect-error — inner schema
    return describeZodType(def.innerType);
  }
  if (def.type === "enum") {
    const values = Object.values(def.entries ?? {}) as string[];
    return `enum(${values.join("|")})`;
  }
  return (def.type as string) ?? "any";
}

function isOptionalSchema(t: ZodTypeAny): boolean {
  // @ts-expect-error — Zod 4 runtime shape
  return t.def?.type === "optional";
}

function toSchema(tool: Tool): ToolSchema {
  const shape = tool.input.shape as Record<string, ZodTypeAny>;
  const parameters: ToolSchema["parameters"] = {};
  for (const [key, value] of Object.entries(shape)) {
    parameters[key] = {
      type: describeZodType(value),
      description: value.description ?? "",
      required: !isOptionalSchema(value),
    };
  }
  return {
    name: tool.name,
    description: tool.description,
    parameters,
  };
}

export function listToolSchemas(): ToolSchema[] {
  return Object.values(TOOLS).map(toSchema);
}

// ─── Runner ───────────────────────────────────────────────

export async function runTool(
  name: string,
  args: unknown
): Promise<unknown> {
  const tool = TOOLS[name];
  if (!tool) throw new Error(`Unknown tool: ${name}`);
  try {
    const parsed = tool.input.parse(args ?? {});
    return await tool.run(parsed);
  } catch (err) {
    if (err instanceof ZodError) {
      throw new ToolValidationError(
        name,
        err.issues.map((i) => ({ path: i.path.join("."), message: i.message }))
      );
    }
    throw err;
  }
}
