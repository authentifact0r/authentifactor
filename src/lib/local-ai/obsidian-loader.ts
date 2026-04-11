/**
 * Obsidian vault loader.
 *
 * Walks the vault, parses every .md file, and produces:
 *   notes.json  — per-note metadata (path, title, frontmatter, headings, tags)
 *   graph.json  — nodes + edges from [[wikilinks]] (knowledge graph)
 *   chunks.json — chunked body text ready for embedding
 *
 * Pure node + regex; no extra deps.
 */

import fs from "node:fs/promises";
import path from "node:path";
import {
  VAULT_PATH,
  DATA_DIR,
  NOTES_JSON,
  GRAPH_JSON,
  CHUNKS_JSON,
  CHUNK_SIZE,
  CHUNK_OVERLAP,
} from "./config";

export interface ObsidianNote {
  id: string;              // relative path without extension
  path: string;            // absolute path
  title: string;
  frontmatter: Record<string, unknown>;
  headings: string[];
  tags: string[];
  links: string[];         // outgoing [[links]] as note ids
  body: string;
  mtime: number;
}

export interface GraphNode {
  id: string;
  title: string;
  tags: string[];
}

export interface GraphEdge {
  from: string;
  to: string;
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  backlinks: Record<string, string[]>;
}

export interface Chunk {
  id: string;          // `${noteId}#${index}`
  noteId: string;
  index: number;
  text: string;
  heading?: string;
}

// ─── Walking the vault ─────────────────────────────────────

async function walk(dir: string, out: string[] = []): Promise<string[]> {
  let entries: import("node:fs").Dirent[];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, out);
    else if (entry.isFile() && entry.name.endsWith(".md")) out.push(full);
  }
  return out;
}

// ─── Parsing ───────────────────────────────────────────────

