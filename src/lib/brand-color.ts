/**
 * 2026-05-20 hardening (audit HIGH — CSS-injection branding XSS).
 *
 * Brand colours (`primaryColor`, `accentColor`, `backgroundColor`,
 * `textColor`) are admin-controlled strings that get interpolated into
 * a server-rendered `<style dangerouslySetInnerHTML>` block on every
 * storefront page. An admin who set a colour to
 *   `red } </style><script>...</script><style> {`
 * would achieve stored XSS against every visitor.
 *
 * Defense in depth: validate at WRITE time (reject the request) AND
 * sanitize at READ time (fall back to a safe default if a bad value
 * somehow reached the DB — e.g. a row written before this fix shipped).
 */

// CSS hex colour: # followed by 3, 4, 6 or 8 hex digits.
const HEX_COLOR = /^#[0-9a-fA-F]{3,8}$/;

export function isValidHexColor(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const v = value.trim();
  // Reject 5/7-length forms — only 3/4/6/8 are valid CSS hex.
  if (!HEX_COLOR.test(v)) return false;
  const digits = v.length - 1;
  return digits === 3 || digits === 4 || digits === 6 || digits === 8;
}

/**
 * Returns the value if it is a valid hex colour, otherwise the
 * supplied safe fallback. Use at READ time before interpolating into
 * CSS so a poisoned legacy row cannot break out of the `<style>` tag.
 */
export function safeHexColor(value: unknown, fallback: string): string {
  return isValidHexColor(value) ? (value as string).trim() : fallback;
}

/**
 * Validates a colour at WRITE time. Returns the normalised value, or
 * throws `BrandColorError` so the API route can reply 400. Accepts
 * `undefined`/empty (caller decides whether to apply the schema
 * default) — only a present, malformed value is rejected.
 */
export class BrandColorError extends Error {}

export function assertBrandColor(
  fieldName: string,
  value: unknown,
): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (!isValidHexColor(value)) {
    throw new BrandColorError(
      `${fieldName} must be a hex colour like #064E3B`,
    );
  }
  return (value as string).trim();
}
