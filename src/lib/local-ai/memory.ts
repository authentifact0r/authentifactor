/**
 * Conversation memory for the local AI stack.
 *
 * A tiny SQLite-backed store of sessions and messages so the knowledge
 * agent and ReAct loop can carry multi-turn state. Kept in its own DB
 * file (`memory.sqlite`) so it can be wiped independently of the
 * embedding index.
 */

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import Database from "better-sqlite3";
import { DATA_DIR } from "./config";

const MEMORY_DB = path.join(DATA_DIR, "memory.sqlite");

export type MessageRole = "user" | "assistant" | "system" | "tool";

export interface Session {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
}

export interface Message {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  createdAt: number;
  metadata?: Record<string, unknown>;
}

let _db: Database.Database | null = null;

async function getDb(): Promise<Database.Database> {
  if (_db) return _db;
  await fs.mkdir(DATA_DIR, { recursive: true });
  _db = new Database(MEMORY_DB);
  _db.pragma("journal_mode = WAL");
  _db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      created_at  INTEGER NOT NULL,
      updated_at  INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS messages (
      id          TEXT PRIMARY KEY,
      session_id  TEXT NOT NULL,
      role        TEXT NOT NULL,
      content     TEXT NOT NULL,
      metadata    TEXT,
      created_at  INTEGER NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id, created_at);
  `);
  return _db;
}

function nowMs(): number {
  return Date.now();
}

function newId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}

// ─── Sessions ─────────────────────────────────────────────

export async function createSession(title = "New conversation"): Promise<Session> {
  const db = await getDb();
  const id = newId("ses");
  const t = nowMs();
  db.prepare(
    "INSERT INTO sessions (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)"
  ).run(id, title, t, t);
  return { id, title, createdAt: t, updatedAt: t, messageCount: 0 };
}

export async function getOrCreateSession(sessionId?: string): Promise<Session> {
  if (!sessionId) return createSession();
  const db = await getDb();
  const row = db.prepare("SELECT * FROM sessions WHERE id = ?").get(sessionId) as
    | { id: string; title: string; created_at: number; updated_at: number }
    | undefined;
  if (row) {
    const count = (db
      .prepare("SELECT COUNT(*) as c FROM messages WHERE session_id = ?")
      .get(sessionId) as { c: number }).c;
    return {
      id: row.id,
      title: row.title,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      messageCount: count,
    };
  }
  // Caller passed an id that doesn't exist — create with that id so the
  // client can mint its own ids if it wants.
  const t = nowMs();
  db.prepare(
    "INSERT INTO sessions (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)"
  ).run(sessionId, "New conversation", t, t);
  return {
    id: sessionId,
    title: "New conversation",
    createdAt: t,
    updatedAt: t,
    messageCount: 0,
  };
}

export async function listSessions(limit = 50): Promise<Session[]> {
  const db = await getDb();
  const rows = db
    .prepare(
      `SELECT s.*, (SELECT COUNT(*) FROM messages m WHERE m.session_id = s.id) AS message_count
       FROM sessions s
       ORDER BY s.updated_at DESC
       LIMIT ?`
    )
    .all(limit) as {
    id: string;
    title: string;
    created_at: number;
    updated_at: number;
    message_count: number;
  }[];
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    messageCount: r.message_count,
  }));
}

export async function deleteSession(sessionId: string): Promise<void> {
  const db = await getDb();
  db.prepare("DELETE FROM messages WHERE session_id = ?").run(sessionId);
  db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
}

export async function renameSession(sessionId: string, title: string): Promise<void> {
  const db = await getDb();
  db.prepare("UPDATE sessions SET title = ?, updated_at = ? WHERE id = ?").run(
    title,
    nowMs(),
    sessionId
  );
}

// ─── Messages ─────────────────────────────────────────────

export async function appendMessage(
  sessionId: string,
  role: MessageRole,
  content: string,
  metadata?: Record<string, unknown>
): Promise<Message> {
  const db = await getDb();
  const id = newId("msg");
  const t = nowMs();
  db.prepare(
    "INSERT INTO messages (id, session_id, role, content, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(id, sessionId, role, content, metadata ? JSON.stringify(metadata) : null, t);
  db.prepare("UPDATE sessions SET updated_at = ? WHERE id = ?").run(t, sessionId);

  // If this is the first user message and the session still has the
  // default title, use a truncated copy as the title. Cheap, no LLM call.
  if (role === "user") {
    const row = db
      .prepare("SELECT title FROM sessions WHERE id = ?")
      .get(sessionId) as { title: string } | undefined;
    if (row?.title === "New conversation") {
      const short = content.slice(0, 60).replace(/\s+/g, " ").trim();
      db.prepare("UPDATE sessions SET title = ? WHERE id = ?").run(
        short || "New conversation",
        sessionId
      );
    }
  }

  return { id, sessionId, role, content, createdAt: t, metadata };
}

export async function getHistory(
  sessionId: string,
  limit = 20
): Promise<Message[]> {
  const db = await getDb();
  const rows = db
    .prepare(
      `SELECT * FROM messages WHERE session_id = ?
       ORDER BY created_at DESC LIMIT ?`
    )
    .all(sessionId, limit) as {
    id: string;
    session_id: string;
    role: MessageRole;
    content: string;
    metadata: string | null;
    created_at: number;
  }[];
  return rows.reverse().map((r) => ({
    id: r.id,
    sessionId: r.session_id,
    role: r.role,
    content: r.content,
    createdAt: r.created_at,
    metadata: r.metadata ? JSON.parse(r.metadata) : undefined,
  }));
}

/**
 * Format recent history as a compact transcript to prepend to a prompt.
 * Skips tool/system rows to keep the context lean.
 */
export function formatHistoryForPrompt(messages: Message[]): string {
  if (messages.length === 0) return "";
  const lines = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`);
  return lines.join("\n\n");
}

export async function closeMemoryDb(): Promise<void> {
  if (_db) {
    _db.close();
    _db = null;
  }
}
