import Link from "next/link";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-gray-950">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/platform" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-sm font-bold text-white">
              A
            </div>
            <span className="text-lg font-bold text-white">
              Authentifactor
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-gray-400 transition-colors hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/platform/onboard"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
            >
              Start Your Store
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t bg-gray-950 py-10">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500 text-xs font-bold text-white">
              A
            </div>
            <span className="text-sm font-semibold text-white">
              Authentifactor
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Powered by Authentifactor. The platform for African food retail.
          </p>
        </div>
      </footer>
    </div>
  );
}
