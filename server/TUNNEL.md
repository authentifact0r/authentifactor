# Cloudflare Tunnel — ai.olu.dev

Stable public hostname for the sovereign local AI server. Zero DNS
migration needed — `olu.dev` stays on Vercel, we add a single CNAME to
Cloudflare's tunnel address.

## Architecture

```
  phone / laptop / vercel app
            │
            ▼
   https://ai.olu.dev              (TLS terminates at Cloudflare edge)
            │
            ▼
   Cloudflare edge → tunnel
            │
            ▼
  cfargotunnel.com endpoint
            │
            ▼ (cloudflared daemon, outbound only)
            │
     127.0.0.1:4100                (loopback-only — unreachable without tunnel)
            │
            ▼
   local-ai-server (pm2)
            │
            ▼
    llama3.1 / qwen2.5 / nomic
            │
            ▼
  Obsidian vault + SQLite indexes
```

**Key property**: your Mac never opens a port to the internet. cloudflared
makes an **outbound** QUIC connection to Cloudflare's edge and keeps it
open. Inbound traffic is pulled through that connection. No firewall
changes, no port forwarding, no public IP needed.

## Initial setup (one-time)

```bash
# 1. Install the CLI
brew install cloudflared

# 2. Authenticate (opens browser, interactive)
cloudflared tunnel login
# → writes ~/.cloudflared/cert.pem

# 3. Create the named tunnel
cloudflared tunnel create local-ai
# → prints the tunnel UUID and creates ~/.cloudflared/<UUID>.json

# 4. Write ~/.cloudflared/config.yml (see below)

# 5. Start the tunnel under pm2
pm2 restart cloudflared --update-env
pm2 save
```

## config.yml

```yaml
tunnel: local-ai
credentials-file: /Users/olu/.cloudflared/<UUID>.json

ingress:
  - hostname: ai.olu.dev
    service: http://localhost:4100
    originRequest:
      connectTimeout: 30s
      noTLSVerify: true
  - service: http_status:404
```

## DNS setup (one-time, at Vercel)

Because `olu.dev` lives on Vercel DNS (not Cloudflare), you add the CNAME
at Vercel instead of using `cloudflared tunnel route dns`.

1. Go to [Vercel dashboard](https://vercel.com/dashboard) → your `olu.dev`
   project → **Settings → Domains** (or **Domains** in the main nav)
2. Click **Add** on the DNS records section
3. Enter:
   - **Type**: `CNAME`
   - **Name**: `ai`
   - **Value**: `<UUID>.cfargotunnel.com` (the UUID from step 3 above)
   - **TTL**: 60 (or default)
4. Save

Propagation is typically **under a minute** on Vercel's DNS. Verify with:
```bash
dig +short CNAME ai.olu.dev
curl https://ai.olu.dev/health
```

## First call from the public internet

```bash
TOKEN=$(cat ~/.local-ai/authentifactor/token.txt)
curl -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -X POST https://ai.olu.dev/rag \
     -d '{"query":"what are my active projects?"}'
```

## Updating every consuming app

After the tunnel is live, every sibling app needs:
```
LOCAL_AI_URL=https://ai.olu.dev
LOCAL_AI_TOKEN=<from ~/.local-ai/authentifactor/token.txt>
```

Where to set it (per app):

| App              | File                                             |
|------------------|--------------------------------------------------|
| Authentifactor   | `.env.local`                                     |
| CitiesTroves web | `apps/web/.env.local`                            |
| CitiesTroves api | `apps/api/.env`                                  |
| Careceutical     | `.env.local`                                     |
| Bowsea frontend  | `frontend/.env.local`                            |
| Bowsea backend   | `backend/.env` (or Cloud Run env vars)           |

The client file (synced to every app) already reads these env vars by
default — no code change required in any app.

## Upgrading to Cloudflare Access (SSO gate — recommended)

Adds Google/GitHub/Apple SSO in front of the tunnel, on top of the bearer
token. Your internal apps still call via service tokens that Access issues.

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Zero Trust**
2. **Access → Applications → Add an application**
3. **Self-hosted**
4. Application domain: `ai.olu.dev`
5. **Policies → Add a policy**
6. Name: `Owner only`
7. Action: `Allow`
8. Include: `Emails` → your email
9. Save

Now every browser request to `ai.olu.dev` hits an SSO gate. For
server-to-server calls from your apps, create **Service Tokens** under
**Zero Trust → Access → Service Auth** and add two extra headers to
every client request:
```
CF-Access-Client-Id: <id>.access
CF-Access-Client-Secret: <secret>
```

(The `LocalAI` client class accepts a `fetch` override — you can wrap the
default fetch to inject these headers app-wide.)

## Lifecycle

| Operation                    | Command                                          |
|------------------------------|--------------------------------------------------|
| Check tunnel health          | `cloudflared tunnel info local-ai`               |
| List all tunnels             | `cloudflared tunnel list`                        |
| Tail tunnel logs             | `pm2 logs cloudflared`                           |
| Restart tunnel               | `pm2 restart cloudflared`                        |
| Delete tunnel                | `cloudflared tunnel delete local-ai`             |
| Rotate credentials           | `cloudflared tunnel create local-ai-v2` + swap config + delete old |

## Failure modes

| Symptom                               | Cause                                  | Fix                                             |
|---------------------------------------|----------------------------------------|-------------------------------------------------|
| `curl ai.olu.dev/health` → DNS error  | CNAME not propagated yet               | Wait 60s, or flush dig cache                    |
| `curl ai.olu.dev/health` → 1033       | Tunnel not running                     | `pm2 restart cloudflared`                       |
| `curl ai.olu.dev/health` → 502        | Server not on localhost:4100           | `pm2 restart local-ai-server`                   |
| All requests return 401               | Missing/wrong bearer token             | Check `~/.local-ai/authentifactor/token.txt`    |
| Requests are slow                     | First request loading a cold model     | `curl ai.olu.dev/warmup` once                   |
