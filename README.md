# Accessible Patterns

**Accessible Components Library:** [https://konainm.github.io/Accessible-Patterns/index.html](https://konainm.github.io/Accessible-Patterns/index.html)

Designing for everyone should not be an afterthought—it must be the foundation of everything we build. This library is a dedicated component system aimed at removing digital barriers and empowering every user through universally accessible design. By equipping teams with a truly equitable toolkit, we are taking a vital step toward a web where intuitive, beautiful, and highly usable experiences are the standard for everyone, regardless of how they navigate the digital world.

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
