import { describe, it, expect } from "vitest";
import { convertPrice, formatDisplayPrice, getSymbol, fallbackRates } from "../currency";

describe("convertPrice", () => {
  it("returns the amount unchanged for same-currency conversion", () => {
    expect(convertPrice(49.99, "GBP", "GBP", fallbackRates)).toBe(49.99);
  });

  it("converts through the GBP base with 2dp rounding", () => {
    // 100 USD → GBP: 100 / 1.27 = 78.740..., → NGN: × 1900
    const gbp = convertPrice(100, "USD", "GBP", fallbackRates);
    expect(gbp).toBe(Math.round((100 / 1.27) * 100) / 100);
    const ngn = convertPrice(10, "GBP", "NGN", fallbackRates);
    expect(ngn).toBe(19000);
  });

  it("falls back to rate 1 for unknown currencies rather than NaN", () => {
    const out = convertPrice(50, "GBP", "ZZZ", fallbackRates);
    expect(Number.isFinite(out)).toBe(true);
    expect(out).toBe(50);
  });

  it("never produces negative output for positive input", () => {
    for (const to of Object.keys(fallbackRates)) {
      expect(convertPrice(9.99, "GBP", to, fallbackRates)).toBeGreaterThan(0);
    }
  });
});

describe("formatDisplayPrice", () => {
  it("formats zero-decimal currencies without decimals", () => {
    const out = formatDisplayPrice(10, "GBP", "JPY", fallbackRates);
    expect(out.startsWith("¥")).toBe(true);
    expect(out).not.toContain(".");
  });

  it("drops decimals for large converted amounts", () => {
    const out = formatDisplayPrice(100, "GBP", "NGN", fallbackRates);
    expect(out).toBe(`₦${(190000).toLocaleString()}`);
  });

  it("keeps 2dp for small amounts", () => {
    expect(formatDisplayPrice(9.99, "GBP", "GBP", fallbackRates)).toBe("£9.99");
  });
});

describe("getSymbol", () => {
  it("returns the mapped symbol", () => {
    expect(getSymbol("NGN")).toBe("₦");
  });

  it("falls back to the code + space for unmapped currencies", () => {
    expect(getSymbol("ZZZ")).toBe("ZZZ ");
  });
});
