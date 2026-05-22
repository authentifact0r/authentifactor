import type { NextRequest } from "next/server";

/**
 * Body-size-limited JSON reader for App-Router API routes.
 *
 * 2026-05-22 hardening (audit MEDIUM — no size limits on `request.json()`):
 * server actions inherit `experimental.serverActions.bodySizeLimit`, but
 * App-Router route handlers do NOT — an attacker could POST a multi-hundred-MB
 * JSON payload and exhaust process memory before parsing fails.
 *
 * `readJsonBody()` rejects early on the `Content-Length` header, then
 * defensively re-checks the actual decoded byte length (a request can omit
 * or understate Content-Length). On overflow it throws `Error("PayloadTooLarge")`,
 * which `apiError()` maps to HTTP 413.
 */

const DEFAULT_MAX_BYTES = 1 * 1024 * 1024; // 1 MB — generous for JSON API bodies.

export class PayloadTooLargeError extends Error {
  constructor() {
    super("PayloadTooLarge");
    this.name = "PayloadTooLargeError";
  }
}

export async function readJsonBody<T = unknown>(
  request: NextRequest,
  maxBytes: number = DEFAULT_MAX_BYTES,
): Promise<T> {
  // Fast path: reject on the declared Content-Length before reading.
  const declared = request.headers.get("content-length");
  if (declared) {
    const len = Number(declared);
    if (Number.isFinite(len) && len > maxBytes) {
      throw new PayloadTooLargeError();
    }
  }

  // Defensive path: the header can be absent or lie — measure the real body.
  const raw = await request.text();
  if (Buffer.byteLength(raw, "utf8") > maxBytes) {
    throw new PayloadTooLargeError();
  }

  if (!raw) {
    return {} as T;
  }

  return JSON.parse(raw) as T;
}
