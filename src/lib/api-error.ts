import { NextResponse } from "next/server";

/**
 * Centralised API error handler.
 *
 * 2026-05-22 hardening (audit MEDIUM — error-message leakage + wrong
 * status codes): every admin/storefront/data route previously did
 * `catch (error) { return NextResponse.json({ error: error.message }, { status: 500 }) }`.
 * That had two problems:
 *   1. `requireAdmin()` / `requireAuth()` throw `Error("Unauthorized")` /
 *      `Error("Forbidden")` — an auth failure was reported to the client
 *      as a 500, not a 401/403.
 *   2. Prisma errors (`PrismaClientKnownRequestError`, validation errors)
 *      leak schema/column names and internal detail to the client.
 *
 * `apiError()` maps known error shapes to the correct HTTP status and a
 * generic external message, while logging the full detail server-side.
 * Routes call it from their `catch` block — purely additive, the
 * happy-path response is unchanged.
 */

interface ApiErrorOptions {
  /** Context label for the server-side log line. */
  context?: string;
}

function isPrismaError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const name = (error as { name?: string }).name ?? "";
  return name.startsWith("PrismaClient");
}

export function apiError(error: unknown, opts: ApiErrorOptions = {}): NextResponse {
  const message =
    error instanceof Error ? error.message : String(error ?? "Unknown error");

  // Always log the full detail server-side (never sent to the client).
  console.error(`[api-error]${opts.context ? ` ${opts.context}:` : ""}`, error);

  // Auth failures thrown by requireAuth/requireAdmin/requireSuperAdmin.
  if (message === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (message === "Forbidden" || message.startsWith("Forbidden")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Body too large (thrown by readJsonBody).
  if (message === "PayloadTooLarge") {
    return NextResponse.json(
      { error: "Request body too large" },
      { status: 413 },
    );
  }

  // Prisma errors leak schema detail — never forward the raw message.
  if (isPrismaError(error)) {
    const code = (error as { code?: string }).code;
    // P2025 = record not found; P2002 = unique-constraint violation.
    if (code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (code === "P2002") {
      return NextResponse.json(
        { error: "A record with these details already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "A database error occurred" },
      { status: 500 },
    );
  }

  // Anything else — generic 500, no internal detail.
  return NextResponse.json(
    { error: "An unexpected error occurred. Please try again." },
    { status: 500 },
  );
}
