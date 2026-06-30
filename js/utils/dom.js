// DOM Utilities
export class DOMUtils {
    // Create element with attributes and children
    static create(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        // Set attributes
        for (const [key, value] of Object.entries(attributes)) {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else if (key.startsWith('data-')) {
                element.dataset[key.replace('data-', '')] = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else if (key === 'onclick') {
                element.addEventListener('click', value);
            } else {
                element.setAttribute(key, value);
            }
        }
        
        // Append children
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof HTMLElement) {
                element.appendChild(child);
            }
        });
        
        return element;
    }

    // Query selector
    static $(selector, context = document) {
        return context.querySelector(selector);
    }

    // Query selector all
    static $$(selector, context = document) {
        return Array.from(context.querySelectorAll(selector));
    }

    // Add event listener to multiple elements
    static on(elements, event, handler) {
        if (typeof elements === 'string') {
            elements = this.$$(elements);
        }
        
        if (!Array.isArray(elements)) {
            elements = [elements];
        }
        
        elements.forEach(element => {
            element.addEventListener(event, handler);
        });
    }

    // Remove event listener from multiple elements
    static off(elements, event, handler) {
        if (typeof elements === 'string') {
            elements = this.$$(elements);
        }
        
        if (!Array.isArray(elements)) {
            elements = [elements];
        }
        
        elements.forEach(element => {
            element.removeEventListener(event, handler);
        });
    }

    // Add class
    static addClass(element, className) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        if (element) {
            element.classList.add(...className.split(' '));
        }
    }

    // Remove class
    static removeClass(element, className) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        if (element) {
            element.classList.remove(...className.split(' '));
        }
    }

    // Toggle class
    static toggleClass(element, className) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        if (element) {
            element.classList.toggle(className);
        }
    }

    // Has class
    static hasClass(element, className) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        return element ? element.classList.contains(className) : false;
    }

    // Set attribute
    static setAttr(element, name, value) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        if (element) {
            element.setAttribute(name, value);
        }
    }

    // Get attribute
    static getAttr(element, name) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        return element ? element.getAttribute(name) : null;
    }

    // Remove attribute
    static removeAttr(element, name) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        if (element) {
            element.removeAttribute(name);
        }
    }

    // Set data attribute
    static setData(element, key, value) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        if (element) {
            element.dataset[key] = value;
        }
    }

    // Get data attribute
    static getData(element, key) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        return element ? element.dataset[key] : null;
    }

    // Set HTML content
    static html(element, content) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        if (element) {
            element.innerHTML = content;
        }
    }

    // Get HTML content
    static getHtml(element) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        return element ? element.innerHTML : '';
    }

    // Set text content
    static text(element, content) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        if (element) {
            element.textContent = content;
        }
    }

    // Get text content
    static getText(element) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        return element ? element.textContent : '';
    }

    // Append child
    static append(parent, child) {
        if (typeof parent === 'string') {
            parent = this.$(parent);
        }
        
        if (typeof child === 'string') {
            parent.appendChild(document.createTextNode(child));
        } else if (child instanceof HTMLElement) {
            parent.appendChild(child);
        }
    }

    // Prepend child
    static prepend(parent, child) {
        if (typeof parent === 'string') {
            parent = this.$(parent);
        }
        
        if (typeof child === 'string') {
            parent.insertBefore(document.createTextNode(child), parent.firstChild);
        } else if (child instanceof HTMLElement) {
            parent.insertBefore(child, parent.firstChild);
        }
    }

    // Remove element
    static remove(element) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    // Empty element
    static empty(element) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        if (element) {
            element.innerHTML = '';
        }
    }

    // Show element
    static show(element) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        if (element) {
            element.style.display = '';
        }
    }

    // Hide element
    static hide(element) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        if (element) {
            element.style.display = 'none';
        }
    }

    // Toggle visibility
    static toggle(element) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        if (element) {
            element.style.display = element.style.display === 'none' ? '' : 'none';
        }
    }

    // Get element dimensions
    static getDimensions(element) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        if (!element) return null;
        
        const rect = element.getBoundingClientRect();
        return {
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            right: rect.right,
            bottom: rect.bottom
        };
    }

    // Get scroll position
    static getScrollPosition() {
        return {
            x: window.pageXOffset || document.documentElement.scrollLeft,
            y: window.pageYOffset || document.documentElement.scrollTop
        };
    }

    // Scroll to element
    static scrollTo(element, options = {}) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        if (element) {
            element.scrollIntoView({
                behavior: options.behavior || 'smooth',
                block: options.block || 'start',
                inline: options.inline || 'nearest'
            });
        }
    }

    // Debounce function
    static debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle function
    static throttle(func, limit = 300) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Get form data as object
    static getFormData(form) {
        if (typeof form === 'string') {
            form = this.$(form);
        }
        
        if (!form) return {};
        
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            if (data[key]) {
                // Handle multiple values
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        
        return data;
    }

    // Set form values
    static setFormValues(form, values) {
        if (typeof form === 'string') {
            form = this.$(form);
        }
        
        if (!form) return;
        
        for (const [key, value] of Object.entries(values)) {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = value;
                } else if (input.type === 'radio') {
                    input.checked = input.value === value;
                } else {
                    input.value = value;
                }
            }
        }
    }

    // Clear form
    static clearForm(form) {
        if (typeof form === 'string') {
            form = this.$(form);
        }
        
        if (form) {
            form.reset();
        }
    }

    // Disable element
    static disable(element) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        if (element) {
            element.disabled = true;
        }
    }

    // Enable element
    static enable(element) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        if (element) {
            element.disabled = false;
        }
    }

    // Toggle disabled state
    static toggleDisabled(element) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        if (element) {
            element.disabled = !element.disabled;
        }
    }

    // Copy to clipboard
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Failed to copy:', error);
            return false;
        }
    }

    // Read from clipboard
    static async readFromClipboard() {
        try {
            return await navigator.clipboard.readText();
        } catch (error) {
            console.error('Failed to read clipboard:', error);
            return null;
        }
    }

    // Download file
    static downloadFile(content, filename, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Upload file
    static uploadFile(options = {}) {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = options.accept || '*';
            input.multiple = options.multiple || false;
            
            input.onchange = async (e) => {
                const files = Array.from(e.target.files);
                
                if (options.maxSize) {
                    const validFiles = files.filter(file => file.size <= options.maxSize);
                    if (validFiles.length !== files.length) {
                        reject(new Error('Some files exceed the maximum size'));
                        return;
                    }
                }
                
                if (options.multiple) {
                    resolve(files);
                } else {
                    resolve(files[0] || null);
                }
            };
            
            input.click();
        });
    }

    // Read file as text
    static readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    // Read file as data URL
    static readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
        });
    }

    // Escape HTML
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Unescape HTML
    static unescapeHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent;
    }

    // Generate unique ID
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Wait for element
    static waitFor(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const element = this.$(selector);
            if (element) {
                resolve(element);
                return;
            }
            
            const observer = new MutationObserver((mutations, obs) => {
                const element = this.$(selector);
                if (element) {
                    obs.disconnect();
                    resolve(element);
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);
        });
    }

    // Check if element is in viewport
    static isInViewport(element) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        if (!element) return false;
        
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Get viewport size
    static getViewportSize() {
        return {
            width: window.innerWidth || document.documentElement.clientWidth,
            height: window.innerHeight || document.documentElement.clientHeight
        };
    }

    // Check if mobile
    static isMobile() {
        return window.innerWidth < 768;
    }

    // Check if tablet
    static isTablet() {
        return window.innerWidth >= 768 && window.innerWidth < 1024;
    }

    // Check if desktop
    static isDesktop() {
        return window.innerWidth >= 1024;
    }

    // Prevent default and stop propagation
    static preventAll(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    // Trigger event
    static trigger(element, eventName, detail = {}) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        if (element) {
            const event = new CustomEvent(eventName, {
                detail,
                bubbles: true,
                cancelable: true
            });
            element.dispatchEvent(event);
        }
    }

    // On event
    static onEvent(element, eventName, handler) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        if (element) {
            element.addEventListener(eventName, (e) => handler(e.detail));
        }
    }
}