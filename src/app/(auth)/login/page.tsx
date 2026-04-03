"use client";

import Link from "next/link";
import Image from "next/image";
import { SmokeyBackground } from "@/components/ui/smokey-background";
import { User, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // Call server action via fetch or import
    try {
      const { loginAction } = await import("@/actions/auth");
      await loginAction(formData);
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <main className="relative w-full min-h-screen bg-gray-950">
      {/* Smokey WebGL Background */}
      <SmokeyBackground color="#059669" />

      {/* Login Form */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm p-8 space-y-6 bg-white/[0.07] backdrop-blur-xl rounded-2xl border border-white/[0.12] shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
          {/* Logo + Header */}
          <div className="text-center">
            <div className="mx-auto mb-4">
              <Image
                src="/images/authentifactor-logo.png"
                alt="Authentifactor"
                width={375}
                height={375}
                className="mx-auto h-24 w-auto"
              />
            </div>
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="mt-1 text-sm text-white/40">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="relative z-0">
              <input
                type="email"
                id="login-email"
                name="email"
                className="block w-full py-2.5 px-0 text-sm text-white bg-transparent border-0 border-b-2 border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-emerald-400 peer"
                placeholder=" "
                required
              />
              <label
                htmlFor="login-email"
                className="absolute text-sm text-white/40 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-emerald-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              >
                <User className="inline-block mr-2 -mt-1" size={14} />
                Email Address
              </label>
            </div>

            {/* Password */}
            <div className="relative z-0">
              <input
                type="password"
                id="login-password"
                name="password"
                className="block w-full py-2.5 px-0 text-sm text-white bg-transparent border-0 border-b-2 border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-emerald-400 peer"
                placeholder=" "
                required
              />
              <label
                htmlFor="login-password"
                className="absolute text-sm text-white/40 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-emerald-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              >
                <Lock className="inline-block mr-2 -mt-1" size={14} />
                Password
              </label>
            </div>

            <div className="flex items-center justify-between">
              <a href="#" className="text-xs text-white/30 hover:text-white transition">
                Forgot Password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="group w-full flex items-center justify-center py-3 px-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300"
            >
              Sign In
              <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-white/10" />
              <span className="flex-shrink mx-4 text-white/30 text-xs">OR CONTINUE WITH</span>
              <div className="flex-grow border-t border-white/10" />
            </div>

            {/* Google Login */}
            <button
              type="button"
              className="w-full flex items-center justify-center py-2.5 px-4 bg-white/90 hover:bg-white rounded-xl text-gray-700 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 8.841C34.553 4.806 29.613 2.5 24 2.5C11.983 2.5 2.5 11.983 2.5 24s9.483 21.5 21.5 21.5S45.5 36.017 45.5 24c0-1.538-.135-3.022-.389-4.417z" />
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12.5 24 12.5c3.059 0 5.842 1.154 7.961 3.039l5.839-5.841C34.553 4.806 29.613 2.5 24 2.5C16.318 2.5 9.642 6.723 6.306 14.691z" />
                <path fill="#4CAF50" d="M24 45.5c5.613 0 10.553-2.306 14.802-6.341l-5.839-5.841C30.842 35.846 27.059 38 24 38c-5.039 0-9.345-2.608-11.124-6.481l-6.571 4.819C9.642 41.277 16.318 45.5 24 45.5z" />
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l5.839 5.841C44.196 35.123 45.5 29.837 45.5 24c0-1.538-.135-3.022-.389-4.417z" />
              </svg>
              Sign in with Google
            </button>
          </form>

          <p className="text-center text-xs text-white/30">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-emerald-400 hover:text-emerald-300 transition">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
