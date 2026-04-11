#!/usr/bin/env bash
# Nightly eval — runs the local AI eval harness against the running
# :4100 server, compares to the previous run, and writes a summary
# markdown note to the vault so it shows up in Obsidian automatically.
#
# Scheduled via launchd (macOS). See scripts/com.olu.local-ai-eval.plist.

set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
VAULT="${OBSIDIAN_VAULT_PATH:-$HOME/Documents/ObsidianVault}"
NOTE_DIR="$VAULT/00_System/local-ai-eval"
mkdir -p "$NOTE_DIR"

TS="$(date +%Y-%m-%d)"
NOTE="$NOTE_DIR/$TS.md"

cd "$REPO"

# Ensure tsx is available in PATH
export PATH="$HOME/.npm-global/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"

{
  echo "---"
  echo "title: Local AI eval — $TS"
  echo "tags: [local-ai, eval]"
  echo "date: $TS"
  echo "---"
  echo
  echo "# Local AI eval — $TS"
  echo
  echo '```'
  npm run ai:eval -- --compare 2>&1 || echo "eval failed with exit $?"
  echo '```'
} > "$NOTE"

echo "nightly eval written to $NOTE"
