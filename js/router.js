// Router - SPA Navigation
export class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.beforeHooks = [];
        this.afterHooks = [];
        this.params = {};
        this.query = {};
        this.initialized = false;
        
        // Handle browser back/forward buttons and hash changes
        window.addEventListener('popstate', (event) => {
            this.handleRouteChange(event.state?.path || window.location.hash, false);
        });
        
        window.addEventListener('hashchange', () => {
            this.handleRouteChange(window.location.hash, false);
        });
    }
    
    // Initialize router (call after routes are registered)
    init() {
        if (!this.initialized) {
            this.initialized = true;
            // Handle initial load
            this.handleRouteChange(window.location.hash || '#dashboard', false);
        }
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
        console.log('Router: Handling route change to', hash);
        const path = hash.replace('#', '') || 'dashboard';
        const [routePath, queryString] = path.split('?');
        
        console.log('Router: Route path:', routePath);
        
        // Parse query parameters
        this.query = this.parseQuery(queryString || '');
        
        // Get page class
        const PageClass = this.routes.get(routePath);
        
        if (!PageClass) {
            console.error(`Router: Route not found: ${routePath}`);
            console.error('Router: Available routes:', Array.from(this.routes.keys()));
            return;
        }
        
        console.log('Router: Found page class:', PageClass.name);
        
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
        console.log('Router: Page container:', pageContainer);
        
        if (!pageContainer) {
            console.error('Router: Page container not found!');
            return;
        }
        
        const page = new PageClass();
        this.currentRoute = page;
        
        // Render page
        const pageElement = page.render();
        console.log('Router: Page element rendered:', pageElement);
        
        pageElement.classList.add('page', 'page-enter');
        pageContainer.appendChild(pageElement);
        
        console.log('Router: Page element added to DOM');
        
        // Initialize page
        if (page.init) {
            console.log('Router: Initializing page...');
            await page.init(this.params, this.query);
            console.log('Router: Page initialized');
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
        
        console.log('Router: Route change complete');
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
            const page = item.getAttribute('data-page');
            if (page === routePath) {
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