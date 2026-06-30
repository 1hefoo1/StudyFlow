// Storage Layer - Abstracted for future upgrades (IndexedDB, SQLite, Cloud)
export class Storage {
    constructor() {
        this.prefix = 'studyflow_';
        this.listeners = new Map();
    }

    // Get item from storage
    async get(key) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Error getting ${key}:`, error);
            return null;
        }
    }

    // Set item in storage
    async set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            this.notifyListeners(key, value);
            return true;
        } catch (error) {
            console.error(`Error setting ${key}:`, error);
            return false;
        }
    }

    // Remove item from storage
    async remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            this.notifyListeners(key, null);
            return true;
        } catch (error) {
            console.error(`Error removing ${key}:`, error);
            return false;
        }
    }

    // Get all keys with prefix
    async keys() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.prefix)) {
                keys.push(key.substring(this.prefix.length));
            }
        }
        return keys;
    }

    // Clear all data
    async clear() {
        try {
            const keys = await this.keys();
            keys.forEach(key => localStorage.removeItem(this.prefix + key));
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }

    // Subscribe to changes
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        this.listeners.get(key).push(callback);
        
        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(key);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        };
    }

    // Notify listeners of changes
    notifyListeners(key, value) {
        const callbacks = this.listeners.get(key);
        if (callbacks) {
            callbacks.forEach(callback => callback(value));
        }
    }

    // Get storage usage
    getUsage() {
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.prefix)) {
                const value = localStorage.getItem(key);
                total += key.length + value.length;
            }
        }
        return total;
    }

    // Export all data
    async export() {
        const data = {};
        const keys = await this.keys();
        for (const key of keys) {
            data[key] = await this.get(key);
        }
        return data;
    }

    // Import data
    async import(data) {
        try {
            for (const [key, value] of Object.entries(data)) {
                await this.set(key, value);
            }
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
}

// Singleton instance
export const storage = new Storage();