/**
 * Unified App Shell Controller
 * Manages hash routing, dynamic template/asset loading, homepage grid rendering,
 * footer links, accessible global component search, theme toggle, and viewport simulation.
 */
(function () {
    'use strict';

    const registry = window.APP_REGISTRY;
    if (!registry) return;

    // Build strict allow-listed route map from registry
    const allEntries = [...registry.pages, ...registry.components];
    const routeMap = new Map();
    allEntries.forEach((entry) => {
        routeMap.set(entry.route, entry);
    });

    // Caches for loaded templates, styles, and scripts
    const templateCache = new Map();
    const loadedStyles = new Set();
    const loadedScripts = new Map();

    // -------------------------------------------------------------------------
    // 1. Dynamic Asset Loaders (strictly from allow-listed registry paths)
    // -------------------------------------------------------------------------
    function ensureStyles(styleUrls) {
        const tasks = styleUrls.map((href) => {
            if (loadedStyles.has(href)) return Promise.resolve();
            return new Promise((resolve) => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = href;
                link.dataset.dynamicStyle = 'true';
                link.onload = () => {
                    loadedStyles.add(href);
                    resolve();
                };
                link.onerror = () => resolve();
                document.head.appendChild(link);
            });
        });
        return Promise.all(tasks);
    }

    function ensureScripts(scriptUrls) {
        const tasks = scriptUrls.map((src) => {
            if (loadedScripts.has(src)) return loadedScripts.get(src);
            const promise = new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = src;
                script.dataset.dynamicScript = 'true';
                script.onload = () => resolve();
                script.onerror = () => resolve();
                document.body.appendChild(script);
            });
            loadedScripts.set(src, promise);
            return promise;
        });
        return Promise.all(tasks);
    }

    async function fetchTemplate(templatePath) {
        if (templateCache.has(templatePath)) {
            return templateCache.get(templatePath);
        }
        const response = await fetch(templatePath);
        if (!response.ok) {
            throw new Error(`Failed to load view template (${response.status})`);
        }
        const html = await response.text();
        templateCache.set(templatePath, html);
        return html;
    }

    function mountHtmlSafely(container, html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Defense-in-depth: strip any inline scripts from fetched fragments
        doc.querySelectorAll('script').forEach((node) => node.remove());

        const fragment = document.createDocumentFragment();
        while (doc.body.firstChild) {
            fragment.appendChild(document.adoptNode(doc.body.firstChild));
        }
        container.replaceChildren(fragment);
    }

    // -------------------------------------------------------------------------
    // 2. Registry-Driven Component Grid (Homepage) & Footer Quick Links
    // -------------------------------------------------------------------------
    function renderHomeComponentGrid() {
        const grid = document.getElementById('component-grid');
        if (!grid) return;

        const fragment = document.createDocumentFragment();

        registry.components.forEach((component) => {
            const card = document.createElement('a');
            card.href = `#${component.route}`;
            card.className = 'component-card';
            card.setAttribute('aria-label', `${component.title} Component`);

            const imageBox = document.createElement('div');
            imageBox.className = 'card-image';

            if (component.thumbnail && component.thumbnail.type === 'image') {
                const img = document.createElement('img');
                img.src = component.thumbnail.src;
                img.alt = component.thumbnail.alt;
                imageBox.appendChild(img);
            }

            const content = document.createElement('div');
            content.className = 'card-content';

            const heading = document.createElement('h2');
            heading.textContent = component.title;

            const desc = document.createElement('p');
            desc.textContent = component.description;

            content.append(heading, desc);
            card.append(imageBox, content);
            fragment.appendChild(card);
        });

        grid.replaceChildren(fragment);
    }

    function renderFooterComponents() {
        const list = document.getElementById('footer-components-list');
        if (!list) return;

        const fragment = document.createDocumentFragment();
        registry.components.forEach((component) => {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#${component.route}`;
            link.textContent = component.title;
            li.appendChild(link);
            fragment.appendChild(li);
        });
        list.replaceChildren(fragment);
    }

    // -------------------------------------------------------------------------
    // 3. Hash Router with Allow-List Validation & Focus Management
    // -------------------------------------------------------------------------
    let isInitialLoad = true;
    let activeNavigationToken = 0;

    function getCurrentRouteKey() {
        const rawHash = window.location.hash || '#/';
        // Ignore in-page anchor target like #main-content
        if (rawHash === '#main-content') {
            return null;
        }
        const cleaned = rawHash.replace(/^#/, '');
        if (!cleaned || cleaned === '/') return '/';
        const normalized = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
        return normalized.replace(/\/+$/, '') || '/';
    }

        function updateNavState(route) {
            const activeRoute = route.route;
            const isComponentRoute = registry.components.some((c) => c.route === activeRoute);

            const navLinks = document.querySelectorAll('header nav a[data-route]');
            navLinks.forEach((link) => {
                const linkRoute = link.getAttribute('data-route');
                const isCurrent = linkRoute === activeRoute || (linkRoute === '/' && isComponentRoute);
                if (isCurrent) {
                    link.setAttribute('aria-current', 'page');
                } else {
                    link.removeAttribute('aria-current');
                }
            });

            const subnav = document.getElementById('header-subnav');
            const subnavCurrent = document.getElementById('header-subnav-current');
            if (subnav) {
                if (isComponentRoute) {
                    if (subnavCurrent) {
                        subnavCurrent.textContent = route.title;
                    }
                    subnav.removeAttribute('hidden');
                } else {
                    subnav.setAttribute('hidden', '');
                }
            }
        }

        function announceRoute(message) {
            const announcer = document.getElementById('route-announcer');
            if (!announcer) return;
            announcer.textContent = '';
            requestAnimationFrame(() => {
                announcer.textContent = message;
            });
        }

        function renderErrorState(container) {
            const section = document.createElement('section');
            section.className = 'doc-section';

            const heading = document.createElement('h1');
            heading.textContent = 'Unable to load view';

            const msg = document.createElement('p');
            msg.textContent = 'Something went wrong while loading this component. Please try returning to the component library.';

            const homeLink = document.createElement('a');
            homeLink.href = '#/';
            homeLink.className = 'btn btn-primary';
            homeLink.textContent = 'Back to Components';

            section.append(heading, msg, homeLink);
            container.replaceChildren(section);
        }

        async function renderRoute() {
            const routeKey = getCurrentRouteKey();
            if (routeKey === null) return;

            const route = routeMap.get(routeKey) || routeMap.get('/');
            const mainEl = document.getElementById('main-content');
            if (!mainEl || !route) return;

            const token = ++activeNavigationToken;

            // Notify active component modules to clean up listeners/body classes
            document.dispatchEvent(new Event('pageContentUnloading'));

            try {
                const [html] = await Promise.all([
                    fetchTemplate(route.template),
                    ensureStyles(route.styles)
                ]);

                if (token !== activeNavigationToken) return;

                mountHtmlSafely(mainEl, html);
                document.title = route.pageTitle;
                updateNavState(route);

                if (route.id === 'home') {
                    renderHomeComponentGrid();
                }

                await ensureScripts(route.scripts);
                if (token !== activeNavigationToken) return;

                document.dispatchEvent(new Event('pageContentLoaded'));

                if (!isInitialLoad) {
                    window.scrollTo({ top: 0, behavior: 'auto' });
                    mainEl.focus({ preventScroll: true });
                    announceRoute(`Navigated to ${route.title}`);
                }
                isInitialLoad = false;
            } catch (_error) {
                if (token !== activeNavigationToken) return;
                renderErrorState(mainEl);
                isInitialLoad = false;
            }
        }

        // -------------------------------------------------------------------------
        // 4. Accessible Global Component Search (Header Combobox)
        // -------------------------------------------------------------------------
        function initGlobalSearch() {
            const container = document.getElementById('global-search');
            const input = document.getElementById('global-search-input');
            const listbox = document.getElementById('global-search-listbox');
            const status = document.getElementById('global-search-status');
            if (!container || !input || !listbox) return;

            const searchableItems = [...registry.components, registry.pages.find((p) => p.id === 'documentation')].filter(Boolean);

            let isOpen = false;
            let matches = [];
            let activeIndex = -1;

            function announce(text) {
                if (!status) return;
                status.textContent = '';
                requestAnimationFrame(() => {
                    status.textContent = text;
                });
            }

            function close() {
                if (!isOpen) return;
                isOpen = false;
                activeIndex = -1;
                listbox.setAttribute('hidden', '');
                input.setAttribute('aria-expanded', 'false');
                input.removeAttribute('aria-activedescendant');
            }

            function open() {
                if (isOpen) return;
                isOpen = true;
                listbox.removeAttribute('hidden');
                input.setAttribute('aria-expanded', 'true');
            }

            function setActive(index) {
                const optionEls = listbox.querySelectorAll('[role="option"]');
                if (optionEls.length === 0) {
                    activeIndex = -1;
                    input.removeAttribute('aria-activedescendant');
                    return;
                }
                const wrapped = ((index % optionEls.length) + optionEls.length) % optionEls.length;
                activeIndex = wrapped;
                optionEls.forEach((el, idx) => {
                    el.classList.toggle('is-active', idx === wrapped);
                    el.setAttribute('aria-selected', idx === wrapped ? 'true' : 'false');
                });
                const activeEl = optionEls[wrapped];
                input.setAttribute('aria-activedescendant', activeEl.id);
                activeEl.scrollIntoView({ block: 'nearest' });
            }

            function navigateToEntry(entry) {
                if (!entry) return;
                input.value = '';
                close();
                if (window.location.hash === `#${entry.route}`) {
                    renderRoute();
                } else {
                    window.location.hash = `#${entry.route}`;
                }
            }

            function updateResults(query, shouldAnnounce) {
                const normalized = query.trim().toLowerCase();
                matches = searchableItems.filter((item) => {
                    if (!normalized) return true;
                    const haystack = [
                        item.title,
                        item.category,
                        item.description,
                        ...(item.keywords || [])
                    ]
                        .join(' ')
                        .toLowerCase();
                    return haystack.includes(normalized);
                });

                const fragment = document.createDocumentFragment();

                if (matches.length === 0) {
                    const empty = document.createElement('li');
                    empty.className = 'search-empty';
                    empty.textContent = `No matches for "${query.trim()}"`;
                    fragment.appendChild(empty);
                } else {
                    matches.forEach((item, idx) => {
                        const li = document.createElement('li');
                        li.id = `global-search-opt-${idx}`;
                        li.className = 'search-option';
                        li.setAttribute('role', 'option');
                        li.setAttribute('aria-selected', 'false');
                        li.dataset.route = item.route;

                        const topRow = document.createElement('div');
                        topRow.className = 'search-option-header';

                        const titleSpan = document.createElement('span');
                        titleSpan.className = 'search-option-title';
                        titleSpan.textContent = item.title;

                        const badge = document.createElement('span');
                        badge.className = 'search-option-badge';
                        badge.textContent = item.category;

                        topRow.append(titleSpan, badge);

                        const descSpan = document.createElement('span');
                        descSpan.className = 'search-option-desc';
                        descSpan.textContent = item.description;

                        li.append(topRow, descSpan);
                        fragment.appendChild(li);
                    });
                }

                listbox.replaceChildren(fragment);
                activeIndex = -1;
                input.removeAttribute('aria-activedescendant');

                if (shouldAnnounce) {
                    announce(
                        matches.length === 0
                            ? 'No matching components found.'
                            : `${matches.length} ${matches.length === 1 ? 'result' : 'results'} available.`
                    );
                }
            }

            input.addEventListener('focus', () => {
                updateResults(input.value, false);
                open();
            });

            input.addEventListener('input', () => {
                updateResults(input.value, true);
                open();
            });

            input.addEventListener('keydown', (e) => {
                switch (e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        if (!isOpen) {
                            updateResults(input.value, false);
                            open();
                        }
                        setActive(activeIndex + 1);
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        if (!isOpen) {
                            updateResults(input.value, false);
                            open();
                        }
                        setActive(activeIndex <= 0 ? matches.length - 1 : activeIndex - 1);
                        break;
                    case 'Enter':
                        if (isOpen && matches.length > 0) {
                            e.preventDefault();
                            const target = activeIndex >= 0 ? matches[activeIndex] : matches[0];
                            navigateToEntry(target);
                        }
                        break;
                    case 'Escape':
                        if (isOpen) {
                            e.preventDefault();
                            close();
                        } else if (input.value) {
                            e.preventDefault();
                            input.value = '';
                            announce('Search cleared.');
                        }
                        break;
                    case 'Tab':
                        close();
                        break;
                    default:
                        break;
                }
            });

            listbox.addEventListener('mousedown', (e) => {
                e.preventDefault();
            });

            listbox.addEventListener('click', (e) => {
                const option = e.target.closest('[role="option"]');
                if (!option) return;
                const entry = routeMap.get(option.dataset.route);
                navigateToEntry(entry);
            });

            container.addEventListener('focusout', (e) => {
                if (!container.contains(e.relatedTarget)) {
                    close();
                }
            });

            document.addEventListener('click', (e) => {
                if (isOpen && !container.contains(e.target)) {
                    close();
                }
            });

            // Keyboard shortcut "/" focuses global search when not already typing in a field
            document.addEventListener('keydown', (e) => {
                if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
                const tag = document.activeElement ? document.activeElement.tagName : '';
                const isEditable =
                    tag === 'INPUT' ||
                    tag === 'TEXTAREA' ||
                    tag === 'SELECT' ||
                    (document.activeElement && document.activeElement.isContentEditable);
                if (!isEditable) {
                    e.preventDefault();
                    input.focus();
                }
            });
        }

        // -------------------------------------------------------------------------
        // 5. Theme Toggle, Viewport Simulator & Skip Link
        // -------------------------------------------------------------------------
        function initShellControls() {
            const themeToggleBtn = document.getElementById('theme-toggle');
            if (themeToggleBtn) {
                const updateThemeButton = (theme) => {
                    themeToggleBtn.setAttribute(
                        'aria-label',
                        theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'
                    );
                };
                const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
                updateThemeButton(currentTheme);

                themeToggleBtn.addEventListener('click', () => {
                    const active = document.documentElement.getAttribute('data-theme') || 'dark';
                    const next = active === 'light' ? 'dark' : 'light';
                    document.documentElement.setAttribute('data-theme', next);
                    localStorage.setItem('theme', next);
                    updateThemeButton(next);
                });
            }

            const viewportToggleBtn = document.getElementById('viewport-toggle');
            if (viewportToggleBtn) {
                const updateViewportButton = (view) => {
                    viewportToggleBtn.setAttribute(
                        'aria-label',
                        view === 'mobile' ? 'Switch to desktop view' : 'Switch to mobile view'
                    );
                };
                const currentView = document.documentElement.getAttribute('data-view') || 'desktop';
                updateViewportButton(currentView);

                viewportToggleBtn.addEventListener('click', () => {
                    const active = document.documentElement.getAttribute('data-view') || 'desktop';
                    const next = active === 'mobile' ? 'desktop' : 'mobile';
                    document.documentElement.setAttribute('data-view', next);
                    localStorage.setItem('view', next);
                    updateViewportButton(next);
                });
            }

            const skipLink = document.querySelector('.skip-link');
            if (skipLink) {
                skipLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    const mainEl = document.getElementById('main-content');
                    if (mainEl) {
                        mainEl.focus();
                        mainEl.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            }
        }

        // -------------------------------------------------------------------------
        // 6. Boot Application
        // -------------------------------------------------------------------------
        document.addEventListener('DOMContentLoaded', () => {
            initShellControls();
            renderFooterComponents();
            initGlobalSearch();

            window.addEventListener('hashchange', renderRoute);
            renderRoute();
        });
    }) ();
