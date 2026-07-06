# CLAUDE.md — Authentifactor (multi-tenant commerce)

Full intelligence: `~/.claude/fable-intelligence/` (PORTFOLIO.md § Authentifactor).

## What this is
Multi-tenant commerce platform powering Taste of Motherland, Toks Mimi, Styled by Mariam.
Next.js 16 + Prisma + TypeScript 6. Dual payments: Paystack + Stripe (separate webhook secrets).
Undocumented-but-real features: AI pipeline (`npm run ai:*` scripts), geolocation delivery
(LOCAL_HUB_LAT/LNG/RADIUS). `~/style-by-maryam` is a separate Astro tenant frontend.

## Hard rules
- **Multi-tenant: every query must filter by tenant/owner.** A cross-tenant IDOR has occurred in a
  sibling repo — treat tenant scoping as a review gate on every data access.
- Next.js 16 diverges from training data — check `node_modules/next/dist/docs/` before writing Next code.
- Webhooks (both processors): signature-verified + idempotent + fail-closed, no exceptions.

## Tests & CI (added 2026-07-06)
- `npm test` — vitest suites for password-policy, currency conversion, Paystack webhook signature
  verification (20 tests). Keep green; GH Actions CI enforces on main.
- `npm run typecheck` — currently FAILS with 40 pre-existing TS errors in 21 files. Not gated in CI
  yet; pay this debt down opportunistically, then add typecheck to ci.yml.

## Known gaps (don't inherit them)
- Deploys are manual (Dockerfile only) — no deploy automation.
- Security fixes from the 2026-05 campaign are committed — verify the DEPLOYED revision before
  assuming they're live.
