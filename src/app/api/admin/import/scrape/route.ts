import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

async function tryFetch(url: string): Promise<string | null> {
  // Strategy 1: Direct fetch with browser-like headers
  const strategies = [
    {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "identity",
        "Cache-Control": "no-cache",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
      },
    },
    // Strategy 2: Googlebot UA (many sites serve full HTML to Googlebot)
    {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "Accept": "text/html",
      },
    },
  ];

  for (const strategy of strategies) {
    try {
      const res = await fetch(url, { headers: strategy.headers, redirect: "follow" });
      if (!res.ok) continue;
      const html = await res.text();
      // Check it's real content, not a CAPTCHA or blank page
      if (html.length > 5000 && (html.includes("og:title") || html.includes("<title") || html.includes("product"))) {
        return html;
      }
    } catch {}
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

    const html = await tryFetch(url);

    // Detect supplier
    let supplier = "unknown";
    if (url.includes("aliexpress")) supplier = "aliexpress";
    else if (url.includes("amazon")) supplier = "amazon";
    else if (url.includes("temu")) supplier = "temu";
    else if (url.includes("alibaba")) supplier = "alibaba";
    else if (url.includes("cjdropshipping")) supplier = "cjdropshipping";
    else if (url.includes("dhgate")) supplier = "dhgate";
    else if (url.includes("shein")) supplier = "shein";

    // If scraping failed, return partial data so user can fill manually
    if (!html) {
      return NextResponse.json({
        title: "",
        description: "",
        images: [],
        price: 0,
        currency: "USD",
        supplier,
        sourceUrl: url,
        variants: [],
        manual: true,
        message: `Could not auto-fetch from ${supplier}. The site blocked the request. Please enter details manually below.`,
      });
    }

    // Extract Open Graph / meta data
    const extract = (pattern: RegExp): string => {
      const match = html.match(pattern);
      return match?.[1]?.trim().replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"') || "";
    };

    const title = extract(/property="og:title["\s]*content="([^"]+)"/i)
      || extract(/content="([^"]+)"[^>]*property="og:title"/i)
      || extract(/<title[^>]*>([^<]+)<\/title>/i)
      || "";

    const description = extract(/property="og:description["\s]*content="([^"]+)"/i)
      || extract(/content="([^"]+)"[^>]*property="og:description"/i)
      || extract(/name="description["\s]*content="([^"]+)"/i)
      || extract(/content="([^"]+)"[^>]*name="description"/i)
      || "";

    const image = extract(/property="og:image["\s]*content="([^"]+)"/i)
      || extract(/content="([^"]+)"[^>]*property="og:image"/i)
      || "";

    // Price from meta tags
    let price = extract(/property="og:price:amount["\s]*content="([^"]+)"/i)
      || extract(/property="product:price:amount["\s]*content="([^"]+)"/i)
      || extract(/content="([^"]+)"[^>]*property="og:price:amount"/i)
      || extract(/content="([^"]+)"[^>]*property="product:price:amount"/i)
      || "";

    const currency = extract(/property="og:price:currency["\s]*content="([^"]+)"/i)
      || extract(/property="product:price:currency["\s]*content="([^"]+)"/i)
      || "USD";

    // Fallback price extraction from page content
    if (!price) {
      const priceMatch = html.match(/"formattedActivityPrice":"[^"]*?([\d.]+)"/i)
        || html.match(/"minPrice":"([\d.]+)"/i)
        || html.match(/"salePrice":"([\d.]+)"/i)
        || html.match(/"price":\s*"?([\d.]+)"?/i)
        || html.match(/"discountPrice":\s*\{[^}]*"minPrice":\s*([\d.]+)/i)
        || html.match(/class="[^"]*price[^"]*"[^>]*>[^<]*?[\$£€]\s*([\d,.]+)/i);
      if (priceMatch) price = priceMatch[1].replace(/[^0-9.]/g, "");
    }

    // Extract images
    const images: string[] = [];
    if (image) images.push(image);

    // All og:image tags
    const ogImgMatches = html.matchAll(/(?:property="og:image["\s]*content="|content=")([^"]+)"[^>]*(?:property="og:image")?/gi);
    for (const m of ogImgMatches) {
      const src = m[1];
      if (src && src.startsWith("http") && !images.includes(src) && images.length < 10) images.push(src);
    }

    // JSON image URLs (AliExpress, Alibaba, Temu patterns)
    const jsonImgMatches = html.matchAll(/"(?:imageUrl|imgUrl|image_url|imageURI|mainImage)":\s*"(https?:\/\/[^"]+)"/gi);
    for (const m of jsonImgMatches) {
      if (m[1] && !images.includes(m[1]) && images.length < 10) images.push(m[1]);
    }

    // img tags with product-like src
    if (images.length < 3) {
      const imgTagMatches = html.matchAll(/<img[^>]+src="(https?:\/\/[^"]+(?:product|item|goods|upload)[^"]*)"/gi);
      for (const m of imgTagMatches) {
        if (m[1] && !images.includes(m[1]) && images.length < 10) images.push(m[1]);
      }
    }

    // Extract variants
    const variants: { name: string; values: string[] }[] = [];
    const skuMatch = html.match(/"skuPropertyValues":\s*\[([^\]]+)\]/);
    if (skuMatch) {
      try {
        const values = JSON.parse(`[${skuMatch[1]}]`);
        const grouped: Record<string, string[]> = {};
        for (const v of values) {
          const name = v.skuPropertyName || "Option";
          if (!grouped[name]) grouped[name] = [];
          const val = v.propertyValueDefinitionName || v.skuPropertyValue || "";
          if (val && !grouped[name].includes(val)) grouped[name].push(val);
        }
        for (const [n, vals] of Object.entries(grouped)) {
          if (vals.length > 0) variants.push({ name: n, values: vals });
        }
      } catch {}
    }

    // Clean title
    const cleanTitle = title
      .replace(/\s*[-|–]\s*(AliExpress|Amazon|Temu|Alibaba|DHgate|SHEIN).*$/i, "")
      .replace(/\s*-\s*\d+[\d.]*%\s*off.*$/i, "")
      .replace(/Buy\s+/i, "")
      .trim();

    const hasData = cleanTitle || images.length > 0 || parseFloat(price) > 0;

    return NextResponse.json({
      title: cleanTitle,
      description: description.slice(0, 500),
      images: images.slice(0, 8),
      price: parseFloat(price) || 0,
      currency,
      supplier,
      sourceUrl: url,
      variants,
      manual: !hasData,
      message: hasData ? undefined : `Limited data from ${supplier}. Please review and fill in missing details.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
