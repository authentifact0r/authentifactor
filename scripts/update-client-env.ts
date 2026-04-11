#!/usr/bin/env tsx
/**
 * Fan out LOCAL_AI_URL + LOCAL_AI_TOKEN into every sibling app's
 * env file. Add-only: reads each file, leaves existing keys alone,
 * adds or updates only the two vars we care about.
 *
 *   npm run ai:env:sync
 *   npm run ai:env:sync -- --url http://localhost:4100  (override)
 */

import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

interface Target {
  name: string;
  file: string;
}

const TARGETS: Target[] = [
  { name: "Authentifactor",     file: path.join(os.homedir(), "Authentifactor/.env.local") },
  { name: "CitiesTroves web",   file: path.join(os.homedir(), "CitiesTroves/apps/web/.env.local") },
  { name: "CitiesTroves api",   file: path.join(os.homedir(), "CitiesTroves/apps/api/.env") },
  { name: "Careceutical",       file: path.join(os.homedir(), "Careceutical/.env.local") },
  { name: "Bowsea frontend",    file: path.join(os.homedir(), "bowsea/frontend/.env.local") },
  { name: "Bowsea backend",     file: path.join(os.homedir(), "bowsea/backend/.env") },
];

const args = process.argv.slice(2);
const flag = (name: string, fallback?: string) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return fallback;
  return args[i + 1];
};

const URL = flag("url", "https://ai.linkolu.com")!;
const TOKEN_FILE = path.join(os.homedir(), ".local-ai/authentifactor/token.txt");

async function upsert(file: string, vars: Record<string, string>): Promise<"created" | "updated" | "unchanged"> {
  let content = "";
  try {
    content = await fs.readFile(file, "utf8");
  } catch {
    // File doesn't exist — create it
  }

  let changed = false;
  const hadContent = content.length > 0;
  const lines = content.split("\n");
  for (const [key, value] of Object.entries(vars)) {
    const re = new RegExp(`^${key}=.*$`, "m");
    const newLine = `${key}=${value}`;
    if (re.test(content)) {
      const updated = content.replace(re, newLine);
      if (updated !== content) {
        content = updated;
        changed = true;
      }
    } else {
      // Append
      if (content && !content.endsWith("\n")) content += "\n";
      content += newLine + "\n";
      changed = true;
    }
  }
  if (!changed) return "unchanged";
  // Ensure parent dir exists (only for the files we're targeting)
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content);
  return hadContent ? "updated" : "created";
}

async function main() {
  const token = (await fs.readFile(TOKEN_FILE, "utf8")).trim();
  console.log(`📝 propagating LOCAL_AI env to sibling apps`);
  console.log(`   LOCAL_AI_URL = ${URL}`);
  console.log(`   LOCAL_AI_TOKEN = ${token.slice(0, 10)}…${token.slice(-6)}`);
  console.log();

  for (const target of TARGETS) {
    const parent = path.dirname(target.file);
    try {
      await fs.access(parent);
    } catch {
      console.log(`  - ${target.name.padEnd(22)} skip (${parent.replace(os.homedir(), "~")} missing)`);
      continue;
    }
    const status = await upsert(target.file, {
      LOCAL_AI_URL: URL,
      LOCAL_AI_TOKEN: token,
    });
    const icon = status === "created" ? "+" : status === "updated" ? "~" : "=";
    console.log(`  ${icon} ${target.name.padEnd(22)} ${status.padEnd(9)} ${target.file.replace(os.homedir(), "~")}`);
  }

  console.log(`\n✅ done`);
}

main().catch((err) => {
  console.error("env sync failed:", err);
  process.exit(1);
});
