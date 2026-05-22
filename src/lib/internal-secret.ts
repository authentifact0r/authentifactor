import crypto from "crypto";

/**
 * 2026-05-20 hardening (audit HIGH — unauthenticated internal endpoints).
 *
 * Constant-time comparison of a request-supplied secret against an
 * expected env value. Used to gate internal-only endpoints (deploy-hook
 * trigger, cron jobs) that must not be callable by anonymous internet
 * users.
 *
 * `timingSafeEqual` requires equal-length buffers, so both sides are
 * hashed to a fixed-width digest first — this also avoids leaking the
 * expected secret's length.
 */
export function timingSafeEqualStr(a: string, b: string): boolean {
  const ah = crypto.createHash("sha256").update(a).digest();
  const bh = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ah, bh);
}

export class SecretMisconfiguredError extends Error {}

/**
 * Verifies that `provided` matches the env var `envName`.
 *
 * Fails CLOSED on misconfiguration: if the env var is unset/empty this
 * throws `SecretMisconfiguredError` (caller should return 500) rather
 * than silently allowing the request — the previous "fail open if the
 * secret is unset" behaviour was the audited vulnerability.
 *
 * Returns `false` for a present-but-wrong secret (caller returns 401).
 */
export function verifyInternalSecret(
  envName: string,
  provided: string | null | undefined,
): boolean {
  const expected = process.env[envName] || "";
  if (!expected) {
    throw new SecretMisconfiguredError(
      `${envName} is not configured — refusing to authorize`,
    );
  }
  if (!provided) return false;
  return timingSafeEqualStr(provided, expected);
}
