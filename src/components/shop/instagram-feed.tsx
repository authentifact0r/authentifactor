"use client";

import { useTenant } from "@/components/tenant-provider";
import { Instagram } from "lucide-react";

/**
 * Instagram feed section — displays a CTA linking to the tenant's Instagram.
 * For a full embedded feed, you'd integrate the Instagram Basic Display API
 * or use a service like Elfsight. This provides the brand section + link.
 */
export function InstagramFeed() {
  const tenant = useTenant();

  if (!tenant.instagramHandle) return null;

  const handle = tenant.instagramHandle.replace("@", "");
  const url = `https://instagram.com/${handle}`;

  return (
    <section
      className="py-16"
      style={{ backgroundColor: tenant.backgroundColor }}
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8 text-center">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 transition-opacity hover:opacity-70"
        >
          <Instagram
            className="h-6 w-6"
            style={{ color: tenant.textColor }}
            strokeWidth={1.5}
          />
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.5rem",
              fontWeight: 500,
              fontStyle: "italic",
              color: tenant.textColor,
              letterSpacing: "0.02em",
            }}
          >
            @{handle}
          </span>
        </a>
        <p
          className="mt-3"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.8rem",
            fontWeight: 400,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#777",
          }}
        >
          Follow us for new arrivals and styling inspiration
        </p>

        {/* Placeholder grid — replace with real API integration */}
        <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="group aspect-square overflow-hidden bg-gray-100"
            >
              <div
                className="h-full w-full transition-all duration-500 group-hover:scale-105 group-hover:opacity-80"
                style={{
                  backgroundColor: `${tenant.accentColor}${(10 + i * 5).toString(16)}`,
                }}
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
