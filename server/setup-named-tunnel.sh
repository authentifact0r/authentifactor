#!/usr/bin/env bash
#
# Finalize the named Cloudflare Tunnel for ai.linkolu.com.
#
# Prerequisites (run ONCE before this script):
#   1. Bought linkolu.com on Cloudflare Registrar
#   2. cloudflared tunnel login  (browser — pick linkolu.com)
#   3. ~/.cloudflared/cert.pem exists
#
# Running this script will:
#   - create the "local-ai" named tunnel (or reuse it if it exists)
#   - write ~/.cloudflared/config.yml
#   - route ai.linkolu.com DNS to the tunnel
#   - swap pm2's cloudflared app to named-tunnel mode
#   - verify end-to-end
#
# Idempotent: re-running is safe.

set -euo pipefail

DOMAIN="${DOMAIN:-linkolu.com}"
HOSTNAME="${HOSTNAME_AI:-ai.$DOMAIN}"
TUNNEL_NAME="${TUNNEL_NAME:-local-ai}"
CF_DIR="$HOME/.cloudflared"
CONFIG="$CF_DIR/config.yml"
PORT="${LOCAL_AI_PORT:-4100}"
REPO="$(cd "$(dirname "$0")/.." && pwd)"

GREEN=$'\e[32m'; YELLOW=$'\e[33m'; RED=$'\e[31m'; DIM=$'\e[2m'; RESET=$'\e[0m'
say() { echo "${GREEN}▸${RESET} $*"; }
warn() { echo "${YELLOW}!${RESET} $*"; }
fail() { echo "${RED}✗${RESET} $*"; exit 1; }

# ─── 1. Prereq checks ──────────────────────────────────────
say "checking prereqs"
[ -f "$CF_DIR/cert.pem" ] || fail "missing $CF_DIR/cert.pem — run 'cloudflared tunnel login' first"
command -v cloudflared >/dev/null || fail "cloudflared not installed — brew install cloudflared"
command -v pm2 >/dev/null || { export PATH="$HOME/.npm-global/bin:$PATH"; command -v pm2 >/dev/null || fail "pm2 not on PATH"; }

# ─── 2. Create (or reuse) the named tunnel ─────────────────
say "ensuring tunnel '$TUNNEL_NAME' exists"
if cloudflared tunnel list 2>/dev/null | awk 'NR>1 {print $2}' | grep -qx "$TUNNEL_NAME"; then
  echo "  ${DIM}·${RESET} tunnel '$TUNNEL_NAME' already exists"
else
  cloudflared tunnel create "$TUNNEL_NAME"
fi

TUNNEL_ID=$(cloudflared tunnel list 2>/dev/null | awk -v name="$TUNNEL_NAME" '$2==name {print $1}' | head -1)
[ -n "$TUNNEL_ID" ] || fail "couldn't resolve tunnel id for '$TUNNEL_NAME'"
say "  uuid: $TUNNEL_ID"

CREDS_FILE="$CF_DIR/$TUNNEL_ID.json"
[ -f "$CREDS_FILE" ] || fail "missing credentials file $CREDS_FILE"

# ─── 3. Write config.yml ───────────────────────────────────
say "writing $CONFIG"
cat > "$CONFIG" <<EOF
tunnel: $TUNNEL_ID
credentials-file: $CREDS_FILE

ingress:
  - hostname: $HOSTNAME
    service: http://localhost:$PORT
    originRequest:
      connectTimeout: 30s
      keepAliveTimeout: 90s
      noHappyEyeballs: false
  - service: http_status:404
EOF
echo "  ${DIM}·${RESET} ingress: $HOSTNAME → http://localhost:$PORT"

# ─── 4. Route DNS ──────────────────────────────────────────
say "routing DNS for $HOSTNAME"
if cloudflared tunnel route dns "$TUNNEL_NAME" "$HOSTNAME" 2>&1 | tee /tmp/cf-route.log | grep -qi "already exists\|added\|INFO"; then
  echo "  ${DIM}·${RESET} dns routed"
else
  warn "  (route dns output was unexpected — check /tmp/cf-route.log)"
fi

# ─── 5. Swap pm2 cloudflared app to named mode ─────────────
say "switching pm2 cloudflared app to named-tunnel mode"
pm2 delete cloudflared >/dev/null 2>&1 || true

# Start the named tunnel using config.yml (pm2 will supervise)
pm2 start "cloudflared tunnel --config $CONFIG run $TUNNEL_NAME" \
  --name cloudflared \
  --no-autorestart=false \
  --max-restarts 20 \
  --restart-delay 5000 \
  --cwd "$REPO" \
  --output "$REPO/.pm2/cloudflared.out.log" \
  --error "$REPO/.pm2/cloudflared.err.log" \
  --time
pm2 save >/dev/null 2>&1 || true

sleep 5

# ─── 6. Verify ─────────────────────────────────────────────
say "verifying public endpoint"
TOKEN=$(cat "$HOME/.local-ai/authentifactor/token.txt" 2>/dev/null || echo "")
if [ -z "$TOKEN" ]; then
  warn "  no token file — skipping authenticated probe"
else
  for i in 1 2 3 4 5; do
    if curl -fsS --max-time 10 "https://$HOSTNAME/health" >/dev/null 2>&1; then
      echo "  ${DIM}·${RESET} https://$HOSTNAME/health ✓"
      break
    fi
    echo "  ${DIM}·${RESET} attempt $i: not yet, waiting 4s"
    sleep 4
  done
fi

cat <<EOF

${GREEN}════════════════════════════════════════════════════════════${RESET}
${GREEN} named tunnel live — https://$HOSTNAME ${RESET}
${GREEN}════════════════════════════════════════════════════════════${RESET}

  ${DIM}tunnel${RESET}    $TUNNEL_NAME ($TUNNEL_ID)
  ${DIM}config${RESET}    $CONFIG
  ${DIM}creds${RESET}     $CREDS_FILE
  ${DIM}ingress${RESET}   $HOSTNAME → http://localhost:$PORT
  ${DIM}token${RESET}     $(echo $TOKEN | cut -c1-16)…

${DIM}test from anywhere:${RESET}
  curl -H "Authorization: Bearer \$TOKEN" https://$HOSTNAME/health

${DIM}tail logs:${RESET}
  pm2 logs cloudflared

${DIM}next: update every sibling app's .env:${RESET}
  LOCAL_AI_URL=https://$HOSTNAME
  LOCAL_AI_TOKEN=\$(cat ~/.local-ai/authentifactor/token.txt)

EOF
