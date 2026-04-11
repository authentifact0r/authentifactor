/**
 * Local AI subsystem — shared configuration.
 *
 * Everything the sovereign local stack needs to know about itself:
 * vault location, model names, storage paths, offline toggle.
 */

import path from "node:path";
import os from "node:os";

export const OLLAMA_URL =
  process.env.OLLAMA_URL || "http://localhost:11434";

export const OFFLINE_MODE =
  (process.env.OFFLINE_MODE ?? "true").toLowerCase() !== "false";

export const VAULT_PATH =
  process.env.OBSIDIAN_VAULT_PATH ||
  path.join(os.homedir(), "Documents", "ObsidianVault");

// Where indexed artefacts live. Outside the Next.js src tree so hot-reload
// doesn't thrash when the index is rebuilt.
export const DATA_DIR =
  process.env.LOCAL_AI_DATA_DIR ||
  path.join(os.homedir(), ".local-ai", "authentifactor");

export const NOTES_JSON = path.join(DATA_DIR, "notes.json");
export const GRAPH_JSON = path.join(DATA_DIR, "graph.json");
export const CHUNKS_JSON = path.join(DATA_DIR, "chunks.json");
export const EMBEDDINGS_DB = path.join(DATA_DIR, "embeddings.sqlite");

export const MODELS = {
  fast: process.env.OLLAMA_FAST_MODEL || "llama3.1:8b",
  smart: process.env.OLLAMA_SMART_MODEL || "qwen2.5:14b",
  embed: process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text",
};

export const CHUNK_SIZE = 800;     // chars per chunk
export const CHUNK_OVERLAP = 120;  // chars of overlap between chunks
