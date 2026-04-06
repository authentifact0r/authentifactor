"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Lock, ShieldCheck } from "lucide-react";
import { formatPrice } from "@/lib/utils";

// Load Stripe once
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || ""
);

interface StripePaymentFormProps {
  amount: number;
  currency: string;
  orderId?: string;
  orderNumber?: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}

function PaymentForm({
  amount,
  currency,
  onSuccess,
  onError,
}: {
  amount: number;
  currency: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    if (error) {
      onError(error.message || "Payment failed. Please try again.");
      setProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement
        options={{
          layout: "accordion",
          wallets: {
            applePay: "auto",
            googlePay: "auto",
          },
        }}
      />

      <Button
        type="submit"
        size="lg"
        className="w-full h-14 text-base font-semibold"
        disabled={!stripe || !elements || processing}
      >
        {processing ? (
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Pay {formatPrice(amount, currency)} securely
          </span>
        )}
      </Button>

      {/* Security assurance */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <ShieldCheck className="h-3.5 w-3.5" />
        <span>Secured by Stripe. Your card details are encrypted end-to-end.</span>
      </div>
    </form>
  );
}

export function StripePaymentForm({
  amount,
  currency,
  orderId,
  orderNumber,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function createIntent() {
      try {
        const res = await fetch("/api/checkout/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, currency, orderId, orderNumber }),
        });
        const data = await res.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          onError(data.error || "Failed to initialize payment");
        }
      } catch {
        onError("Network error initializing payment");
      } finally {
        setLoading(false);
      }
    }

    createIntent();
  }, [amount, currency, orderId, orderNumber, onError]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Preparing secure payment...
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Unable to initialize payment. Please try refreshing.
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#059669",
            borderRadius: "8px",
            fontFamily: "var(--font-body, Inter, sans-serif)",
          },
        },
      }}
    >
      <PaymentForm
        amount={amount}
        currency={currency}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}
