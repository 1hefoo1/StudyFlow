// Toast Notification Component
export class Toast {
    constructor() {
        this.container = null;
        this.toasts = new Map();
        this.init();
    }

    init() {
        // Create toast container
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    }

    // Show toast notification
    show(options = {}) {
        const {
            title = '',
            message = '',
            type = 'info', // success, error, warning, info
            duration = 5000,
            showProgress = true,
            closable = true,
            onClose = null
        } = options;

        const id = Date.now().toString();
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // Icon
        const icon = document.createElement('div');
        icon.className = 'toast-icon';
        icon.innerHTML = this.getIcon(type);
        
        // Content
        const content = document.createElement('div');
        content.className = 'toast-content';
        
        if (title) {
            const titleEl = document.createElement('div');
            titleEl.className = 'toast-title';
            titleEl.textContent = title;
            content.appendChild(titleEl);
        }
        
        if (message) {
            const messageEl = document.createElement('div');
            messageEl.className = 'toast-message';
            messageEl.textContent = message;
            content.appendChild(messageEl);
        }
        
        // Close button
        let closeBtn = null;
        if (closable) {
            closeBtn = document.createElement('button');
            closeBtn.className = 'toast-close';
            closeBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4l8 8M12 4l-8 8"/>
            </svg>`;
            closeBtn.onclick = () => this.dismiss(id);
        }
        
        // Progress bar
        let progress = null;
        if (showProgress && duration > 0) {
            progress = document.createElement('div');
            progress.className = 'toast-progress';
        }
        
        // Assemble toast
        toast.appendChild(icon);
        toast.appendChild(content);
        if (closeBtn) toast.appendChild(closeBtn);
        if (progress) toast.appendChild(progress);
        
        // Add to container
        this.container.appendChild(toast);
        
        // Store toast data
        const toastData = { id, element: toast, onClose, timeout: null };
        this.toasts.set(id, toastData);
        
        // Auto dismiss
        if (duration > 0) {
            toastData.timeout = setTimeout(() => {
                this.dismiss(id);
            }, duration);
        }
        
        // Pause on hover
        toast.addEventListener('mouseenter', () => {
            if (toastData.timeout) {
                clearTimeout(toastData.timeout);
                toastData.timeout = null;
            }
            if (progress) {
                progress.style.animationPlayState = 'paused';
            }
        });
        
        // Resume on leave
        toast.addEventListener('mouseleave', () => {
            if (duration > 0 && !toastData.timeout) {
                const remaining = this.getRemainingTime(toast);
                toastData.timeout = setTimeout(() => {
                    this.dismiss(id);
                }, remaining);
                if (progress) {
                    progress.style.animationPlayState = 'running';
                }
            }
        });
        
        return id;
    }

    // Dismiss toast
    dismiss(id) {
        const toastData = this.toasts.get(id);
        if (!toastData) return;
        
        const { element, onClose, timeout } = toastData;
        
        // Clear timeout
        if (timeout) {
            clearTimeout(timeout);
        }
        
        // Animate out
        element.classList.add('removing');
        
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            
            if (onClose) onClose();
            
            this.toasts.delete(id);
        }, 300);
    }

    // Dismiss all toasts
    dismissAll() {
        this.toasts.forEach((_, id) => this.dismiss(id));
    }

    // Get remaining animation time
    getRemainingTime(element) {
        const progress = element.querySelector('.toast-progress');
        if (!progress) return 5000;
        
        const computedStyle = window.getComputedStyle(progress);
        const duration = parseFloat(computedStyle.animationDuration) * 1000;
        const remaining = parseFloat(computedStyle.animationPlayState === 'paused' 
            ? computedStyle.animationDelay 
            : duration);
        
        return Math.max(0, remaining);
    }

    // Get icon SVG
    getIcon(type) {
        const icons = {
            success: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 10l3 3 7-7"/>
            </svg>`,
            error: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="10" cy="10" r="7"/>
                <path d="M7 7l6 6M13 7l-6 6"/>
            </svg>`,
            warning: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 3l7 14H3l7-14z"/>
                <path d="M10 8v4M10 14v1"/>
            </svg>`,
            info: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="10" cy="10" r="7"/>
                <path d="M10 9v4M10 7v1"/>
            </svg>`
        };
        return icons[type] || icons.info;
    }

    // Success toast
    success(title, message, options = {}) {
        return this.show({ ...options, title, message, type: 'success' });
    }

    // Error toast
    error(title, message, options = {}) {
        return this.show({ ...options, title, message, type: 'error' });
    }

    // Warning toast
    warning(title, message, options = {}) {
        return this.show({ ...options, title, message, type: 'warning' });
    }

    // Info toast
    info(title, message, options = {}) {
        return this.show({ ...options, title, message, type: 'info' });
    }
}

// Singleton instance
export const toast = new Toast();