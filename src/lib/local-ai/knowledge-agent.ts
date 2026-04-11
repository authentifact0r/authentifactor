/**
 * Knowledge agent — single-shot grounded Q&A over the vault.
 *
 * Pipeline:
 *   1. hybrid search to gather semantic + graph context
 *   2. pull neighbors of the top note for extra breadcrumbs
 *   3. build a citation-ready context package
 *   4. route to smart-llm
 *   5. return {answer, citations, model}
 */

import { buildContext } from "./rag";
import { graphSearch } from "./rag";
import { smartLLM } from "../smart-llm";
import {
  getOrCreateSession,
  getHistory,
  appendMessage,
  formatHistoryForPrompt,
} from "./memory";

export interface KnowledgeAnswer {
  sessionId: string;
  answer: string;
  citations: { noteId: string; heading?: string; score: number }[];
  model: string;
  provider: string;
}

const SYSTEM = `You are a knowledge agent grounded in the user's personal Obsidian vault.
Answer using ONLY the context blocks provided. Each block is prefixed with a bracketed index like [1].

Rules:
- Extract specific facts directly from the context — prefer quoting exact names, stacks, numbers, and labels rather than paraphrasing into vague summaries.
- When you use a fact, cite it inline as [1], [2], etc.
- If a context block lists items (tenants, stack components, projects), enumerate ALL of them.
- If the context does not contain the answer, say so plainly — do not invent.`;

export async function runKnowledgeAgent(
  question: string,
  opts: { sessionId?: string; historyLimit?: number } = {}
): Promise<KnowledgeAnswer> {
  const session = await getOrCreateSession(opts.sessionId);
  const prior = await getHistory(session.id, opts.historyLimit ?? 8);
  const historyText = formatHistoryForPrompt(prior);

  // Sweet spot from the eval harness: 6 rerank-selected blocks, 4k
  // chars. Wider windows degraded composite score because llama3.1:8b
  // starts ignoring specific facts under too much context. The wider
  // candidate pool (30 in hybridSearch) gives rerank enough to choose
  // from without the generator drowning.
  const { blocks, text: contextText } = await buildContext(question, 6, 4000);

  // Pull 1-hop graph neighbors of the top-ranked note for breadcrumbs.
  let neighborNote = "";
  if (blocks[0]) {
    const g = await graphSearch(blocks[0].noteId, 1);
    const related = [...g.neighbors, ...g.backlinks].slice(0, 8);
    if (related.length) {
      neighborNote = `\n\nRelated notes (graph neighbors of top result):\n- ${related.join("\n- ")}`;
    }
  }

  const historyBlock = historyText
    ? `Prior conversation (oldest → newest):\n${historyText}\n\n`
    : "";

  const prompt = `${historyBlock}Question: ${question}

Context:
${contextText}${neighborNote}

Answer the question using the context above. Cite sources inline as [1], [2], etc.
If the question refers back to the prior conversation, use it — but only cite from the context blocks.`;

  const res = await smartLLM({
    prompt,
    system: SYSTEM,
    // Empirical sweet spot: llama3.1:8b on an already-rerank-curated 6
    // blocks. The eval harness showed qwen2.5:14b gained only +2pp at
    // 2.5× latency — not worth it. Callers can override to "medium"
    // on a per-call basis when they want the bigger generator.
    complexity: "simple",
    maxTokens: 1024,
  });

  const citations = blocks.map((b) => ({
    noteId: b.noteId,
    heading: b.heading,
    score: Number(b.score.toFixed(3)),
  }));

  // Persist the turn so the next call can see it.
  await appendMessage(session.id, "user", question);
  await appendMessage(session.id, "assistant", res.text, {
    citations,
    model: res.model,
    provider: res.provider,
  });

  return {
    sessionId: session.id,
    answer: res.text,
    citations,
    model: res.model,
    provider: res.provider,
  };
}
