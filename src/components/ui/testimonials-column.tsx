"use client";

import React from "react";
import { motion } from "framer-motion";

export interface Testimonial {
  text: string;
  name: string;
  role: string;
  image: string;
}

export function TestimonialsColumn({
  className,
  testimonials,
  duration = 10,
}: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) {
  return (
    <div className={className}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[...Array(2)].map((_, index) => (
          <React.Fragment key={index}>
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl border border-gray-200 bg-white shadow-sm max-w-xs w-full"
              >
                <p className="text-sm text-gray-600 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 mt-5">
                  <img
                    src={t.image}
                    alt={t.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{t.name}</p>
                    <p className="text-xs text-gray-500 leading-tight">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}

export function TestimonialsSection({
  title,
  subtitle,
  columns,
}: {
  title: string;
  subtitle: string;
  columns: { testimonials: Testimonial[]; duration?: number }[];
}) {
  return (
    <section className="py-20 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          <p className="mt-3 text-gray-500 max-w-lg mx-auto">{subtitle}</p>
        </div>
      </div>
      <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)] max-h-[600px]">
        {columns.map((col, i) => (
          <TestimonialsColumn
            key={i}
            testimonials={col.testimonials}
            duration={col.duration}
            className="hidden md:block"
          />
        ))}
        {/* Mobile: show first column only */}
        <TestimonialsColumn
          testimonials={columns[0].testimonials}
          duration={columns[0].duration}
          className="md:hidden"
        />
      </div>
    </section>
  );
}
