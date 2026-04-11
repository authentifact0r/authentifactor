# Sovereign Local AI

A fully offline, multi-agent AI platform for your personal fleet of apps. Runs
on your machine, knows your Obsidian vault, performs multi-step reasoning,
speaks to every app in your fleet through a single HTTP surface, and never
phones home.

```
┌─────────────────────────────────────────────────────────────────────┐
│                          your machine                              │
│                                                                     │
│   ┌────────────────┐     ┌──────────────────┐    ┌──────────────┐   │
│   │  Obsidian      │──▶│  local-ai-server  │──▶│   Ollama     │   │
│   │  vault (~335   │     │  :4100 (pm2)     │    │  llama3.1    │   │
│   │  notes)        │     │                  │    │  qwen2.5     │   │
│   │                │     │  · RAG           │    │  nomic-embed │   │
│   │  ~/.local-ai/  │     │  · ReAct agent   │    └──────────────┘   │
│   │    embeddings  │     │  · tool calling  │                       │
│   │    memory      │     │  · sessions      │                       │
│   └────────────────┘     │  · streaming     │                       │
│       ▲                  │  · vault watcher │                       │
│       │ chokidar         └─────────┬────────┘                       │
│       │ rebuild                    │                                │
│       │                            ▼                                │
│   ┌────────────────┐     ┌──────────────────┐                       │
│   │  file watcher  │     │   cloudflared    │                       │
│   │  (in-process)  │     │   (pm2)          │                       │
│   └────────────────┘     └─────────┬────────┘                       │
└────────────────────────────────────┼────────────────────────────────┘
                                     │
                            ai.olu.dev (public, TLS, bearer-token gated)
                                     │
         ┌───────────────────────────┼─────────────────────────────┐
         ▼                ▼          ▼          ▼          ▼        ▼
  Authentifactor    CitiesTroves  Careceutical  Bowsea   VARSITY  Agency
  (Next.js)         (Next + Nest) (Next.js)     (Web+BE) (Next)   (Next)
```

## Components

| Component       | Role                                             | Location                                        |
|-----------------|--------------------------------------------------|-------------------------------------------------|
| **Ollama**      | Local model runtime                              | `http://localhost:11434` · system service       |
| **Models**      | llama3.1:8b · qwen2.5:14b · nomic-embed-text     | `~/.ollama/models`                              |
| **Vault index** | Parsed notes, graph, chunks                      | `~/.local-ai/authentifactor/{notes,graph,chunks}.json` |
| **Embeddings**  | 3317 chunks × 768-dim vectors                    | `~/.local-ai/authentifactor/embeddings.sqlite`  |
| **Memory**      | Conversation sessions + messages                 | `~/.local-ai/authentifactor/memory.sqlite`      |
| **Server**      | Fastify on `:4100`                               | `server/local-ai-server.ts`                     |
| **Library**     | Loader, embedder, RAG, agents, tools, memory     | `src/lib/local-ai/**`                           |
| **Client**      | Zero-dep TS client (synced to 6 apps)            | `server/client/local-ai-client.ts`              |
| **Eval harness**| 10-question eval with LLM-as-judge scoring       | `scripts/eval-local-ai.ts` · `scripts/eval/`    |
| **PM2**         | Daemon manager (server + cloudflared)            | `ecosystem.config.cjs`                          |
| **Tunnel**      | Cloudflare Tunnel → `ai.olu.dev`                 | `~/.cloudflared/config.yml`                     |
| **Auth**        | Bearer token                                     | `~/.local-ai/authentifactor/token.txt`          |

## HTTP API

Base: `http://localhost:4100` (dev) · `https://ai.olu.dev` (prod)
Auth: `Authorization: Bearer <LOCAL_AI_TOKEN>` on every route except `/health`.

| Method  | Path              | Purpose                                                  |
|---------|-------------------|----------------------------------------------------------|
| GET     | `/health`         | Server + model info (public)                             |
| POST    | `/warmup`         | Pre-load models into VRAM                                |
| POST    | `/chat`           | Non-streaming smart LLM call                             |
| POST    | `/stream`         | SSE streaming tokens                                     |
| POST    | `/rag`            | Grounded Q&A (modes: answer, semantic, hybrid, reranked, context) |
| POST    | `/agent`          | ReAct autonomous loop                                    |
| GET     | `/graph`          | Whole graph summary · `?node=X&depth=N` for neighbors    |
| GET     | `/tools`          | Registered tool schemas                                  |
| POST    | `/tools`          | `{ tool, args }` direct invocation                       |
| GET     | `/sessions`       | List sessions · `?id=X` for history                      |
| POST    | `/sessions`       | Create a new session                                     |
| PATCH   | `/sessions`       | Rename                                                   |
| DELETE  | `/sessions/:id`   | Delete a session + all its messages                      |

## Client

Any app in your fleet gets access via the synced zero-dep client:

```ts
import { LocalAI } from "@/lib/local-ai-client";

const ai = new LocalAI();                            // reads LOCAL_AI_URL / LOCAL_AI_TOKEN
const { answer, citations } = await ai.rag("what are our tenants?");
```

The canonical file lives at `server/client/local-ai-client.ts` and is synced
to every other app via `npm run ai:client:sync`.

