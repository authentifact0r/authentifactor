#!/usr/bin/env tsx
/**
 * Build the local AI index from the Obsidian vault.
 *
 *   npx tsx scripts/index-vault.ts
 *
 * Incremental: already-embedded chunks whose content hasn't changed are
 * skipped. Stale chunks (deleted notes) are removed.
 */

import { loadVault, persistVaultIndex } from "../src/lib/local-ai/obsidian-loader";
import { indexChunks, closeDb } from "../src/lib/local-ai/embeddings";
import { VAULT_PATH, DATA_DIR, MODELS } from "../src/lib/local-ai/config";

async function main() {
  console.log("📚 Local AI indexer");
  console.log(`   vault: ${VAULT_PATH}`);
  console.log(`   data:  ${DATA_DIR}`);
  console.log(`   embed: ${MODELS.embed}\n`);

  const t0 = Date.now();
  const { notes, graph, chunks } = await loadVault();
  console.log(`✓ Parsed ${notes.length} notes → ${chunks.length} chunks`);
  console.log(`✓ Graph: ${graph.nodes.length} nodes / ${graph.edges.length} edges`);

  await persistVaultIndex(notes, graph, chunks);
  console.log(`✓ Wrote notes.json / graph.json / chunks.json`);

  console.log(`\n🧠 Embedding (this may take a while on first run)…`);
  let lastPct = -1;
  const stats = await indexChunks(chunks, (done, total) => {
    const pct = Math.floor((done / total) * 100);
    if (pct !== lastPct && pct % 5 === 0) {
      process.stdout.write(`\r   ${pct}%  (${done}/${total})`);
      lastPct = pct;
    }
  });
  process.stdout.write("\n");

  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(
    `\n✅ Done in ${secs}s — added ${stats.added}, updated ${stats.updated}, removed ${stats.removed}, total ${stats.total}`
  );

  await closeDb();
}

main().catch((err) => {
  console.error("❌ Indexer failed:", err);
  process.exit(1);
});
