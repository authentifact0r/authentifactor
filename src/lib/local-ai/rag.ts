/**
 * RAG engine — semantic + graph + hybrid search over the Obsidian index.
 */

import crypto from "node:crypto";
import { embedText, loadAllEmbeddings, cosineSim, type EmbeddedChunk } from "./embeddings";
import { readVaultIndex } from "./obsidian-loader";
import type { KnowledgeGraph } from "./obsidian-loader";
import { smartLLM } from "../smart-llm";
import { LRU } from "./cache";

export interface RagHit {
  chunkId: string;
  noteId: string;
  heading?: string;
  text: string;
  score: number;
  source: "semantic" | "graph" | "hybrid";
}

export interface ContextBlock {
  noteId: string;
  heading?: string;
  text: string;
  score: number;
}

// In-memory caches — rebuilt on process start.
let _chunks: EmbeddedChunk[] | null = null;
let _graph: KnowledgeGraph | null = null;
let _noteTitles: Map<string, string> | null = null;

// LRU cache for query embeddings: same text → same vector, so why pay
// Ollama twice? 500 entries is plenty for a personal workflow.
const _queryEmbedCache = new LRU<string, number[]>(500);
function queryKey(q: string): string {
  return crypto.createHash("sha1").update(q).digest("hex");
}
async function embedQueryCached(query: string): Promise<number[]> {
  const key = queryKey(query);
  const hit = _queryEmbedCache.get(key);
  if (hit) return hit;
  const vec = await embedText(query);
  _queryEmbedCache.set(key, vec);
  return vec;
}

async function getChunks(): Promise<EmbeddedChunk[]> {
  if (!_chunks) _chunks = await loadAllEmbeddings();
  return _chunks;
}

async function getGraph(): Promise<KnowledgeGraph> {
  if (!_graph) {
    const idx = await readVaultIndex();
    _graph = idx.graph;
    _noteTitles = new Map(idx.notes.map((n) => [n.id, n.title]));
  }
  return _graph;
}

export function invalidateCaches(): void {
  _chunks = null;
  _graph = null;
  _noteTitles = null;
  // Query cache stays valid across reindexes — same query text still
  // yields the same vector. Only clear if the embedding model changes.
}

export function clearQueryCache(): void {
  _queryEmbedCache.clear();
}

// Query words that look like proper nouns / distinctive terms. Used to
// boost chunks whose note id contains a term from the query — the
// cheapest way to fix the "asked about X, retrieved Y" failure mode.
function extractQueryTerms(query: string): string[] {
  return query
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4)
    .filter((w) => !STOP_WORDS.has(w.toLowerCase()))
    .map((w) => w.toLowerCase());
}

const STOP_WORDS = new Set([
  "what", "when", "where", "which", "whom", "whose", "about", "does", "this",
  "that", "these", "those", "their", "there", "have", "from", "into", "with",
  "they", "them", "your", "yours", "would", "could", "should", "will", "shall",
  "been", "being", "ever", "just", "like", "made", "make", "more", "most", "much",
  "some", "such", "than", "then", "were", "what's", "whats", "serve", "currently",
  "listing", "list", "give", "main", "tell", "describe", "stack", "tech", "the",
  "how", "why", "who", "you", "my", "is", "are", "a", "an", "of", "to", "in", "on",
]);

function applyTitleBoost(hits: RagHit[], query: string): RagHit[] {
  const terms = extractQueryTerms(query);
  if (terms.length === 0) return hits;
  return hits.map((hit) => {
    const noteLower = hit.noteId.toLowerCase();
    const matches = terms.filter((t) => noteLower.includes(t)).length;
    if (matches === 0) return hit;
    // Compound boost — 12% per matching term, capped at +50%.
    const factor = Math.min(1.5, 1 + matches * 0.12);
    return { ...hit, score: hit.score * factor };
  });
}

export async function semanticSearch(query: string, topN = 8): Promise<RagHit[]> {
  const queryVec = await embedQueryCached(query);
  const chunks = await getChunks();
  const raw: RagHit[] = chunks.map((c) => ({
    chunkId: c.id,
    noteId: c.noteId,
    heading: c.heading,
    text: c.text,
    score: cosineSim(queryVec, c.vector),
    source: "semantic",
  }));
  const boosted = applyTitleBoost(raw, query);
  boosted.sort((a, b) => b.score - a.score);
  return boosted.slice(0, topN);
}

export async function graphSearch(
  nodeId: string,
  depth = 1
): Promise<{ nodeId: string; neighbors: string[]; backlinks: string[] }> {
  const graph = await getGraph();
  const outgoing = new Set<string>();
  const backlinks = new Set<string>();
  const frontier = [nodeId];
  for (let d = 0; d < depth; d++) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const edge of graph.edges) {
        if (edge.from === id && !outgoing.has(edge.to)) {
          outgoing.add(edge.to);
          next.push(edge.to);
        }
      }
      for (const back of graph.backlinks[id] ?? []) {
        backlinks.add(back);
      }
    }
    frontier.splice(0, frontier.length, ...next);
  }
  return {
    nodeId,
    neighbors: [...outgoing],
    backlinks: [...backlinks],
  };
}

