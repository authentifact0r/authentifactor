/**
 * Obsidian vault file watcher.
 *
 * Watches the vault for .md changes, debounces bursts, then rebuilds
 * the index. Thanks to content-hash incremental embedding, a rebuild
 * after a small edit is near-free — only the changed chunks hit Ollama.
 *
 * Designed to run as a long-lived process via `npm run ai:watch`, but
 * the `startVaultWatcher` function is reusable from anywhere (e.g. a
 * dev-only Next.js hook).
 */

import chokidar, { type FSWatcher } from "chokidar";
import path from "node:path";
import { VAULT_PATH } from "./config";
import { loadVault, persistVaultIndex } from "./obsidian-loader";
import { indexChunks } from "./embeddings";
import { invalidateCaches } from "./rag";

export interface WatcherOptions {
  vaultPath?: string;
  debounceMs?: number;
  onEvent?: (event: WatcherEvent) => void;
}

export type WatcherEvent =
  | { type: "ready"; files: number }
  | { type: "change"; file: string }
  | { type: "rebuild-start"; pending: number }
  | {
      type: "rebuild-done";
      durationMs: number;
      stats: { added: number; updated: number; removed: number; total: number };
    }
  | { type: "error"; error: Error };

export interface VaultWatcher {
  stop: () => Promise<void>;
}

export function startVaultWatcher(opts: WatcherOptions = {}): VaultWatcher {
  const vaultPath = opts.vaultPath ?? VAULT_PATH;
  const debounceMs = opts.debounceMs ?? 1500;
  const emit = opts.onEvent ?? (() => {});

  const pending = new Set<string>();
  let timer: NodeJS.Timeout | null = null;
  let rebuilding = false;
  let rerun = false;

  const scheduleRebuild = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(runRebuild, debounceMs);
  };

  const runRebuild = async () => {
    if (rebuilding) {
      // A rebuild is already running — queue another to catch changes
      // that landed after it started.
      rerun = true;
      return;
    }
    rebuilding = true;
    const snapshotSize = pending.size;
    pending.clear();
    emit({ type: "rebuild-start", pending: snapshotSize });
    const t0 = Date.now();
    try {
      const { notes, graph, chunks } = await loadVault(vaultPath);
      await persistVaultIndex(notes, graph, chunks);
      const stats = await indexChunks(chunks);
      invalidateCaches();
      emit({ type: "rebuild-done", durationMs: Date.now() - t0, stats });
    } catch (error) {
      emit({ type: "error", error: error as Error });
    } finally {
      rebuilding = false;
      if (rerun) {
        rerun = false;
        scheduleRebuild();
      }
    }
  };

  const watcher: FSWatcher = chokidar.watch(vaultPath, {
    ignored: (p: string) => {
      const base = path.basename(p);
      if (base.startsWith(".")) return true;
      // Only care about markdown for content, but allow directories
      // through so chokidar can recurse.
      return false;
    },
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 },
  });

  const handle = (event: string) => (file: string) => {
    if (!file.endsWith(".md")) return;
    pending.add(file);
    emit({ type: "change", file: `${event}:${path.relative(vaultPath, file)}` });
    scheduleRebuild();
  };

  watcher.on("add", handle("add"));
  watcher.on("change", handle("change"));
  watcher.on("unlink", handle("unlink"));
  watcher.on("error", (error) =>
    emit({ type: "error", error: error as Error })
  );
  watcher.on("ready", () => {
    const watched = watcher.getWatched();
    const files = Object.values(watched).flat().length;
    emit({ type: "ready", files });
  });

  return {
    stop: async () => {
      if (timer) clearTimeout(timer);
      await watcher.close();
    },
  };
}
