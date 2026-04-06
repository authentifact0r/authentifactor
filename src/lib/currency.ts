/**
 * Geo-based currency system.
 *
 * - Detects customer country from Vercel's x-vercel-ip-country header
 * - Maps country → currency
 * - Provides exchange rates (cached, refreshed daily)
 * - All tenants price in their base currency; display converts for the customer
 */

// Country → currency mapping (covers major markets)
export const countryCurrencyMap: Record<string, string> = {
  // Africa
  NG: "NGN", GH: "GHS", KE: "KES", ZA: "ZAR", EG: "EGP",
  TZ: "TZS", UG: "UGX", RW: "RWF", ET: "ETB", SN: "XOF",
  // Europe
  GB: "GBP", IE: "EUR", FR: "EUR", DE: "EUR", IT: "EUR",
  ES: "EUR", NL: "EUR", BE: "EUR", PT: "EUR", AT: "EUR",
  GR: "EUR", FI: "EUR", SE: "SEK", NO: "NOK", DK: "DKK",
  PL: "PLN", CZ: "CZK", CH: "CHF",
  // Americas
  US: "USD", CA: "CAD", MX: "MXN", BR: "BRL", AR: "ARS",
  // Asia Pacific
  IN: "INR", CN: "CNY", JP: "JPY", KR: "KRW", SG: "SGD",
  AU: "AUD", NZ: "NZD", AE: "AED", SA: "SAR", MY: "MYR",
  TH: "THB", PH: "PHP", ID: "IDR", PK: "PKR",
  // Caribbean
  JM: "JMD", TT: "TTD", BB: "BBD",
};

export const currencySymbols: Record<string, string> = {
  GBP: "£", USD: "$", EUR: "€", NGN: "₦", GHS: "₵",
  KES: "KSh", ZAR: "R", CAD: "C$", AUD: "A$", INR: "₹",
  AED: "د.إ", SAR: "﷼", JPY: "¥", CNY: "¥", KRW: "₩",
  SGD: "S$", NZD: "NZ$", SEK: "kr", NOK: "kr", DKK: "kr",
  CHF: "CHF", PLN: "zł", CZK: "Kč", BRL: "R$", MXN: "$",
  MYR: "RM", THB: "฿", PHP: "₱", IDR: "Rp", PKR: "₨",
  EGP: "E£", TZS: "TSh", UGX: "USh", RWF: "RF", ETB: "Br",
  XOF: "CFA", JMD: "J$", TTD: "TT$", BBD: "Bds$",
  ARG: "$", ARs: "$",
};

export const supportedDisplayCurrencies = [
  { code: "GBP", label: "£ GBP", symbol: "£" },
  { code: "USD", label: "$ USD", symbol: "$" },
  { code: "EUR", label: "€ EUR", symbol: "€" },
  { code: "NGN", label: "₦ NGN", symbol: "₦" },
  { code: "GHS", label: "₵ GHS", symbol: "₵" },
  { code: "KES", label: "KSh KES", symbol: "KSh" },
  { code: "CAD", label: "C$ CAD", symbol: "C$" },
  { code: "AUD", label: "A$ AUD", symbol: "A$" },
  { code: "INR", label: "₹ INR", symbol: "₹" },
  { code: "AED", label: "د.إ AED", symbol: "د.إ" },
  { code: "ZAR", label: "R ZAR", symbol: "R" },
];

/**
 * Fallback exchange rates (GBP base). Updated manually — replaced by live rates from API.
 */
export const fallbackRates: Record<string, number> = {
  GBP: 1,
  USD: 1.27,
  EUR: 1.17,
  NGN: 1900,
  GHS: 19.5,
  KES: 165,
  ZAR: 23.5,
  CAD: 1.72,
  AUD: 1.95,
  INR: 106,
  AED: 4.67,
  SAR: 4.76,
  JPY: 191,
  CNY: 9.2,
  SGD: 1.71,
  NZD: 2.12,
  SEK: 13.4,
  NOK: 13.7,
  CHF: 1.12,
  PLN: 5.1,
  BRL: 6.4,
  MXN: 21.8,
};

export function getSymbol(currency: string): string {
  return currencySymbols[currency] || currency + " ";
}

export function convertPrice(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>
): number {
  if (fromCurrency === toCurrency) return amount;

  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;

  // Convert to GBP first (base), then to target
  const inBase = amount / fromRate;
  return Math.round(inBase * toRate * 100) / 100;
}

export function formatDisplayPrice(
  amount: number,
  baseCurrency: string,
  displayCurrency: string,
  rates: Record<string, number>
): string {
  const converted = convertPrice(amount, baseCurrency, displayCurrency, rates);
  const symbol = getSymbol(displayCurrency);

  // Zero-decimal currencies
  const zeroDecimal = ["JPY", "KRW", "UGX", "RWF", "XOF"];
  if (zeroDecimal.includes(displayCurrency)) {
    return `${symbol}${Math.round(converted).toLocaleString()}`;
  }

  // Large currencies — no decimals
  if (converted >= 1000) {
    return `${symbol}${Math.round(converted).toLocaleString()}`;
  }

  return `${symbol}${converted.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
