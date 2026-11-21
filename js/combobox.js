/**
 * W3C WAI-ARIA Combobox Pattern
 * Supports both editable autocomplete comboboxes (<input role="combobox">)
 * and select-only comboboxes (<button role="combobox">).
 */
class AccessibleCombobox {
        constructor(wrapper, signal) {
            this.wrapper = wrapper;
            this.signal = signal;
            this.combobox = wrapper.querySelector('[role="combobox"]');
            this.listboxId = this.combobox ? this.combobox.getAttribute('aria-controls') : null;
            this.listbox = this.listboxId ? document.getElementById(this.listboxId) : wrapper.querySelector('[role="listbox"]');
            this.toggleBtn = wrapper.querySelector('[data-combobox-toggle]');
            this.liveRegion = wrapper.querySelector('[data-combobox-status]');
            this.readout = wrapper.querySelector('[data-combobox-value]');
            this.noResultsEl = this.listbox ? this.listbox.querySelector('[data-combobox-empty]') : null;

            if (!this.combobox || !this.listbox) return;

            this.isEditable = this.combobox.tagName === 'INPUT';
            this.options = Array.from(this.listbox.querySelectorAll('[role="option"]'));
            this.activeIndex = -1;
            this.selectedOption = this.options.find(opt => opt.getAttribute('aria-selected') === 'true') || null;
            this.isOpen = false;
            this.typeaheadBuffer = '';
            this.typeaheadTimer = null;

            this.bindEvents();
        }

