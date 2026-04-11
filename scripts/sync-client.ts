#!/usr/bin/env tsx
/**
 * Sync the LocalAI client into every consuming app.
 *
 *   npm run ai:client:sync
 *
 * Reads the canonical client from server/client/local-ai-client.ts and
 * writes it to every declared target. Only copies when the target
 * exists on disk — missing apps are skipped with a note so this is
 * safe to run even when some sibling repos are absent.
 */

import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const SOURCE = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
  "server",
  "client",
  "local-ai-client.ts"
);

// (appName, destination path) — the destination is where the app
// conventionally keeps shared TS helpers.
const TARGETS: { name: string; to: string }[] = [
  { name: "CitiesTroves web",     to: path.join(os.homedir(), "CitiesTroves/apps/web/src/lib/local-ai-client.ts") },
  { name: "CitiesTroves api",     to: path.join(os.homedir(), "CitiesTroves/apps/api/src/config/local-ai-client.ts") },
  { name: "CitiesTroves shared",  to: path.join(os.homedir(), "CitiesTroves/packages/shared/src/local-ai-client.ts") },
  { name: "Careceutical",         to: path.join(os.homedir(), "Careceutical/src/lib/local-ai-client.ts") },
  { name: "Bowsea frontend",      to: path.join(os.homedir(), "bowsea/frontend/src/lib/local-ai-client.ts") },
  { name: "Bowsea backend",       to: path.join(os.homedir(), "bowsea/backend/src/utils/local-ai-client.ts") },
  { name: "VARSITY",              to: path.join(os.homedir(), "Desktop/VARSITY/src/lib/local-ai-client.ts") },
  { name: "Agency in the Box",    to: path.join(os.homedir(), "AgencyInTheBox/src/lib/local-ai-client.ts") },
];

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const source = await fs.readFile(SOURCE, "utf8");
  console.log(`📦 syncing LocalAI client (${source.length} bytes)\n`);

  let synced = 0;
  let skipped = 0;
  for (const target of TARGETS) {
    const parent = path.dirname(target.to);
    if (!(await exists(parent))) {
      console.log(`  - ${target.name.padEnd(22)} skip (parent dir not found: ${parent.replace(os.homedir(), "~")})`);
      skipped++;
      continue;
    }
    await fs.writeFile(target.to, source);
    console.log(`  ✓ ${target.name.padEnd(22)} → ${target.to.replace(os.homedir(), "~")}`);
    synced++;
  }

  console.log(`\n${synced} synced · ${skipped} skipped (apps not on disk)`);
  console.log(`\nAdd to each app's .env.local:   LOCAL_AI_URL=http://localhost:4100`);
}

main().catch((err) => {
  console.error("sync failed:", err);
  process.exit(1);
});
