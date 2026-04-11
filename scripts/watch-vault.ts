#!/usr/bin/env tsx
/**
 * Long-lived vault watcher.
 *
 *   npm run ai:watch
 *
 * Rebuilds the local AI index whenever notes change. Incremental, so
 * most rebuilds only touch the chunks that actually changed.
 */

import { startVaultWatcher } from "../src/lib/local-ai/watcher";
import { VAULT_PATH } from "../src/lib/local-ai/config";

console.log(`👁  Watching ${VAULT_PATH}`);
console.log(`   (Ctrl+C to stop)\n`);

const watcher = startVaultWatcher({
  onEvent: (e) => {
    const ts = new Date().toLocaleTimeString();
    switch (e.type) {
      case "ready":
        console.log(`[${ts}] ready — tracking ${e.files} paths`);
        break;
      case "change":
        console.log(`[${ts}] ${e.file}`);
        break;
      case "rebuild-start":
        console.log(`[${ts}] rebuilding… (${e.pending} change${e.pending === 1 ? "" : "s"})`);
        break;
      case "rebuild-done":
        console.log(
          `[${ts}] ✓ done in ${e.durationMs}ms — +${e.stats.added} ~${e.stats.updated} -${e.stats.removed} (total ${e.stats.total})`
        );
        break;
      case "error":
        console.error(`[${ts}] ❌`, e.error.message);
        break;
    }
  },
});

const shutdown = async () => {
  console.log("\nstopping watcher…");
  await watcher.stop();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
