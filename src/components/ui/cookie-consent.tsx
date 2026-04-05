"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-lg rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.1)]"
        >
          <button onClick={decline} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
          <p className="text-sm text-gray-700 leading-relaxed pr-6">
            We use cookies to improve your experience and analyse platform usage.
            See our{" "}
            <Link href="/legal/cookies" className="text-emerald-600 hover:underline font-medium">
              Cookie Policy
            </Link>{" "}
            and{" "}
            <Link href="/legal/privacy" className="text-emerald-600 hover:underline font-medium">
              Privacy Policy
            </Link>.
          </p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={accept}
              className="rounded-xl bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition"
            >
              Accept All
            </button>
            <button
              onClick={decline}
              className="rounded-xl border border-gray-200 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Essential Only
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
