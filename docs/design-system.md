# Design System Documentation: Cinematic AI Editorial
**Version:** 1.0.0 | **Status:** Active | **Last Updated:** April 2026

> **Active Palette Note:** The original spec used orange-red (#ff8f70)
> as the primary accent. The production implementation uses **jade
> green (#2DD4A0)** as primary with **neon blue (#00BFFF)** as the
> complementary accent. The surface tokens, typography, no-line rule,
> light-bleed, and motion principles below are all applied as
> specified. Replace #ff8f70 → #2DD4A0, #cc7259 → #1FA87D, and
> #8ab4f8 → #00BFFF when reading this doc.

---

## 1. Overview & Creative North Star

### The Creative North Star: "The Digital Monolith"

This design system is built to evoke the feeling of a cinematic title
sequence — grand, atmospheric, and undeniably high-tech. It moves away
from the "SaaS-standard" of grids and borders, instead leaning into
**The Digital Monolith**: a philosophy where UI elements emerge from
shadows through light and depth rather than structural lines.

We break the "template" look by utilizing intentional asymmetry,
oversized display typography, and "light-bleed" effects. Every screen
should feel like a frame from a futuristic film — using the contrast
between the deep `#1e1e1e` charcoal and the vibrant `#2DD4A0` jade
green to guide the eye through an immersive narrative experience.

### Core Design Principles

| Principle | Description |
|---|---|
| **Depth over Division** | Use layered surfaces, not borders, to separate content |
| **Light as Structure** | Glow, bloom, and gradient replace lines as visual anchors |
| **Editorial Tension** | Oversized type against dense darkness creates drama |
| **Cinematic Motion** | Transitions are slow, intentional, and atmospheric |
| **Asymmetric Confidence** | Avoid perfect symmetry; lean into editorial layouts |

---

## 2. Color System

Our palette is rooted in a high-contrast dark mode designed to minimize
eye strain while maximizing dramatic impact.

### Full Color Token Reference

#### Background & Surface Tokens

| Token | Hex Value | Usage |
|---|---|---|
| `background` | `#1e1e1e` | Root page background; the "void" |
| `surface` | `#0e0e0e` | Deepest base layer; maximum depth |
| `surface-container-low` | `#131313` | Primary content blocks; Nesting Level 1 |
| `surface-container` | `#181818` | Standard card surfaces |
| `surface-container-high` | `#201f1f` | Interactive cards, elevated panels |
| `surface-container-highest` | `#262626` | Modals, dropdowns, highest priority |
| `surface-bright` | `#2c2c2c` | Glass/blur overlays, floating nav |
| `surface-dim` | `#0a0a0a` | Recessed or disabled surfaces |

#### Brand & Accent Tokens (Production — Jade/Neon Blue)

| Token | Hex Value | Usage |
|---|---|---|
| `primary` | `#2DD4A0` | Primary CTA, highlights, active states (jade green) |
| `primary-dim` | `#1FA87D` | Hover/pressed state for primary |
| `primary-glow` | `rgba(45,212,160,0.15)` | Ambient glow behind primary elements |
| `primary-on` | `#0e0e0e` | Text/icons placed on top of primary |
| `secondary` | `#00BFFF` | Neon blue; data, links, info, gradient pair |
| `tertiary` | `#00BFFF` | Same neon blue for consistency |
| `error` | `#f28b82` | Error states, destructive actions |

#### Text & Icon Tokens

| Token | Hex Value | Usage |
|---|---|---|
| `on-background` | `#f0ede8` | Primary text on background |
| `on-surface` | `#e8e3dc` | Primary text on surfaces |
| `on-surface-variant` | `#9e9a94` | Secondary/supporting text |
| `outline` | `#3d3a36` | Minimal dividers only (use sparingly) |
| `outline-variant` | `#2a2826` | Subtle visual separation if required |

---

### The "No-Line" Rule

> **Explicit Instruction:** Do not use `1px solid` borders to define
> sections or containers. Separation must be achieved **exclusively**
> through background color shifts.

For example, a `surface-container-low` (`#131313`) section sitting
against `background` (`#1e1e1e`) provides a sophisticated "ink-pool"
transition that feels premium and integrated. The eye perceives depth
and hierarchy without mechanical divisions.

**Permitted Exception:** `outline-variant` may be used at maximum `0.4`
opacity as a hairline rule between table rows only.

---

### Surface Hierarchy & Nesting

Treat the UI as a series of physical layers — like sheets of dark glass
floating above a void.

```
Layer 0 — Void:         surface        #0e0e0e  ← deepest background
Layer 1 — Ground:       background     #1e1e1e  ← page canvas
Layer 2 — Content:      container-low  #131313  ← primary content blocks
Layer 3 — Cards:        container-high #201f1f  ← elevated interactive cards
Layer 4 — Floating:     container-highest #262626 ← modals, tooltips
Layer 5 — Glass:        surface-bright  #2c2c2c @ 50% opacity + blur
```

---

### The "Glass & Gradient" Rule

To inject **soul** into the interface, apply Glassmorphism to floating
navigation elements, overlays, and spotlight panels:

```css
.glass-panel {
  background: rgba(44, 44, 44, 0.50);   /* surface-bright @ 50% */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(240, 237, 232, 0.06); /* ghost border only */
}
```

### The "Light Bleed" Rule

For hero sections, active cards, and focal UI elements, apply a
directional gradient to simulate a light source emanating from below
or behind:

```css
.light-bleed-primary {
  background: radial-gradient(
    ellipse 80% 50% at 50% 100%,
    rgba(45, 212, 160, 0.12) 0%,
    transparent 70%
  );
}
```

---

## 3. Typography

Typography is the **voice** of this system. We use a high-contrast
scale to create an editorial, cinematic feel — the equivalent of a
film's opening title card.

### Typeface Selection

| Role | Typeface | Rationale |
|---|---|---|
| **Headlines** | Space Grotesk | Geometric, authoritative, futuristic; wide apertures convey confidence |
| **Body** | Manrope | Humanistic, highly legible; balances Space Grotesk's technicality |
| **Labels/Micro** | Space Grotesk | Maintains tech aesthetic at smallest sizes |
| **Monospace/Code** | JetBrains Mono | For data, code snippets, and terminal aesthetics |

### Type Scale

| Token | Size | Line Height | Weight | Typeface | Usage |
|---|---|---|---|---|---|
| `display-lg` | 3.5rem (56px) | 1.1 | 700 | Space Grotesk | Hero headlines, splash screens |
| `display-md` | 2.75rem (44px) | 1.15 | 700 | Space Grotesk | Section openers, feature titles |
| `headline-lg` | 2rem (32px) | 1.2 | 600 | Space Grotesk | Page-level headlines |
| `headline-md` | 1.5rem (24px) | 1.3 | 600 | Space Grotesk | Sub-section headers |
| `headline-sm` | 1.25rem (20px) | 1.35 | 600 | Space Grotesk | Card titles, modal headers |
| `body-lg` | 1rem (16px) | 1.6 | 400 | Manrope | Long-form content, articles |
| `body-md` | 0.875rem (14px) | 1.55 | 400 | Manrope | Functional UI text, descriptions |
| `body-sm` | 0.8125rem (13px) | 1.5 | 400 | Manrope | Captions, supporting text |
| `label-lg` | 0.875rem (14px) | 1.2 | 500 | Space Grotesk | Button text, form labels |
| `label-md` | 0.75rem (12px) | 1.2 | 500 | Space Grotesk | Tags, badges, micro-copy |
| `label-sm` | 0.6875rem (11px) | 1.2 | 500 | Space Grotesk | Status pills, timestamps |
| `mono-md` | 0.875rem (14px) | 1.5 | 400 | JetBrains Mono | Code, IDs, data values |

### Typography Rules

1. **Never use `on-surface-variant` text on `display-lg` or `headline-lg`** — primary text color only for impact statements
2. **Track (letter-spacing) on ALL-CAPS labels:** `+0.08em` minimum
3. **Optical sizing:** Apply `font-optical-sizing: auto` for headlines ≥`headline-lg`
4. **Limit line length:** Body text max `68ch`; display text max `22ch`
5. **No centered body text** — left-align all text beyond `headline-md`

---

## 4. Spacing & Layout

### Spacing Scale (Base 4px)

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Micro — icon padding, tight gaps |
| `space-2` | 8px | XS — inline element gaps |
| `space-3` | 12px | SM — compact list items |
| `space-4` | 16px | MD — default component padding |
| `space-5` | 24px | LG — section inner padding |
| `space-6` | 32px | XL — card padding, section gaps |
| `space-8` | 48px | 2XL — major section separators |
| `space-10` | 64px | 3XL — hero section padding |
| `space-14` | 96px | 4XL — full-bleed section breathing room |

### Grid System

```
Mobile (< 768px):    4 columns | 16px gutter | 16px margin
Tablet (768-1199px): 8 columns | 24px gutter | 32px margin
Desktop (≥ 1200px): 12 columns | 32px gutter | 64px margin
Max content width:   1440px
```

### Layout Principles

- **Intentional Asymmetry:** Avoid 50/50 splits. Prefer 60/40 or 70/30 column splits for editorial tension
- **Negative Space as Feature:** Large empty `background` regions are intentional — they add cinematic breathing room
- **Bleed Elements:** Full-width sections with no padding create cinematic sweep; use between content sections
- **Vertical Rhythm:** Apply consistent `space-8` (48px) between major sections

---

## 5. Elevation & Shadow

Shadows simulate real depth in the monolithic dark world. All shadows
use the primary color or pure darkness — never grey.

| Token | CSS Value | Usage |
|---|---|---|
| `elevation-1` | `0 2px 8px rgba(0,0,0,0.4)` | Subtle card lift |
| `elevation-2` | `0 4px 16px rgba(0,0,0,0.6)` | Standard card elevation |
| `elevation-3` | `0 8px 32px rgba(0,0,0,0.8)` | Modal, drawer elevation |
| `elevation-glow-sm` | `0 0 12px rgba(45,212,160,0.2)` | Subtle primary glow on active elements |
| `elevation-glow-md` | `0 0 24px rgba(45,212,160,0.3)` | CTA button glow, focus rings |
| `elevation-glow-lg` | `0 0 48px rgba(45,212,160,0.15)` | Hero element ambient glow |

---

## 6. Motion & Animation

Motion is **slow, deliberate, and atmospheric** — never snappy or bouncy.

### Duration Tokens

| Token | Value | Usage |
|---|---|---|
| `duration-instant` | 80ms | Micro-feedback (checkbox tick) |
| `duration-fast` | 150ms | Hover state color transitions |
| `duration-standard` | 300ms | Component entrance/exit |
| `duration-cinematic` | 600ms | Hero elements, page transitions |
| `duration-atmospheric` | 1200ms | Background effects, ambient motion |

### Easing Tokens

| Token | CSS Value | Usage |
|---|---|---|
| `ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Default transitions |
| `ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering the screen |
| `ease-accelerate` | `cubic-bezier(0.4, 0, 1, 1)` | Elements leaving the screen |
| `ease-cinematic` | `cubic-bezier(0.16, 1, 0.3, 1)` | Dramatic entrances (hero, modal) |

### Animation Principles

1. **Fade + Translate as default:** All component entrances use `opacity: 0 → 1` + `translateY(12px → 0)`
2. **Staggered reveals:** Lists and grids stagger children by `60ms` increments
3. **No spring physics:** Avoid bouncy easing; maintain cinematic gravity
4. **Reduced motion:** Always provide `prefers-reduced-motion` alternative with `duration-instant`

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

---

## 7. Component Patterns

### Buttons

```
Primary CTA:
  Background: primary (#2DD4A0) or jade→blue gradient
  Text: on-primary (#0e0e0e), label-lg, Space Grotesk
  Padding: space-3 space-5 (12px 24px)
  Border-radius: 12px (rounded-xl)
  Box-shadow (default): elevation-glow-sm
  Box-shadow (hover): elevation-glow-md
  Transition: duration-fast, ease-standard

Ghost Button:
  Background: transparent
  Border: 1px solid rgba(45,212,160,0.4)
  Text: primary (#2DD4A0)
  Hover: background rgba(45,212,160,0.08)

Destructive:
  Background: error (#f28b82)
  Text: #0e0e0e
```

### Cards

```
Default Card:
  Background: surface-container-high (#201f1f)
  Padding: space-6 (32px)
  Border-radius: 16px (rounded-2xl)
  Border: none (No-Line Rule)
  Hover: translateY(-4px) + elevation-2

Featured Card (with light bleed):
  Background: surface-container-high
  + light-bleed-primary pseudo-element at bottom
  Border-radius: 16px
```

### Form Inputs

```
Background: surface-container (#252525)
Border: none (No-Line Rule)
Focus: ring-2 ring-primary/30 + elevation-glow-sm
Text: on-surface (#f0ede8), body-md
Label: on-surface-variant, label-md uppercase tracking-[0.12em]
Placeholder: #6b6762
Border-radius: 12px (rounded-xl)
Padding: space-3 space-4 (14px 16px)
```

### Navigation

```
Global Nav:
  Apply glass-panel rule
  Position: sticky top-0
  Height: 64px
  Z-index: 100

Nav Links:
  Default: on-surface-variant (#9e9a94), label-lg
  Hover: on-surface (#f0ede8), duration-fast
  Active: primary (#2DD4A0) + 2px bottom indicator (primary)
```

---

## 8. Accessibility

| Standard | Requirement |
|---|---|
| **Color Contrast** | Minimum AA (4.5:1) for body text; AAA (7:1) preferred for `display-lg` |
| **Focus Indicators** | `elevation-glow-md` outline + `2px solid primary` for keyboard navigation |
| **Touch Targets** | Minimum 44×44px for all interactive elements |
| **Motion** | `prefers-reduced-motion` required on all animations |
| **Screen Readers** | All decorative SVGs use `aria-hidden="true"`; icons have `aria-label` |
| **Semantic HTML** | Use `<h1>–<h6>` hierarchy matching visual type scale |

---

## 9. Do's & Don'ts

### Do
- Use `surface-container` tokens to create layered depth
- Apply `light-bleed` gradients to hero and focal sections
- Use `Space Grotesk` boldly at `display-lg` for cinematic impact
- Allow generous negative space — the void is part of the design
- Apply glow effects to interactive elements to signal affordance
- Use asymmetric layouts to create editorial tension

### Don't
- Add `1px solid` borders between sections (No-Line Rule)
- Use bouncy or spring-based animations
- Center-align body copy
- Use grey shadows — always use black or primary-tinted glows
- Mix more than 2 typefaces at any one scale level
- Use pure `#000000` black — always use `surface` (`#0e0e0e`) or `background` (`#1e1e1e`)
- Apply glassmorphism to content cards — glass is for floating/overlay elements only

---

## 10. Implementation Notes for Claude Code

When building components using this design system:

1. **CSS Custom Properties:** Tokens defined in `[data-theme="cinematic"]` scope in `src/app/globals.css` (not global `:root`)
2. **Tailwind v4:** Uses `@theme` block; cinematic overrides applied via `data-theme` attribute on `platform-shell.tsx` root div
3. **Scope:** Only platform pages (`/`, `/get-started`, `/marketplace`, `/login`) use cinematic. Admin keeps luxury cream theme, tenant storefronts stay per-tenant themed.
4. **Dark Mode Only:** This system has no light mode variant; do not add `prefers-color-scheme: light` overrides
5. **Font Loading:** Space Grotesk + Manrope + JetBrains Mono loaded via `next/font/google` in `src/app/layout.tsx`
6. **Glass Panels:** Always test `backdrop-filter` with Safari prefix `-webkit-backdrop-filter`
7. **Glow Effects:** Use `will-change: box-shadow` on elements with animated glows for GPU acceleration

### File Reference Map

| Concern | File |
|---|---|
| Token definitions | `src/app/globals.css` |
| Font loading | `src/app/layout.tsx` |
| Theme activation | `src/app/platform/platform-shell.tsx` (data-theme="cinematic") |
| Shared glow card | `src/components/ui/glow-card.tsx` |
| FAQ accordion | `src/components/ui/faq-section.tsx` |
| Hero | `src/components/ui/split-hero.tsx` |
| Services | `src/components/ui/sticky-scroll-cards-section.tsx` |
| Capabilities | `src/components/ui/bento-capabilities.tsx` |
