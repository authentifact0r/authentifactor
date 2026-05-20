import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
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

export async function createAccessToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(JWT_SECRET);
}

export async function createRefreshToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(REFRESH_SECRET);
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

export async function verifyRefreshToken(
  token: string
): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookies(payload: JWTPayload) {
  const cookieStore = await cookies();
  const accessToken = await createAccessToken(payload);
  const refreshToken = await createRefreshToken(payload);

  const baseCookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    // Cross-subdomain auth: allows cookies to work across *.authentifactor.com
    ...(process.env.NODE_ENV === "production" && {
      domain: ".authentifactor.com",
    }),
  };

  cookieStore.set("access_token", accessToken, {
    ...baseCookieOpts,
    maxAge: 15 * 60, // 15 minutes
  });

  cookieStore.set("refresh_token", refreshToken, {
    ...baseCookieOpts,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    // Try refresh token
    const refreshToken = cookieStore.get("refresh_token")?.value;
    if (!refreshToken) return null;

    const refreshPayload = await verifyRefreshToken(refreshToken);
    if (!refreshPayload) return null;

    // Issue new access token
    const newPayload: JWTPayload = {
      userId: refreshPayload.userId,
      email: refreshPayload.email,
      tenantId: refreshPayload.tenantId,
      tenantRole: refreshPayload.tenantRole,
    };
    await setAuthCookies(newPayload);

    return {
      id: refreshPayload.userId,
      email: refreshPayload.email,
      tenantId: refreshPayload.tenantId,
      tenantRole: refreshPayload.tenantRole,
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
