// Modal Component
export class Modal {
    constructor() {
        this.activeModal = null;
        this.init();
    }

    init() {
        // Close modal on backdrop click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                this.close();
            }
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.close();
            }
        });
    }

    // Open modal
    open(options = {}) {
        const {
            title = 'Modal',
            content = '',
            size = 'md', // sm, md, lg, xl
            showClose = true,
            closeOnBackdrop = true,
            footer = null,
            onOpen = null,
            onClose = null
        } = options;

        // Remove existing modal
        if (this.activeModal) {
            this.close();
        }

        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = `modal modal-${size}`;
        
        // Header
        const header = document.createElement('div');
        header.className = 'modal-header';
        
        const titleEl = document.createElement('h2');
        titleEl.className = 'modal-title';
        titleEl.textContent = title;
        header.appendChild(titleEl);
        
        if (showClose) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'modal-close';
            closeBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 5l10 10M15 5L5 15"/>
            </svg>`;
            closeBtn.onclick = () => this.close();
            header.appendChild(closeBtn);
        }
        
        // Body
        const body = document.createElement('div');
        body.className = 'modal-body';
        if (typeof content === 'string') {
            body.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            body.appendChild(content);
        }
        
        // Footer
        let footerEl = null;
        if (footer) {
            footerEl = document.createElement('div');
            footerEl.className = 'modal-footer';
            if (typeof footer === 'string') {
                footerEl.innerHTML = footer;
            } else if (footer instanceof HTMLElement) {
                footerEl.appendChild(footer);
            }
        }
        
        // Assemble modal
        modal.appendChild(header);
        modal.appendChild(body);
        if (footerEl) {
            modal.appendChild(footerEl);
        }
        
        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);
        
        // Store reference
        this.activeModal = { backdrop, modal, onClose };
        
        // Animate in
        requestAnimationFrame(() => {
            backdrop.classList.add('active');
        });
        
        // Focus first input if exists
        const firstInput = modal.querySelector('input, textarea, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
        
        // Callback
        if (onOpen) onOpen(modal);
        
        return modal;
    }

    // Close modal
    close() {
        if (!this.activeModal) return;
        
        const { backdrop, modal, onClose } = this.activeModal;
        
        // Animate out
        backdrop.classList.remove('active');
        backdrop.classList.add('closing');
        
        setTimeout(() => {
            if (backdrop.parentNode) {
                backdrop.parentNode.removeChild(backdrop);
            }
            
            if (onClose) onClose();
            
            this.activeModal = null;
        }, 200);
    }

    // Update modal content
    updateContent(content) {
        if (!this.activeModal) return;
        
        const body = this.activeModal.modal.querySelector('.modal-body');
        if (body) {
            if (typeof content === 'string') {
                body.innerHTML = content;
            } else if (content instanceof HTMLElement) {
                body.innerHTML = '';
                body.appendChild(content);
            }
        }
    }

    // Update modal title
    updateTitle(title) {
        if (!this.activeModal) return;
        
        const titleEl = this.activeModal.modal.querySelector('.modal-title');
        if (titleEl) {
            titleEl.textContent = title;
        }
    }

    // Get modal element
    getModal() {
        return this.activeModal?.modal;
    }

    // Get backdrop element
    getBackdrop() {
        return this.activeModal?.backdrop;
    }

    // Check if modal is open
    isOpen() {
        return this.activeModal !== null;
    }
}

// Singleton instance
export const modal = new Modal();