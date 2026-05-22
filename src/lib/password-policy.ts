import { z } from "zod";

/**
 * Shared password policy.
 *
 * 2026-05-22 hardening (audit MEDIUM — weak password policy):
 * registration / signup previously accepted `z.string().min(8)` with no
 * complexity requirement and no upper bound. bcrypt silently truncates
 * input at 72 bytes, so a "password" longer than that had its tail
 * ignored — a usability + security footgun.
 *
 * Policy:
 *   - 12 char minimum (NIST SP 800-63B leans on length over complexity,
 *     but a light complexity heuristic raises the floor against the
 *     weakest 12-char choices).
 *   - 72 byte maximum (bcrypt's hard limit — reject rather than truncate).
 *   - At least 3 of 4 character classes (lower / upper / digit / symbol).
 *
 * NOTE: a Have I Been Pwned k-anonymity breach check is intentionally
 * NOT wired in here — it adds an outbound network call on every signup
 * and a failure mode to reason about. Tracked as a follow-up.
 */

export const PASSWORD_MIN = 12;
export const PASSWORD_MAX_BYTES = 72;

function classCount(value: string): number {
  let n = 0;
  if (/[a-z]/.test(value)) n++;
  if (/[A-Z]/.test(value)) n++;
  if (/[0-9]/.test(value)) n++;
  if (/[^a-zA-Z0-9]/.test(value)) n++;
  return n;
}

/** Returns an error string if the password is unacceptable, else null. */
export function checkPassword(value: string): string | null {
  if (value.length < PASSWORD_MIN) {
    return `Password must be at least ${PASSWORD_MIN} characters`;
  }
  if (Buffer.byteLength(value, "utf8") > PASSWORD_MAX_BYTES) {
    return `Password is too long (max ${PASSWORD_MAX_BYTES} bytes)`;
  }
  if (classCount(value) < 3) {
    return "Password must include at least 3 of: lowercase, uppercase, number, symbol";
  }
  return null;
}

/** Zod schema fragment enforcing the policy. */
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters`)
  .refine((v) => Buffer.byteLength(v, "utf8") <= PASSWORD_MAX_BYTES, {
    message: `Password is too long (max ${PASSWORD_MAX_BYTES} bytes)`,
  })
  .refine((v) => classCount(v) >= 3, {
    message:
      "Password must include at least 3 of: lowercase, uppercase, number, symbol",
  });
