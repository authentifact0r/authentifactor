#!/usr/bin/env tsx
/**
 * Local AI evaluation harness.
 *
 *   npm run ai:eval                     # hit http://localhost:4100
 *   npm run ai:eval -- --base http://…  # custom server
 *   npm run ai:eval -- --compare        # diff against previous run
 *
 * Runs a fixed question set through /rag, then scores each answer three
 * ways:
 *   1. Keyword coverage — how many of the expected strings appear
 *   2. Citation match   — did the cited notes include any expected note?
 *   3. LLM judgement    — llama scores 0–10 for correctness and groundedness
 *
 * A composite score (0–1) and per-question trace get written to
 *   ~/.local-ai/authentifactor/eval-runs/<timestamp>.json
 * so you can diff runs after model/prompt/chunker changes.
 */

import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { DATA_DIR } from "../src/lib/local-ai/config";

type Category = "facts" | "list" | "principles" | "nuance";

interface Question {
  id: string;
  question: string;
  mustContain?: string[];
  mustNotContain?: string[];
  expectedCitations?: string[];
  category: Category;
}

interface Result {
  id: string;
  category: Category;
  question: string;
  answer: string;
  citations: string[];
  scores: {
    keywordCoverage: number;     // 0..1
    citationMatch: number;       // 0..1 (any match = 1)
    llmCorrectness: number;      // 0..1
    llmGroundedness: number;     // 0..1
    composite: number;           // weighted 0..1
  };
  latencyMs: number;
  model: string;
  missingKeywords: string[];
  forbiddenPresent: string[];
}

const args = process.argv.slice(2);
const flag = (name: string, fallback?: string): string | undefined => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return fallback;
  return args[i + 1];
};
const hasFlag = (name: string) => args.includes(`--${name}`);

const BASE = flag("base", process.env.LOCAL_AI_URL) ?? "http://localhost:4100";
const COMPARE = hasFlag("compare");

const EVAL_DIR = path.join(DATA_DIR, "eval-runs");
const QUESTIONS_PATH = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  "eval",
  "questions.json"
);