        bindEvents() {
            this.combobox.addEventListener('keydown', this.onKeydown.bind(this));
            this.combobox.addEventListener('click', this.onComboboxClick.bind(this));

            if (this.isEditable) {
                this.combobox.addEventListener('input', this.onInput.bind(this));
            }

            if (this.toggleBtn) {
                this.toggleBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (this.isOpen) {
                        this.close();
                    } else {
                        if (this.isEditable) {
                            this.filterOptions('');
                        }
                        this.open();
                    }
                    this.combobox.focus();
                });
            }

            this.listbox.addEventListener('mousedown', (e) => {
                // Prevent input blur before option click completes
                e.preventDefault();
            });

            this.listbox.addEventListener('click', (e) => {
                const option = e.target.closest('[role="option"]');
                if (option && !option.hidden) {
                    this.selectOption(option);
                    this.close();
                    this.combobox.focus();
                }
            });

            this.wrapper.addEventListener('focusout', (e) => {
                if (!this.wrapper.contains(e.relatedTarget)) {
                    this.close();
                }
            });

            document.addEventListener('click', (e) => {
                if (this.isOpen && !this.wrapper.contains(e.target)) {
                    this.close();
                }
        }, this.signal ? { signal: this.signal } : undefined);
    }

    getVisibleOptions() {
        return this.options.filter(opt => !opt.hidden);
    }

    open() {
        if (this.isOpen) return;
        this.isOpen = true;
        this.listbox.removeAttribute('hidden');
        this.combobox.setAttribute('aria-expanded', 'true');
        if (this.toggleBtn) {
            this.toggleBtn.setAttribute('aria-expanded', 'true');
        }
    }

    close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        this.listbox.setAttribute('hidden', '');
        this.combobox.setAttribute('aria-expanded', 'false');
        if (this.toggleBtn) {
            this.toggleBtn.setAttribute('aria-expanded', 'false');
        }
        this.clearActiveDescendant();
    }

    setActiveIndex(visibleIndex) {
        const visible = this.getVisibleOptions();
        if (visible.length === 0) {
            this.clearActiveDescendant();
            return;
        }

        const wrappedIndex = ((visibleIndex % visible.length) + visible.length) % visible.length;
        this.activeIndex = wrappedIndex;

        this.options.forEach(opt => opt.classList.remove('is-active'));
        const activeOption = visible[wrappedIndex];
        activeOption.classList.add('is-active');
        this.combobox.setAttribute('aria-activedescendant', activeOption.id);
        activeOption.scrollIntoView({ block: 'nearest' });
    }

    clearActiveDescendant() {
        this.activeIndex = -1;
        this.options.forEach(opt => opt.classList.remove('is-active'));
        this.combobox.removeAttribute('aria-activedescendant');
    }

    selectOption(option) {
        this.options.forEach(opt => opt.setAttribute('aria-selected', 'false'));
        option.setAttribute('aria-selected', 'true');
        this.selectedOption = option;

        const label = option.dataset.value || option.textContent.trim();

        if (this.isEditable) {
            this.combobox.value = label;
            this.filterOptions('');
        } else {
            const textEl = this.combobox.querySelector('[data-combobox-button-text]');
            if (textEl) {
                textEl.textContent = label;
                textEl.classList.remove('is-placeholder');
            }
        }

        if (this.readout) {
            this.readout.textContent = label;
        }

        this.announce(`${label} selected.`);
    }

    filterOptions(query) {
        const normalized = query.trim().toLowerCase();
        let matchCount = 0;

        this.options.forEach(option => {
            const text = (option.dataset.value || option.textContent).trim().toLowerCase();
            const isMatch = normalized === '' || text.includes(normalized);
            option.hidden = !isMatch;
            if (isMatch) matchCount++;
        });

        if (this.noResultsEl) {
            this.noResultsEl.hidden = matchCount > 0;
        }

        return matchCount;
    }

    announce(message) {
        if (!this.liveRegion) return;
        this.liveRegion.textContent = '';
        // Brief clear ensures screen readers re-announce identical messages
        requestAnimationFrame(() => {
            this.liveRegion.textContent = message;
        });
    }

    onComboboxClick() {
        if (this.isEditable) {
            if (!this.isOpen) {
                this.filterOptions(this.combobox.value);
                this.open();
            }
        } else {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
                const visible = this.getVisibleOptions();
                const selectedIdx = this.selectedOption ? visible.indexOf(this.selectedOption) : 0;
                this.setActiveIndex(selectedIdx >= 0 ? selectedIdx : 0);
            }
        }
    }

    onInput() {
        const count = this.filterOptions(this.combobox.value);
        this.clearActiveDescendant();
        this.open();
        this.announce(count === 0 ? 'No results found.' : `${count} ${count === 1 ? 'result' : 'results'} available.`);
    }

    handleTypeahead(key) {
        clearTimeout(this.typeaheadTimer);
        this.typeaheadBuffer += key.toLowerCase();
        this.typeaheadTimer = setTimeout(() => {
            this.typeaheadBuffer = '';
        }, 500);

        const visible = this.getVisibleOptions();
        if (visible.length === 0) return;

        const startIndex = this.isOpen && this.activeIndex >= 0 ? this.activeIndex : 0;
        for (let i = 0; i < visible.length; i++) {
            const idx = (startIndex + (this.typeaheadBuffer.length === 1 ? i + 1 : i)) % visible.length;
            const text = (visible[idx].dataset.value || visible[idx].textContent).trim().toLowerCase();
            if (text.startsWith(this.typeaheadBuffer)) {
                if (!this.isOpen) this.open();
                this.setActiveIndex(idx);
                return;
            }
        }
    }

    onKeydown(event) {
        const { key, altKey } = event;
        const visible = this.getVisibleOptions();

        switch (key) {
            case 'ArrowDown':
                event.preventDefault();
                if (!this.isOpen) {
                    if (this.isEditable) {
                        this.filterOptions(this.combobox.value);
                    }
                    this.open();
                    if (!altKey && this.getVisibleOptions().length > 0) {
                        const selectedIdx = this.selectedOption ? this.getVisibleOptions().indexOf(this.selectedOption) : 0;
                        this.setActiveIndex(selectedIdx >= 0 ? selectedIdx : 0);
                    }
                } else if (visible.length > 0) {
                    this.setActiveIndex(this.activeIndex + 1);
                }
                break;

            case 'ArrowUp':
                event.preventDefault();
                if (altKey && this.isOpen) {
                    this.close();
                    return;
                }
                if (!this.isOpen) {
                    if (this.isEditable) {
                        this.filterOptions(this.combobox.value);
                    }
                    this.open();
                    const openVisible = this.getVisibleOptions();
                    if (openVisible.length > 0) {
                        const selectedIdx = this.selectedOption ? openVisible.indexOf(this.selectedOption) : openVisible.length - 1;
                        this.setActiveIndex(selectedIdx >= 0 ? selectedIdx : openVisible.length - 1);
                    }
                } else if (visible.length > 0) {
                    this.setActiveIndex(this.activeIndex <= 0 ? visible.length - 1 : this.activeIndex - 1);
                }
                break;

            case 'Home':
                if (!this.isEditable) {
                    event.preventDefault();
                    if (!this.isOpen) this.open();
                    this.setActiveIndex(0);
                }
                break;

            case 'End':
                if (!this.isEditable) {
                    event.preventDefault();
                    if (!this.isOpen) this.open();
                    this.setActiveIndex(this.getVisibleOptions().length - 1);
                }
                break;

            case 'Enter':
                if (this.isOpen && this.activeIndex >= 0 && visible[this.activeIndex]) {
                    event.preventDefault();
                    this.selectOption(visible[this.activeIndex]);
                    this.close();
                } else if (!this.isEditable && !this.isOpen) {
                    event.preventDefault();
                    this.open();
                    const selectedIdx = this.selectedOption ? visible.indexOf(this.selectedOption) : 0;
                    this.setActiveIndex(selectedIdx >= 0 ? selectedIdx : 0);
                }
                break;

            case ' ':
                if (!this.isEditable) {
                    event.preventDefault();
                    if (!this.isOpen) {
                        this.open();
                        const selectedIdx = this.selectedOption ? visible.indexOf(this.selectedOption) : 0;
                        this.setActiveIndex(selectedIdx >= 0 ? selectedIdx : 0);
                    } else if (this.activeIndex >= 0 && visible[this.activeIndex]) {
                        this.selectOption(visible[this.activeIndex]);
                        this.close();
                    } else {
                        this.close();
                    }
                }
                break;

            case 'Escape':
                if (this.isOpen) {
                    event.preventDefault();
                    this.close();
                } else if (this.isEditable && this.combobox.value !== '') {
                    event.preventDefault();
                    this.combobox.value = '';
                    this.filterOptions('');
                    if (this.readout) {
                        this.readout.textContent = 'None';
                    }
                    this.options.forEach(opt => opt.setAttribute('aria-selected', 'false'));
                    this.selectedOption = null;
                    this.announce('Input cleared.');
                }
                break;

            case 'Tab':
                if (this.isOpen) {
                    this.close();
                }
                break;

            default:
                if (!this.isEditable && key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
                    event.preventDefault();
                    this.handleTypeahead(key);
                }
                break;
        }
    }
}

let comboboxAbortController = null;

function initComboboxes() {
    if (comboboxAbortController) {
        comboboxAbortController.abort();
    }
    comboboxAbortController = new AbortController();

    const wrappers = document.querySelectorAll('[data-combobox]');
    wrappers.forEach(wrapper => {
        if (!wrapper.dataset.initialized) {
            new AccessibleCombobox(wrapper, comboboxAbortController.signal);
            wrapper.dataset.initialized = 'true';
        }
    });
}

document.addEventListener('DOMContentLoaded', initComboboxes);
document.addEventListener('pageContentLoaded', initComboboxes);
document.addEventListener('pageContentUnloading', () => {
    if (comboboxAbortController) {
        comboboxAbortController.abort();
        comboboxAbortController = null;
    }
});
