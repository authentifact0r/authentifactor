/**
 * Magic-byte image validation for the admin upload route.
 *
 * 2026-05-22 hardening (audit MEDIUM — upload route trusts client MIME):
 * the upload route previously allow-listed `file.type` (the HTTP-supplied
 * Content-Type) and derived the stored extension from the user-controlled
 * filename. An attacker could upload HTML/SVG/JS with `Content-Type: image/png`
 * and have it served from the platform's own origin.
 *
 * This module sniffs the first bytes of the actual file content and only
 * accepts the five raster image formats the product surfaces support.
 * The stored extension is then derived from the *detected* type, never
 * from the input filename. `file-type` is not added as a dependency —
 * these five signatures are short, stable, and well-defined.
 */

export type DetectedImage = {
  mime: string;
  ext: string;
};

function startsWith(buf: Uint8Array, sig: number[], offset = 0): boolean {
  if (buf.length < offset + sig.length) return false;
  for (let i = 0; i < sig.length; i++) {
    if (buf[offset + i] !== sig[i]) return false;
  }
  return true;
}

/**
 * Returns the detected image type, or null if the bytes do not match one
 * of the supported raster image formats.
 */
export function detectImage(buf: Uint8Array): DetectedImage | null {
  // JPEG: FF D8 FF
  if (startsWith(buf, [0xff, 0xd8, 0xff])) {
    return { mime: "image/jpeg", ext: "jpg" };
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { mime: "image/png", ext: "png" };
  }
  // GIF: "GIF87a" or "GIF89a"
  if (
    startsWith(buf, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) ||
    startsWith(buf, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
  ) {
    return { mime: "image/gif", ext: "gif" };
  }
  // WebP: "RIFF" .... "WEBP"
  if (
    startsWith(buf, [0x52, 0x49, 0x46, 0x46]) &&
    startsWith(buf, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return { mime: "image/webp", ext: "webp" };
  }
  // AVIF: ISO-BMFF "ftyp" box at offset 4, brand "avif" or "avis" at offset 8
  if (
    startsWith(buf, [0x66, 0x74, 0x79, 0x70], 4) &&
    (startsWith(buf, [0x61, 0x76, 0x69, 0x66], 8) ||
      startsWith(buf, [0x61, 0x76, 0x69, 0x73], 8))
  ) {
    return { mime: "image/avif", ext: "avif" };
  }
  return null;
}
