import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Try Vercel Blob first, fall back to local filesystem
async function uploadToBlob(name: string, file: File): Promise<string | null> {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
    const { put } = await import("@vercel/blob");
    const blob = await put(name, file, { access: "public", addRandomSuffix: false });
    return blob.url;
  } catch {
    return null;
  }
}

async function uploadToLocal(name: string, buffer: Buffer): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, name);
  // Ensure subdirectories exist
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, buffer);
  return `/uploads/${name}`;
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Only images allowed (JPEG, PNG, WebP, GIF)" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    // Try Vercel Blob first (production), fall back to local (dev)
    let url = await uploadToBlob(`products/${name}`, file);

    if (!url) {
      const buffer = Buffer.from(await file.arrayBuffer());
      url = await uploadToLocal(name, buffer);
    }

    return NextResponse.json({ url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
