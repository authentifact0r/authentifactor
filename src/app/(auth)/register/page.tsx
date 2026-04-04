"use client";

import Link from "next/link";
import Image from "next/image";
import { GradientBackground } from "@/components/ui/gradient-background";
import { ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const { registerAction } = await import("@/actions/auth");
      await registerAction(formData);
    } catch (err) {
      console.error("Register error:", err);
    }
  };

  return (
    <GradientBackground>
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md p-10 bg-white/[0.08] backdrop-blur-2xl rounded-3xl border border-white/[0.12] shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
          {/* Logo */}
          <div className="text-center mb-8">
            <Image
              src="/images/authentifactor-logo.png"
              alt="Authentifactor"
              width={375}
              height={375}
              className="mx-auto h-20 w-auto"
            />
            <h2 className="mt-5 text-3xl font-bold text-white tracking-tight">Create your account</h2>
            <p className="mt-2 text-base text-white/60">Join the Authentifactor platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-firstName" className="block text-sm font-medium text-white/80 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="reg-firstName"
                  name="firstName"
                  placeholder="John"
                  required
                  className="w-full h-12 px-4 rounded-xl bg-white/[0.06] border border-white/[0.12] text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition"
                />
              </div>
              <div>
                <label htmlFor="reg-lastName" className="block text-sm font-medium text-white/80 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="reg-lastName"
                  name="lastName"
                  placeholder="Doe"
                  required
                  className="w-full h-12 px-4 rounded-xl bg-white/[0.06] border border-white/[0.12] text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-white/80 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="reg-email"
                name="email"
                placeholder="you@company.com"
                required
                className="w-full h-12 px-4 rounded-xl bg-white/[0.06] border border-white/[0.12] text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="reg-phone" className="block text-sm font-medium text-white/80 mb-2">
                Phone <span className="text-white/30">(optional)</span>
              </label>
              <input
                type="tel"
                id="reg-phone"
                name="phone"
                placeholder="+44 7700 900000"
                className="w-full h-12 px-4 rounded-xl bg-white/[0.06] border border-white/[0.12] text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-white/80 mb-2">
                Password
              </label>
              <input
                type="password"
                id="reg-password"
                name="password"
                placeholder="Min 8 characters"
                minLength={8}
                required
                className="w-full h-12 px-4 rounded-xl bg-white/[0.06] border border-white/[0.12] text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="group w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base transition-all duration-200"
            >
              Create Account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-white/10" />
              <span className="px-4 text-sm text-white/40">or</span>
              <div className="flex-grow border-t border-white/10" />
            </div>

            {/* Google */}
            <button
              type="button"
              className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-gray-100 text-gray-800 font-semibold text-base transition-all duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 8.841C34.553 4.806 29.613 2.5 24 2.5C11.983 2.5 2.5 11.983 2.5 24s9.483 21.5 21.5 21.5S45.5 36.017 45.5 24c0-1.538-.135-3.022-.389-4.417z" />
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12.5 24 12.5c3.059 0 5.842 1.154 7.961 3.039l5.839-5.841C34.553 4.806 29.613 2.5 24 2.5C16.318 2.5 9.642 6.723 6.306 14.691z" />
                <path fill="#4CAF50" d="M24 45.5c5.613 0 10.553-2.306 14.802-6.341l-5.839-5.841C30.842 35.846 27.059 38 24 38c-5.039 0-9.345-2.608-11.124-6.481l-6.571 4.819C9.642 41.277 16.318 45.5 24 45.5z" />
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l5.839 5.841C44.196 35.123 45.5 29.837 45.5 24c0-1.538-.135-3.022-.389-4.417z" />
              </svg>
              Continue with Google
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-white/50">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </GradientBackground>
  );
}
