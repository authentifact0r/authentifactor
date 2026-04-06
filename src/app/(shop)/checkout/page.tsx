"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Truck, AlertTriangle, CreditCard, Lock, CheckCircle, ShieldCheck, Wallet } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, totalWeight, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingMethod, setShippingMethod] = useState("STANDARD");
  const [paymentProvider, setPaymentProvider] = useState<"PAYSTACK" | "STRIPE">("PAYSTACK");

  // Address form state
  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    line1: "",
    city: "",
    state: "",
    postcode: "",
    phone: "",
  });

  const shippingCosts: Record<string, number> = {
    STANDARD: 1500 + Math.max(0, totalWeight() - 5) * 200,
    EXPRESS: 3500 + Math.max(0, totalWeight() - 5) * 200,
    LOCAL_VAN: 2000,
    LOCAL_FRESH: 1000,
  };

  const shippingCost = shippingCosts[shippingMethod] || 0;
  const total = subtotal() + shippingCost;
  const hasPerishables = items.some((i) => i.product?.isPerishable);

  const isAddressValid =
    address.firstName &&
    address.lastName &&
    address.line1 &&
    address.city &&
    address.state &&
    address.postcode &&
    address.phone;

  const handlePlaceOrder = async () => {
    if (!isAddressValid) {
      setError("Please fill in all address fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          shippingMethod,
          paymentProvider,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // If we got a payment URL (Paystack), redirect there
      if (data.paymentUrl) {
        clearCart();
        window.location.href = data.paymentUrl;
        return;
      }

      // Otherwise, order placed successfully
      clearCart();
      router.push(`/checkout/success?order=${data.orderNumber}`);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-gray-500">Add some products before checkout.</p>
        <Button className="mt-6" onClick={() => router.push("/products")}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1
        className="text-2xl"
        style={{
          fontFamily: "var(--font-heading, Georgia), serif",
          fontStyle: "italic",
          fontWeight: 400,
        }}
      >
        Checkout
      </h1>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Step 1: Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">1. Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Input
                placeholder="First Name"
                required
                value={address.firstName}
                onChange={(e) => setAddress({ ...address, firstName: e.target.value })}
              />
              <Input
                placeholder="Last Name"
                required
                value={address.lastName}
                onChange={(e) => setAddress({ ...address, lastName: e.target.value })}
              />
              <Input
                placeholder="Address Line 1"
                required
                className="sm:col-span-2"
                value={address.line1}
                onChange={(e) => setAddress({ ...address, line1: e.target.value })}
              />
              <Input
                placeholder="City"
                required
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
              />
              <Input
                placeholder="State"
                required
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
              />
              <Input
                placeholder="Postcode"
                required
                value={address.postcode}
                onChange={(e) => setAddress({ ...address, postcode: e.target.value })}
              />
              <Input
                placeholder="Phone"
                type="tel"
                required
                value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
              />
            </CardContent>
          </Card>

          {/* Step 2: Shipping */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="h-4 w-4" /> 2. Shipping Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {hasPerishables && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
                  <div>
                    <p className="font-medium text-amber-800">
                      Your cart contains perishable items
                    </p>
                    <p className="text-amber-600">
                      Perishable items require local delivery. If you are outside our local delivery area, these items will need to be removed.
                    </p>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-500">
                Cart weight: {totalWeight().toFixed(1)} kg
              </p>

              {[
                { id: "STANDARD", name: "Standard Shipping", desc: "5-7 business days", cost: shippingCosts.STANDARD },
                { id: "EXPRESS", name: "Express Shipping", desc: "1-2 business days", cost: shippingCosts.EXPRESS },
                { id: "LOCAL_VAN", name: "Local Van Delivery", desc: "Same-day (heavy items)", cost: shippingCosts.LOCAL_VAN },
                { id: "LOCAL_FRESH", name: "Local Fresh Delivery", desc: "Same-day (perishables)", cost: shippingCosts.LOCAL_FRESH },
              ].map((method) => (
                <label
                  key={method.id}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors ${
                    shippingMethod === method.id
                      ? "border-emerald-600 bg-emerald-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      value={method.id}
                      checked={shippingMethod === method.id}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      className="accent-emerald-800"
                    />
                    <div>
                      <p className="text-sm font-medium">{method.name}</p>
                      <p className="text-xs text-gray-500">{method.desc}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatPrice(method.cost)}
                  </span>
                </label>
              ))}
            </CardContent>
          </Card>

          {/* Step 3: Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> 3. Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Payment provider selection — styled as cards */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentProvider("PAYSTACK")}
                  className={`flex h-16 cursor-pointer items-center justify-center gap-2.5 rounded-xl border-2 transition-all ${
                    paymentProvider === "PAYSTACK"
                      ? "border-emerald-600 bg-emerald-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {/* Paystack icon */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M2 4h20v3H2V4zm0 5h20v3H2V9zm0 5h14v3H2v-3zm0 5h14v3H2v-3z" fill="#00C3F7"/>
                  </svg>
                  <span className="text-sm font-semibold text-gray-800">Paystack</span>
                  {paymentProvider === "PAYSTACK" && (
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentProvider("STRIPE")}
                  className={`flex h-16 cursor-pointer items-center justify-center gap-2.5 rounded-xl border-2 transition-all ${
                    paymentProvider === "STRIPE"
                      ? "border-indigo-600 bg-indigo-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {/* Stripe icon */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.918 3.757 7.098c0 4.46 2.72 5.946 5.508 6.98 2.172.787 2.889 1.426 2.889 2.333 0 .974-.772 1.457-2.21 1.457-1.901 0-4.81-.953-6.676-2.21l-.89 5.56C4.151 22.455 7.047 24 10.937 24c2.594 0 4.673-.635 6.158-1.91 1.621-1.38 2.428-3.206 2.428-5.58.057-4.554-2.747-5.994-5.547-7.06z" fill="#635BFF"/>
                  </svg>
                  <span className="text-sm font-semibold text-gray-800">Stripe</span>
                  {paymentProvider === "STRIPE" && (
                    <CheckCircle className="h-4 w-4 text-indigo-600" />
                  )}
                </button>
              </div>

              {/* Separator */}
              <div className="flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-xs font-medium text-gray-400 shrink-0">
                  secure checkout
                </span>
                <Separator className="flex-1" />
              </div>

              {/* Payment info */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {paymentProvider === "PAYSTACK" ? "Paystack Secure Checkout" : "Stripe Secure Checkout"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      You'll be redirected to {paymentProvider === "PAYSTACK" ? "Paystack" : "Stripe"} to enter your card details securely. Your card information never touches our servers.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-1">
                  {/* Card brand icons */}
                  {["Visa", "Mastercard", "Amex"].map((brand) => (
                    <span key={brand} className="rounded border border-gray-200 bg-white px-2 py-1 text-[10px] font-medium text-gray-500">
                      {brand}
                    </span>
                  ))}
                  {paymentProvider === "PAYSTACK" && (
                    <span className="rounded border border-gray-200 bg-white px-2 py-1 text-[10px] font-medium text-gray-500">
                      Bank Transfer
                    </span>
                  )}
                </div>
              </div>

              {/* Place Order button */}
              <Button
                size="lg"
                className="w-full h-14 text-base font-semibold"
                disabled={loading || !isAddressValid}
                onClick={handlePlaceOrder}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Pay {formatPrice(total)} securely
                  </span>
                )}
              </Button>

              {!isAddressValid && (
                <p className="text-xs text-gray-400 text-center">
                  Please fill in your shipping address to continue
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-gray-700 line-clamp-1">
                    {item.product?.name} &times; {item.quantity}
                  </span>
                  <span className="font-medium">
                    {formatPrice(
                      parseFloat(item.product?.price || "0") * item.quantity
                    )}
                  </span>
                </div>
              ))}
              <hr />
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatPrice(subtotal())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span>{formatPrice(shippingCost)}</span>
              </div>
              <hr />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
