"use client";

import { useState, useRef, useEffect } from "react";
import { useCurrency } from "./currency-provider";
import { supportedDisplayCurrencies } from "@/lib/currency";
import { Globe } from "lucide-react";

export function CurrencySwitcher() {
  const { displayCurrency, setCurrency, isConverted, baseCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = supportedDisplayCurrencies.find((c) => c.code === displayCurrency);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 transition-colors hover:opacity-60 cursor-pointer"
        aria-label="Change currency"
        style={{ color: "var(--color-text, #1a1a1a)" }}
      >
        <Globe className="h-[16px] w-[16px]" strokeWidth={1.5} />
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.65rem",
            fontWeight: 500,
            letterSpacing: "0.08em",
          }}
        >
          {current?.symbol || displayCurrency}
        </span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-lg border shadow-xl"
          style={{
            backgroundColor: "var(--color-bg, #fff)",
            borderColor: "rgba(0,0,0,0.08)",
          }}
        >
          {supportedDisplayCurrencies.map((c) => (
            <button
              key={c.code}
              onClick={() => {
                setCurrency(c.code);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-black/[0.03] cursor-pointer"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.75rem",
                color:
                  c.code === displayCurrency
                    ? "var(--color-accent, #C5A059)"
                    : "var(--color-text, #1a1a1a)",
                fontWeight: c.code === displayCurrency ? 600 : 400,
              }}
            >
              <span>{c.label}</span>
              {c.code === baseCurrency && (
                <span
                  style={{
                    fontSize: "0.6rem",
                    color: "#999",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  base
                </span>
              )}
            </button>
          ))}

          {isConverted && (
            <div
              className="border-t px-3 py-2"
              style={{
                borderColor: "rgba(0,0,0,0.06)",
                fontFamily: "var(--font-body)",
                fontSize: "0.6rem",
                color: "#999",
              }}
            >
              Prices converted from {baseCurrency}. Charged in {baseCurrency} at checkout.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
