#!/usr/bin/env tsx
/**
 * Smoke test the entire local AI stack.
 *
 *   npx tsx scripts/test-local-ai.ts [optional question]
 *
 * Checks:
 *   1. Ollama reachable
 *   2. Vault index exists
 *   3. Embedding round-trip works
 *   4. Semantic + hybrid search return hits
 *   5. Knowledge agent produces an answer
 *   6. ReAct agent loop runs end-to-end with a tool call
 */

import fs from "node:fs/promises";
import { OLLAMA_URL, MODELS, EMBEDDINGS_DB, VAULT_PATH } from "../src/lib/local-ai/config";
import { embedText, loadAllEmbeddings, closeDb } from "../src/lib/local-ai/embeddings";
import { semanticSearch, hybridSearch } from "../src/lib/local-ai/rag";
import { runKnowledgeAgent } from "../src/lib/local-ai/knowledge-agent";
import { runAgentLoop } from "../src/lib/local-ai/agent-loop";
import { smartLLMStream, warmupLocalModels } from "../src/lib/smart-llm";
import { listSessions, getHistory, deleteSession } from "../src/lib/local-ai/memory";
import { startVaultWatcher } from "../src/lib/local-ai/watcher";
import fsp from "node:fs/promises";
import nodePath from "node:path";
import { VAULT_PATH } from "../src/lib/local-ai/config";

const QUESTION =
  process.argv[2] ||
  "What are the main projects I'm working on according to my Obsidian vault?";

function ok(label: string) {
  console.log(`  ✅ ${label}`);
}
function fail(label: string, err: unknown): never {
  console.error(`  ❌ ${label}`);
  console.error(err);
  process.exit(1);
}