// Minimal YAML frontmatter parser: key: value, nested lists via "- item".
function parseFrontmatter(raw: string): { fm: Record<string, unknown>; body: string } {
  if (!raw.startsWith("---")) return { fm: {}, body: raw };
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { fm: {}, body: raw };
  const block = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).replace(/^\n/, "");
  const fm: Record<string, unknown> = {};
  let currentKey: string | null = null;
  for (const line of block.split("\n")) {
    const listMatch = line.match(/^\s*-\s+(.+)$/);
    if (listMatch && currentKey) {
      const arr = (fm[currentKey] as unknown[]) ?? [];
      arr.push(listMatch[1].trim().replace(/^["']|["']$/g, ""));
      fm[currentKey] = arr;
      continue;
    }
    const kv = line.match(/^([A-Za-z0-9_\-]+)\s*:\s*(.*)$/);
    if (!kv) continue;
    const [, key, val] = kv;
    currentKey = key;
    const trimmed = val.trim();
    if (trimmed === "") {
      fm[key] = [];
    } else {
      fm[key] = trimmed.replace(/^["']|["']$/g, "");
    }
  }
  return { fm, body };
}

function extractHeadings(body: string): string[] {
  const out: string[] = [];
  for (const line of body.split("\n")) {
    const m = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (m) out.push(m[2]);
  }
  return out;
}

function extractTags(body: string, fm: Record<string, unknown>): string[] {
  const tags = new Set<string>();
  const fmTags = fm.tags;
  if (Array.isArray(fmTags)) fmTags.forEach((t) => tags.add(String(t)));
  else if (typeof fmTags === "string")
    fmTags.split(/[,\s]+/).filter(Boolean).forEach((t) => tags.add(t));

  // Inline #tags (skip code blocks, skip leading # of headings)
  const stripped = body.replace(/```[\s\S]*?```/g, "").replace(/^#{1,6}\s.*$/gm, "");
  for (const m of stripped.matchAll(/(?:^|\s)#([A-Za-z0-9][A-Za-z0-9_\-/]*)/g)) {
    tags.add(m[1]);
  }
  return [...tags];
}

function extractLinks(body: string): string[] {
  const links = new Set<string>();
  for (const m of body.matchAll(/\[\[([^\]]+?)\]\]/g)) {
    const raw = m[1].split("|")[0].split("#")[0].trim();
    if (raw) links.add(raw);
  }
  return [...links];
}

/**
 * Markdown-aware chunker.
 *
 * Strategy (cascade — only falls back when the prior level exceeds CHUNK_SIZE):
 *   1. Split the note into sections by headings (## / ### / …)
 *   2. For each section, split by blank-line paragraphs
 *   3. Pack paragraphs into chunks up to CHUNK_SIZE, never crossing a heading
 *   4. If a single paragraph is bigger than CHUNK_SIZE, fall back to a
 *      sentence-aware sliding window so we don't split mid-word
 *
 * Each chunk carries its nearest heading so RAG results can show breadcrumbs.
 */
function splitSection(text: string): string[] {
  // Paragraphs = runs separated by one-or-more blank lines.
  return text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
}

function splitLongParagraph(para: string): string[] {
  if (para.length <= CHUNK_SIZE) return [para];
  // Sentence-aware fallback — split on `. ` / `? ` / `! ` boundaries.
  const sentences = para.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) ?? [para];
  const out: string[] = [];
  let buf = "";
  for (const s of sentences) {
    if ((buf + s).length > CHUNK_SIZE && buf) {
      out.push(buf.trim());
      // overlap: keep the tail of the previous chunk
      buf = buf.slice(Math.max(0, buf.length - CHUNK_OVERLAP)) + s;
    } else {
      buf += s;
    }
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

function chunkText(text: string, noteId: string, defaultHeading?: string): Chunk[] {
  const chunks: Chunk[] = [];
  const clean = text.replace(/\s+\n/g, "\n").trim();
  if (!clean) return chunks;

  // Walk line by line, opening a new section whenever we see a heading.
  const lines = clean.split("\n");
  type Section = { heading: string | undefined; body: string };
  const sections: Section[] = [{ heading: defaultHeading, body: "" }];
  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (headingMatch) {
      sections.push({ heading: headingMatch[2], body: "" });
    } else {
      sections[sections.length - 1].body += line + "\n";
    }
  }

  let index = 0;
  for (const section of sections) {
    const paragraphs = splitSection(section.body);
    if (paragraphs.length === 0) continue;

    // Pack paragraphs into chunks up to CHUNK_SIZE.
    let buf = "";
    const flush = () => {
      if (!buf.trim()) return;
      chunks.push({
        id: `${noteId}#${index}`,
        noteId,
        index,
        text: buf.trim(),
        heading: section.heading,
      });
      index++;
      buf = "";
    };

    for (const para of paragraphs) {
      if (para.length > CHUNK_SIZE) {
        flush();
        for (const piece of splitLongParagraph(para)) {
          chunks.push({
            id: `${noteId}#${index}`,
            noteId,
            index,
            text: piece,
            heading: section.heading,
          });
          index++;
        }
        continue;
      }
      if ((buf + "\n\n" + para).length > CHUNK_SIZE && buf) flush();
      buf = buf ? `${buf}\n\n${para}` : para;
    }
    flush();
  }

  return chunks;
}

// ─── Public API ────────────────────────────────────────────

export async function loadVault(vaultPath = VAULT_PATH): Promise<{
  notes: ObsidianNote[];
  graph: KnowledgeGraph;
  chunks: Chunk[];
}> {
  const files = await walk(vaultPath);
  const notes: ObsidianNote[] = [];
  const chunks: Chunk[] = [];

  // First pass: parse notes, build id set from file basenames
  const byTitle = new Map<string, string>();
  for (const file of files) {
    const rel = path.relative(vaultPath, file).replace(/\.md$/, "");
    const title = path.basename(rel);
    byTitle.set(title, rel);
  }

  for (const file of files) {
    const raw = await fs.readFile(file, "utf8");
    const stat = await fs.stat(file);
    const { fm, body } = parseFrontmatter(raw);
    const rel = path.relative(vaultPath, file).replace(/\.md$/, "");
    const title = (fm.title as string) || path.basename(rel);
    const headings = extractHeadings(body);
    const tags = extractTags(body, fm);
    const rawLinks = extractLinks(body);
    // Resolve links to ids when possible, else keep raw title
    const links = rawLinks.map((l) => byTitle.get(l) ?? l);

    notes.push({
      id: rel,
      path: file,
      title,
      frontmatter: fm,
      headings,
      tags,
      links,
      body,
      mtime: stat.mtimeMs,
    });

    chunks.push(...chunkText(body, rel, headings[0]));
  }

  // Build graph
  const nodes: GraphNode[] = notes.map((n) => ({
    id: n.id,
    title: n.title,
    tags: n.tags,
  }));
  const edges: GraphEdge[] = [];
  const backlinks: Record<string, string[]> = {};
  for (const n of notes) {
    for (const target of n.links) {
      edges.push({ from: n.id, to: target });
      (backlinks[target] ??= []).push(n.id);
    }
  }

  return { notes, graph: { nodes, edges, backlinks }, chunks };
}

export async function persistVaultIndex(
  notes: ObsidianNote[],
  graph: KnowledgeGraph,
  chunks: Chunk[]
): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  // Strip heavy body field from notes.json to keep it lean.
  const slim = notes.map(({ body: _body, ...rest }) => rest);
  await fs.writeFile(NOTES_JSON, JSON.stringify(slim, null, 2));
  await fs.writeFile(GRAPH_JSON, JSON.stringify(graph, null, 2));
  await fs.writeFile(CHUNKS_JSON, JSON.stringify(chunks));
}

export async function readVaultIndex(): Promise<{
  notes: Omit<ObsidianNote, "body">[];
  graph: KnowledgeGraph;
  chunks: Chunk[];
}> {
  const [notes, graph, chunks] = await Promise.all([
    fs.readFile(NOTES_JSON, "utf8").then(JSON.parse),
    fs.readFile(GRAPH_JSON, "utf8").then(JSON.parse),
    fs.readFile(CHUNKS_JSON, "utf8").then(JSON.parse),
  ]);
  return { notes, graph, chunks };
}
