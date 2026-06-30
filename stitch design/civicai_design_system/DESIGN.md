---
name: CivicAI Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434654'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c5d7'
  surface-tint: '#1353d8'
  primary: '#003fb1'
  on-primary: '#ffffff'
  primary-container: '#1a56db'
  on-primary-container: '#d4dcff'
  inverse-primary: '#b5c4ff'
  secondary: '#00687a'
  on-secondary: '#ffffff'
  secondary-container: '#57dffe'
  on-secondary-container: '#006172'
  tertiary: '#852b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#ad3b00'
  on-tertiary-container: '#ffd4c5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b5c4ff'
  on-primary-fixed: '#00174d'
  on-primary-fixed-variant: '#003dab'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59a'
  on-tertiary-fixed: '#380d00'
  on-tertiary-fixed-variant: '#802a00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.03em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.5rem
  sm: 0.75rem
  md: 1rem
  lg: 1.5rem
  xl: 2rem
  gutter: 1.5rem
  container-max: 1280px
---

## Brand & Style

The design system is engineered for **CivicAI**, a high-end civic engagement platform that bridges the gap between citizens and local government. The brand personality is **authoritative yet accessible**, combining the precision of a data-driven enterprise tool with the empathy of a community-focused service.

The visual style is **High-End Glassmorphism**. This aesthetic uses depth and translucency to create a "futuristic transparency," symbolizing the open and clear communication between the public and the state. By utilizing frosted surfaces and vibrant background blurs, the interface feels lightweight and premium, avoiding the "heavy" bureaucratic feel of traditional government software. It evokes feelings of trust, innovation, and civic pride.

## Colors

The color palette is anchored by a high-energy blue-to-cyan gradient, representing the technological core of the AI-driven platform. 

- **Primary Brand:** A sophisticated transition from Deep Royal (#1A56DB) to Bright Cyan (#06B6D4). This should be used for primary actions, active states, and data visualizations.
- **Semantic Palette:** Clear, industry-standard tones for status signaling:
    - **Success:** Emerald-500 for "Resolved" or "Verified" issues.
    - **Warning:** Amber-500 for "Pending" or "In Progress."
    - **Danger:** Rose-500 for "Critical" severity or "Rejected" reports.
- **Glass Foundation:** Surfaces use a semi-transparent white (70% opacity) to allow background colors and gradients to bleed through softly, ensuring the interface feels integrated with its environment.

## Typography

This design system utilizes **Inter** exclusively to leverage its exceptional legibility and neutral, modern character. 

**Hierarchy Strategy:**
- **Headings:** Use tight letter-spacing (tracking) and heavy weights (Bold/ExtraBold) to create a "compact" and professional look.
- **Body:** Standard tracking with ample line height to ensure readability of civic reports and long-form data.
- **Labels:** Use Medium/SemiBold weights at smaller sizes for metadata (e.g., Ward names, timestamps).

Typography should scale dynamically, with display and headline sizes reducing by ~15-20% on mobile devices to maintain visual balance.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** model with generous safe areas to create a "breathable" premium feel.

- **Grid:** 12-column system for desktop, 6-column for tablet, and 2-column for mobile.
- **Standard Padding:** Use `lg` (24px / 1.5rem) as the default internal container padding for all cards and sections.
- **Vertical Rhythm:** Elements are spaced in multiples of 8px. Use larger gaps (`xl`) between distinct content sections (e.g., between the Header and the Report List) and tighter gaps (`sm`) for related internal metadata.
- **Safe Zones:** Horizontal page margins should be 24px on mobile and scale up to 64px on ultra-wide displays to maintain a centered, professional focus.

## Elevation & Depth

Depth is achieved through **optical layers** rather than heavy shadows.

- **Level 0 (Background):** A soft, subtle light-gray or very faint primary-tinted background.
- **Level 1 (The Glass Surface):** Semi-transparent white containers (`bg-white/70`). Apply a `backdrop-blur-xl` to create the frosted effect.
- **Level 2 (Active/Hover States):** For interactive cards, use a very subtle, extra-diffused shadow (`0 10px 25px -5px rgba(0, 0, 0, 0.05)`) and increase the border opacity slightly.
- **Outlines:** Every glass element must have a 1px solid border (`border-white/20`) to define its edges against the background, simulating the thickness of physical glass.

## Shapes

The shape language is **Rounded**, balancing modern softness with geometric structural integrity.

- **Main Containers:** All cards, input fields, and main containers use a default radius of 0.5rem (8px).
- **Secondary Elements:** Interactive items like buttons and list items use the same 8px radius to maintain consistency.
- **Avatars & Status Tags:** These may use "Full" rounding (Pill-shaped) to distinguish them from structural UI components.

## Components

The design system uses **Lucide React** icons for their clean, consistent stroke weight.

- **Buttons:** 
  - **Primary:** Gradient background (#1A56DB to #06B6D4), white text, no border.
  - **Secondary:** Glass background, subtle border, primary colored text.
- **Cards:** The central component of the UI. Must feature `backdrop-blur-xl`, a 1px white border at 20% opacity, and internal padding of `lg` (24px).
- **Chips/Badges:** Small, pill-shaped indicators for status (e.g., "Critical," "Resolved"). Use low-opacity versions of semantic colors (e.g., Rose-500 at 10% opacity) with high-contrast text.
- **Inputs:** Focused state should use a primary gradient border or a subtle cyan glow. Backgrounds should be slightly more opaque white (80%) to ensure text contrast.
- **Lists:** Clean rows with 1px divider lines (low opacity). Hover states should trigger a slight background opacity increase to 90% rather than a color change.
- **Dashboard Widgets:** Use high-contrast typography for large numerical data (Civic Score) to ensure immediate information hierarchy.