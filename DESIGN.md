# Design System: Kinetic Minimalist

## Style Theme Properties
- **Font**: GEIST (Headline/Label), INTER (Body)
- **Roundness**: ROUND_EIGHT (Default radius of 12px/0.75rem for buttons and inputs, 16px/1rem for cards and modals)
- **Primary Color**: `#3525cd` (Indigo) / Override: `#4f46e5`
- **Secondary Color**: `#0058be` (Electric Blue) / Override: `#3b82f6`
- **Tertiary Color**: `#571ac0` (Soft Violet) / Override: `#8b5cf6`
- **Neutral Color**: `#f9fafb` (Base background)

### Color Palette Reference (CSS Custom Properties)
```css
:root {
  --background: #f8f9fa;
  --on-background: #191c1d;
  --surface: #f8f9fa;
  --surface-bright: #f8f9fa;
  --surface-dim: #d9dadb;
  --surface-container-lowest: #ffffff;
  --surface-container-low: #f3f4f5;
  --surface-container: #edeeef;
  --surface-container-high: #e7e8e9;
  --surface-container-highest: #e1e3e4;
  --on-surface: #191c1d;
  --on-surface-variant: #464555;
  --inverse-surface: #2e3132;
  --inverse-on-surface: #f0f1f2;
  --outline: #777587;
  --outline-variant: #c7c4d8;
  --surface-tint: #4d44e3;
  --primary: #3525cd;
  --on-primary: #ffffff;
  --primary-container: #4f46e5;
  --on-primary-container: #dad7ff;
  --inverse-primary: #c3c0ff;
  --secondary: #0058be;
  --on-secondary: #ffffff;
  --secondary-container: #2170e4;
  --on-secondary-container: #fefcff;
  --tertiary: #571ac0;
  --on-tertiary: #ffffff;
  --tertiary-container: #6f3dd9;
  --on-tertiary-container: #e3d5ff;
  --error: #ba1a1a;
  --on-error: #ffffff;
  --error-container: #ffdad6;
  --on-error-container: #93000a;
  
  /* Status Colors */
  --status-new: #3B82F6;
  --status-contacted: #F59E0B;
  --status-qualified: #8B5CF6;
  --status-proposal: #06B6D4;
  --status-won: #10B981;
  --status-lost: #EF4444;
  
  --border-subtle: #E5E7EB;
  --surface-glass: rgba(255, 255, 255, 0.7);
}
```

---

## Brand & Style

This design system is engineered for a high-performance CRM environment, prioritizing speed, clarity, and a "technical luxury" aesthetic. It draws inspiration from the **Minimalist** and **Glassmorphism** movements, focusing on functional density without visual clutter.

The personality is professional yet innovative, catering to high-growth teams who value precision. The interface utilizes generous whitespace, crisp typography, and subtle depth through translucent layers to distinguish between navigational, workspace, and utility surfaces. The user experience should feel lightweight and instantaneous, evoking a sense of calm efficiency.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. Navigation and sidebars are fixed-width to ensure tool accessibility, while the primary content area (CRM Table/Kanban) is fluid to maximize data visibility.

- **Desktop:** 12-column grid with 24px gutters and 32px outer margins.
- **Tablet:** 8-column grid with 20px gutters.
- **Mobile:** 4-column grid with 16px gutters; sidebars collapse into a bottom sheet or full-screen overlay.

Spacing units are strictly based on a 4px baseline, with 12px being the "standard" gap for internal component layout.

## Elevation & Depth

Depth is communicated through **Glassmorphism** and **Ambient Shadows** rather than stark borders.

- **Level 0 (Base):** Off-white background, non-interactive.
- **Level 1 (Cards):** White background, 1px subtle border (#E5E7EB), no shadow.
- **Level 2 (Hover/Active):** White background, very soft diffused shadow (0 4px 20px rgba(0,0,0,0.04)).
- **Level 3 (Overlays/Modals):** Frosted glass surface (70% white, 20px blur) with a 1px white inner stroke and a deep, low-opacity shadow (0 20px 40px rgba(0,0,0,0.08)).

## Components

### Buttons & Inputs
- **Primary Button:** Deep Indigo background, white text, 12px radius. Subtle scale-down effect (0.98) on click.
- **Input Fields:** Off-white background, 1px border (#E5E7EB). On focus, the border transitions to Primary Indigo with a 3px soft focus ring.

### Badges (Pill-shaped)
- Status badges use a low-saturation version of the status color for the background (15% opacity) and the full-saturation color for the text.

### Data Tables
- **Header:** Label-sm typography, sticky position, very light gray background.
- **Rows:** 56px height, subtle hover state change to off-white, 1px horizontal dividers only.
- **Cells:** High data density but with 12px horizontal padding to maintain "breathability."

### Cards
- Used for Kanban views and lead summaries. 16px radius, Level 1 elevation. Internal padding of 20px.

### Navigation
- Vertical sidebar with glassmorphic transparency. Active links use a subtle indigo "pill" background and a high-contrast label.
