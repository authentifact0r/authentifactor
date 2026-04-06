import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // Validate file type
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Only images allowed (JPEG, PNG, WebP, GIF)" }, { status: 400 });
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    // Generate a clean filename
    const ext = file.name.split(".").pop() || "jpg";
    const name = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const blob = await put(name, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error: any) {
    // If Vercel Blob isn't configured, return a helpful error
    if (error.message?.includes("BLOB")) {
      return NextResponse.json({ error: "Image storage not configured. Add BLOB_READ_WRITE_TOKEN to environment." }, { status: 500 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
