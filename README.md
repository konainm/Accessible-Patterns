# Accessible Patterns

**Accessible Components Library:** [https://konainm.github.io/Accessible-Patterns/](https://konainm.github.io/Accessible-Patterns/)

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

### 4. Combobox
A W3C WAI-ARIA compliant combobox supporting both editable autocomplete and select-only interactions.
- **Features**: Real-time list filtering, character type-ahead, full arrow/Enter/Escape/Home/End keyboard navigation, and `aria-live="polite"` announcements.
- **ARIA**: Uses `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, `role="listbox"`, and `role="option"`.
- **Variants**: Includes both **Editable Combobox (List Autocomplete)** and **Select-Only Combobox**.

## Unified App Shell Architecture

The library uses a zero-build **Unified App Shell** so shared layout elements are defined once and never duplicated across component files:

```text
Accessible-Patterns/
├── index.html          # Single app shell (skip link, header, global search, toggles, <main>, footer)
├── components/         # Standalone HTML fragments for individual components
│   ├── modal.html
│   ├── tabs.html
│   ├── tooltip.html
│   └── combobox.html
├── pages/              # Standalone HTML fragments for library pages
│   ├── home.html
│   └── documentation.html
├── css/                # Shared styles + per-component stylesheets loaded on demand
└── js/
    ├── registry.js     # Single source of truth for routes, cards, search, footer, and assets
    ├── app.js          # Hash router, safe DOM mounting, global search, shell controls
    └── <component>.js  # Per-component behavior scripts loaded on demand
```

### Adding a New Component
1. Create a pure HTML fragment in `components/<name>.html` (demo + accessibility standards only).
2. Add `css/<name>.css` and `js/<name>.js` (initialize on `pageContentLoaded`).
3. Add a single entry in `js/registry.js` — routing, homepage card, footer link, and global search update automatically.

## How to Run Locally

Since this is built with standard semantic HTML, CSS, and Vanilla JavaScript, there are no build steps required.

1. **Start a Local Server**: Because the app shell uses `fetch()` to load component fragments dynamically, serve the project over `http://` or `https://`:
   ```bash
   # Using npm (included http-server)
   npm start

   # Or Python 3
   python -m http.server 8080
   ```
2. Open `http://localhost:8080/` in your browser.
