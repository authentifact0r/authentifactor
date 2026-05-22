import { NextRequest, NextResponse } from "next/server";
import { getScopedDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const tdb = await getScopedDb();

    const { name, method, minWeightKg, maxWeightKg, baseCost, perKgCost, estimatedDays } = await request.json();
    if (!name || !method) return NextResponse.json({ error: "Name and method required" }, { status: 400 });

    const rule = await tdb.shippingRule.create({
      data: {
        name,
        method,
        minWeightKg: minWeightKg || 0,
        maxWeightKg: maxWeightKg || 30,
        baseCost: baseCost || 0,
        perKgCost: perKgCost || 0,
        estimatedDays: estimatedDays || 3,
        isActive: true,
      },
    });

    return NextResponse.json({ rule }, { status: 201 });
  } catch (error: any) {
    return apiError(error, { context: "admin/shipping" });
  }
}
