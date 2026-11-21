/**
 * Single Source of Truth for the Accessible Components Library.
 * Add a new component entry here to register its route, homepage card,
 * global search metadata, footer quick link, and on-demand CSS/JS assets.
 */
window.APP_REGISTRY = Object.freeze({
    version: '9',

    pages: Object.freeze([
        Object.freeze({
            id: 'home',
            route: '/',
            title: 'Components',
            pageTitle: 'Accessible Components Library',
            category: 'Page',
            description: 'Browse all universally accessible web components in the library.',
            template: 'pages/home.html',
            styles: Object.freeze([]),
            scripts: Object.freeze([]),
            keywords: Object.freeze(['home', 'library', 'components', 'overview', 'all'])
        }),
        Object.freeze({
            id: 'documentation',
            route: '/documentation',
            title: 'Documentation',
            pageTitle: 'Documentation | Accessible Components Library',
            category: 'Guide',
            description: 'Learn how to run the library locally and add components to the unified app shell.',
            template: 'pages/documentation.html',
            styles: Object.freeze([]),
            scripts: Object.freeze([]),
            keywords: Object.freeze(['docs', 'setup', 'install', 'local', 'server', 'architecture', 'guidelines', 'aria'])
        })
    ]),

    components: Object.freeze([
        Object.freeze({
            id: 'modal',
            route: '/modal',
            title: 'Dialog',
            pageTitle: 'Dialog | Accessible Patterns',
            category: 'Component',
            description: 'A fully accessible dialog box with focus trapping, ARIA roles, and Escape key support.',
            template: 'components/modal.html',
            styles: Object.freeze(['css/modal.css?v=3']),
            scripts: Object.freeze(['js/modal.js?v=3']),
            keywords: Object.freeze(['modal', 'dialog', 'popup', 'overlay', 'focus trap', 'aria-modal', 'escape']),
            thumbnail: Object.freeze({
                type: 'image',
                src: 'assets/modal_thumbnail.png',
                alt: 'Preview of the sleek dark mode modal dialog'
            })
        }),
        Object.freeze({
            id: 'tabs',
            route: '/tabs',
            title: 'Tabs',
            pageTitle: 'Tabs | Accessible Patterns',
            category: 'Component',
            description: 'Accessible tabbed interface with keyboard navigation. Includes automatic and manual activation variants.',
            template: 'components/tabs.html',
            styles: Object.freeze(['css/tabs.css?v=3']),
            scripts: Object.freeze(['js/tabs.js?v=3']),
            keywords: Object.freeze(['tabs', 'tablist', 'tabpanel', 'automatic', 'manual', 'roving tabindex', 'arrow keys']),
            thumbnail: Object.freeze({
                type: 'image',
                src: 'assets/tabs_thumbnail.png',
                alt: 'Preview of the sleek dark mode tabs navigation'
            })
        }),
        Object.freeze({
            id: 'tooltip',
            route: '/tooltip',
            title: 'Tooltip',
            pageTitle: 'Tooltip | Accessible Patterns',
            category: 'Component',
            description: 'Accessible standard tooltips and interactive non-modal toggletip dialogs.',
            template: 'components/tooltip.html',
            styles: Object.freeze(['css/tooltip.css?v=3']),
            scripts: Object.freeze(['js/tooltip.js?v=3']),
            keywords: Object.freeze(['tooltip', 'toggletip', 'popover', 'hover', 'hint', 'aria-describedby']),
            thumbnail: Object.freeze({
                type: 'image',
                src: 'assets/tooltip_thumbnail.png',
                alt: 'Preview of the sleek dark mode tooltips'
            })
        }),
        Object.freeze({
            id: 'combobox',
            route: '/combobox',
            title: 'Combobox',
            pageTitle: 'Combobox | Accessible Patterns',
            category: 'Component',
            description: 'A fully accessible autocomplete combobox with keyboard navigation and ARIA live regions.',
            template: 'components/combobox.html',
            styles: Object.freeze(['css/combobox.css?v=3']),
            scripts: Object.freeze(['js/combobox.js?v=3']),
            keywords: Object.freeze(['combobox', 'autocomplete', 'select', 'dropdown', 'listbox', 'option', 'aria-activedescendant', 'live region']),
            thumbnail: Object.freeze({
                type: 'image',
                src: 'assets/combobox_thumbnail.png',
                alt: 'Preview of the sleek dark mode autocomplete combobox'
            })
        })
    ])
});
