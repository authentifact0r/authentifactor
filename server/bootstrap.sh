#!/usr/bin/env bash
#
# Sovereign Local AI — fresh-machine bootstrap.
#
# Everything needed to stand the whole stack up on a new Mac:
#   brew deps → ollama models → npm deps → index the vault →
#   start the server → start the tunnel → run the eval.
#
# Idempotent: re-running is safe, every step skips what's already done.
#
#   ./server/bootstrap.sh
#
# After this script finishes you still have to do exactly two things
# yourself (security-critical, documented in the final output):
#   1. cloudflared tunnel login  (browser, once)
#   2. sudo pm2 startup launchd  (reboot persistence, once)

set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO"

GREEN=$'\e[32m'; YELLOW=$'\e[33m'; RED=$'\e[31m'; DIM=$'\e[2m'; RESET=$'\e[0m'
say() { echo "${GREEN}▸${RESET} $*"; }
warn() { echo "${YELLOW}!${RESET} $*"; }
fail() { echo "${RED}✗${RESET} $*"; exit 1; }

# ─── 1. Homebrew deps ──────────────────────────────────────
say "checking brew deps"
for pkg in ollama cloudflared; do
  if brew list --formula "$pkg" >/dev/null 2>&1; then
    echo "  ${DIM}·${RESET} $pkg already installed"
  else
    say "  installing $pkg"
    brew install "$pkg"
  fi
done

# ─── 2. Ollama daemon + models ─────────────────────────────
say "checking ollama"
if ! pgrep -f "ollama serve" >/dev/null 2>&1; then
  warn "  ollama not running — starting"
  nohup /opt/homebrew/bin/ollama serve >/tmp/ollama.log 2>&1 &
  sleep 2
fi

for model in llama3.1:8b qwen2.5:14b nomic-embed-text; do
  if ollama list 2>/dev/null | awk 'NR>1{print $1}' | grep -qx "$model"; then
    echo "  ${DIM}·${RESET} $model already pulled"
  else
    say "  pulling $model (this can take a while)"
    ollama pull "$model"
  fi
done

# ─── 3. Node deps ──────────────────────────────────────────
say "checking node deps"
if [ ! -d node_modules ]; then
  npm install
else
  echo "  ${DIM}·${RESET} node_modules present"
fi

# Ensure pm2 is available globally
if ! command -v pm2 >/dev/null 2>&1; then
  if [ -x "$HOME/.npm-global/bin/pm2" ]; then
    export PATH="$HOME/.npm-global/bin:$PATH"
  else
    say "  installing pm2 globally"
    npm install -g pm2
    export PATH="$HOME/.npm-global/bin:$PATH"
  fi
fi

# ─── 4. Vault index ────────────────────────────────────────
say "building vault index"
DATA_DIR="${LOCAL_AI_DATA_DIR:-$HOME/.local-ai/authentifactor}"
mkdir -p "$DATA_DIR"
if [ -f "$DATA_DIR/embeddings.sqlite" ] && [ -s "$DATA_DIR/embeddings.sqlite" ]; then
  echo "  ${DIM}·${RESET} embeddings.sqlite already present — running incremental refresh"
fi
npm run ai:index

# ─── 5. Bearer token ───────────────────────────────────────
TOKEN_FILE="$DATA_DIR/token.txt"
if [ ! -f "$TOKEN_FILE" ]; then
  say "generating bearer token"
  openssl rand -hex 32 > "$TOKEN_FILE"
  chmod 600 "$TOKEN_FILE"
fi
TOKEN=$(cat "$TOKEN_FILE")

# ─── 6. Start the daemons ──────────────────────────────────
say "starting daemons under pm2"
LOCAL_AI_TOKEN="$TOKEN" pm2 start ecosystem.config.cjs --update-env >/dev/null 2>&1 || \
  LOCAL_AI_TOKEN="$TOKEN" pm2 restart ecosystem.config.cjs --update-env
pm2 save >/dev/null 2>&1 || true

sleep 3

# ─── 7. Smoke test ─────────────────────────────────────────
say "smoke-testing local-ai-server"
if curl -fsS http://localhost:4100/health >/dev/null; then
  echo "  ${DIM}·${RESET} health ✓"
else
  fail "server didn't respond on :4100 — check: pm2 logs local-ai-server"
fi

if curl -fsS -H "Authorization: Bearer $TOKEN" http://localhost:4100/tools >/dev/null; then
  echo "  ${DIM}·${RESET} auth ✓"
else
  fail "bearer auth failed"
fi

# ─── 8. Sync clients ───────────────────────────────────────
say "syncing client to sibling apps"
npm run ai:client:sync 2>&1 | sed 's/^/  /'

# ─── 9. Final report ───────────────────────────────────────
cat <<EOF

${GREEN}════════════════════════════════════════════════════════════${RESET}
${GREEN} sovereign local AI is live ${RESET}
${GREEN}════════════════════════════════════════════════════════════${RESET}

  ${DIM}local  ${RESET} http://localhost:4100
  ${DIM}token  ${RESET} $(echo $TOKEN | cut -c1-16)…  (full token: $TOKEN_FILE)

${YELLOW}two manual steps still needed:${RESET}

  ${DIM}1. cloudflare tunnel (for ai.olu.dev)${RESET}
     ${DIM}In your terminal:${RESET}
     cloudflared tunnel login
     cloudflared tunnel create local-ai
     ${DIM}then see server/TUNNEL.md for the config + Vercel CNAME step${RESET}

  ${DIM}2. pm2 reboot persistence${RESET}
     sudo env PATH=\$PATH:/usr/local/bin \\
       \$HOME/.npm-global/lib/node_modules/pm2/bin/pm2 \\
       startup launchd -u \$USER --hp \$HOME

${DIM}handy commands:${RESET}
  pm2 status
  pm2 logs local-ai-server
  npm run ai:test
  npm run ai:eval -- --compare

EOF
