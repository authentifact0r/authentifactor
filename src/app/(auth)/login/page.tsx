"use client";

import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { apiUrl } from "@/lib/api";

interface TenantBrand {
  name: string;
  logo: string | null;
  primaryColor: string;
  accentColor: string;
  tagline: string | null;
}

// Fashion imagery for the collage (tenant-aware in future)
const collageImages = [
  { src: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80&fit=crop", alt: "Evening dress" },
  { src: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&q=80&fit=crop", alt: "Gold earrings" },
  { src: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80&fit=crop", alt: "Luxury handbag" },
  { src: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80&fit=crop", alt: "Fashion outfit" },
];

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tenant, setTenant] = useState<TenantBrand | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mounted, setMounted] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeout(() => setFormVisible(true), 300);
    fetch(apiUrl("/api/tenant/brand"))
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.tenant) setTenant(data.tenant); })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please enter email and password");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid email or password"); setLoading(false); return; }
      window.location.replace(data.redirectTo || "/admin");
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  };

  const brandName = tenant?.name || "Authentifactor";
  const accent = tenant?.accentColor || "#C5A059";
  const isTenant = !!tenant;

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full bg-[#F9F7F2]">
      <div className="flex min-h-screen items-center justify-center p-4 md:p-0">
        <div
          className={`w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl shadow-gray-200/50 transition-all duration-500 ${formVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        >
          <div className="flex flex-col md:flex-row">

            {/* Left side — Fashion imagery collage */}
            <div className="hidden md:flex w-full md:w-1/2 bg-[#F5F0E8] p-4 items-center">
              <div className="grid grid-cols-3 grid-rows-2 gap-2.5 w-full" style={{ height: "420px" }}>
                {/* Image 1 — Dress */}
                <div className="overflow-hidden rounded-xl row-span-2">
                  <img src={collageImages[0].src} alt={collageImages[0].alt} className="w-full h-full object-cover" />
                </div>

                {/* Stat card */}
                <div
                  className="rounded-xl flex flex-col justify-center items-center p-3 text-white"
                  style={{
                    backgroundColor: accent,
                    transform: formVisible ? "translateY(0)" : "translateY(20px)",
                    opacity: formVisible ? 1 : 0,
                    transition: "transform 0.6s ease-out, opacity 0.6s ease-out",
                    transitionDelay: "0.2s",
                  }}
                >
                  <h2 className="text-3xl font-bold mb-0.5" style={{ fontFamily: "var(--font-display, Georgia), serif" }}>13+</h2>
                  <p className="text-center text-[10px] leading-tight opacity-90">Curated pieces</p>
                </div>

                {/* Image 2 — Earrings */}
                <div className="overflow-hidden rounded-xl">
                  <img src={collageImages[1].src} alt={collageImages[1].alt} className="w-full h-full object-cover" />
                </div>

                {/* Image 3 — Handbag */}
                <div className="overflow-hidden rounded-xl">
                  <img src={collageImages[2].src} alt={collageImages[2].alt} className="w-full h-full object-cover" />
                </div>

                {/* Image 4 — Fashion */}
                <div className="overflow-hidden rounded-xl">
                  <img src={collageImages[3].src} alt={collageImages[3].alt} className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Right side — Sign in form */}
            <div
              className="w-full md:w-1/2 p-8 md:p-10 bg-white flex flex-col justify-center"
              style={{
                transform: formVisible ? "translateX(0)" : "translateX(20px)",
                opacity: formVisible ? 1 : 0,
                transition: "transform 0.6s ease-out, opacity 0.6s ease-out",
              }}
            >
              {/* Header */}
              <div className="mb-8">
                {tenant?.logo ? (
                  <img src={tenant.logo} alt={brandName} className="h-10 w-auto object-contain mb-6" />
                ) : isTenant ? (
                  <h1 className="text-2xl mb-6" style={{ fontFamily: "var(--font-display, Georgia), serif", fontStyle: "italic", color: "#1a1a1a" }}>
                    {brandName}
                  </h1>
                ) : (
                  <Image src="/images/authentifactor-logo.png" alt="Authentifactor" width={150} height={40} className="h-8 w-auto mb-6" />
                )}

                <h2 className="text-xl font-semibold text-[#1a1a1a] mb-1">
                  {isTenant ? "Welcome back" : "Sign in"}
                </h2>
                <p className="text-sm text-[#777]">
                  {tenant?.tagline || "Enter your credentials to access your dashboard."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
                )}

                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Email Address</label>
                  <input
                    type="email"
                    id="login-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="block w-full rounded-lg border border-gray-300 py-3 px-4 text-sm text-[#1a1a1a] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
                    style={{ focusRingColor: accent } as any}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="login-password" className="block text-sm font-medium text-[#1a1a1a]">Password</label>
                    <a href="#" className="text-xs font-medium transition" style={{ color: accent }}>Forgot password?</a>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="login-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      className="block w-full rounded-lg border border-gray-300 py-3 px-4 pr-10 text-sm text-[#1a1a1a] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-lg py-3 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: accent }}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : "Sign In"}
                </button>

                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-gray-200" />
                  <span className="flex-shrink mx-4 text-xs text-gray-400 uppercase tracking-wider">or</span>
                  <div className="flex-grow border-t border-gray-200" />
                </div>

                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Sign in with Google
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-gray-400">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-medium transition" style={{ color: accent }}>Create one</Link>
              </p>

              {isTenant && (
                <p className="mt-4 text-center text-[9px] text-gray-300 tracking-wide">
                  Powered by Authentifactor
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
