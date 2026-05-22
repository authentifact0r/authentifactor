"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import {
  hashPassword,
  verifyPassword,
  setAuthCookies,
  clearAuthCookies,
  type JWTPayload,
} from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { checkLoginRateLimit } from "@/lib/rateLimit";
import { passwordSchema } from "@/lib/password-policy";

const registerSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerAction(formData: FormData): Promise<void> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    redirect("/register?error=" + encodeURIComponent(parsed.error.issues[0].message));
  }

  const { email, password, firstName, lastName, phone } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    redirect("/register?error=" + encodeURIComponent("An account with this email already exists"));
  }

  const tenant = await getTenant();

  const passwordHash = await hashPassword(password);
  const user = await db.user.create({
    data: { email, passwordHash, firstName, lastName, phone },
  });

  // Create TenantUser with CUSTOMER role
  const tenantUser = await db.tenantUser.create({
    data: {
      userId: user.id,
      tenantId: tenant.id,
      role: "CUSTOMER",
    },
  });

  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    tenantId: tenant.id,
    tenantRole: tenantUser.role,
  };

  await setAuthCookies(payload);
  redirect("/account");
}

export async function loginAction(formData: FormData): Promise<void> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/login?error=" + encodeURIComponent(parsed.error.issues[0].message));
  }

  const { email, password } = parsed.data;

  // 2026-05-22 hardening (audit MEDIUM — no login rate limiting):
  // per-IP + per-email brute-force speed bump on the server-action login
  // path (mirrors `/api/auth/login`).
  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (!checkLoginRateLimit(ip, email).allowed) {
    redirect(
      "/login?error=" +
        encodeURIComponent("Too many login attempts. Please try again later."),
    );
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    redirect("/login?error=" + encodeURIComponent("Invalid email or password"));
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    redirect("/login?error=" + encodeURIComponent("Invalid email or password"));
  }

  let tenantId = "";
  let tenantRole = "CUSTOMER";

  try {
    const tenant = await getTenant();
    tenantId = tenant.id;

    // Find or create TenantUser for this user + tenant
    let tenantUser = await db.tenantUser.findUnique({
      where: { userId_tenantId: { userId: user.id, tenantId: tenant.id } },
    });

    if (!tenantUser) {
      tenantUser = await db.tenantUser.create({
        data: {
          userId: user.id,
          tenantId: tenant.id,
          role: "CUSTOMER",
        },
      });
    }

    tenantRole = tenantUser.role;
  } catch {
    // No tenant context (platform host) — find first linked tenant or use superadmin
    if (user.isSuperAdmin) {
      const firstLink = await db.tenantUser.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
      });
      tenantId = firstLink?.tenantId || "";
      tenantRole = firstLink?.role || "ADMIN";
    } else {
      redirect("/login?error=" + encodeURIComponent("No tenant context. Access your storefront domain directly."));
    }
  }

  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    tenantId,
    tenantRole,
  };

  await setAuthCookies(payload);

  // Superadmins go to superadmin dashboard, others to account
  if (user.isSuperAdmin) {
    redirect("/superadmin");
  }
  redirect("/account");
}

export async function logoutAction(): Promise<void> {
  await clearAuthCookies();
  redirect("/");
}
