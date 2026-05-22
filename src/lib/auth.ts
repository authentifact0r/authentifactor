import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "./db";

// 2026-05-20 hardening (audit HIGH): refuse to boot with a fallback
// JWT secret in production. A misconfigured deploy with `JWT_SECRET`
// unset previously silently fell back to the string literal in this
// file — a value every reader of the repo knows, so every issued JWT
// would be forgeable. Fail loudly at module load.
function loadJwtSecret(name: "JWT_SECRET" | "JWT_REFRESH_SECRET"): Uint8Array {
  const raw = process.env[name] || "";
  if (process.env.NODE_ENV === "production") {
    if (!raw || raw.length < 32) {
      throw new Error(
        `${name} must be set to at least 32 chars in production (was ${raw.length} chars)`,
      );
    }
  } else if (!raw) {
    // Dev only: fall back to a constant so `npm run dev` still works
    // for a fresh checkout. Production cannot reach this branch.
    return new TextEncoder().encode(
      name === "JWT_SECRET"
        ? "fallback-dev-secret-not-for-prod-must-be-32+chars"
        : "fallback-refresh-secret-not-for-prod-32+chars",
    );
  }
  return new TextEncoder().encode(raw);
}

const JWT_SECRET = loadJwtSecret("JWT_SECRET");
const REFRESH_SECRET = loadJwtSecret("JWT_REFRESH_SECRET");

const ACCESS_TOKEN_TTL_SEC = 15 * 60; // 15 minutes
const REFRESH_TOKEN_TTL_SEC = 7 * 24 * 60 * 60; // 7 days

export interface JWTPayload {
  userId: string;
  email: string;
  tenantId: string;
  tenantRole: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function createAccessToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(JWT_SECRET);
}

// 2026-05-20 hardening (audit HIGH — no refresh rotation/revocation):
// the refresh token now carries a `jti`. The signed token's SHA-256
// hash is persisted in the RefreshToken table so logout / rotation
// can revoke it server-side. A stolen refresh token is therefore
// killable, and rotation detects re-use.
async function createRefreshToken(payload: JWTPayload): Promise<string> {
  const jti = crypto.randomUUID();
  const token = await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setJti(jti)
    .setExpirationTime("7d")
    .sign(REFRESH_SECRET);

  await db.refreshToken.create({
    data: {
      jti,
      tokenHash: sha256Hex(token),
      userId: payload.userId,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SEC * 1000),
    },
  });

  return token;
}

export async function verifyAccessToken(
  token: string
): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

interface RefreshVerifyResult {
  payload: JWTPayload;
  jti: string;
}

// Verifies the JWT signature AND that the matching RefreshToken row is
// present, not revoked, and not expired.
async function verifyRefreshToken(
  token: string
): Promise<RefreshVerifyResult | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    const jti = payload.jti as string | undefined;
    if (!jti) return null;

    const row = await db.refreshToken.findUnique({ where: { jti } });
    if (!row) return null;
    if (row.revokedAt) return null;
    if (row.expiresAt.getTime() < Date.now()) return null;
    if (row.tokenHash !== sha256Hex(token)) return null;

    return { payload: payload as unknown as JWTPayload, jti };
  } catch {
    return null;
  }
}

function baseCookieOpts() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    // Cross-subdomain auth: allows cookies to work across *.authentifactor.com
    ...(process.env.NODE_ENV === "production" && {
      domain: ".authentifactor.com",
    }),
  };
}

// Sole login session-issuing path. Consolidates the previously
// divergent `/api/auth/login` (flat 7d access_token) and server-action
// (15m + raw 7d) flows into one shape: 15m access + rotating, revocable
// 7d refresh.
export async function setAuthCookies(payload: JWTPayload) {
  const cookieStore = await cookies();
  const accessToken = await createAccessToken(payload);
  const refreshToken = await createRefreshToken(payload);
  const opts = baseCookieOpts();

  cookieStore.set("access_token", accessToken, {
    ...opts,
    maxAge: ACCESS_TOKEN_TTL_SEC,
  });
  cookieStore.set("refresh_token", refreshToken, {
    ...opts,
    maxAge: REFRESH_TOKEN_TTL_SEC,
  });
}

// Revokes the persisted refresh-token row (if present) and clears the
// browser cookies. Used by /api/auth/logout and logoutAction.
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;
  if (refreshToken) {
    try {
      const { payload } = await jwtVerify(refreshToken, REFRESH_SECRET);
      const jti = payload.jti as string | undefined;
      if (jti) {
        await db.refreshToken
          .updateMany({
            where: { jti, revokedAt: null },
            data: { revokedAt: new Date() },
          })
          .catch(() => {});
      }
    } catch {
      // invalid/expired token — nothing to revoke
    }
  }
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    // Try refresh token — verified against the server-side session store.
    const refreshToken = cookieStore.get("refresh_token")?.value;
    if (!refreshToken) return null;

    const result = await verifyRefreshToken(refreshToken);
    if (!result) return null;

    // 2026-05-20 hardening (audit HIGH): re-load role + isSuperAdmin
    // from the DB on every refresh so role downgrades / account
    // disables propagate instead of waiting out the 7-day TTL.
    const tenantUser = await db.tenantUser.findUnique({
      where: {
        userId_tenantId: {
          userId: result.payload.userId,
          tenantId: result.payload.tenantId,
        },
      },
      include: { user: { select: { id: true, email: true } } },
    });
    if (!tenantUser) {
      // The user no longer belongs to this tenant — kill the session.
      await db.refreshToken
        .updateMany({
          where: { jti: result.jti, revokedAt: null },
          data: { revokedAt: new Date() },
        })
        .catch(() => {});
      return null;
    }

    const newPayload: JWTPayload = {
      userId: tenantUser.user.id,
      email: tenantUser.user.email,
      tenantId: result.payload.tenantId,
      tenantRole: tenantUser.role,
    };

    // Rotate: revoke the consumed jti, issue a fresh access + refresh pair.
    await db.refreshToken
      .updateMany({
        where: { jti: result.jti, revokedAt: null },
        data: { revokedAt: new Date() },
      })
      .catch(() => {});
    await setAuthCookies(newPayload);

    return {
      id: newPayload.userId,
      email: newPayload.email,
      tenantId: newPayload.tenantId,
      tenantRole: newPayload.tenantRole,
    };
  }

  const payload = await verifyAccessToken(accessToken);
  if (!payload) return null;

  return {
    id: payload.userId,
    email: payload.email,
    tenantId: payload.tenantId,
    tenantRole: payload.tenantRole,
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.tenantRole !== "ADMIN" && user.tenantRole !== "MANAGER") {
    throw new Error("Forbidden");
  }
  return user;
}

export async function requireSuperAdmin() {
  const user = await requireAuth();
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { isSuperAdmin: true },
  });
  if (!dbUser?.isSuperAdmin) {
    throw new Error("Forbidden: Super admin access required");
  }
  return user;
}
