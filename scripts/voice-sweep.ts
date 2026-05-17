/**
 * voice-sweep.ts
 *
 * Surfaces em-dashes and common AI-tell filler in authored source so brand
 * and product copy reads like a person wrote it. Authentifactor is an agency
 * platform — copy quality is the product.
 *
 * Adapted from agentic-saas-blueprint's voice-sweep.test.ts. There is no
 * vitest/jest runner in this repo, so this is a standalone `tsx` script that
 * fits the existing `scripts/` + `npm run` pattern.
 *
 * Usage:
 *   npm run lint:voice            report mode — lists findings, exits 0
 *   npm run lint:voice -- --strict  exits 1 if anything is found (for CI)
 *
 * Report mode is the default on purpose: existing brand/email copy contains
 * intentional em-dashes. The sweep flags; a human decides. It does NOT
 * auto-rewrite and must not break the build by default.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const ROOT = process.cwd();
const SCAN_DIRS = ['src/app', 'src/components', 'src/lib'];
const SCAN_EXTS = new Set(['.ts', '.tsx']);
const STRICT = process.argv.includes('--strict');

// U+2014 em-dash only. U+2500 box-drawing (─, used in our comment dividers)
// and U+2013 en-dash (number ranges) are deliberately NOT matched.
const EM_DASH = /—/;

// Curated AI-tell filler. Word-boundary, case-insensitive.
const FILLER = [
  'delve', 'leverage', 'seamless', 'seamlessly', 'robust', 'boasts',
  'in today\'s', 'it\'s worth noting', 'a testament to', 'navigating the',
  'unlock the power', 'in conclusion', 'furthermore', 'moreover',
  'elevate your', 'game-changer', 'cutting-edge', 'state-of-the-art',
];
const FILLER_RE = new RegExp(
  '\\b(' + FILLER.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b',
  'i',
);

function* walk(dir: string): Generator<string> {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const e of entries) {
    const full = join(dir, e);
    let s;
    try {
      s = statSync(full);
    } catch {
      continue;
    }
    if (s.isDirectory()) {
      if (e === 'node_modules' || e.startsWith('.') || e === 'dist') continue;
      yield* walk(full);
    } else if (SCAN_EXTS.has(extname(e))) {
      yield full;
    }
  }
}

type Finding = { file: string; line: number; kind: string; text: string };

const findings: Finding[] = [];

for (const dir of SCAN_DIRS) {
  for (const file of walk(join(ROOT, dir))) {
    const rel = relative(ROOT, file);
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((content, i) => {
      if (EM_DASH.test(content)) {
        findings.push({ file: rel, line: i + 1, kind: 'em-dash', text: content.trim().slice(0, 100) });
      }
      const f = content.match(FILLER_RE);
      if (f) {
        findings.push({ file: rel, line: i + 1, kind: `filler:${f[1].toLowerCase()}`, text: content.trim().slice(0, 100) });
      }
    });
  }
}

if (findings.length === 0) {
  console.log('voice-sweep: clean. No em-dashes or AI-tell filler in authored source.');
  process.exit(0);
}

const byKind = findings.reduce<Record<string, number>>((acc, f) => {
  const k = f.kind.split(':')[0];
  acc[k] = (acc[k] ?? 0) + 1;
  return acc;
}, {});

console.log(`voice-sweep: ${findings.length} finding(s) — ${JSON.stringify(byKind)}\n`);
for (const f of findings) {
  console.log(`  ${f.file}:${f.line}  [${f.kind}]  ${f.text}`);
}
console.log(
  `\n${findings.length} finding(s). ${STRICT
    ? 'Strict mode: failing.'
    : 'Report mode: not failing the build. Run with --strict in CI to enforce.'}`,
);

process.exit(STRICT ? 1 : 0);
