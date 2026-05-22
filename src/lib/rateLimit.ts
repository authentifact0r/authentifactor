/**
 * Simple in-memory rate limiter.
 * Suitable for Vercel serverless (per-instance only — not globally shared).
 * For production at scale, replace with Vercel KV or Redis.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean expired entries every 60s
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 60_000);

export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: maxRequests - entry.count };
}

/**
 * 2026-05-22 hardening (audit MEDIUM — no rate limiting on login):
 * `/api/auth/login` and the `loginAction` server action had no brute-force
 * / credential-stuffing protection. This applies a layered limit:
 *   - per-IP:    20 attempts / 15 min
 *   - per-email: 10 attempts / 15 min  (slows targeted attacks on one account)
 *
 * STOPGAP: the underlying `store` is an in-process `Map`. On Vercel each
 * serverless instance has its own copy and cold starts reset it, so this
 * is a best-effort speed bump, NOT a hard guarantee. The durable fix is a
 * shared store (Vercel KV / Upstash Redis) — tracked as a follow-up.
 */
export function checkLoginRateLimit(
  ip: string,
  email: string
): { allowed: boolean } {
  const ipCheck = rateLimit(`login:ip:${ip}`, 20, 15 * 60_000);
  const emailKey = email.trim().toLowerCase();
  const emailCheck = emailKey
    ? rateLimit(`login:email:${emailKey}`, 10, 15 * 60_000)
    : { success: true, remaining: 0 };
  return { allowed: ipCheck.success && emailCheck.success };
}
