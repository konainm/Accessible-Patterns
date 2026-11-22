/**
 * W3C WAI-ARIA APG Menubar Pattern
 * Implements single-tab-stop roving tabindex, nested submenus, menuitemcheckbox,
 * menuitemradio groups, first-character type-ahead, and full keyboard/pointer support.
 */
(function () {
    'use strict';

    const ITEM_SELECTOR = '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]';
    const SIZE_ORDER = ['sm', 'md', 'lg', 'xl'];
    const SIZE_LABELS = { sm: 'Small', md: 'Medium', lg: 'Large', xl: 'Extra Large' };

    class AccessibleMenubar {
        constructor(menubarEl, signal) {
            this.menubar = menubarEl;
            this.demoRoot = menubarEl.closest('[data-menubar-demo]');
            this.demoType = this.demoRoot ? this.demoRoot.dataset.menubarDemo : null;
            this.liveRegion = this.demoRoot ? this.demoRoot.querySelector('[data-menubar-status]') : null;
            this.signal = signal;

            this.topItems = this.getDirectMenuItems(this.menubar);
            this.activeTopIndex = 0;

            // Editor demo state
            this.editorState = {
                font: 'sans',
                fontLabel: 'Sans-serif',
                bold: false,
                italic: false,
                underline: false,
                align: 'left',
                alignLabel: 'Left',
                size: 'md'
            };

            this.bindEvents();
        }

        // Return immediate menu items belonging to a specific menubar or menu (not nested submenus)
        getDirectMenuItems(menuEl) {
            return Array.from(menuEl.querySelectorAll(ITEM_SELECTOR)).filter(
                (item) => item.closest('[role="menubar"], [role="menu"]') === menuEl
            );
        }

        getSubmenu(item) {
            if (!item || item.getAttribute('aria-haspopup') !== 'true') return null;
            const parentLi = item.parentElement;
            if (!parentLi) return null;
            return Array.from(parentLi.children).find((el) => el.getAttribute('role') === 'menu') || null;
        }

        getParentTrigger(menuEl) {
            if (!menuEl || menuEl === this.menubar) return null;
            const parentLi = menuEl.parentElement;
            if (!parentLi) return null;
            return Array.from(parentLi.children).find((el) => el.matches(ITEM_SELECTOR)) || null;
        }

        isAnyTopMenuOpen() {
            return this.topItems.some((item) => item.getAttribute('aria-expanded') === 'true');
        }

        setRovingTopItem(index) {
            const wrapped = ((index % this.topItems.length) + this.topItems.length) % this.topItems.length;
            this.activeTopIndex = wrapped;
            this.topItems.forEach((item, idx) => {
                item.setAttribute('tabindex', idx === wrapped ? '0' : '-1');
            });
            return this.topItems[wrapped];
        }

        openMenu(trigger) {
            const submenu = this.getSubmenu(trigger);
            if (!submenu) return null;

            // Close sibling menus at the same level
            const parentMenu = trigger.closest('[role="menubar"], [role="menu"]');
            this.getDirectMenuItems(parentMenu).forEach((sibling) => {
                if (sibling !== trigger) {
                    this.closeSubtree(sibling);
                }
            });

            trigger.setAttribute('aria-expanded', 'true');
            submenu.removeAttribute('hidden');
            return submenu;
        }

        closeSubtree(trigger) {
            const submenu = this.getSubmenu(trigger);
            if (!submenu) return;
            // Recursively close nested submenus
            submenu.querySelectorAll('[aria-expanded="true"]').forEach((nestedTrigger) => {
                nestedTrigger.setAttribute('aria-expanded', 'false');
            });
            submenu.querySelectorAll('[role="menu"]').forEach((nestedMenu) => {
                nestedMenu.setAttribute('hidden', '');
            });
            trigger.setAttribute('aria-expanded', 'false');
            submenu.setAttribute('hidden', '');
        }

        closeAllMenus() {
            this.topItems.forEach((item) => this.closeSubtree(item));
        }

        focusMenuItem(menuEl, index) {
            const items = this.getDirectMenuItems(menuEl);
            if (items.length === 0) return;
            const wrapped = ((index % items.length) + items.length) % items.length;
            if (menuEl === this.menubar) {
                this.setRovingTopItem(wrapped);
            }
            items[wrapped].focus();
        }

        focusByFirstChar(menuEl, currentItem, char) {
            const items = this.getDirectMenuItems(menuEl);
            if (items.length === 0) return;
            const targetChar = char.toLowerCase();
            const currentIndex = items.indexOf(currentItem);
            for (let i = 1; i <= items.length; i++) {
                const idx = (currentIndex + i) % items.length;
                const text = items[idx].textContent.trim().toLowerCase();
                if (text.startsWith(targetChar)) {
                    this.focusMenuItem(menuEl, idx);
                    return;
                }
            }
        }

        announce(message) {
            if (!this.liveRegion) return;
            this.liveRegion.textContent = '';
            requestAnimationFrame(() => {
                this.liveRegion.textContent = message;
            });
        }

        activateItem(item) {
            const role = item.getAttribute('role');
            const action = item.dataset.action;
            const value = item.dataset.value;
            const label = item.dataset.label || item.textContent.trim();

            if (role === 'menuitemcheckbox') {
                const nextChecked = item.getAttribute('aria-checked') !== 'true';
                item.setAttribute('aria-checked', String(nextChecked));
                if (this.demoType === 'editor' && action === 'style' && value) {
                    this.editorState[value] = nextChecked;
                    this.syncEditorPreview();
                    this.announce(`${label} ${nextChecked ? 'enabled' : 'disabled'}.`);
                }
            } else if (role === 'menuitemradio') {
                const group = item.closest('[role="group"]') || item.closest('[role="menu"]');
                if (group) {
                    group.querySelectorAll('[role="menuitemradio"]').forEach((radio) => {
                        radio.setAttribute('aria-checked', radio === item ? 'true' : 'false');
                    });
                }
                if (this.demoType === 'editor') {
                    if (action === 'font' && value) {
                        this.editorState.font = value;
                        this.editorState.fontLabel = label;
                    } else if (action === 'align' && value) {
                        this.editorState.align = value;
                        this.editorState.alignLabel = label;
                    } else if (action === 'size' && value) {
                        this.editorState.size = value;
                    }
                    this.syncEditorPreview();
                    this.announce(`${label} selected.`);
                }
            } else if (this.demoType === 'editor') {
                if (action === 'size-step') {
                    const idx = SIZE_ORDER.indexOf(this.editorState.size);
                    const nextIdx =
                        value === 'larger'
                            ? Math.min(SIZE_ORDER.length - 1, idx + 1)
                            : Math.max(0, idx - 1);
                    this.editorState.size = SIZE_ORDER[nextIdx];
                    this.syncSizeRadios();
                    this.syncEditorPreview();
                    this.announce(`Font size set to ${SIZE_LABELS[this.editorState.size]}.`);
                } else if (action === 'reset') {
                    this.resetEditor();
                    this.announce('Formatting reset to defaults.');
                }
            } else if (this.demoType === 'nav' && action === 'navigate') {
                const readout = this.demoRoot ? this.demoRoot.querySelector('[data-nav-readout]') : null;
                if (readout) {
                    readout.textContent = label;
                }
                this.announce(`Selected ${label}.`);
            }

            // Close open menus and restore focus to active top-level menubar item
            const topItem = this.topItems[this.activeTopIndex];
            this.closeAllMenus();
            if (topItem) {
                topItem.focus();
            }
        }

        syncSizeRadios() {
            this.menubar.querySelectorAll('[data-action="size"]').forEach((radio) => {
                radio.setAttribute('aria-checked', radio.dataset.value === this.editorState.size ? 'true' : 'false');
            });
        }

        syncEditorPreview() {
            const preview = this.demoRoot ? this.demoRoot.querySelector('#editor-preview') : null;
            const summary = this.demoRoot ? this.demoRoot.querySelector('[data-editor-summary]') : null;
            if (!preview) return;

            const classes = [
                'editor-preview-box',
                `preview-font-${this.editorState.font}`,
                `preview-align-${this.editorState.align}`,
                `preview-size-${this.editorState.size}`
            ];
            if (this.editorState.bold) classes.push('preview-bold');
            if (this.editorState.italic) classes.push('preview-italic');
            if (this.editorState.underline) classes.push('preview-underline');
            preview.className = classes.join(' ');

            if (summary) {
                const styles = [];
                if (this.editorState.bold) styles.push('Bold');
                if (this.editorState.italic) styles.push('Italic');
                if (this.editorState.underline) styles.push('Underline');
                const parts = [
                    this.editorState.fontLabel,
                    styles.length ? styles.join(', ') : 'Regular',
                    this.editorState.alignLabel,
                    SIZE_LABELS[this.editorState.size]
                ];
                summary.textContent = parts.join(' · ');
            }
        }

        resetEditor() {
            this.editorState = {
                font: 'sans',
                fontLabel: 'Sans-serif',
                bold: false,
                italic: false,
                underline: false,
                align: 'left',
                alignLabel: 'Left',
                size: 'md'
            };

            this.menubar.querySelectorAll('[data-action="font"]').forEach((el) => {
                el.setAttribute('aria-checked', el.dataset.value === 'sans' ? 'true' : 'false');
            });
            this.menubar.querySelectorAll('[data-action="style"]').forEach((el) => {
                el.setAttribute('aria-checked', 'false');
            });
            this.menubar.querySelectorAll('[data-action="align"]').forEach((el) => {
                el.setAttribute('aria-checked', el.dataset.value === 'left' ? 'true' : 'false');
            });
            this.syncSizeRadios();
            this.syncEditorPreview();
        }

        onTopItemKeydown(event, item) {
            const index = this.topItems.indexOf(item);
            const hasPopup = item.getAttribute('aria-haspopup') === 'true';
            const wasOpen = this.isAnyTopMenuOpen();

            switch (event.key) {
                case 'ArrowRight': {
                    event.preventDefault();
                    const next = this.setRovingTopItem(index + 1);
                    if (wasOpen) {
                        this.closeAllMenus();
                        if (next.getAttribute('aria-haspopup') === 'true') {
                            this.openMenu(next);
                        }
                    }
                    next.focus();
                    break;
                }
                case 'ArrowLeft': {
                    event.preventDefault();
                    const prev = this.setRovingTopItem(index - 1);
                    if (wasOpen) {
                        this.closeAllMenus();
                        if (prev.getAttribute('aria-haspopup') === 'true') {
                            this.openMenu(prev);
                        }
                    }
                    prev.focus();
                    break;
                }
                case 'ArrowDown':
                    if (hasPopup) {
                        event.preventDefault();
                        const submenu = this.openMenu(item);
                        if (submenu) this.focusMenuItem(submenu, 0);
                    }
                    break;
                case 'ArrowUp':
                    if (hasPopup) {
                        event.preventDefault();
                        const submenu = this.openMenu(item);
                        if (submenu) {
                            const items = this.getDirectMenuItems(submenu);
                            this.focusMenuItem(submenu, items.length - 1);
                        }
                    }
                    break;
                case 'Enter':
                case ' ':
                    event.preventDefault();
                    if (hasPopup) {
                        const submenu = this.openMenu(item);
                        if (submenu) this.focusMenuItem(submenu, 0);
                    } else {
                        this.activateItem(item);
                    }
                    break;
                case 'Home': {
                    event.preventDefault();
                    this.closeAllMenus();
                    const first = this.setRovingTopItem(0);
                    first.focus();
                    break;
                }
                case 'End': {
                    event.preventDefault();
                    this.closeAllMenus();
                    const last = this.setRovingTopItem(this.topItems.length - 1);
                    last.focus();
                    break;
                }
                case 'Escape':
                    if (wasOpen) {
                        event.preventDefault();
                        this.closeAllMenus();
                    }
                    break;
                case 'Tab':
                    this.closeAllMenus();
                    break;
                default:
                    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
                        event.preventDefault();
                        this.focusByFirstChar(this.menubar, item, event.key);
                    }
                    break;
            }
        }

        onMenuItemKeydown(event, item, currentMenu) {
            const items = this.getDirectMenuItems(currentMenu);
            const index = items.indexOf(item);
            const hasPopup = item.getAttribute('aria-haspopup') === 'true';
            const parentTrigger = this.getParentTrigger(currentMenu);
            const parentMenu = parentTrigger ? parentTrigger.closest('[role="menubar"], [role="menu"]') : null;

            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    this.focusMenuItem(currentMenu, index + 1);
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    this.focusMenuItem(currentMenu, index - 1);
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    if (hasPopup) {
                        const submenu = this.openMenu(item);
                        if (submenu) this.focusMenuItem(submenu, 0);
                    } else {
                        this.closeAllMenus();
                        const nextTop = this.setRovingTopItem(this.activeTopIndex + 1);
                        if (nextTop.getAttribute('aria-haspopup') === 'true') {
                            const nextMenu = this.openMenu(nextTop);
                            if (nextMenu) this.focusMenuItem(nextMenu, 0);
                        } else {
                            nextTop.focus();
                        }
                    }
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    if (parentMenu && parentMenu !== this.menubar && parentTrigger) {
                        this.closeSubtree(parentTrigger);
                        parentTrigger.focus();
                    } else {
                        this.closeAllMenus();
                        const prevTop = this.setRovingTopItem(this.activeTopIndex - 1);
                        if (prevTop.getAttribute('aria-haspopup') === 'true') {
                            const prevMenu = this.openMenu(prevTop);
                            if (prevMenu) this.focusMenuItem(prevMenu, 0);
                        } else {
                            prevTop.focus();
                        }
                    }
                    break;
                case 'Home':
                    event.preventDefault();
                    this.focusMenuItem(currentMenu, 0);
                    break;
                case 'End':
                    event.preventDefault();
                    this.focusMenuItem(currentMenu, items.length - 1);
                    break;
                case 'Enter':
                case ' ':
                    event.preventDefault();
                    if (hasPopup) {
                        const submenu = this.openMenu(item);
                        if (submenu) this.focusMenuItem(submenu, 0);
                    } else {
                        this.activateItem(item);
                    }
                    break;
                case 'Escape':
                    event.preventDefault();
                    if (parentTrigger) {
                        this.closeSubtree(parentTrigger);
                        parentTrigger.focus();
                    } else {
                        this.closeAllMenus();
                    }
                    break;
                case 'Tab':
                    this.closeAllMenus();
                    break;
                default:
                    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
                        event.preventDefault();
                        this.focusByFirstChar(currentMenu, item, event.key);
                    }
                    break;
            }
        }

        bindEvents() {
            this.menubar.addEventListener('keydown', (event) => {
                const item = event.target.closest(ITEM_SELECTOR);
                if (!item || !this.menubar.contains(item)) return;
                const containerMenu = item.closest('[role="menubar"], [role="menu"]');
                if (containerMenu === this.menubar) {
                    this.onTopItemKeydown(event, item);
                } else {
                    this.onMenuItemKeydown(event, item, containerMenu);
                }
            });

            this.menubar.addEventListener('click', (event) => {
                const item = event.target.closest(ITEM_SELECTOR);
                if (!item || !this.menubar.contains(item)) return;
                event.stopPropagation();

                const containerMenu = item.closest('[role="menubar"], [role="menu"]');
                const hasPopup = item.getAttribute('aria-haspopup') === 'true';

                if (containerMenu === this.menubar) {
                    const topIdx = this.topItems.indexOf(item);
                    if (topIdx >= 0) this.setRovingTopItem(topIdx);

                    if (hasPopup) {
                        if (item.getAttribute('aria-expanded') === 'true') {
                            this.closeSubtree(item);
                        } else {
                            this.openMenu(item);
                        }
                    } else {
                        this.activateItem(item);
                    }
                } else if (hasPopup) {
                    if (item.getAttribute('aria-expanded') === 'true') {
                        this.closeSubtree(item);
                    } else {
                        this.openMenu(item);
                    }
                } else {
                    this.activateItem(item);
                }
            });

            // Classic menubar hover switching when a menu is already open
            this.menubar.addEventListener('pointerover', (event) => {
                const item = event.target.closest(ITEM_SELECTOR);
                if (!item || !this.menubar.contains(item)) return;
                const containerMenu = item.closest('[role="menubar"], [role="menu"]');

                if (containerMenu === this.menubar) {
                    if (this.isAnyTopMenuOpen()) {
                        const topIdx = this.topItems.indexOf(item);
                        if (topIdx >= 0) this.setRovingTopItem(topIdx);
                        if (item.getAttribute('aria-haspopup') === 'true') {
                            this.openMenu(item);
                        } else {
                            this.closeAllMenus();
                        }
                    }
                } else {
                    if (item.getAttribute('aria-haspopup') === 'true') {
                        this.openMenu(item);
                    } else {
                        this.getDirectMenuItems(containerMenu).forEach((sibling) => {
                            if (sibling !== item) this.closeSubtree(sibling);
                        });
                    }
                }
            });

            this.menubar.addEventListener('focusout', (event) => {
                if (!this.menubar.contains(event.relatedTarget)) {
                    this.closeAllMenus();
                }
            });

            document.addEventListener(
                'click',
                (event) => {
                    if (!this.menubar.contains(event.target)) {
                        this.closeAllMenus();
                    }
                },
                this.signal ? { signal: this.signal } : undefined
            );
        }
    }

    let menubarAbortController = null;

    function initMenubars() {
        if (menubarAbortController) {
            menubarAbortController.abort();
        }
        menubarAbortController = new AbortController();

        document.querySelectorAll('[data-menubar]').forEach((menubarEl) => {
            if (!menubarEl.dataset.initialized) {
                new AccessibleMenubar(menubarEl, menubarAbortController.signal);
                menubarEl.dataset.initialized = 'true';
            }
        });
    }

    document.addEventListener('DOMContentLoaded', initMenubars);
    document.addEventListener('pageContentLoaded', initMenubars);
    document.addEventListener('pageContentUnloading', () => {
        if (menubarAbortController) {
            menubarAbortController.abort();
            menubarAbortController = null;
        }
    });
})();
