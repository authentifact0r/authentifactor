export interface TenantTemplate {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  colorScheme: {
    primaryColor: string;
    accentColor: string;
  };
  defaultCategories: string[];
  shippingMethods: Array<{
    name: string;
    method: "LOCAL_FRESH" | "STANDARD" | "EXPRESS" | "LOCAL_VAN" | "DHL";
    minWeightKg: number;
    maxWeightKg: number;
    baseCost: number;
    perKgCost: number;
    estimatedDays: number;
  }>;
  sampleProducts: Array<{
    name: string;
    sku: string;
    slug: string;
    description: string;
    category: string;
    price: number;
    weightKg: number;
    isPerishable: boolean;
    isSubscribable: boolean;
    tags: string[];
  }>;
}

export const TENANT_TEMPLATES: Record<string, TenantTemplate> = {
  grocery: {
    id: "grocery",
    name: "Grocery & Food",
    description: "African grocery, spices, fresh produce, and pantry staples",
    icon: "🛒",
    colorScheme: {
      primaryColor: "#064E3B",
      accentColor: "#F59E0B",
    },
    defaultCategories: [
      "Staples & Grains",
      "Spices & Seasonings",
      "Sauces & Condiments",
      "Drinks & Beverages",
      "Snacks",
      "Fresh & Frozen",
      "Cooking Oils",
      "Flour & Baking",
    ],
    shippingMethods: [
      { name: "Local Fresh Delivery", method: "LOCAL_FRESH", minWeightKg: 0, maxWeightKg: 30, baseCost: 5.99, perKgCost: 0.50, estimatedDays: 1 },
      { name: "Standard Shipping", method: "STANDARD", minWeightKg: 0, maxWeightKg: 25, baseCost: 4.99, perKgCost: 0.80, estimatedDays: 3 },
      { name: "Express Shipping", method: "EXPRESS", minWeightKg: 0, maxWeightKg: 20, baseCost: 9.99, perKgCost: 1.20, estimatedDays: 1 },
    ],
    sampleProducts: [
      { name: "Jollof Rice Spice Mix", sku: "SPICE-JOLLOF-001", slug: "jollof-rice-spice-mix", description: "Authentic West African jollof rice seasoning blend.", category: "Spices & Seasonings", price: 4.99, weightKg: 0.15, isPerishable: false, isSubscribable: true, tags: ["nigerian", "spice", "staple"] },
      { name: "Palm Oil (1L)", sku: "OIL-PALM-001", slug: "palm-oil-1l", description: "Pure unrefined red palm oil, perfect for soups and stews.", category: "Cooking Oils", price: 6.99, weightKg: 1.05, isPerishable: false, isSubscribable: true, tags: ["nigerian", "oil", "staple"] },
      { name: "Garri (White, 2kg)", sku: "STAPLE-GARRI-001", slug: "garri-white-2kg", description: "Premium white garri, finely processed cassava flakes.", category: "Staples & Grains", price: 5.49, weightKg: 2.0, isPerishable: false, isSubscribable: true, tags: ["nigerian", "staple", "cassava"] },
    ],
  },

  fashion: {
    id: "fashion",
    name: "Fashion & Textiles",
    description: "Clothing, accessories, African prints, and bespoke fashion",
    icon: "👗",
    colorScheme: {
      primaryColor: "#1C1917",
      accentColor: "#D4AF37",
    },
    defaultCategories: [
      "Dresses & Gowns",
      "Tops & Blouses",
      "Trousers & Skirts",
      "Accessories",
      "Shoes & Bags",
      "Fabric & Textiles",
      "Men's Wear",
      "Children's Wear",
    ],
    shippingMethods: [
      { name: "Standard Shipping", method: "STANDARD", minWeightKg: 0, maxWeightKg: 10, baseCost: 4.99, perKgCost: 1.00, estimatedDays: 3 },
      { name: "Express Shipping", method: "EXPRESS", minWeightKg: 0, maxWeightKg: 10, baseCost: 8.99, perKgCost: 1.50, estimatedDays: 1 },
      { name: "International (DHL)", method: "DHL", minWeightKg: 0, maxWeightKg: 15, baseCost: 14.99, perKgCost: 3.00, estimatedDays: 5 },
    ],
    sampleProducts: [
      { name: "Ankara Print Dress", sku: "DRESS-ANKARA-001", slug: "ankara-print-dress", description: "Vibrant African print A-line dress with puff sleeves.", category: "Dresses & Gowns", price: 65.00, weightKg: 0.4, isPerishable: false, isSubscribable: false, tags: ["ankara", "dress", "african-print"] },
      { name: "Embroidered Agbada Set", sku: "MENS-AGBADA-001", slug: "embroidered-agbada-set", description: "Hand-embroidered 3-piece agbada set for special occasions.", category: "Men's Wear", price: 120.00, weightKg: 1.2, isPerishable: false, isSubscribable: false, tags: ["agbada", "menswear", "traditional"] },
    ],
  },

  catering: {
    id: "catering",
    name: "Catering & Meal Prep",
    description: "Meal prep, catering orders, party packs, and event food",
    icon: "🍽️",
    colorScheme: {
      primaryColor: "#7C2D12",
      accentColor: "#EA580C",
    },
    defaultCategories: [
      "Party Packs",
      "Meal Prep Boxes",
      "Soups & Stews",
      "Rice Dishes",
      "Grilled & BBQ",
      "Desserts & Pastries",
      "Drinks & Smoothies",
      "Catering Platters",
    ],
    shippingMethods: [
      { name: "Local Fresh Delivery", method: "LOCAL_FRESH", minWeightKg: 0, maxWeightKg: 20, baseCost: 7.99, perKgCost: 0.60, estimatedDays: 1 },
      { name: "Local Van (Bulk)", method: "LOCAL_VAN", minWeightKg: 5, maxWeightKg: 100, baseCost: 15.00, perKgCost: 0.30, estimatedDays: 1 },
    ],
    sampleProducts: [
      { name: "Jollof Rice Party Pack (10 portions)", sku: "PARTY-JOLLOF-010", slug: "jollof-rice-party-pack-10", description: "Perfectly seasoned jollof rice, serves 10 guests.", category: "Party Packs", price: 45.00, weightKg: 5.0, isPerishable: true, isSubscribable: false, tags: ["party", "jollof", "catering"] },
      { name: "Weekly Meal Prep Box", sku: "MEALPREP-WEEKLY-001", slug: "weekly-meal-prep-box", description: "5 balanced meals for the week. Fresh, pre-portioned, ready to heat.", category: "Meal Prep Boxes", price: 39.99, weightKg: 3.5, isPerishable: true, isSubscribable: true, tags: ["meal-prep", "weekly", "healthy"] },
    ],
  },

  beauty: {
    id: "beauty",
    name: "Beauty & Cosmetics",
    description: "Skincare, haircare, natural beauty products, and cosmetics",
    icon: "✨",
    colorScheme: {
      primaryColor: "#581C87",
      accentColor: "#E879F9",
    },
    defaultCategories: [
      "Skincare",
      "Haircare",
      "Makeup",
      "Natural & Organic",
      "Body Care",
      "Fragrance",
      "Tools & Accessories",
      "Gift Sets",
    ],
    shippingMethods: [
      { name: "Standard Shipping", method: "STANDARD", minWeightKg: 0, maxWeightKg: 10, baseCost: 3.99, perKgCost: 1.00, estimatedDays: 3 },
      { name: "Express Shipping", method: "EXPRESS", minWeightKg: 0, maxWeightKg: 10, baseCost: 7.99, perKgCost: 1.50, estimatedDays: 1 },
      { name: "International (DHL)", method: "DHL", minWeightKg: 0, maxWeightKg: 5, baseCost: 12.99, perKgCost: 2.50, estimatedDays: 5 },
    ],
    sampleProducts: [
      { name: "Shea Butter Moisturiser (200ml)", sku: "SKIN-SHEA-001", slug: "shea-butter-moisturiser", description: "Raw unrefined shea butter, deeply nourishing for all skin types.", category: "Skincare", price: 12.99, weightKg: 0.25, isPerishable: false, isSubscribable: true, tags: ["shea-butter", "natural", "moisturiser"] },
      { name: "Black Soap Bar", sku: "SKIN-BSOAP-001", slug: "african-black-soap-bar", description: "Traditional African black soap, handmade with plantain ash and cocoa pod.", category: "Natural & Organic", price: 6.99, weightKg: 0.15, isPerishable: false, isSubscribable: true, tags: ["black-soap", "natural", "traditional"] },
    ],
  },

  education: {
    id: "education",
    name: "Education & Learning",
    description: "Courses, learning materials, tutoring subscriptions, and books",
    icon: "📚",
    colorScheme: {
      primaryColor: "#1E40AF",
      accentColor: "#3B82F6",
    },
    defaultCategories: [
      "Courses",
      "Textbooks & Workbooks",
      "Tutoring Packages",
      "Educational Toys",
      "Stationery",
      "Digital Resources",
      "Subscription Plans",
      "Gift Vouchers",
    ],
    shippingMethods: [
      { name: "Standard Shipping", method: "STANDARD", minWeightKg: 0, maxWeightKg: 15, baseCost: 3.99, perKgCost: 0.80, estimatedDays: 3 },
      { name: "Express Shipping", method: "EXPRESS", minWeightKg: 0, maxWeightKg: 10, baseCost: 6.99, perKgCost: 1.20, estimatedDays: 1 },
    ],
    sampleProducts: [
      { name: "11+ Maths Workbook Pack", sku: "EDU-11PLUS-MATH", slug: "11-plus-maths-workbook-pack", description: "Comprehensive 11+ maths preparation workbook set with practice papers.", category: "Textbooks & Workbooks", price: 24.99, weightKg: 0.8, isPerishable: false, isSubscribable: false, tags: ["11-plus", "maths", "exam-prep"] },
      { name: "Monthly Tutoring Subscription", sku: "TUTOR-MONTHLY-001", slug: "monthly-tutoring-subscription", description: "4 one-hour tutoring sessions per month with a qualified tutor.", category: "Tutoring Packages", price: 120.00, weightKg: 0, isPerishable: false, isSubscribable: true, tags: ["tutoring", "monthly", "subscription"] },
    ],
  },
};

export function getTemplate(id: string): TenantTemplate | undefined {
  return TENANT_TEMPLATES[id];
}

export function getAllTemplates(): TenantTemplate[] {
  return Object.values(TENANT_TEMPLATES);
}
