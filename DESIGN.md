# Design System: Swedish Camp Command
**Project ID:** TBD (Assigned by Stitch)

## 1. Visual Theme & Atmosphere
**"Scandic-Precision meets On-Ice Intensity."**
The design should feel **clean, crisp, and professional**, evoking the cool air of an ice rink combined with the warmth of a premium hospitality experience. It is **Airy** but **Data-Dense** where needed (dashboard). The aesthetic is **Minimalist** with high-impact typography and subtle micro-interactions. It should communicate **Authority, Organization, and Energy**.

## 2. Color Palette & Roles

### Primary Brand
*   **Nordic Midnight (#0F172A)**: *Primary Background / Text.* Deep, rich navy used for sidebars, primary buttons, and strong headings. Anchors the design.
*   **Glacier Blue (#E0F2FE)**: *Primary Accent / Highlight.* A bright, icy blue used for active states, focus rings, and subtle backgrounds to break up white space.
*   **Ice White (#FFFFFF)**: *Canvas.* Pure white for main content areas, cards, and form backgrounds.

### Functional Colors
*   **Victory Gold (#F59E0B)**: *Attention / Call-to-Action.* Used sparingly for critical primary actions (e.g., "Register Now", "Pay").
*   **Penalty Red (#EF4444)**: *Error / Destructive.* Used for form errors, delete actions, and alerts.
*   **Success Green (#10B981)**: *Confirmation / Success.* Used for completion states and positive trends.
*   **Rink Gray (#F1F5F9)**: *Secondary Background.* A very light cool gray used for page backgrounds behind cards to create depth.

### Text Colors
*   **Deepest Ink (#1E293B)**: Primary text color for maximum legibility.
*   **Muted Steel (#64748B)**: Secondary text, labels, and helper text.

## 3. Typography Rules
**Font Family:** `Inter`, `Roboto`, or similar modern geometric sans-serif.

*   **Headings (H1-H3)**: **Bold (700)**. Tight tracking (-0.02em). Used for page titles and major section headers. Commanding but not shouting.
*   **Body Copy**: **Regular (400) & Medium (500)**. High readability. 1.5 line height.
*   **Labels / Data**: **Semi-Bold (600)**. Used for form labels, table headers, and dashboard metrics.
*   **Numbers**: **Monospaced** (optional) for tabular data to ensure alignment.

## 4. Component Stylings

### Buttons
*   **Primary**: **Solid Nordic Midnight**. Medium rounding (`rounded-md`). Subtle scale transform on hover.
*   **Secondary**: **Outline Muted Steel**. Transparent background. `border-2`.
*   **CTA (Gold)**: **Solid Victory Gold**. Used for the most important step on a screen.

### Cards & Containers
*   **Shape**: **Subtly rounded corners (`rounded-lg`)**. 
*   **Elevation**: **Soft, diffused shadow (`shadow-sm` or `shadow-md`)**. No harsh outlines unless necessary for contrast.
*   **Background**: **Pure White** on top of **Rink Gray** page background.

### Inputs & Forms
*   **Style**: **Clean & Spacious**. 
*   **Border**: Thin, Muted Steel border (`border-gray-300`). Thicker Glacier Blue border on focus with a subtle glow ring.
*   **Sizing**: Generous padding (`p-3`). Large touch targets.

## 5. Layout Principles
*   **Grid**: strict 12-column grid for dashboards. centered single-column for forms.
*   **Spacing**: Generous whitespace. Use multiples of `4px` (Tailwind scale). Sections are clearly separated by `py-8` or `py-12`.
*   **Density**: High density for "Organiser Views" (tables, lists), Low density for "Guardian Views" (registration forms) to reduce cognitive load.
