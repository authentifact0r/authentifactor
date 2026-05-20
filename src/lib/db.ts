import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// ─── TENANT-SCOPED PRISMA CLIENT ────────────────────────────

const TENANT_SCOPED_MODELS = [
  "product",
  "warehouse",
  "inventoryBatch",
  "cartItem",
  "order",
  "subscription",
  "recipe",
  "flashSale",
  "shippingRule",
  "seoSettings",
  "subscriber",
  "campaign",
] as const;

type TenantScopedModel = (typeof TENANT_SCOPED_MODELS)[number];

function isTenantScoped(model: string): boolean {
  // Prisma passes PascalCase model names (e.g. "InventoryBatch")
  // but our list uses camelCase. Compare case-insensitively.
  const lower = model.toLowerCase();
  return (TENANT_SCOPED_MODELS as readonly string[]).some(
    (m) => m.toLowerCase() === lower
  );
}

export function tenantDb(tenantId: string) {
  return db.$extends({
    query: {
      $allModels: {
        async findMany({ model, args, query }) {
          if (isTenantScoped(model)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async findFirst({ model, args, query }) {
          if (isTenantScoped(model)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async findUnique({ model, args, query }) {
          if (isTenantScoped(model)) {
            args.where = { ...args.where, tenantId } as typeof args.where;
          }
          return query(args);
        },
        async count({ model, args, query }) {
          if (isTenantScoped(model)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async aggregate({ model, args, query }) {
          if (isTenantScoped(model)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async create({ model, args, query }) {
          if (isTenantScoped(model)) {
            (args.data as Record<string, unknown>).tenantId = tenantId;
          }
          return query(args);
        },
        async createMany({ model, args, query }) {
          if (isTenantScoped(model)) {
            if (Array.isArray(args.data)) {
              args.data = args.data.map((d: Record<string, unknown>) => ({ ...d, tenantId }));
            } else {
              (args.data as Record<string, unknown>).tenantId = tenantId;
            }
          }
          return query(args);
        },
        async update({ model, args, query }) {
          if (isTenantScoped(model)) {
            args.where = { ...args.where, tenantId } as typeof args.where;
          }
          return query(args);
        },
        async updateMany({ model, args, query }) {
          if (isTenantScoped(model)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async delete({ model, args, query }) {
          if (isTenantScoped(model)) {
            args.where = { ...args.where, tenantId } as typeof args.where;
          }
          return query(args);
        },
        async deleteMany({ model, args, query }) {
          if (isTenantScoped(model)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async upsert({ model, args, query }) {
          if (isTenantScoped(model)) {
            args.where = { ...args.where, tenantId } as typeof args.where;
            (args.create as Record<string, unknown>).tenantId = tenantId;
          }
          return query(args);
        },
      },
    },
  });
}

/**
 * Resolve the tenant-scoped Prisma client for the current request.
 *
 * 2026-05-20 hardening: authenticated callers (admin/account routes) now
 * derive tenantId from the SERVER-ISSUED JWT, NOT the `x-tenant-slug`
 * request header. The header was previously the sole authority and a
 * client could simply set it to any tenant's slug to read/write that
 * tenant's data (audit CRITICAL #1). The JWT path closes that.
 *
 * Unauthenticated callers (storefront product reads, sitemap, etc.)
 * still fall through to the header — but middleware now unconditionally
 * deletes any user-supplied `x-tenant-slug` and re-sets it from the
 * server-side host/subdomain resolver, so the header is trustworthy for
 * those reads.
 */
export async function getScopedDb() {
  const { getCurrentUser } = await import("./auth");
  const { getTenantId } = await import("./tenant");

  const user = await getCurrentUser().catch(() => null);
  if (user?.tenantId) {
    return tenantDb(user.tenantId);
  }
  const id = await getTenantId();
  return tenantDb(id);
}

/**
 * Strict variant — REQUIRES an authenticated user and returns a client
 * scoped to that user's tenant. Use in admin/account routes where any
 * fall-through to header-based resolution would be a security bug.
 */
export async function getAuthScopedDb() {
  const { getCurrentUser } = await import("./auth");
  const user = await getCurrentUser();
  if (!user?.tenantId) {
    throw new Error("Unauthorized");
  }
  return tenantDb(user.tenantId);
}

/**
 * Placeholder tenantId for create operations on scoped clients.
 * The tenant middleware injects the real tenantId at runtime,
 * but TypeScript needs a value to satisfy the required field type.
 */
export const TENANT_ID = "" as string;
