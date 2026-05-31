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
