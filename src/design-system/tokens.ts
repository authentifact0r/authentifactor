/**
 * Authentifactor Design System Tokens
 * Applied across all admin + superadmin surfaces.
 */

// ── Colors ──
export const colors = {
  // Surfaces
  bg: {
    primary: "#000000",
    secondary: "#030303",
    card: "rgba(255,255,255,0.03)",
    cardHover: "rgba(255,255,255,0.05)",
    elevated: "rgba(255,255,255,0.06)",
  },
  // Borders
  border: {
    subtle: "rgba(255,255,255,0.06)",
    default: "rgba(255,255,255,0.08)",
    hover: "rgba(255,255,255,0.12)",
    active: "rgba(255,255,255,0.15)",
  },
  // Text
  text: {
    primary: "#FFFFFF",
    secondary: "rgba(255,255,255,0.70)",
    muted: "rgba(255,255,255,0.50)",
    faint: "rgba(255,255,255,0.30)",
  },
  // Accents
  accent: {
    emerald: "#10B981",
    blue: "#3B82F6",
    violet: "#8B5CF6",
    amber: "#F59E0B",
    red: "#EF4444",
    cyan: "#06B6D4",
  },
  // Status
  status: {
    active: { bg: "rgba(16,185,129,0.15)", text: "#34D399" },
    delinquent: { bg: "rgba(239,68,68,0.15)", text: "#F87171" },
    paused: { bg: "rgba(245,158,11,0.15)", text: "#FBBF24" },
    info: { bg: "rgba(59,130,246,0.15)", text: "#60A5FA" },
  },
} as const;

// ── Typography ──
export const typography = {
  fonts: {
    sans: '"Inter", ui-sans-serif, system-ui, sans-serif',
    serif: '"Instrument Serif", serif',
    mono: '"JetBrains Mono", ui-monospace, monospace',
  },
  sizes: {
    xs: "0.6875rem",   // 11px
    sm: "0.8125rem",   // 13px
    base: "0.875rem",  // 14px
    md: "1rem",        // 16px
    lg: "1.125rem",    // 18px
    xl: "1.25rem",     // 20px
    "2xl": "1.5rem",   // 24px
    "3xl": "2rem",     // 32px
    "4xl": "2.5rem",   // 40px
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },
  tracking: {
    tight: "-0.02em",
    normal: "0",
    wide: "0.05em",
    wider: "0.1em",
    widest: "0.2em",
  },
} as const;

// ── Spacing ──
export const spacing = {
  0: "0",
  1: "0.25rem",  // 4px
  2: "0.5rem",   // 8px
  3: "0.75rem",  // 12px
  4: "1rem",     // 16px
  5: "1.25rem",  // 20px
  6: "1.5rem",   // 24px
  8: "2rem",     // 32px
  10: "2.5rem",  // 40px
  12: "3rem",    // 48px
  16: "4rem",    // 64px
} as const;

// ── Radii ──
export const radii = {
  sm: "0.5rem",    // 8px
  md: "0.625rem",  // 10px
  lg: "0.875rem",  // 14px
  xl: "1rem",      // 16px
  "2xl": "1.25rem",// 20px
  full: "9999px",
} as const;

// ── Shadows ──
export const shadows = {
  sm: "0 1px 2px rgba(0,0,0,0.2)",
  md: "0 4px 12px rgba(0,0,0,0.15)",
  lg: "0 8px 32px rgba(0,0,0,0.2)",
  xl: "0 16px 48px rgba(0,0,0,0.3)",
  glow: {
    emerald: "0 0 20px rgba(16,185,129,0.15)",
    blue: "0 0 20px rgba(59,130,246,0.15)",
    violet: "0 0 20px rgba(139,92,246,0.15)",
  },
} as const;

// ── Motion ──
export const motion = {
  ease: [0.16, 1, 0.3, 1] as const,
  duration: {
    fast: 0.15,
    normal: 0.3,
    slow: 0.5,
    page: 0.6,
  },
  spring: {
    stiffness: 350,
    damping: 30,
  },
  stagger: 0.06,
} as const;

// ── Tailwind class helpers ──
export const tw = {
  card: "rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm",
  cardHover: "hover:border-white/[0.1] hover:bg-white/[0.05] hover:shadow-[0_8px_40px_rgba(0,0,0,0.3)]",
  input: "h-12 px-4 rounded-xl bg-white/[0.06] border border-white/[0.12] text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition",
  button: {
    primary: "h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base transition-all",
    secondary: "h-12 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/60 hover:bg-white/[0.1] hover:text-white font-medium text-sm transition-all",
    ghost: "rounded-xl text-white/40 hover:bg-white/[0.06] hover:text-white/60 transition-all",
  },
  badge: {
    active: "bg-emerald-500/15 text-emerald-400",
    delinquent: "bg-red-500/15 text-red-400",
    paused: "bg-yellow-500/15 text-yellow-400",
    info: "bg-blue-500/15 text-blue-400",
  },
  label: "text-xs font-semibold uppercase tracking-[0.15em] text-white/40",
} as const;
