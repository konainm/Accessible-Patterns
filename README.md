# Accessible Patterns

A curated library of premium, fully accessible web components featuring a modern, flat, solid-color design language (no blurs, no energy gradients). Designed for maximum visual clarity, tactile response, and 100% WCAG accessibility compliance.

## Key Features & Architecture

- **⚡ Client-Side SPA Router**:
  - Custom PJAX-style router ensures lightning-fast navigation. 
  - The header and navigation regions persist across pages, preventing FOUC (Flash of Unstyled Content) and layout flicker, making it feel like a modern Single Page Application (SPA) without relying on heavy frameworks.
- **🎨 Premium Solid Theme Toggle**:
  - Persists **Light** and **Dark** themes in `localStorage`.
  - Zero theme-flash loading (using early attribute binding).
  - Fully accessible ARIA control attributes on the toggle switch.
- **📱 Desktop Viewport Simulator**:
  - Simulates a mobile phone screen (`412px` width) directly in your desktop browser.
  - Constrains fixed overlays (like the dialog box) inside the simulated container for a fully nested mockup.

## Accessible Components

### 1. Dialog (Modal)
A fully accessible dialog box that overrides the rest of the page.
- **Features**: Full keyboard focus trapping, Escape key handler to dismiss, semantic headings and descriptions.
- **ARIA**: Uses `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `aria-describedby`.
- **UX**: Safely returns keyboard focus to the triggering element upon closing.

### 2. Tabs
An accessible tabbed interface allowing users to navigate between distinct content panels.
- **Features**: Supports standard keyboard navigation (Left/Right arrows) and `Home`/`End` key jumps.
- **ARIA**: Uses `role="tablist"`, `role="tab"`, and `role="tabpanel"`, managing `aria-selected` and `aria-controls` dynamically.
- **Variants**: Includes both **Automatic** activation (panels switch on focus) and **Manual** activation (panels switch only on Enter/Space).

### 3. Tooltip & Toggletip Dialogs
A robust dual-system component for rendering informational popups.
- **Features**: Follows specific W3C WAI-ARIA interaction patterns depending on the content.
- **Standard Tooltips**: Text-only informational blocks. Triggered safely by `hover` or `focus`, utilizing `role="tooltip"` and `aria-describedby`.
- **Toggletips (Interactive Dialogs)**: Non-modal popovers containing links or buttons. Triggered explicitly by a `click` to prevent accidental closure, allowing users to move focus inside them. Uses `role="dialog"` and `aria-expanded`.
- **UX**: Both variants are easily dismissed with the `Escape` key.

## Accessibility Specifications

Components are built following W3C Web Content Accessibility Guidelines (WCAG 2.1/2.2):
- Contrast ratio is guaranteed `>= 4.5:1` for all text and placeholder components.
- Keyboard navigation is fully supported for all interactive elements.
- ARIA states communicate element changes dynamically to screen readers.
- Every component page includes detailed specification tables for Keyboard Navigation and ARIA Roles & Attributes.

## How to Run Locally

Since this is built with standard semantic HTML, CSS, and Vanilla JavaScript, there are no build steps or complex dependencies required to run the codebase.

1. **Start a Local Server (Required for SPA Routing)**: Because the application uses `fetch()` to drive its Single Page Application router, it must be run over `http://` or `https://` (opening files directly via `file://` will trigger CORS errors).
   
   Start a local HTTP server from the root of the project:
   ```bash
   # Python (standard on many systems)
   python -m http.server 8000
   
   # Node.js (via npx serve)
   npx serve
   ```
2. Open `http://localhost:8000/` or `http://localhost:3000/` in your browser.