// ─── HTTP helpers ─────────────────────────────────────────

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(180_000),
  });
  if (!res.ok) {
    throw new Error(`${url} → ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

interface RagAnswer {
  sessionId: string;
  answer: string;
  citations: { noteId: string; heading?: string; score: number }[];
  model: string;
  provider: string;
}

// ─── Scoring ──────────────────────────────────────────────

function scoreKeywords(answer: string, q: Question): {
  coverage: number;
  missing: string[];
  forbidden: string[];
} {
  const lower = answer.toLowerCase();
  const must = q.mustContain ?? [];
  const missing = must.filter((k) => !lower.includes(k.toLowerCase()));
  const coverage = must.length === 0 ? 1 : 1 - missing.length / must.length;

  const mustNot = q.mustNotContain ?? [];
  const forbidden = mustNot.filter((k) => lower.includes(k.toLowerCase()));

  return { coverage, missing, forbidden };
}

function scoreCitations(citations: string[], q: Question): number {
  const expected = q.expectedCitations ?? [];
  if (expected.length === 0) return 1;
  const lower = citations.map((c) => c.toLowerCase());
  const hit = expected.some((e) =>
    lower.some((c) => c.includes(e.toLowerCase()))
  );
  return hit ? 1 : 0;
}

async function llmJudge(
  question: string,
  answer: string,
  expectedKeywords: string[]
): Promise<{ correctness: number; groundedness: number }> {
  const prompt = `You are judging an AI assistant's answer to a question about a user's personal notes.

Question: ${question}

Expected facts or keywords that should appear: ${expectedKeywords.join(", ") || "(none specified)"}

Assistant answer:
${answer}

Return ONLY a JSON object of the form {"correctness": <0-10>, "groundedness": <0-10>, "reason": "<short>"}.
- correctness: how well the answer addresses the question and contains the expected facts
- groundedness: does it avoid hallucinating (0 = makes stuff up, 10 = only states facts clearly grounded in notes)`;

  const res = await postJson<{ text: string }>(`${BASE}/chat`, {
    prompt,
    system: "You are a precise judge. Respond with JSON only.",
    complexity: "simple",
    maxTokens: 200,
    jsonMode: true,
  });

  try {
    const parsed = JSON.parse(res.text) as {
      correctness?: number;
      groundedness?: number;
    };
    return {
      correctness: Math.max(0, Math.min(10, Number(parsed.correctness ?? 0))) / 10,
      groundedness: Math.max(0, Math.min(10, Number(parsed.groundedness ?? 0))) / 10,
    };
  } catch {
    return { correctness: 0, groundedness: 0 };
  }
}

// ─── Runner ───────────────────────────────────────────────

async function runOne(q: Question): Promise<Result> {
  const t0 = Date.now();
  const res = await postJson<RagAnswer>(`${BASE}/rag`, {
    query: q.question,
    mode: "answer",
  });
  const latencyMs = Date.now() - t0;

  const citations = res.citations.map((c) => c.noteId);
  const kw = scoreKeywords(res.answer, q);
  const citationMatch = scoreCitations(citations, q);
  const { correctness, groundedness } = await llmJudge(
    q.question,
    res.answer,
    q.mustContain ?? []
  );

  // Composite: lean on LLM judge + keyword coverage, then citations.
  const composite =
    0.4 * correctness +
    0.25 * kw.coverage +
    0.2 * groundedness +
    0.15 * citationMatch -
    (kw.forbidden.length > 0 ? 0.3 : 0);

  return {
    id: q.id,
    category: q.category,
    question: q.question,
    answer: res.answer,
    citations,
    scores: {
      keywordCoverage: Number(kw.coverage.toFixed(3)),
      citationMatch,
      llmCorrectness: Number(correctness.toFixed(3)),
      llmGroundedness: Number(groundedness.toFixed(3)),
      composite: Number(Math.max(0, Math.min(1, composite)).toFixed(3)),
    },
    latencyMs,
    model: res.model,
    missingKeywords: kw.missing,
    forbiddenPresent: kw.forbidden,
  };
}

function pct(n: number): string {
  return `${(n * 100).toFixed(0)}%`;
}

function statusIcon(composite: number): string {
  if (composite >= 0.8) return "✅";
  if (composite >= 0.6) return "🟡";
  return "❌";
}

async function main() {
  const raw = await fs.readFile(QUESTIONS_PATH, "utf8");
  const questions = JSON.parse(raw) as Question[];

  // Sanity-check server is reachable
  try {
    const r = await fetch(`${BASE}/health`);
    if (!r.ok) throw new Error(`health ${r.status}`);
  } catch (err) {
    console.error(`❌ cannot reach ${BASE}/health — is the server running?`);
    console.error(`   npm run ai:serve   (or)   pm2 start ecosystem.config.cjs`);
    console.error(`   reason: ${(err as Error).message}`);
    process.exit(1);
  }

  console.log(`🧪 eval harness → ${BASE}`);
  console.log(`   ${questions.length} questions\n`);

  const results: Result[] = [];
  for (const q of questions) {
    process.stdout.write(`  ${q.id.padEnd(22)} `);
    try {
      const r = await runOne(q);
      results.push(r);
      console.log(
        `${statusIcon(r.scores.composite)} ${pct(r.scores.composite)}  ` +
          `(kw ${pct(r.scores.keywordCoverage)} · corr ${pct(r.scores.llmCorrectness)} · ` +
          `cite ${r.scores.citationMatch ? "✓" : "✗"} · ${r.latencyMs}ms)`
      );
      if (r.missingKeywords.length)
        console.log(`    missing: ${r.missingKeywords.join(", ")}`);
      if (r.forbiddenPresent.length)
        console.log(`    ⚠ forbidden present: ${r.forbiddenPresent.join(", ")}`);
    } catch (err) {
      console.log(`❌ error: ${(err as Error).message}`);
    }
  }

  // Aggregate
  const avg = (key: keyof Result["scores"]) =>
    results.reduce((s, r) => s + r.scores[key], 0) / Math.max(results.length, 1);

  const summary = {
    timestamp: new Date().toISOString(),
    base: BASE,
    questionCount: results.length,
    averages: {
      composite: Number(avg("composite").toFixed(3)),
      keywordCoverage: Number(avg("keywordCoverage").toFixed(3)),
      citationMatch: Number(avg("citationMatch").toFixed(3)),
      llmCorrectness: Number(avg("llmCorrectness").toFixed(3)),
      llmGroundedness: Number(avg("llmGroundedness").toFixed(3)),
    },
    avgLatencyMs: Math.round(
      results.reduce((s, r) => s + r.latencyMs, 0) / Math.max(results.length, 1)
    ),
    results,
  };

  console.log("\n📊 Summary");
  console.log(`   composite       ${pct(summary.averages.composite)}`);
  console.log(`   keyword cover   ${pct(summary.averages.keywordCoverage)}`);
  console.log(`   citation match  ${pct(summary.averages.citationMatch)}`);
  console.log(`   llm correct     ${pct(summary.averages.llmCorrectness)}`);
  console.log(`   llm grounded    ${pct(summary.averages.llmGroundedness)}`);
  console.log(`   avg latency     ${summary.avgLatencyMs}ms`);

  await fs.mkdir(EVAL_DIR, { recursive: true });
  const outPath = path.join(
    EVAL_DIR,
    `${summary.timestamp.replace(/[:.]/g, "-")}.json`
  );
  await fs.writeFile(outPath, JSON.stringify(summary, null, 2));
  console.log(`\n💾 saved: ${outPath.replace(os.homedir(), "~")}`);

  if (COMPARE) {
    // Find the most recent prior run.
    const files = (await fs.readdir(EVAL_DIR)).filter((f) => f.endsWith(".json")).sort();
    const prevFile = files.length >= 2 ? files[files.length - 2] : null;
    if (prevFile) {
      const prev = JSON.parse(
        await fs.readFile(path.join(EVAL_DIR, prevFile), "utf8")
      ) as typeof summary;
      const delta = summary.averages.composite - prev.averages.composite;
      const sign = delta >= 0 ? "+" : "";
      console.log(
        `\n🔁 vs previous (${prevFile}): composite ${pct(prev.averages.composite)} → ${pct(summary.averages.composite)}  (${sign}${(delta * 100).toFixed(1)}pp)`
      );
    } else {
      console.log("\n🔁 no prior run to compare against");
    }
  }
}

main().catch((err) => {
  console.error("eval failed:", err);
  process.exit(1);
});