export async function hybridSearch(query: string, topN = 8): Promise<RagHit[]> {
  // Over-fetch semantically so the graph + rerank stages have room to work.
  // Wider pool = more recall, at the cost of a longer rerank prompt.
  const candidates = await semanticSearch(query, Math.max(topN * 4, 30));
  if (candidates.length === 0) return [];

  // Boost chunks whose notes are graph neighbors of the top hit.
  const topNote = candidates[0].noteId;
  const neighbors = await graphSearch(topNote, 1);
  const boostSet = new Set([...neighbors.neighbors, ...neighbors.backlinks]);

  const boosted = candidates.map((hit) => ({
    ...hit,
    score: boostSet.has(hit.noteId) ? hit.score * 1.15 : hit.score,
    source: "hybrid" as const,
  }));
  boosted.sort((a, b) => b.score - a.score);
  return boosted.slice(0, topN);
}

/**
 * LLM-based cross-encoder rerank.
 *
 * Takes the top-K semantic candidates and asks llama3.1:8b to score each
 * 0–10 for relevance to the query, then keeps the highest `topN`. This
 * is the single biggest answer-quality improvement you can make without
 * swapping the embedding model — cosine similarity ranks "mentions the
 * same words," a cross-encoder ranks "actually answers the question."
 *
 * Fails soft: if the scoring call errors or returns garbage, falls back
 * to the raw semantic ordering.
 */
export async function rerankedSearch(
  query: string,
  topN = 6,
  candidateCount = 30
): Promise<RagHit[]> {
  const candidates = await hybridSearch(query, candidateCount);
  if (candidates.length <= topN) return candidates;

  const numbered = candidates
    .map(
      (c, i) =>
        `[${i}] (note: ${c.noteId}${c.heading ? ` › ${c.heading}` : ""})\n${c.text.slice(0, 400)}`
    )
    .join("\n\n");

  const prompt = `Query: ${query}

Candidate passages:
${numbered}

Score each passage 0–10 for how directly it answers the query.
10 = directly answers. 5 = related but indirect. 0 = irrelevant.
Return ONLY a JSON object of the form {"scores": [{"i": 0, "score": 7}, ...]} with one entry per candidate.`;

  try {
    const res = await smartLLM({
      prompt,
      system: "You are a precise relevance judge. Respond with JSON only.",
      complexity: "simple",
      maxTokens: 500,
      jsonMode: true,
    });
    const parsed = JSON.parse(res.text) as { scores?: { i: number; score: number }[] };
    if (!parsed.scores || !Array.isArray(parsed.scores)) {
      return candidates.slice(0, topN);
    }
    const scoreMap = new Map<number, number>();
    for (const s of parsed.scores) {
      if (typeof s.i === "number" && typeof s.score === "number") {
        scoreMap.set(s.i, s.score);
      }
    }
    // Blend: 70% rerank judge + 30% original hybrid score, so a chunk
    // the judge rates as 0 but was semantically strong still survives
    // to the top-N. Without this blend llama's over-strict scoring can
    // wipe out the entire candidate set for ambiguous questions.
    const reranked = candidates
      .map((c, i) => {
        const judge = (scoreMap.get(i) ?? 0) / 10;
        return { ...c, score: 0.7 * judge + 0.3 * c.score };
      })
      .sort((a, b) => b.score - a.score);
    return reranked.slice(0, topN);
  } catch {
    // Rerank failed — original ordering is still useful.
    return candidates.slice(0, topN);
  }
}

export async function buildContext(
  query: string,
  topN = 6,
  maxChars = 4000,
  opts: { rerank?: boolean } = {}
): Promise<{ blocks: ContextBlock[]; text: string }> {
  const useRerank = opts.rerank ?? process.env.LOCAL_AI_RERANK !== "false";
  const hits = useRerank
    ? await rerankedSearch(query, topN)
    : await hybridSearch(query, topN);
  await getGraph(); // populate titles
  const titles = _noteTitles ?? new Map();
  const blocks: ContextBlock[] = [];
  let total = 0;
  for (const hit of hits) {
    if (total + hit.text.length > maxChars) break;
    blocks.push({
      noteId: hit.noteId,
      heading: hit.heading,
      text: hit.text,
      score: hit.score,
    });
    total += hit.text.length;
  }
  const text = blocks
    .map((b, i) => {
      const title = titles.get(b.noteId) ?? b.noteId;
      const head = b.heading ? ` › ${b.heading}` : "";
      return `[${i + 1}] ${title}${head}\n${b.text}`;
    })
    .join("\n\n---\n\n");
  return { blocks, text };
}
