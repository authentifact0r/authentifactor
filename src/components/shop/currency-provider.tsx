"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  fallbackRates,
  formatDisplayPrice as fmtPrice,
  convertPrice,
  getSymbol,
  supportedDisplayCurrencies,
} from "@/lib/currency";

interface CurrencyContextValue {
  /** The currency products are priced in (tenant's base currency) */
  baseCurrency: string;
  /** The currency being displayed to the customer */
  displayCurrency: string;
  /** Exchange rates (GBP base) */
  rates: Record<string, number>;
  /** Customer's detected country code */
  country: string;
  /** Format a price for display (auto-converts from base to display currency) */
  formatPrice: (amount: number) => string;
  /** Convert a price from base to display currency (raw number) */
  convert: (amount: number) => number;
  /** Symbol for the display currency */
  symbol: string;
  /** Change the display currency manually */
  setCurrency: (code: string) => void;
  /** Whether we're showing a different currency than the base */
  isConverted: boolean;
  /** Loading state */
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({
  baseCurrency,
  children,
}: {
  baseCurrency: string;
  children: ReactNode;
}) {
  const [displayCurrency, setDisplayCurrency] = useState(baseCurrency);
  const [rates, setRates] = useState<Record<string, number>>(fallbackRates);
  const [country, setCountry] = useState("GB");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for user preference first
    const saved = localStorage.getItem("preferred-currency");

    async function detectCurrency() {
      try {
        const res = await fetch("/api/geo");
        const data = await res.json();

        if (data.rates) setRates(data.rates);
        if (data.country) setCountry(data.country);

        // Use saved preference, or detected currency
        if (saved && data.rates[saved]) {
          setDisplayCurrency(saved);
        } else if (data.currency && data.rates[data.currency]) {
          setDisplayCurrency(data.currency);
        }
      } catch {
        // Use base currency on error
        if (saved) setDisplayCurrency(saved);
      } finally {
        setLoading(false);
      }
    }

    detectCurrency();
  }, []);

  const setCurrency = useCallback(
    (code: string) => {
      setDisplayCurrency(code);
      localStorage.setItem("preferred-currency", code);
    },
    []
  );

  const formatPrice = useCallback(
    (amount: number) => fmtPrice(amount, baseCurrency, displayCurrency, rates),
    [baseCurrency, displayCurrency, rates]
  );

  const convert = useCallback(
    (amount: number) => convertPrice(amount, baseCurrency, displayCurrency, rates),
    [baseCurrency, displayCurrency, rates]
  );

  return (
    <CurrencyContext.Provider
      value={{
        baseCurrency,
        displayCurrency,
        rates,
        country,
        formatPrice,
        convert,
        symbol: getSymbol(displayCurrency),
        setCurrency,
        isConverted: displayCurrency !== baseCurrency,
        loading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
