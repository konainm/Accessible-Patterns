// Immediate execution to prevent flash of theme or view simulation
(function () {
    const getInitialTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme;
        
        const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        return systemPrefersLight ? 'light' : 'dark';
    };

    const getInitialView = () => {
        const savedView = localStorage.getItem('view');
        return savedView || 'desktop';
    };

    const activeTheme = getInitialTheme();
    document.documentElement.setAttribute('data-theme', activeTheme);

    const activeView = getInitialView();
    document.documentElement.setAttribute('data-view', activeView);
})();

document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Toggle Logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        // Helper to update accessibility attributes
        const updateThemeButton = (theme) => {
            if (theme === 'light') {
                themeToggleBtn.setAttribute('aria-label', 'Switch to dark theme');
            } else {
                themeToggleBtn.setAttribute('aria-label', 'Switch to light theme');
            }
        };

        // Initialize button state
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        updateThemeButton(currentTheme);

        // Click handler
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeButton(newTheme);
        });
    }

    // 2. Viewport Simulator Logic
    const viewportToggleBtn = document.getElementById('viewport-toggle');
    if (viewportToggleBtn) {
        // Helper to update accessibility attributes
        const updateViewportButton = (view) => {
            if (view === 'mobile') {
                viewportToggleBtn.setAttribute('aria-label', 'Switch to desktop view');
            } else {
                viewportToggleBtn.setAttribute('aria-label', 'Switch to mobile view');
            }
        };

        // Initialize button state
        const currentView = document.documentElement.getAttribute('data-view') || 'desktop';
        updateViewportButton(currentView);

        // Click handler
        viewportToggleBtn.addEventListener('click', () => {
            const currentView = document.documentElement.getAttribute('data-view') || 'desktop';
            const newView = currentView === 'mobile' ? 'desktop' : 'mobile';
            
            document.documentElement.setAttribute('data-view', newView);
            localStorage.setItem('view', newView);
            updateViewportButton(newView);
        });
    }
});
