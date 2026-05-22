import { lookup } from "node:dns/promises";
import net from "node:net";

/**
 * 2026-05-20 hardening (audit HIGH — SSRF).
 *
 * `safeFetch` is an SSRF-aware fetch wrapper for routes that fetch a
 * user/admin-supplied URL server-side (e.g. the supplier-scrape import).
 * It:
 *   - rejects any scheme other than http/https,
 *   - resolves the hostname and rejects private / reserved / loopback /
 *     link-local IPs (cloud metadata, internal services, loopback),
 *   - follows redirects MANUALLY, re-validating every hop's target so a
 *     public URL cannot 30x-bounce into the internal network,
 *   - caps the number of redirects and the response body size.
 *
 * It does NOT pin the resolved IP into the socket, so a DNS-rebinding
 * race (TOCTOU between this check and the kernel's own resolution)
 * remains theoretically possible. For the scrape use-case the domain
 * allowlist below is the primary control; the IP check is defence in
 * depth. A fully rebinding-proof implementation would need a custom
 * agent that dials the validated IP directly.
 */

export class SsrfBlockedError extends Error {}

const MAX_REDIRECTS = 5;
const MAX_BODY_BYTES = 5 * 1024 * 1024; // 5 MB

function isPrivateIpv4(ip: string): boolean {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => Number.isNaN(n))) return true;
  const [a, b] = p;
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 127) return true; // 127.0.0.0/8 loopback
  if (a === 0) return true; // 0.0.0.0/8
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 169 && b === 254) return true; // 169.254.0.0/16 link-local (cloud metadata)
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 CGNAT
  if (a >= 224) return true; // 224.0.0.0/4 multicast + 240/4 reserved
  return false;
}

function isPrivateIpv6(ip: string): boolean {
  const v = ip.toLowerCase();
  if (v === "::1" || v === "::") return true; // loopback / unspecified
  if (v.startsWith("fe80")) return true; // link-local
  if (v.startsWith("fc") || v.startsWith("fd")) return true; // unique-local fc00::/7
  // IPv4-mapped (::ffff:a.b.c.d) — validate the embedded v4 address.
  const mapped = v.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIpv4(mapped[1]);
  return false;
}

function isBlockedIp(ip: string): boolean {
  const kind = net.isIP(ip);
  if (kind === 4) return isPrivateIpv4(ip);
  if (kind === 6) return isPrivateIpv6(ip);
  return true; // not a recognisable IP — block
}

async function assertSafeUrl(rawUrl: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new SsrfBlockedError("Invalid URL");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new SsrfBlockedError(`Scheme not allowed: ${url.protocol}`);
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, ""); // strip IPv6 brackets

  // If the host is a literal IP, check it directly.
  if (net.isIP(hostname)) {
    if (isBlockedIp(hostname)) {
      throw new SsrfBlockedError("URL resolves to a private/reserved address");
    }
    return url;
  }

  // Block obvious internal hostnames before DNS.
  const lower = hostname.toLowerCase();
  if (
    lower === "localhost" ||
    lower.endsWith(".localhost") ||
    lower.endsWith(".internal") ||
    lower.endsWith(".local") ||
    lower === "metadata.google.internal"
  ) {
    throw new SsrfBlockedError("Internal hostname not allowed");
  }

  // Resolve every A/AAAA record and reject if ANY is private/reserved.
  let records: { address: string }[];
  try {
    records = await lookup(hostname, { all: true });
  } catch {
    throw new SsrfBlockedError("DNS resolution failed");
  }
  if (records.length === 0) {
    throw new SsrfBlockedError("DNS resolution returned no records");
  }
  for (const rec of records) {
    if (isBlockedIp(rec.address)) {
      throw new SsrfBlockedError("URL resolves to a private/reserved address");
    }
  }

  return url;
}

export interface SafeFetchOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
  /** Optional allowlist of permitted hostnames (exact or suffix match). */
  allowedHosts?: string[];
}

function hostAllowed(hostname: string, allowedHosts?: string[]): boolean {
  if (!allowedHosts || allowedHosts.length === 0) return true;
  const h = hostname.toLowerCase();
  return allowedHosts.some(
    (allowed) => h === allowed || h.endsWith(`.${allowed}`),
  );
}

/**
 * SSRF-safe fetch. Validates the initial URL and every redirect hop,
 * caps redirects and body size. Returns the final Response (body not
 * yet consumed beyond the size guard) or throws SsrfBlockedError.
 */
export async function safeFetch(
  rawUrl: string,
  opts: SafeFetchOptions = {},
): Promise<Response> {
  const timeoutMs = opts.timeoutMs ?? 15_000;
  let currentUrl = rawUrl;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const url = await assertSafeUrl(currentUrl);
    if (!hostAllowed(url.hostname, opts.allowedHosts)) {
      throw new SsrfBlockedError(`Host not in allowlist: ${url.hostname}`);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let res: Response;
    try {
      res = await fetch(url, {
        headers: opts.headers,
        redirect: "manual", // we follow + re-validate hops ourselves
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    // Manual redirect handling — re-validate the Location target.
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) return res;
      if (hop === MAX_REDIRECTS) {
        throw new SsrfBlockedError("Too many redirects");
      }
      currentUrl = new URL(location, url).toString();
      continue;
    }

    // Enforce a body-size cap via Content-Length when present.
    const len = res.headers.get("content-length");
    if (len && Number(len) > MAX_BODY_BYTES) {
      throw new SsrfBlockedError("Response body too large");
    }
    return res;
  }

  throw new SsrfBlockedError("Too many redirects");
}

/** Reads a Response body as text with a hard size cap. */
export async function readTextCapped(res: Response): Promise<string> {
  const buf = await res.arrayBuffer();
  if (buf.byteLength > MAX_BODY_BYTES) {
    throw new SsrfBlockedError("Response body too large");
  }
  return new TextDecoder().decode(buf);
}
