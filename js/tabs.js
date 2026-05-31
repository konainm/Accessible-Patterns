class AccessibleTabs {
    constructor(groupNode) {
        this.tablistNode = groupNode;
        this.tabs = Array.from(this.tablistNode.querySelectorAll('[role="tab"]'));
        this.tabpanels = [];
        
        // Determine activation mode (automatic or manual)
        this.activationMode = this.tablistNode.getAttribute('data-activation') || 'automatic';

        for (let i = 0; i < this.tabs.length; i += 1) {
            const tab = this.tabs[i];
            const tabpanel = document.getElementById(tab.getAttribute('aria-controls'));
            
            if (tabpanel) {
                this.tabpanels.push(tabpanel);
            }

            tab.addEventListener('keydown', this.onKeydown.bind(this));
            tab.addEventListener('click', this.onClick.bind(this));
            
            // Set first tab to active if none are selected
            if (i === 0 && !this.tabs.some(t => t.getAttribute('aria-selected') === 'true')) {
                tab.setAttribute('aria-selected', 'true');
                tab.setAttribute('tabindex', '0');
                if (tabpanel) {
                    tabpanel.removeAttribute('hidden');
                }
            } else if (tab.getAttribute('aria-selected') !== 'true') {
                tab.setAttribute('tabindex', '-1');
                if (tabpanel) {
                    tabpanel.setAttribute('hidden', '');
                }
            }
        }
    }

    onKeydown(event) {
        const currentTab = event.currentTarget;
        let nextTab = null;
        const currentIndex = this.tabs.indexOf(currentTab);

        const orientation = this.tablistNode.getAttribute('aria-orientation') || 'horizontal';

        switch (event.key) {
            case 'ArrowLeft':
                if (orientation === 'horizontal') {
                    nextTab = currentIndex === 0 ? this.tabs[this.tabs.length - 1] : this.tabs[currentIndex - 1];
                }
                break;
            case 'ArrowRight':
                if (orientation === 'horizontal') {
                    nextTab = currentIndex === this.tabs.length - 1 ? this.tabs[0] : this.tabs[currentIndex + 1];
                }
                break;
            case 'ArrowUp':
                if (orientation === 'vertical') {
                    nextTab = currentIndex === 0 ? this.tabs[this.tabs.length - 1] : this.tabs[currentIndex - 1];
                }
                break;
            case 'ArrowDown':
                if (orientation === 'vertical') {
                    nextTab = currentIndex === this.tabs.length - 1 ? this.tabs[0] : this.tabs[currentIndex + 1];
                }
                break;
            case 'Home':
                nextTab = this.tabs[0];
                break;
            case 'End':
                nextTab = this.tabs[this.tabs.length - 1];
                break;
            case 'Enter':
            case ' ':
                if (this.activationMode === 'manual') {
                    this.activateTab(currentTab);
                    event.preventDefault();
                }
                break;
            default:
                break;
        }

        if (nextTab) {
            event.preventDefault();
            
            if (this.activationMode === 'automatic') {
                this.activateTab(nextTab);
            } else {
                // Manual activation just updates focus and roving tabindex
                this.tabs.forEach(t => t.setAttribute('tabindex', '-1'));
                nextTab.setAttribute('tabindex', '0');
            }
            
            nextTab.focus();
        }
    }

    onClick(event) {
        this.activateTab(event.currentTarget);
    }

    activateTab(tab) {
        const index = this.tabs.indexOf(tab);
        
        // Deactivate all tabs
        for (let i = 0; i < this.tabs.length; i++) {
            this.tabs[i].setAttribute('aria-selected', 'false');
            this.tabs[i].setAttribute('tabindex', '-1');
            if (this.tabpanels[i]) {
                this.tabpanels[i].setAttribute('hidden', '');
            }
        }

        // Activate selected tab
        tab.setAttribute('aria-selected', 'true');
        tab.setAttribute('tabindex', '0');
        if (this.tabpanels[index]) {
            this.tabpanels[index].removeAttribute('hidden');
        }
    }
}

function initTabs() {
    const tablists = document.querySelectorAll('[role="tablist"]');
    tablists.forEach(tablist => {
        if (!tablist.dataset.initialized) {
            new AccessibleTabs(tablist);
            tablist.dataset.initialized = 'true';
        }
    });
}

// Initialize Tabs on DOM Load and SPA navigation
document.addEventListener('DOMContentLoaded', initTabs);
document.addEventListener('pageContentLoaded', initTabs);
