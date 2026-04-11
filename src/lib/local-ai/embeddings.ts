/**
 * Local embedding pipeline — Ollama + SQLite.
 *
 * Embeds chunks via Ollama's embeddings endpoint and persists vectors in
 * a single SQLite file. Incremental: skips chunks whose content hash is
 * already indexed and deletes vectors for chunks that no longer exist.
 */

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import Database from "better-sqlite3";
import { OLLAMA_URL, MODELS, EMBEDDINGS_DB, DATA_DIR } from "./config";
import type { Chunk } from "./obsidian-loader";

export interface EmbeddedChunk {
  id: string;
  noteId: string;
  text: string;
  heading?: string;
  vector: Float32Array;
}

let _db: Database.Database | null = null;

async function getDb(): Promise<Database.Database> {
  if (_db) return _db;
  await fs.mkdir(DATA_DIR, { recursive: true });
  _db = new Database(EMBEDDINGS_DB);
  _db.pragma("journal_mode = WAL");
  _db.exec(`
    CREATE TABLE IF NOT EXISTS embeddings (
      id       TEXT PRIMARY KEY,
      note_id  TEXT NOT NULL,
      heading  TEXT,
      text     TEXT NOT NULL,
      hash     TEXT NOT NULL,
      vector   BLOB NOT NULL,
      dim      INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_embeddings_note ON embeddings(note_id);
  `);
  return _db;
}

function hashText(text: string): string {
  return crypto.createHash("sha1").update(text).digest("hex");
}

function vectorToBlob(v: number[]): Buffer {
  const buf = Buffer.alloc(v.length * 4);
  for (let i = 0; i < v.length; i++) buf.writeFloatLE(v[i], i * 4);
  return buf;
}

function blobToVector(buf: Buffer): Float32Array {
  const out = new Float32Array(buf.length / 4);
  for (let i = 0; i < out.length; i++) out[i] = buf.readFloatLE(i * 4);
  return out;
}

export async function embedText(text: string): Promise<number[]> {
  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODELS.embed, prompt: text }),
    signal: AbortSignal.timeout(
      Number(process.env.OLLAMA_EMBED_TIMEOUT_MS ?? 300000)
    ),
  });
  if (!res.ok) {
    throw new Error(`Ollama embeddings error: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  if (!Array.isArray(data.embedding)) {
    throw new Error("Ollama embeddings: no embedding field in response");
  }
  return data.embedding;
}

export async function indexChunks(
  chunks: Chunk[],
  onProgress?: (done: number, total: number) => void,
  opts: { concurrency?: number } = {}
): Promise<{ added: number; updated: number; removed: number; total: number }> {
  const concurrency = Math.max(
    1,
    opts.concurrency ?? Number(process.env.EMBED_CONCURRENCY ?? 6)
  );
  const db = await getDb();

  const existing = db
    .prepare("SELECT id, hash FROM embeddings")
    .all() as { id: string; hash: string }[];
  const existingMap = new Map(existing.map((r) => [r.id, r.hash]));

  const seen = new Set<string>();
  const insert = db.prepare(
    "INSERT OR REPLACE INTO embeddings (id, note_id, heading, text, hash, vector, dim) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );

  let added = 0;
  let updated = 0;
  let done = 0;

  // Partition: skip unchanged chunks up-front so the worker pool only
  // handles work that actually needs network + db writes.
  const todo: Chunk[] = [];
  for (const chunk of chunks) {
    seen.add(chunk.id);
    const hash = hashText(chunk.text);
    const prev = existingMap.get(chunk.id);
    if (prev === hash) {
      done++;
      onProgress?.(done, chunks.length);
      continue;
    }
    todo.push(chunk);
  }

  // Simple fixed-size worker pool. Each worker pulls the next chunk off
  // a shared cursor and writes to SQLite the instant its embedding lands.
  // better-sqlite3 is synchronous and thread-safe via its own mutex, so
  // parallel writes from the same process serialize cleanly.
  let cursor = 0;
  const worker = async (): Promise<void> => {
    while (true) {
      const i = cursor++;
      if (i >= todo.length) return;
      const chunk = todo[i];
      const hash = hashText(chunk.text);
      const vec = await embedText(chunk.text);
      insert.run(
        chunk.id,
        chunk.noteId,
        chunk.heading ?? null,
        chunk.text,
        hash,
        vectorToBlob(vec),
        vec.length
      );
      if (existingMap.has(chunk.id)) updated++;
      else added++;
      done++;
      onProgress?.(done, chunks.length);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(concurrency, todo.length) }, worker)
  );

  // Remove stale
  const del = db.prepare("DELETE FROM embeddings WHERE id = ?");
  let removed = 0;
  for (const row of existing) {
    if (!seen.has(row.id)) {
      del.run(row.id);
      removed++;
    }
  }

  const total = (db.prepare("SELECT COUNT(*) as c FROM embeddings").get() as { c: number }).c;
  return { added, updated, removed, total };
}

export async function loadAllEmbeddings(): Promise<EmbeddedChunk[]> {
  const db = await getDb();
  const rows = db
    .prepare("SELECT id, note_id, heading, text, vector FROM embeddings")
    .all() as {
    id: string;
    note_id: string;
    heading: string | null;
    text: string;
    vector: Buffer;
  }[];
  return rows.map((r) => ({
    id: r.id,
    noteId: r.note_id,
    heading: r.heading ?? undefined,
    text: r.text,
    vector: blobToVector(r.vector),
  }));
}

export function cosineSim(a: Float32Array | number[], b: Float32Array | number[]): number {
  let dot = 0, na = 0, nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export async function closeDb(): Promise<void> {
  if (_db) {
    _db.close();
    _db = null;
  }
}
