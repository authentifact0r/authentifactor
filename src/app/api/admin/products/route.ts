import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-dev-secret");

function generateSKU(name: string): string {
  const prefix = name.replace(/[^a-zA-Z]/g, "").substring(0, 3).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${rand}`;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function getTenantId(request: NextRequest): Promise<string> {
  const token = request.cookies.get("access_token")?.value;
  if (!token) throw new Error("Not authenticated");
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload.tenantId as string;
}

// GET /api/admin/products — list products
export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);
    const products = await db.product.findMany({
      where: { tenantId },
      include: { inventoryBatches: { select: { quantity: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/products — create product
export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);
    const body = await request.json();

    const { name, description, category, price, compareAtPrice, weightKg, tags, images, isActive, isPerishable, isSubscribable, stock } = body;

    if (!name || !description || !category || price === undefined) {
      return NextResponse.json({ error: "name, description, category, price are required" }, { status: 400 });
    }

    const sku = generateSKU(name);
    const slug = slugify(name) + "-" + Math.random().toString(36).substring(2, 6);

    const product = await db.product.create({
      data: {
        tenantId,
        name,
        slug,
        sku,
        description,
        category,
        price,
        compareAtPrice: compareAtPrice || null,
        weightKg: weightKg || 0.1,
        tags: tags || [],
        images: images || [],
        isActive: isActive !== false,
        isPerishable: isPerishable || false,
        isFragile: false,
        isSubscribable: isSubscribable || false,
      },
    });

    // Create initial inventory batch if stock provided
    if (stock && stock > 0) {
      await db.inventoryBatch.create({
        data: {
          tenantId,
          productId: product.id,
          warehouseId: null as any, // Will be set when warehouse is configured
          quantity: stock,
          costPrice: price,
          batchNumber: `INIT-${sku}`,
        },
      });
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
