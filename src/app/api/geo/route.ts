import { NextRequest, NextResponse } from "next/server";
import { countryCurrencyMap, fallbackRates } from "@/lib/currency";

// Cache exchange rates in memory (refresh every 12 hours)
let cachedRates: Record<string, number> | null = null;
let ratesCachedAt = 0;
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours

async function getExchangeRates(): Promise<Record<string, number>> {
  if (cachedRates && Date.now() - ratesCachedAt < CACHE_TTL) {
    return cachedRates;
  }

  try {
    // Free exchange rate API (GBP base)
    const res = await fetch(
      "https://api.exchangerate-api.com/v4/latest/GBP",
      { next: { revalidate: 43200 } } // 12hr cache
    );
    if (res.ok) {
      const data = await res.json();
      cachedRates = data.rates;
      ratesCachedAt = Date.now();
      return cachedRates!;
    }
  } catch {
    // Fall through to fallback
  }

  return fallbackRates;
}

/**
 * GET /api/geo
 * Returns detected country, suggested currency, and exchange rates.
 * Uses Vercel's x-vercel-ip-country header (free, no external API needed).
 */
export async function GET(request: NextRequest) {
  // Vercel auto-injects this header
  const country =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") || // Cloudflare fallback
    "GB"; // Default to UK

  const detectedCurrency = countryCurrencyMap[country] || "GBP";
  const rates = await getExchangeRates();

  return NextResponse.json(
    {
      country,
      currency: detectedCurrency,
      rates,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    }
  );
}
