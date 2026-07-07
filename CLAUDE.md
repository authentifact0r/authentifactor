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
- `npm run typecheck` — clean as of 2026-07-06 (40 errors paid down) and CI-gated. Notable patterns:
  tenant-scoped creates use the `TENANT_ID` sentinel from `@/lib/db` (real value injected by the
  tenantDb extension); Stripe API-version drift is absorbed by `src/lib/stripe-compat.ts` — use its
  helpers, never read `subscription.current_period_end` / `invoice.subscription` directly.

## Deploy (ARMED 2026-07-07 — every push to main deploys)
- Cloud Run service `authentifactor` (europe-west1, hybrid-saas-platform), authentifactor.com mapped.
- Push to main → CI (typecheck+tests) + deploy.yml → Cloud Build → Cloud Run. WIF via the shared
  `github-pool/github-provider` (owner-wide condition — also serves careceutical/clarityconduct/linkolu;
  do NOT narrow it without listing all four repos).
- `.env.production` is UNTRACKED — CI builds get NEXT_PUBLIC values from cloudbuild.yaml
  substitutions → Docker build args. Add new NEXT_PUBLIC vars in BOTH places or they'll be
  undefined in production bundles.
- JWT secret validation is lazy (first use) — a module-scope env check will break the Docker build
  (`next build` collects page data with production NODE_ENV and no runtime secrets).

## DNS / subdomains (2026-07-07)
- The wildcard `*.authentifactor.com` → Vercel A record was DELETED (dead + subdomain-takeover risk).
  Tenant subdomains (middleware supports `tom.authentifactor.com` → tenant slug) are NXDOMAIN until
  explicitly activated: per-subdomain Cloud Run domain mapping + Route53 CNAME to ghs.googlehosted.com.
  Never restore a wildcard pointing at third-party infra.
- `trq*._domainkey` CNAMEs → Shopify DKIM remain (email-scoped; only claimable if the Shopify store
  closes — review if Shopify is ever retired).

## Tenant invoicing (2026-07-07)
`/admin/invoices` (sidebar → Invoices): admin creates + sends Stripe invoices to clients via
POST/GET `/api/admin/invoices`. Uses the tenant's own `Tenant.stripeSecretKey` when set, else the
platform Stripe account scoped by `metadata.tenantId`. Stripe currencies only (gbp/usd/eur) —
NGN/Paystack invoicing deliberately out of scope (Paystack has no equivalent hosted invoice flow
wired here). The billing webhook safely ignores these one-off invoices (no subscription id).
