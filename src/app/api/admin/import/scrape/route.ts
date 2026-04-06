import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

    // Fetch the product page
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!res.ok) return NextResponse.json({ error: `Failed to fetch: ${res.status}` }, { status: 400 });
    const html = await res.text();

    // Extract Open Graph / meta data (works on AliExpress, Amazon, Temu, etc.)
    const extract = (pattern: RegExp): string => {
      const match = html.match(pattern);
      return match?.[1]?.trim() || "";
    };

    const title = extract(/og:title["\s]*content="([^"]+)"/i)
      || extract(/<title[^>]*>([^<]+)<\/title>/i)
      || "";

    const description = extract(/og:description["\s]*content="([^"]+)"/i)
      || extract(/name="description["\s]*content="([^"]+)"/i)
      || "";

    const image = extract(/og:image["\s]*content="([^"]+)"/i) || "";

    // Try to get price from various patterns
    let price = extract(/og:price:amount["\s]*content="([^"]+)"/i)
      || extract(/product:price:amount["\s]*content="([^"]+)"/i)
      || "";

    const currency = extract(/og:price:currency["\s]*content="([^"]+)"/i)
      || extract(/product:price:currency["\s]*content="([^"]+)"/i)
      || "USD";

    // AliExpress specific: try to extract from JSON in page
    if (!price) {
      const priceMatch = html.match(/"formattedActivityPrice":"([^"]+)"/i)
        || html.match(/"minPrice":"([^"]+)"/i)
        || html.match(/"salePrice":"([^"]+)"/i)
        || html.match(/"price":"([^"]+)"/i)
        || html.match(/\$\s*([\d.]+)/);
      if (priceMatch) price = priceMatch[1].replace(/[^0-9.]/g, "");
    }

    // Extract all images
    const images: string[] = [];
    if (image) images.push(image);

    // Try to get more images from og:image tags or AliExpress image JSON
    const imgMatches = html.matchAll(/og:image["\s]*content="([^"]+)"/gi);
    for (const m of imgMatches) {
      if (m[1] && !images.includes(m[1])) images.push(m[1]);
    }

    // AliExpress specific image extraction
    const aliImgMatches = html.matchAll(/"imageUrl":"(https?:\/\/[^"]+)"/gi);
    for (const m of aliImgMatches) {
      if (m[1] && !images.includes(m[1]) && images.length < 8) images.push(m[1]);
    }

    // Try to extract variants/options
    const variants: { name: string; values: string[] }[] = [];
    // AliExpress SKU properties
    const skuMatch = html.match(/"skuPropertyValues":\[([^\]]+)\]/);
    if (skuMatch) {
      try {
        const values = JSON.parse(`[${skuMatch[1]}]`);
        const grouped: Record<string, string[]> = {};
        for (const v of values) {
          const name = v.skuPropertyName || "Option";
          if (!grouped[name]) grouped[name] = [];
          grouped[name].push(v.propertyValueDefinitionName || v.skuPropertyValue || "");
        }
        for (const [name, vals] of Object.entries(grouped)) {
          variants.push({ name, values: vals.filter(Boolean) });
        }
      } catch {}
    }

    // Detect supplier source
    let supplier = "unknown";
    if (url.includes("aliexpress")) supplier = "aliexpress";
    else if (url.includes("amazon")) supplier = "amazon";
    else if (url.includes("temu")) supplier = "temu";
    else if (url.includes("alibaba")) supplier = "alibaba";
    else if (url.includes("cjdropshipping")) supplier = "cjdropshipping";
    else if (url.includes("dhgate")) supplier = "dhgate";

    // Clean title (remove "| AliExpress" etc.)
    const cleanTitle = title
      .replace(/\s*[-|]\s*(AliExpress|Amazon|Temu|Alibaba|DHgate).*$/i, "")
      .replace(/\s*-\s*\d+\.\d+%\s*off.*$/i, "")
      .trim();

    return NextResponse.json({
      title: cleanTitle,
      description: description.slice(0, 500),
      images: images.slice(0, 8),
      price: parseFloat(price) || 0,
      currency,
      supplier,
      sourceUrl: url,
      variants,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
