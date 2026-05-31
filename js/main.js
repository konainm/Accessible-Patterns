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

    // 3. SPA Router Logic
    function initRouter() {
        const handleNavigation = async (url, pushState = true) => {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error('Network response was not ok');
                const html = await response.text();
                
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Extract main content and title
                const newMain = doc.getElementById('main-content');
                const newTitle = doc.title;
                
                if (newMain) {
                    const targetContainer = document.getElementById('main-content');
                    targetContainer.innerHTML = ''; // Safe clear
                    while (newMain.firstChild) {
                        targetContainer.appendChild(newMain.firstChild);
                    }
                    document.title = newTitle;
                    
                    if (pushState) {
                        history.pushState(null, newTitle, url);
                    }
                    
                    // Dispatch custom event to re-initialize components
                    document.dispatchEvent(new Event('pageContentLoaded'));
                }
            } catch (error) {
                console.error('Failed to load page:', error);
                // Fallback to standard navigation
                const targetPage = url.split('/').pop() || 'index.html';
                switch (targetPage) {
                    case 'index.html':
                        window.location.href = 'index.html';
                        break;
                    case 'modal.html':
                        window.location.href = 'modal.html';
                        break;
                    case 'tabs.html':
                        window.location.href = 'tabs.html';
                        break;
                    case 'documentation.html':
                        window.location.href = 'documentation.html';
                        break;
                    default:
                        console.error('Redirect prevented to unapproved page:', targetPage);
                }
            }
        };

        // Intercept clicks on links
        document.addEventListener('click', (e) => {
            // Find closest anchor tag
            const link = e.target.closest('a');
            if (!link) return;
            
            // Check if it's a local HTML link, not a hash link, and not opening in new tab
            const href = link.getAttribute('href');
            if (href && href.endsWith('.html') && !href.startsWith('http') && !href.startsWith('#') && link.target !== '_blank') {
                e.preventDefault();
                // Don't navigate if we're already on the same page
                const currentPath = window.location.pathname.split('/').pop() || 'index.html';
                const targetPath = href.split('/').pop();
                if (currentPath !== targetPath) {
                    handleNavigation(href);
                }
            }
        });

        // Handle back/forward buttons
        window.addEventListener('popstate', () => {
            handleNavigation(window.location.pathname, false);
        });
    }

    initRouter();
});