## npm scripts

| Script                    | What it does                                          |
|---------------------------|-------------------------------------------------------|
| `npm run ai:index`        | Build / refresh the vault index (incremental)         |
| `npm run ai:test`         | 10-stage smoke test (warmup → streaming → watcher)    |
| `npm run ai:watch`        | Foreground vault watcher (standalone, non-pm2)        |
| `npm run ai:serve`        | Foreground server (non-pm2)                           |
| `npm run ai:eval`         | Run 10-question eval, save report                     |
| `npm run ai:eval -- --compare` | Same, but diff against previous run              |
| `npm run ai:client:sync`  | Copy client file to every sibling app                 |

## Daemon management

```bash
pm2 status                           # what's running
pm2 logs local-ai-server             # tail server
pm2 logs cloudflared | grep try      # grab current tunnel URL (quick mode)
pm2 restart local-ai-server          # bounce the brain
pm2 restart cloudflared              # bounce the tunnel
pm2 save                             # persist current process list
```

To survive reboots, run once:
```bash
sudo env PATH=$PATH:/usr/local/bin \
  /Users/olu/.npm-global/lib/node_modules/pm2/bin/pm2 \
  startup launchd -u olu --hp /Users/olu
```

## Environment variables

Set on the server (via `ecosystem.config.cjs` or shell before `pm2 start`):

| Var                       | Default               | Purpose                                    |
|---------------------------|-----------------------|--------------------------------------------|
| `LOCAL_AI_PORT`           | `4100`                | Fastify port                               |
| `LOCAL_AI_HOST`           | `127.0.0.1`           | Bind address (loopback-only by default)    |
| `LOCAL_AI_TOKEN`          | —                     | Bearer token (load from `token.txt`)       |
| `LOCAL_AI_WATCH`          | `true`                | Run vault watcher in-process               |
| `OBSIDIAN_VAULT_PATH`     | `~/Documents/ObsidianVault` | Vault to index                       |
| `OLLAMA_URL`              | `http://localhost:11434` | Ollama endpoint                         |
| `OLLAMA_FAST_MODEL`       | `llama3.1:8b`         | Used for simple complexity                 |
| `OLLAMA_SMART_MODEL`      | `qwen2.5:14b`         | Used for medium/high complexity            |
| `OLLAMA_EMBED_MODEL`      | `nomic-embed-text`    | Embedding model                            |
| `OLLAMA_KEEP_ALIVE`       | `-1` (forever)        | VRAM residency                             |
| `EMBED_CONCURRENCY`       | `6`                   | Parallel embedding workers                 |
| `LOCAL_AI_RERANK`         | `true`                | LLM cross-encoder rerank on RAG            |
| `OFFLINE_MODE`            | `true`                | Never fall back to Claude                  |

Set on every consuming app:

```
LOCAL_AI_URL=https://ai.olu.dev
LOCAL_AI_TOKEN=<from ~/.local-ai/authentifactor/token.txt>
```

## Eval baseline

As of the last recorded run: **65% composite** across 10 canonical questions.
Any prompt tweak, model swap, or chunker change can be measured against this
with `npm run ai:eval -- --compare`.

Nightly cron (installed at `scripts/com.olu.local-ai-eval.plist`) runs the
eval at 03:15 and writes a markdown note to
`~/Documents/ObsidianVault/00_System/local-ai-eval/<date>.md` so the result
shows up in Obsidian every morning.

## Rebuilding from scratch

If you nuke `~/.local-ai/` and want to rebuild:
```bash
./server/bootstrap.sh      # see next section
```

## Key design decisions

- **Sovereign by default** — `OFFLINE_MODE=true` hard-default, Claude only on explicit opt-in
- **Loopback-only binding** — server only listens on `127.0.0.1`, public exposure is solely through the Cloudflare Tunnel
- **Bearer-token auth** enforced at Fastify hook level, belt-and-braces beside Cloudflare Access
- **Single source of truth for the client** — canonical file in `server/client/`, synced via script
- **Content-hash incremental indexing** — only changed chunks hit Ollama on rebuild
- **Model residency (`keep_alive: -1`)** — models stay hot in VRAM so every request is warm
- **LRU query embedding cache** — repeated questions skip Ollama entirely
- **Rerank-blended hybrid search** — `0.7 * LLM judge + 0.3 * cosine` so aggressive judges can't wipe the candidate set
- **Title-overlap boost** — chunks whose `noteId` contains a query term get up to +50% score

## Troubleshooting

| Symptom                                          | Fix                                                    |
|--------------------------------------------------|--------------------------------------------------------|
| Server boots but hangs on first request          | `ollama ps` — model is loading; wait or warm with `curl localhost:4100/warmup` |
| Search returns chunks from the wrong project     | Title-overlap boost should catch it; widen the stopwords list in `src/lib/local-ai/rag.ts` |
| Eval composite drops after a change              | `npm run ai:eval -- --compare` to see exactly which question regressed |
| Cloudflare tunnel gives a new URL every restart  | You're in quick-tunnel mode — graduate to a named tunnel (see `TUNNEL.md`) |
| `/tools` returns `{"error":"unauthorized"}`      | Missing or wrong `Authorization: Bearer <token>` header |
