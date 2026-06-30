// Router - SPA Navigation
export class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.beforeHooks = [];
        this.afterHooks = [];
        this.params = {};
        this.query = {};
        
        // Handle browser back/forward buttons and hash changes
        window.addEventListener('popstate', (event) => {
            this.handleRouteChange(event.state?.path || window.location.hash, false);
        });
        
        window.addEventListener('hashchange', () => {
            this.handleRouteChange(window.location.hash, false);
        });
        
        // Handle initial load
        this.handleRouteChange(window.location.hash || '#dashboard', false);
    }

    // Register a route
    register(path, pageClass) {
        this.routes.set(path, pageClass);
    }

    // Navigate to a route
    navigate(path, params = {}) {
        const hash = path.startsWith('#') ? path : `#${path}`;
        
        // Run before hooks
        for (const hook of this.beforeHooks) {
            const result = hook(path, params);
            if (result === false) return;
        }
        
        // Update URL
        if (window.location.hash !== hash) {
            window.history.pushState({ path, params }, '', hash);
        }
        
        this.params = params;
        this.handleRouteChange(hash, true);
    }

    // Handle route change
    async handleRouteChange(hash, pushState = false) {
        const path = hash.replace('#', '') || 'dashboard';
        const [routePath, queryString] = path.split('?');
        
        // Parse query parameters
        this.query = this.parseQuery(queryString || '');
        
        // Get page class
        const PageClass = this.routes.get(routePath);
        
        if (!PageClass) {
            console.error(`Route not found: ${routePath}`);
            return;
        }
        
        // Hide current page
        if (this.currentRoute) {
            const currentPage = document.querySelector('.page');
            if (currentPage) {
                currentPage.classList.add('page-exit');
                await this.delay(200);
                currentPage.remove();
            }
        }
        
        // Create and render new page
        const pageContainer = document.getElementById('page-container');
        const page = new PageClass();
        this.currentRoute = page;
        
        // Render page
        const pageElement = page.render();
        pageElement.classList.add('page', 'page-enter');
        pageContainer.appendChild(pageElement);
        
        // Initialize page
        if (page.init) {
            await page.init(this.params, this.query);
        }
        
        // Update active nav item
        this.updateActiveNav(routePath);
        
        // Run after hooks
        for (const hook of this.afterHooks) {
            hook(routePath, page);
        }
        
        // Update document title
        if (page.getTitle) {
            document.title = `${page.getTitle()} - StudyFlow`;
        }
    }

    // Parse query string
    parseQuery(queryString) {
        const query = {};
        if (!queryString) return query;
        
        const pairs = queryString.split('&');
        for (const pair of pairs) {
            const [key, value] = pair.split('=');
            query[decodeURIComponent(key)] = decodeURIComponent(value || '');
        }
        return query;
    }

    // Update active navigation item
    updateActiveNav(routePath) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === routePath) {
                item.classList.add('active');
            }
        });
    }

    // Add before hook
    beforeEach(hook) {
        this.beforeHooks.push(hook);
    }

    // Add after hook
    afterEach(hook) {
        this.afterHooks.push(hook);
    }

    // Get current route
    getCurrentRoute() {
        return this.currentRoute;
    }

    // Get current path
    getCurrentPath() {
        return window.location.hash.replace('#', '') || 'dashboard';
    }

    // Get params
    getParams() {
        return this.params;
    }

    // Get query
    getQuery() {
        return this.query;
    }

    // Go back
    back() {
        window.history.back();
    }

    // Go forward
    forward() {
        window.history.forward();
    }

    // Refresh current route
    refresh() {
        this.handleRouteChange(window.location.hash, false);
    }

    // Utility delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Singleton instance
export const router = new Router();