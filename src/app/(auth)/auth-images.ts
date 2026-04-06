// Tenant-aware collage images by vertical — shared between login and register pages

export const verticalImages: Record<string, { src: string; alt: string }[]> = {
  fashion: [
    { src: "/images/collage/white-dress.png", alt: "White draped evening dress" },
    { src: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&q=80&fit=crop", alt: "Gold earrings" },
    { src: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80&fit=crop", alt: "Luxury handbag" },
    { src: "/images/collage/yellow-dress.png", alt: "Soleil yellow tulip mini dress" },
  ],
  grocery: [
    { src: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80&fit=crop", alt: "Fresh produce" },
    { src: "https://images.unsplash.com/photo-1506484381205-f7945b68db56?w=600&q=80&fit=crop", alt: "Spices" },
    { src: "https://images.unsplash.com/photo-1573246123716-6b1782bfc499?w=600&q=80&fit=crop", alt: "Vegetables" },
    { src: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600&q=80&fit=crop", alt: "African ingredients" },
  ],
  catering: [
    { src: "https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80&fit=crop", alt: "Catering platter" },
    { src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80&fit=crop", alt: "Fine dining" },
    { src: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80&fit=crop", alt: "Food preparation" },
    { src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80&fit=crop", alt: "Gourmet dish" },
  ],
  beauty: [
    { src: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80&fit=crop", alt: "Beauty products" },
    { src: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80&fit=crop", alt: "Skincare" },
    { src: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80&fit=crop", alt: "Cosmetics" },
    { src: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=80&fit=crop", alt: "Natural beauty" },
  ],
  education: [
    { src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80&fit=crop", alt: "Learning" },
    { src: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80&fit=crop", alt: "Books" },
    { src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80&fit=crop", alt: "Classroom" },
    { src: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=80&fit=crop", alt: "Students" },
  ],
};

// Default platform images (for authentifactor.com login/register)
export const platformImages = [
  { src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80&fit=crop", alt: "Dashboard analytics" },
  { src: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&q=80&fit=crop", alt: "Team collaboration" },
  { src: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80&fit=crop", alt: "Digital platform" },
  { src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80&fit=crop", alt: "Technology" },
];

export function getAuthImages(vertical: string | null | undefined, isTenant: boolean) {
  if (isTenant && vertical) {
    return verticalImages[vertical] || platformImages;
  }
  return platformImages;
}
