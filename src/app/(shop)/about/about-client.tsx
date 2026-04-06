"use client";

import Image from "next/image";
import { ScrollReveal } from "@/components/shop/scroll-reveal";

interface Props {
  name: string;
  story: string;
  image: string | null;
  accentColor: string;
  textColor: string;
  backgroundColor: string;
  tagline: string | null;
}

export function AboutPageClient({
  name,
  story,
  image,
  accentColor,
  textColor,
  backgroundColor,
  tagline,
}: Props) {
  // Split story into paragraphs
  const paragraphs = story.split("\n\n").filter(Boolean);

  return (
    <div style={{ backgroundColor }}>
      {/* Hero */}
      <section className="relative flex min-h-[50vh] items-center justify-center overflow-hidden">
        {image && (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center px-6">
          <ScrollReveal>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.7rem",
                fontWeight: 500,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Our Story
            </p>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <h1
              className="mt-4"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: 400,
                fontStyle: "italic",
                color: "#FFFFFF",
                lineHeight: 1.2,
              }}
            >
              {name}
            </h1>
          </ScrollReveal>
          {tagline && (
            <ScrollReveal delay={200}>
              <p
                className="mt-4 max-w-lg mx-auto"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.85rem",
                  fontWeight: 300,
                  color: "rgba(255,255,255,0.8)",
                  letterSpacing: "0.04em",
                  lineHeight: 1.7,
                }}
              >
                {tagline}
              </p>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* Story content */}
      <section className="mx-auto max-w-2xl px-6 py-20">
        {paragraphs.map((para, i) => (
          <ScrollReveal key={i} delay={i * 80}>
            <p
              className="mb-8 last:mb-0"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "1rem",
                fontWeight: 300,
                lineHeight: 2,
                color: textColor,
                letterSpacing: "0.02em",
              }}
            >
              {para}
            </p>
          </ScrollReveal>
        ))}

        {/* Accent line */}
        <ScrollReveal delay={paragraphs.length * 80}>
          <div className="mt-12 flex justify-center">
            <div
              className="h-px w-16"
              style={{ backgroundColor: accentColor }}
            />
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
