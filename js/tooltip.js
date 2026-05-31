/**
 * Accessible Tooltip & Toggletip (Tooltip Dialog) Component
 * Follows W3C WAI-ARIA guidelines for tooltips and non-modal dialogs.
 */

class AccessibleTooltip {
    constructor(trigger) {
        this.trigger = trigger;
        this.tooltipId = this.trigger.getAttribute('aria-describedby');
        this.tooltip = document.getElementById(this.tooltipId);
        
        if (!this.tooltip) return;

        this.init();
    }

    init() {
        // Show events
        this.trigger.addEventListener('mouseenter', () => this.show());
        this.trigger.addEventListener('focusin', () => this.show());

        // Hide events
        this.trigger.addEventListener('mouseleave', () => this.hide());
        this.trigger.addEventListener('focusout', () => this.hide());

        // Keyboard dismiss
        this.trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                this.hide();
            }
        });
    }

    show() {
        this.tooltip.classList.add('visible');
    }

    hide() {
        this.tooltip.classList.remove('visible');
    }
}

class AccessibleToggletip {
    constructor(trigger) {
        this.trigger = trigger;
        const targetId = this.trigger.getAttribute('aria-controls');
        this.dialog = document.getElementById(targetId);
        
        if (!this.dialog) return;

        this.isOpen = false;
        this.init();
    }

    init() {
        this.trigger.setAttribute('aria-expanded', 'false');
        
        this.trigger.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent document click from immediately closing
            this.toggle();
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.dialog.contains(e.target) && !this.trigger.contains(e.target)) {
                this.close();
            }
        });

        // Close on Escape
        this.dialog.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                e.preventDefault();
                this.close();
                this.trigger.focus();
            }
        });
        
        // Also listen on trigger for Escape
        this.trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                e.preventDefault();
                this.close();
            }
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        // Close all other open toggletips first
        document.querySelectorAll('.tooltip-dialog.visible').forEach(dialog => {
            if (dialog !== this.dialog) {
                const associatedTrigger = document.querySelector(`[aria-controls="${dialog.id}"]`);
                if (associatedTrigger) {
                    associatedTrigger.setAttribute('aria-expanded', 'false');
                }
                dialog.classList.remove('visible');
            }
        });

        this.dialog.classList.add('visible');
        this.trigger.setAttribute('aria-expanded', 'true');
        this.isOpen = true;
    }

    close() {
        this.dialog.classList.remove('visible');
        this.trigger.setAttribute('aria-expanded', 'false');
        this.isOpen = false;
    }
}

// Global initialization function for SPA router
function initTooltips() {
    // Initialize standard hover/focus tooltips
    const standardTriggers = document.querySelectorAll('[data-tooltip-trigger]');
    standardTriggers.forEach(trigger => {
        if (!trigger.dataset.initialized) {
            new AccessibleTooltip(trigger);
            trigger.dataset.initialized = 'true';
        }
    });

    // Initialize click-based toggletips (dialogs)
    const toggleTriggers = document.querySelectorAll('[data-toggletip-trigger]');
    toggleTriggers.forEach(trigger => {
        if (!trigger.dataset.initialized) {
            new AccessibleToggletip(trigger);
            trigger.dataset.initialized = 'true';
        }
    });
}

// Initialize on DOM load and SPA navigation
document.addEventListener('DOMContentLoaded', initTooltips);
document.addEventListener('pageContentLoaded', initTooltips);