async function main() {
  console.log("🔬 Local AI smoke test");
  console.log(`   vault:   ${VAULT_PATH}`);
  console.log(`   ollama:  ${OLLAMA_URL}`);
  console.log(`   embed:   ${MODELS.embed}`);
  console.log(`   fast:    ${MODELS.fast}`);
  console.log(`   smart:   ${MODELS.smart}`);
  console.log(`   db:      ${EMBEDDINGS_DB}\n`);

  console.log("0. Warmup (pre-load models)");
  try {
    const w = await warmupLocalModels();
    ok(`warmed in ${w.durationMs}ms — fast=${w.fast} smart=${w.smart}`);
  } catch (err) {
    fail("warmup failed", err);
  }

  console.log("\n1. Ollama reachable");
  try {
    const r = await fetch(`${OLLAMA_URL}/api/version`);
    if (!r.ok) throw new Error(`status ${r.status}`);
    ok("ollama is up");
  } catch (err) {
    fail("ollama not reachable — is it running?", err);
  }

  console.log("\n2. Vault index files present");
  try {
    await fs.access(EMBEDDINGS_DB);
    const all = await loadAllEmbeddings();
    if (all.length === 0) throw new Error("no embeddings in DB");
    ok(`${all.length} embedded chunks`);
  } catch (err) {
    fail("no index — run `npx tsx scripts/index-vault.ts` first", err);
  }

  console.log("\n3. Embedding round-trip");
  try {
    const v = await embedText("hello world");
    if (!Array.isArray(v) || v.length < 64) throw new Error("suspiciously short vector");
    ok(`dim=${v.length}`);
  } catch (err) {
    fail("embedding call failed", err);
  }

  console.log("\n4. Semantic + hybrid search");
  try {
    const sem = await semanticSearch(QUESTION, 5);
    const hyb = await hybridSearch(QUESTION, 5);
    ok(`semantic: ${sem.length} hits, top=${sem[0]?.score.toFixed(3)}`);
    ok(`hybrid:   ${hyb.length} hits, top=${hyb[0]?.score.toFixed(3)}`);
  } catch (err) {
    fail("search failed", err);
  }

  console.log("\n5. Knowledge agent");
  try {
    const answer = await runKnowledgeAgent(QUESTION);
    ok(`model=${answer.model} provider=${answer.provider}`);
    console.log(`\n   Q: ${QUESTION}`);
    console.log(`   A: ${answer.answer.slice(0, 500)}${answer.answer.length > 500 ? "…" : ""}`);
    console.log(`   cites: ${answer.citations.map((c) => c.noteId).join(", ")}`);
  } catch (err) {
    fail("knowledge agent failed", err);
  }

  console.log("\n6. ReAct agent loop");
  try {
    const run = await runAgentLoop(QUESTION, { maxSteps: 4 });
    ok(`${run.steps.length} steps, model=${run.model}`);
    for (const [i, s] of run.steps.entries()) {
      const line =
        s.action === "finish"
          ? `     ${i + 1}. finish`
          : `     ${i + 1}. ${s.tool}(${JSON.stringify(s.args ?? {}).slice(0, 80)})`;
      console.log(line);
    }
    console.log(`\n   Final: ${run.answer.slice(0, 500)}${run.answer.length > 500 ? "…" : ""}`);
  } catch (err) {
    fail("agent loop failed", err);
  }

  console.log("\n7. Streaming (time-to-first-token)");
  try {
    const t0 = Date.now();
    let firstTokenAt = 0;
    let tokens = 0;
    let full = "";
    for await (const chunk of smartLLMStream({
      prompt: "Say hello in one short sentence.",
      complexity: "simple",
      maxTokens: 40,
    })) {
      if (!firstTokenAt) firstTokenAt = Date.now() - t0;
      tokens++;
      full += chunk;
    }
    ok(`first token ${firstTokenAt}ms, ${tokens} chunks, total ${Date.now() - t0}ms`);
    console.log(`   stream: ${full.trim().slice(0, 200)}`);
  } catch (err) {
    fail("streaming failed", err);
  }

  console.log("\n8. Conversation memory (multi-turn)");
  try {
    const first = await runKnowledgeAgent(
      "What is Authentifactor in one sentence?"
    );
    ok(`turn 1 session=${first.sessionId.slice(0, 12)}…`);
    const second = await runKnowledgeAgent(
      "And what tenants does it currently serve?",
      { sessionId: first.sessionId }
    );
    ok(`turn 2 same session: ${second.sessionId === first.sessionId}`);
    const history = await getHistory(first.sessionId);
    ok(`history rows: ${history.length}`);
    const sessions = await listSessions(5);
    ok(`listSessions works: ${sessions.length} session(s)`);
    console.log(`   Q2: And what tenants does it currently serve?`);
    console.log(
      `   A2: ${second.answer.slice(0, 300)}${second.answer.length > 300 ? "…" : ""}`
    );
    // Cleanup the test session so the memory DB stays tidy.
    await deleteSession(first.sessionId);
  } catch (err) {
    fail("conversation memory failed", err);
  }

  console.log("\n9. Vault watcher (debounced incremental rebuild)");
  try {
    const probeFile = nodePath.join(VAULT_PATH, `__watcher_probe__.md`);
    const events: string[] = [];
    let rebuildDone = false;
    const w = startVaultWatcher({
      debounceMs: 400,
      onEvent: (e) => {
        events.push(e.type);
        if (e.type === "rebuild-done") {
          rebuildDone = true;
          ok(
            `rebuild in ${e.durationMs}ms — +${e.stats.added} ~${e.stats.updated} -${e.stats.removed}`
          );
        }
        if (e.type === "error") console.error("   watcher error:", e.error.message);
      },
    });
    // Wait for chokidar "ready" (it does an initial scan even with ignoreInitial).
    await new Promise((r) => setTimeout(r, 1500));

    await fsp.writeFile(
      probeFile,
      `---\ntitle: watcher probe\n---\n\n# Watcher probe\n\nGenerated by ai:test at ${new Date().toISOString()}.\n`
    );
    // Wait for debounce + rebuild.
    const t0 = Date.now();
    while (!rebuildDone && Date.now() - t0 < 60000) {
      await new Promise((r) => setTimeout(r, 250));
    }
    if (!rebuildDone) throw new Error("watcher did not rebuild within 60s");

    await fsp.unlink(probeFile);
    // Second rebuild for the delete
    rebuildDone = false;
    const t1 = Date.now();
    while (!rebuildDone && Date.now() - t1 < 60000) {
      await new Promise((r) => setTimeout(r, 250));
    }
    await w.stop();
    ok(`events: ${events.join(" → ")}`);
  } catch (err) {
    fail("watcher failed", err);
  }

  await closeDb();
  console.log("\n🎉 All checks passed. Sovereign stack is live.");
}

main().catch((err) => {
  console.error("Unhandled:", err);
  process.exit(1);
});
