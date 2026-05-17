# CLAUDE.md

Authentifactor — multi-tenant commerce & web platform that powers branded
client storefronts. Not niche-specific: food retail, fashion, services, any
vertical. One codebase, tenant-scoped data, custom domains, per-tenant branding.

Production URL: https://authentifactor.com
Branch in active development: main
Canonical contact email: cs@authentifactor.com

> Adapted from the agentic-saas-blueprint pattern, rewritten for this repo's
> real stack and Olu's infrastructure doctrine. Global rules in
> `~/.claude/CLAUDE.md` still apply and take precedence where they overlap.

## Stack (locked — verify before assuming otherwise)

Next.js 16 App Router · React 19 · TypeScript strict · Tailwind **v4**
(`@theme` in `src/app/globals.css`, no `tailwind.config.*` file) · Prisma 6 +
PostgreSQL · custom JWT/jose auth (`src/lib/auth.ts`) · Paystack + Stripe
(`src/lib/paystack.ts`, `src/lib/stripe.ts`) · Resend (`src/lib/email.ts`) ·
Fastify side-server for local AI · `tsx` scripts · deployed on **Google Cloud
Run** in `hybrid-saas-platform` (NOT Vercel — that migration is done).

Path alias: `@/*` → `./src/*`.

## Non-negotiables

1. **Tailwind v4, not v3.** Tokens live in `@theme` and scoped `[data-theme]`
   blocks in `src/app/globals.css`. There is no `tailwind.config.ts` and you
   must not add one. Never hardcode hex in components — use the existing
   token utilities (`text-primary`, the `cin-*` vars under
   `data-theme="cinematic"`, etc.).
2. **Surface-scoped theming is intentional.** `data-theme="cinematic"` applies
   only to platform pages. Admin, superadmin, and tenant storefronts have
   their own surfaces. Don't bleed one surface's tokens into another.
3. **Multi-tenant by default.** Every query that touches tenant data is
   scoped through `src/lib/tenant.ts`. A query without a tenant filter is a
   bug and a data-leak. Never return cross-tenant rows.
4. **Mobile-first.** Test 375 / 768 / 1280px. Storefronts are mostly viewed
   on phones.
5. **Cards with a destination are clickable `<Link>` wrappers** with a hover
   lift, not a button buried inside a static div.
6. **PII / payment data scrubbed server-side before persistence.** Card data
   never touches our DB — it lives with Stripe/Paystack. Don't log full
   tokens, keys, or customer payment details.
7. **External services soft-fail.** `src/lib/email.ts` is the reference: the
   client is lazily constructed, returns null when the key is absent, callers
   `console.warn` and no-op. Apply the same shape to any new third-party SDK
   (Stripe, Paystack, blob storage) so the app builds and runs with zero
   third-party keys in dev/CI.
8. **No em-dashes or AI-tell filler in source you author.** Run
   `npm run lint:voice` before committing copy-heavy work. Brand/email copy
   may keep an intentional em-dash; flag-and-decide, don't blanket-strip.
9. **Admin/superadmin views show real data** with stat tiles, search,
   filters, pagination — reuse `src/components/superadmin/dashboard-cards.tsx`
   and `src/components/ui/sales-dashboard.tsx`, don't reinvent or drop bare
   HTML tables.

## Workflow

1. State a brief plan with verification steps before mid+ tasks.
2. TDD where a runner exists. There is **no vitest/jest** in this repo yet —
   don't bolt one on for a single test. Validation gates here are:
   `npx tsc --noEmit` → `npm run build` (`prisma generate && next build`) →
   targeted `tsx` script if logic-heavy.
3. Commit and push to `main` immediately on completion (Olu's standing rule).
   Cloud Build / Cloud Run deploy follows the push — there is no Vercel
   webhook to babysit.
4. Verify the deploy: hit the production URL or the relevant
   `/api/health`-style route and confirm 200 before declaring done.

## Anti-patterns

- Adding a `tailwind.config.ts` (this is Tailwind v4 — it won't be read).
- Porting "blueprint" theme tokens / ThemeProvider over the existing
  `@theme` + `data-theme` system — it's a regression, not an upgrade.
- Any tenant query without a tenant scope.
- "Hotfix" comments that disable a feature instead of fixing root cause.
- Single-theme UI with a plan to "add the other surface later".
- Plans with `TODO` / "fill in details" placeholders.
- Leaving work local-only after it's done.
- Assuming Vercel. This runs on Cloud Run.

## Behavior

Default to action. Check memory, codebase, and the Obsidian vault before
asking; ask one question only when ambiguity actually blocks progress. When
asked to plan, deliver complete file paths and real code. When asked to
build, write the code and the validation. When asked to ship, push AND verify
the deploy is live.

Source pattern: https://github.com/NewMatrixCap/agentic-saas-blueprint
