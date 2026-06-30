// Command Palette Component
export class CommandPalette {
    constructor() {
        this.backdrop = null;
        this.palette = null;
        this.input = null;
        this.results = null;
        this.selectedIndex = 0;
        this.items = [];
        this.filteredItems = [];
        this.isOpen = false;
        this.init();
    }

    init() {
        // Create backdrop
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'command-palette-backdrop';
        
        // Create palette
        this.palette = document.createElement('div');
        this.palette.className = 'command-palette';
        
        // Input wrapper
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'command-palette-input-wrapper';
        
        // Search icon
        const icon = document.createElement('div');
        icon.className = 'command-palette-icon';
        icon.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="9" r="6"/>
            <path d="M14 14l4 4"/>
        </svg>`;
        
        // Input
        this.input = document.createElement('input');
        this.input.className = 'command-palette-input';
        this.input.type = 'text';
        this.input.placeholder = 'Type a command or search...';
        this.input.autocomplete = 'off';
        
        // Shortcut hint
        const shortcut = document.createElement('div');
        shortcut.className = 'command-palette-shortcut';
        shortcut.innerHTML = '<kbd>ESC</kbd> to close';
        
        inputWrapper.appendChild(icon);
        inputWrapper.appendChild(this.input);
        inputWrapper.appendChild(shortcut);
        
        // Results
        this.results = document.createElement('div');
        this.results.className = 'command-palette-results';
        
        // Footer
        const footer = document.createElement('div');
        footer.className = 'command-palette-footer';
        footer.innerHTML = `
            <div class="command-palette-footer-hint">
                <span><kbd>↑↓</kbd> to navigate</span>
                <span><kbd>↵</kbd> to select</span>
            </div>
            <span>${this.items.length} commands</span>
        `;
        
        // Assemble
        this.palette.appendChild(inputWrapper);
        this.palette.appendChild(this.results);
        this.palette.appendChild(footer);
        
        document.body.appendChild(this.backdrop);
        document.body.appendChild(this.palette);
        
        // Event listeners
        this.backdrop.addEventListener('click', () => this.close());
        this.input.addEventListener('input', (e) => this.handleInput(e));
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Global keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    // Register command
    register(item) {
        const { id, title, description, icon, shortcut, action, category = 'Commands' } = item;
        this.items.push({ id, title, description, icon, shortcut, action, category });
        this.updateFooter();
    }

    // Register multiple commands
    registerAll(items) {
        items.forEach(item => this.register(item));
    }

    // Toggle palette
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    // Open palette
    open() {
        this.isOpen = true;
        this.input.value = '';
        this.selectedIndex = 0;
        this.filteredItems = [...this.items];
        
        this.backdrop.classList.add('active');
        this.palette.classList.add('active');
        
        this.render();
        this.input.focus();
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    // Close palette
    close() {
        this.isOpen = false;
        this.backdrop.classList.remove('active');
        this.palette.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';
    }

    // Handle input
    handleInput(e) {
        const query = e.target.value.toLowerCase();
        this.filteredItems = this.items.filter(item => 
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query)
        );
        this.selectedIndex = 0;
        this.render();
        this.updateFooter();
    }

    // Handle keyboard navigation
    handleKeydown(e) {
        const items = this.results.querySelectorAll('.command-palette-item');
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
                this.updateSelection(items);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
                this.updateSelection(items);
                break;
                
            case 'Enter':
                e.preventDefault();
                if (this.filteredItems[this.selectedIndex]) {
                    this.selectItem(this.filteredItems[this.selectedIndex]);
                }
                break;
                
            case 'Escape':
                e.preventDefault();
                this.close();
                break;
        }
    }

    // Update selection
    updateSelection(items) {
        items.forEach((item, index) => {
            item.classList.toggle('selected', index === this.selectedIndex);
        });
        
        // Scroll into view
        if (items[this.selectedIndex]) {
            items[this.selectedIndex].scrollIntoView({ block: 'nearest' });
        }
    }

    // Select item
    selectItem(item) {
        if (item && item.action) {
            this.close();
            setTimeout(() => item.action(), 100);
        }
    }

    // Render results
    render() {
        this.results.innerHTML = '';
        
        if (this.filteredItems.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.innerHTML = `
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-title">No results found</div>
                <div class="empty-state-description">Try a different search term</div>
            `;
            this.results.appendChild(empty);
            return;
        }
        
        // Group by category
        const grouped = this.filteredItems.reduce((groups, item) => {
            const category = item.category;
            if (!groups[category]) groups[category] = [];
            groups[category].push(item);
            return groups;
        }, {});
        
        // Render groups
        Object.entries(grouped).forEach(([category, items]) => {
            // Category title
            const groupTitle = document.createElement('div');
            groupTitle.className = 'command-palette-group-title';
            groupTitle.textContent = category;
            this.results.appendChild(groupTitle);
            
            // Items
            items.forEach((item, index) => {
                const itemEl = document.createElement('div');
                itemEl.className = 'command-palette-item';
                if (this.filteredItems[this.selectedIndex] === item) {
                    itemEl.classList.add('selected');
                }
                
                // Icon
                const iconEl = document.createElement('div');
                iconEl.className = 'command-palette-item-icon';
                iconEl.innerHTML = item.icon || '📄';
                
                // Content
                const contentEl = document.createElement('div');
                contentEl.className = 'command-palette-item-content';
                
                const titleEl = document.createElement('div');
                titleEl.className = 'command-palette-item-title';
                titleEl.textContent = item.title;
                
                const descEl = document.createElement('div');
                descEl.className = 'command-palette-item-description';
                descEl.textContent = item.description;
                
                contentEl.appendChild(titleEl);
                contentEl.appendChild(descEl);
                
                // Shortcut
                let shortcutEl = null;
                if (item.shortcut) {
                    shortcutEl = document.createElement('div');
                    shortcutEl.className = 'command-palette-item-shortcut';
                    shortcutEl.innerHTML = `<kbd>${item.shortcut}</kbd>`;
                }
                
                // Assemble
                itemEl.appendChild(iconEl);
                itemEl.appendChild(contentEl);
                if (shortcutEl) itemEl.appendChild(shortcutEl);
                
                // Click handler
                itemEl.addEventListener('click', () => this.selectItem(item));
                
                this.results.appendChild(itemEl);
            });
        });
    }

    // Update footer
    updateFooter() {
        const footer = this.palette.querySelector('.command-palette-footer');
        if (footer) {
            const count = footer.querySelector('span:last-child');
            if (count) {
                count.textContent = `${this.filteredItems.length} command${this.filteredItems.length !== 1 ? 's' : ''}`;
            }
        }
    }

    // Clear all commands
    clear() {
        this.items = [];
        this.filteredItems = [];
        this.updateFooter();
    }

    // Check if open
    isVisible() {
        return this.isOpen;
    }
}

// Singleton instance
export const commandPalette = new CommandPalette();