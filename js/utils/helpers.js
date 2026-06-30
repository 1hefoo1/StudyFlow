// Helper Utilities
export class Helpers {
    // Generate unique ID
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
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

    // Deep clone object
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        return cloned;
    }

    // Merge objects deeply
    static deepMerge(target, ...sources) {
        if (!sources.length) return target;
        const source = sources.shift();

        if (this.isObject(target) && this.isObject(source)) {
            for (const key in source) {
                if (this.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    this.deepMerge(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }

        return this.deepMerge(target, ...sources);
    }

    // Check if object
    static isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    // Format bytes to human readable
    static formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    // Format number with commas
    static formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // Format currency
    static formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    // Format percentage
    static formatPercentage(value, total, decimals = 1) {
        if (total === 0) return '0%';
        return ((value / total) * 100).toFixed(decimals) + '%';
    }

    // Truncate text
    static truncate(text, length = 100, suffix = '...') {
        if (text.length <= length) return text;
        return text.substring(0, length).trim() + suffix;
    }

    // Capitalize first letter
    static capitalize(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    // Convert to title case
    static toTitleCase(text) {
        return text.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    }

    // Convert to camelCase
    static toCamelCase(text) {
        return text
            .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
            .replace(/^[A-Z]/, char => char.toLowerCase());
    }

    // Convert to kebab-case
    static toKebabCase(text) {
        return text
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/[\s_]+/g, '-')
            .toLowerCase();
    }

    // Convert to snake_case
    static toSnakeCase(text) {
        return text
            .replace(/([a-z])([A-Z])/g, '$1_$2')
            .replace(/[\s-]+/g, '_')
            .toLowerCase();
    }

    // Slugify text
    static slugify(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    // Escape HTML
    static escapeHtml(text) {
        const map = {
            '&': '&',
            '<': '<',
            '>': '>',
            '"': '"',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, char => map[char]);
    }

    // Unescape HTML
    static unescapeHtml(html) {
        const map = {
            '&': '&',
            '<': '<',
            '>': '>',
            '"': '"',
            '&#039;': "'"
        };
        return html.replace(/&(amp|lt|gt|quot|#039);/g, char => map[char]);
    }

    // Strip HTML tags
    static stripHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }

    // Parse HTML
    static parseHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div;
    }

    // Get random item from array
    static randomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    // Get random items from array
    static randomItems(array, count) {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    // Shuffle array
    static shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Group array by key
    static groupBy(array, key) {
        return array.reduce((result, item) => {
            const group = typeof key === 'function' ? key(item) : item[key];
            if (!result[group]) result[group] = [];
            result[group].push(item);
            return result;
        }, {});
    }

    // Sort array by key
    static sortBy(array, key, order = 'asc') {
        return [...array].sort((a, b) => {
            const aVal = typeof key === 'function' ? key(a) : a[key];
            const bVal = typeof key === 'function' ? key(b) : b[key];
            
            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // Filter array by multiple conditions
    static filterBy(array, conditions) {
        return array.filter(item => {
            return Object.entries(conditions).every(([key, value]) => {
                if (typeof value === 'function') {
                    return value(item[key]);
                }
                return item[key] === value;
            });
        });
    }

    // Pluck property from array of objects
    static pluck(array, key) {
        return array.map(item => item[key]);
    }

    // Remove duplicates from array
    static unique(array, key = null) {
        if (key) {
            const seen = new Set();
            return array.filter(item => {
                const val = item[key];
                if (seen.has(val)) return false;
                seen.add(val);
                return true;
            });
        }
        return [...new Set(array)];
    }

    // Chunk array into smaller arrays
    static chunk(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    // Flatten array
    static flatten(array, depth = 1) {
        return array.flat(depth);
    }

    // Difference between two arrays
    static difference(array1, array2) {
        return array1.filter(item => !array2.includes(item));
    }

    // Intersection of two arrays
    static intersection(array1, array2) {
        return array1.filter(item => array2.includes(item));
    }

    // Union of two arrays
    static union(array1, array2) {
        return [...new Set([...array1, ...array2])];
    }

    // Check if array contains any of the values
    static containsAny(array, values) {
        return values.some(value => array.includes(value));
    }

    // Check if array contains all of the values
    static containsAll(array, values) {
        return values.every(value => array.includes(value));
    }

    // Sleep/delay function
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Retry function with exponential backoff
    static async retry(func, maxAttempts = 3, delayMs = 1000) {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await func();
            } catch (error) {
                if (attempt === maxAttempts) throw error;
                await this.sleep(delayMs * Math.pow(2, attempt - 1));
            }
        }
    }

    // Memoize function
    static memoize(func) {
        const cache = new Map();
        return function(...args) {
            const key = JSON.stringify(args);
            if (cache.has(key)) {
                return cache.get(key);
            }
            const result = func.apply(this, args);
            cache.set(key, result);
            return result;
        };
    }

    // Curry function
    static curry(func) {
        return function curried(...args) {
            if (args.length >= func.length) {
                return func.apply(this, args);
            }
            return function(...nextArgs) {
                return curried.apply(this, [...args, ...nextArgs]);
            };
        };
    }

    // Compose functions
    static compose(...funcs) {
        return funcs.reduce((a, b) => (...args) => a(b(...args)));
    }

    // Pipe functions
    static pipe(...funcs) {
        return funcs.reduce((a, b) => (...args) => b(a(...args)));
    }

    // Get nested property
    static get(obj, path, defaultValue = undefined) {
        const keys = path.split('.');
        let result = obj;
        
        for (const key of keys) {
            if (result === null || result === undefined) {
                return defaultValue;
            }
            result = result[key];
        }
        
        return result !== undefined ? result : defaultValue;
    }

    // Set nested property
    static set(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((acc, key) => {
            if (!acc[key]) acc[key] = {};
            return acc[key];
        }, obj);
        target[lastKey] = value;
        return obj;
    }

    // Omit properties from object
    static omit(obj, keys) {
        const result = { ...obj };
        keys.forEach(key => delete result[key]);
        return result;
    }

    // Pick properties from object
    static pick(obj, keys) {
        return keys.reduce((result, key) => {
            if (obj.hasOwnProperty(key)) {
                result[key] = obj[key];
            }
            return result;
        }, {});
    }

    // Check if object is empty
    static isEmpty(obj) {
        if (obj === null || obj === undefined) return true;
        if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
        return Object.keys(obj).length === 0;
    }

    // Get file extension
    static getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
    }

    // Get file name without extension
    static getFileNameWithoutExtension(filename) {
        return filename.substring(0, filename.lastIndexOf('.')) || filename;
    }

    // Validate email
    static isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Validate URL
    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    // Validate phone number (basic)
    static isValidPhone(phone) {
        const re = /^\+?[\d\s-()]+$/;
        return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
    }

    // Parse query string
    static parseQuery(queryString) {
        const query = {};
        if (!queryString) return query;
        
        const pairs = queryString.split('&');
        for (const pair of pairs) {
            const [key, value] = pair.split('=');
            query[decodeURIComponent(key)] = decodeURIComponent(value || '');
        }
        return query;
    }

    // Build query string
    static buildQuery(params) {
        return Object.entries(params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
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

    // Local storage helpers
    static storage = {
        get: (key, defaultValue = null) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch {
                return defaultValue;
            }
        },
        
        set: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch {
                return false;
            }
        },
        
        remove: (key) => {
            try {
                localStorage.removeItem(key);
                return true;
            } catch {
                return false;
            }
        },
        
        clear: () => {
            try {
                localStorage.clear();
                return true;
            } catch {
                return false;
            }
        }
    };

    // Color utilities
    static colors = {
        // Convert hex to RGB
        hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        },

        // Convert RGB to hex
        rgbToHex(r, g, b) {
            return '#' + [r, g, b].map(x => {
                const hex = x.toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            }).join('');
        },

        // Get contrasting color (black or white)
        getContrastColor(hex) {
            const rgb = this.hexToRgb(hex);
            if (!rgb) return '#000000';
            
            const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
            return brightness > 128 ? '#000000' : '#FFFFFF';
        },

        // Lighten color
        lighten(hex, percent) {
            const rgb = this.hexToRgb(hex);
            if (!rgb) return hex;
            
            const amount = Math.round(2.55 * percent);
            const r = Math.min(255, rgb.r + amount);
            const g = Math.min(255, rgb.g + amount);
            const b = Math.min(255, rgb.b + amount);
            
            return this.rgbToHex(r, g, b);
        },

        // Darken color
        darken(hex, percent) {
            const rgb = this.hexToRgb(hex);
            if (!rgb) return hex;
            
            const amount = Math.round(2.55 * percent);
            const r = Math.max(0, rgb.r - amount);
            const g = Math.max(0, rgb.g - amount);
            const b = Math.max(0, rgb.b - amount);
            
            return this.rgbToHex(r, g, b);
        }
    };

    // Array of common color palettes
    static colorPalettes = {
        warm: ['#8B7355', '#C4A77D', '#D4C5B9', '#A08060', '#6B5344'],
        cool: ['#5B8C9F', '#7BA3B0', '#9FC5D1', '#4A7A8C', '#6B9AAC'],
        vibrant: ['#C75050', '#5B8C5A', '#5B8C9F', '#C47A4A', '#8B6B9F'],
        pastel: ['#E8B8C8', '#B8D4B7', '#B8D4E0', '#E8C4A8', '#D4B8E0'],
        monochrome: ['#2D2D2D', '#6B6B6B', '#9B9B9B', '#C0C0C0', '#E8E8E8']
    };

    // Get random color from palette
    static getRandomColor(palette = 'warm') {
        return this.randomItem(this.colorPalettes[palette] || this.colorPalettes.warm);
    }

    // Generate gradient
    static generateGradient(colors, direction = 'to right') {
        return `linear-gradient(${direction}, ${colors.join(', ')})`;
    }

    // Animation frame helper
    static requestAnimationFrame(callback) {
        return window.requestAnimationFrame(callback);
    }

    // Cancel animation frame
    static cancelAnimationFrame(id) {
        window.cancelAnimationFrame(id);
    }

    // Check if element is visible
    static isVisible(element) {
        if (!element) return false;
        return element.offsetParent !== null;
    }

    // Wait for element
    static waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }

            const observer = new MutationObserver((mutations, obs) => {
                const element = document.querySelector(selector);
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

    // Get device type
    static getDeviceType() {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    }

    // Check if online
    static isOnline() {
        return navigator.onLine;
    }

    // Get OS
    static getOS() {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Win')) return 'Windows';
        if (userAgent.includes('Mac')) return 'macOS';
        if (userAgent.includes('Linux')) return 'Linux';
        if (userAgent.includes('Android')) return 'Android';
        if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
        return 'Unknown';
    }

    // Get browser
    static getBrowser() {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Unknown';
    }

    // Log with timestamp
    static log(...args) {
        console.log(`[${new Date().toISOString()}]`, ...args);
    }

    // Error with timestamp
    static error(...args) {
        console.error(`[${new Date().toISOString()}]`, ...args);
    }

    // Warn with timestamp
    static warn(...args) {
        console.warn(`[${new Date().toISOString()}]`, ...args);
    }
}