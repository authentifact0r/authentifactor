"use client";

import { TestimonialsSection } from "@/components/ui/testimonials-column";
import { useTenant } from "@/components/tenant-provider";

const defaultTestimonials = [
  { text: "Amazing quality products and fast delivery. I've been ordering regularly and the auto-ship subscription saves me so much time.", name: "Sarah T.", role: "Loyal Customer", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80&fit=crop&crop=face" },
  { text: "The online ordering experience is seamless. I love being able to browse, add to cart, and checkout in minutes.", name: "David K.", role: "Regular Shopper", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80&fit=crop&crop=face" },
  { text: "Finally found a store that stocks exactly what I've been looking for. The product range is fantastic.", name: "Amina J.", role: "Customer", image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&q=80&fit=crop&crop=face" },
  { text: "Great prices and excellent customer service. They always go above and beyond.", name: "Michael O.", role: "Verified Buyer", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80&fit=crop&crop=face" },
  { text: "The recipe section is genius — I found a recipe, clicked 'buy all ingredients', and everything was at my door the next day.", name: "Ngozi A.", role: "Home Chef", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80&fit=crop&crop=face" },
  { text: "I've recommended this store to all my friends. The quality is consistently excellent.", name: "Folake B.", role: "Customer since 2025", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80&fit=crop&crop=face" },
];

export function StorefrontTestimonials() {
  const tenant = useTenant();

  return (
    <TestimonialsSection
      title={`What our customers say`}
      subtitle={`Real reviews from people who shop at ${tenant.name}.`}
      columns={[
        { testimonials: defaultTestimonials.slice(0, 3), duration: 12 },
        { testimonials: defaultTestimonials.slice(3, 6), duration: 14 },
      ]}
    />
  );
}
