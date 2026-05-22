import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/api-error";
import { detectImage } from "@/lib/image-validate";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

// Try Vercel Blob first, fall back to local filesystem
async function uploadToBlob(name: string, buffer: Buffer): Promise<string | null> {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
    const { put } = await import("@vercel/blob");
    const blob = await put(name, buffer, { access: "public", addRandomSuffix: false });
    return blob.url;
  } catch {
    return null;
  }
}

async function uploadToLocal(name: string, buffer: Buffer): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  // `name` is a server-generated `<uuid>.<ext>` — no directory components.
  const filePath = path.join(uploadDir, name);
  await writeFile(filePath, buffer);
  return `/uploads/${name}`;
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    // 2026-05-22 hardening (audit MEDIUM — upload route trusts client MIME):
    // the previous code allow-listed `file.type` (the client-supplied
    // Content-Type) and built the stored extension from the attacker-
    // controlled filename. Now we sniff the actual file bytes and reject
    // anything that is not one of the five supported raster image formats.
    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.byteLength > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const detected = detectImage(buffer);
    if (!detected) {
      return NextResponse.json(
        { error: "Only image files are allowed (JPEG, PNG, WebP, GIF, AVIF)" },
        { status: 400 },
      );
    }

    // 2026-05-22 hardening (audit MEDIUM — CWE-338 + path control):
    // filename is a server-generated UUID and the extension comes from
    // the DETECTED type, never the input filename. This removes the
    // Math.random() PRNG and any attacker control over the stored name.
    const name = `${crypto.randomUUID()}.${detected.ext}`;

    // Try Vercel Blob first (production), fall back to local (dev)
    let url = await uploadToBlob(`products/${name}`, buffer);
    if (!url) {
      url = await uploadToLocal(name, buffer);
    }

    return NextResponse.json({ url });
  } catch (error: unknown) {
    return apiError(error, { context: "admin/upload" });
  }
}
