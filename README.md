# Accessible Patterns

A curated library of premium, fully accessible web components featuring a modern, flat, solid-color design language (no blurs, no energy gradients). Designed for maximum visual clarity, tactile response, and 100% WCAG accessibility compliance.

## Key Features

- **♿ WAI-ARIA Compliant Components**:
  - **Accessible Modal Dialog**: Full keyboard focus trapping, Escape key handler, semantic headings and descriptions (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`), and focus return to opening trigger.
- **🎨 Premium Solid Theme Toggle**:
  - Persists **Light** and **Dark** themes in `localStorage`.
  - Zero theme-flash loading (using early attribute binding).
  - Fully accessible ARIA control attributes on the toggle switch.
- **📱 Desktop Viewport Simulator**:
  - Simulates a mobile phone screen (`412px` width) directly in your desktop browser.
  - Centered frame with side bounds and an outer mockup backdrop workspace.
  - Constrains fixed overlays (like the modal dialog) inside the simulated container for a fully nested mockup.
- **⚡ Responsive Grid & Header Layouts**:
  - Fluid component grid wraps from multi-columns to a single-column layout on mobile.
  - Collapses header links into a centralized stacked navigation layout on screen sizes `<=480px`.
- **📖 Accessibility Specification Tables**:
  - Clear lists of all keyboard interaction paths and ARIA roles for every component.
  - Padded responsive tables with overflow scroll on mobile.



## How to Run Locally

Since this is built with standard semantic HTML, CSS, and Vanilla JavaScript, there are no build steps or dependencies. 

1. **Option A (Simple Launch)**: Open `index.html` directly in your browser.
2. **Option B (Recommended for Local Dev)**: Start a local HTTP server from the root of the project to test absolute overlay boundaries:
   ```bash
   # Python (standard on many systems)
   python -m http.server 8000
   
   # Node.js (via npx serve)
   npx serve
   ```
   Then open `http://localhost:8000/` or `http://localhost:3000/`.

## Accessibility Specifications

Components are built following W3C Web Content Accessibility Guidelines (WCAG 2.1/2.2):
- Contrast ratio is guaranteed `>= 4.5:1` for all text and placeholder components.
- Keyboard navigation is fully supported for all interactive elements.
- ARIA states communicate element changes dynamically to screen readers.
