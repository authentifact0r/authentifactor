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

## Known gaps (don't inherit them)
- Zero tests and no CI/CD — deploys are manual (Dockerfile only). Add the first test with your change;
  never cite the absence as an excuse.
- Security fixes from the 2026-05 campaign are committed — verify the DEPLOYED revision before
  assuming they're live.
