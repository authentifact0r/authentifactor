"use client";

import React from "react";

const techCards = [
  {
    title: "Next.js & React 19",
    description: "Server components, app router, and streaming for blazing-fast multi-tenant storefronts.",
    logos: [
      { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg", name: "Next.js" },
      { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg", name: "React" },
    ],
    bg: "from-gray-900 to-gray-800",
  },
  {
    title: "TypeScript & Tailwind",
    description: "Type-safe code with utility-first CSS for rapid, maintainable frontend development.",
    logos: [
      { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg", name: "TypeScript" },
      { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg", name: "Tailwind" },
    ],
    bg: "from-blue-950 to-blue-900",
  },
  {
    title: "PostgreSQL & Prisma",
    description: "Schema-first ORM with tenant-scoped data isolation, migrations, and type-safe queries.",
    logos: [
      { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg", name: "PostgreSQL" },
      { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/prisma/prisma-original.svg", name: "Prisma" },
    ],
    bg: "from-indigo-950 to-indigo-900",
  },
];

export function TechStackSection() {
  return (
    <section className="w-full bg-[#1e1e1e] py-20 md:py-28">
      {/* Feature Cards */}
      <div className="text-center max-w-2xl mx-auto mb-12 px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff8f70] mb-3">
          Technology
        </p>
        <h1 className="text-3xl font-semibold text-[#f0ede8] tracking-tight">
          Our Technology Stack
        </h1>
        <p className="text-sm text-[#9e9a94] mt-2">
          Battle-tested, modern infrastructure powering every Authentifactor product — from e-commerce to clinical platforms.
        </p>
      </div>

      <div className="flex flex-wrap items-start justify-center gap-10 px-6">
        {techCards.map((card) => (
          <div
            key={card.title}
            className="max-w-80 hover:-translate-y-1 transition duration-300"
          >
            <div className={`rounded-xl w-full h-52 bg-gradient-to-br ${card.bg} flex items-center justify-center gap-6 p-8`}>
              {card.logos.map((logo) => (
                <div key={logo.name} className="flex flex-col items-center gap-2">
                  <img
                    src={logo.src}
                    alt={logo.name}
                    className="h-16 w-16 drop-shadow-lg"
                  />
                  <span className="text-[11px] font-medium text-white/50 tracking-wide">
                    {logo.name}
                  </span>
                </div>
              ))}
            </div>
            <h3 className="text-base font-semibold text-[#f0ede8] mt-4">
              {card.title}
            </h3>
            <p className="text-sm text-[#9e9a94] mt-1">
              {card.description}
            </p>
          </div>
        ))}
      </div>

      {/* Trusted By — showcase images */}
      <div className="max-w-6xl mx-auto mt-20 px-6">
        <p className="bg-gradient-to-r from-[#f0ede8] to-[#ff8f70] text-transparent bg-clip-text text-3xl text-left max-w-2xl font-semibold tracking-tight">
          Trusted by 100+ clients worldwide.
        </p>
        <div className="flex flex-col-reverse md:flex-row items-center justify-center max-h-[450px] gap-6 mt-6">
          <img
            src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/features/image-7.svg"
            alt="Technology showcase"
            className="hover:-translate-y-1 transition-all duration-300"
          />
          <img
            src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/features/image-8.svg"
            alt="Technology showcase"
            className="hover:-translate-y-1 transition-all duration-300 max-md:w-full"
          />
        </div>
      </div>
    </section>
  );
}
