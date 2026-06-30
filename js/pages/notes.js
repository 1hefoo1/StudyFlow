// Notes Page
import { DateUtils } from '../utils/date.js';
import { db } from '../database.js';
import { Helpers } from '../utils/helpers.js';

export class NotesPage {
    constructor() {
        this.container = null;
        this.notes = [];
        this.notebooks = [];
        this.selectedNotebook = null;
        this.searchQuery = '';
    }

    render() {
        this.container = document.createElement('div');
        this.container.className = 'notes-page';
        this.container.innerHTML = `
            <div class="page-header">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--spacing-md);">
                    <div>
                        <h1 class="page-title">Notes</h1>
                        <p class="page-subtitle">Capture and organize your thoughts</p>
                    </div>
                    <button class="btn btn-primary" onclick="notesPage.createNote()">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10 4v12M4 10h12"/>
                        </svg>
                        <span>New Note</span>
                    </button>
                </div>
            </div>
            
            <div class="notes-layout">
                <aside class="notes-sidebar">
                    <div class="search-input" style="margin-bottom: var(--spacing-lg);">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="9" cy="9" r="6"/>
                            <path d="M14 14l4 4"/>
                        </svg>
                        <input type="text" placeholder="Search notes..." oninput="notesPage.handleSearch(this.value)">
                    </div>
                    
                    <div class="notes-notebooks">
                        <div class="section-header" style="margin-bottom: var(--spacing-md);">
                            <h3 class="section-title">Notebooks</h3>
                            <button class="btn btn-sm btn-ghost" onclick="notesPage.createNotebook()">+</button>
                        </div>
                        <div class="notebooks-list" id="notebooks-list">
                            <!-- Notebooks will be rendered here -->
                        </div>
                    </div>
                </aside>
                
                <main class="notes-main">
                    <div class="notes-header" style="margin-bottom: var(--spacing-lg);">
                        <h2 class="notes-title" id="notes-title">All Notes</h2>
                        <div class="notes-actions">
                            <button class="btn btn-sm btn-secondary" onclick="notesPage.toggleView()">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="1" y="1" width="6" height="6"/>
                                    <rect x="9" y="1" width="6" height="6"/>
                                    <rect x="1" y="9" width="6" height="6"/>
                                    <rect x="9" y="9" width="6" height="6"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    <div class="notes-grid" id="notes-grid">
                        <!-- Notes will be rendered here -->
                    </div>
                    
                    <div class="empty-state" id="notes-empty" style="display: none;">
                        <div class="empty-state-icon">📝</div>
                        <div class="empty-state-title">No notes yet</div>
                        <div class="empty-state-description">Create your first note to get started</div>
                        <button class="btn btn-primary" onclick="notesPage.createNote()">Create Note</button>
                    </div>
                </main>
            </div>
        `;
        
        return this.container;
    }

    async init() {
        // Update global reference so onclick handlers use this instance
        window.notesPage = this;
        
        await this.loadNotebooks();
        await this.loadNotes();
        this.setupEventListeners();
    }

    getTitle() {
        return 'Notes';
    }

    setupEventListeners() {
        // Event listeners will be set up here
    }

    async loadNotebooks() {
        this.notebooks = await db.getNotebooks();
        const container = document.getElementById('notebooks-list');
        if (!container) return;

        if (this.notebooks.length === 0) {
            container.innerHTML = '<p class="text-tertiary" style="padding: var(--spacing-md); font-size: var(--font-size-sm);">No notebooks yet</p>';
            return;
        }

        container.innerHTML = this.notebooks.map(notebook => `
            <div class="notebook-item ${this.selectedNotebook === notebook.id ? 'active' : ''}" 
                 onclick="notesPage.selectNotebook('${notebook.id}')"
                 style="display: flex; align-items: center; gap: var(--spacing-sm); padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--radius-md); cursor: pointer; transition: all var(--transition-fast); ${this.selectedNotebook === notebook.id ? 'background: var(--color-bg-hover); color: var(--color-accent);' : ''}">
                <div style="width: 12px; height: 12px; border-radius: var(--radius-sm); background: ${notebook.color}; flex-shrink: 0;"></div>
                <span style="flex: 1; font-size: var(--font-size-sm);">${notebook.name}</span>
            </div>
        `).join('');
    }

    async loadNotes() {
        this.notes = await db.getNotes();
        await this.renderNotes();
    }

    async renderNotes() {
        const container = document.getElementById('notes-grid');
        const emptyState = document.getElementById('notes-empty');
        if (!container) return;

        let filteredNotes = this.notes;

        // Filter by notebook
        if (this.selectedNotebook) {
            filteredNotes = filteredNotes.filter(note => note.notebookId === this.selectedNotebook);
        }

        // Filter by search query
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filteredNotes = filteredNotes.filter(note => 
                note.title?.toLowerCase().includes(query) ||
                note.content?.toLowerCase().includes(query)
            );
        }

        // Sort by updated date
        filteredNotes.sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));

        if (filteredNotes.length === 0) {
            container.style.display = 'none';
            if (emptyState) emptyState.style.display = 'flex';
            return;
        }

        container.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';

        container.innerHTML = filteredNotes.map(note => `
            <div class="note-card card" onclick="notesPage.openNote('${note.id}')">
                <div class="card-header">
                    <div style="flex: 1; min-width: 0;">
                        <div class="card-title">${note.title || 'Untitled'}</div>
                        <div class="card-description">${this.stripHtml(note.content || '').substring(0, 100)}</div>
                    </div>
                    ${note.pinned ? '<span style="font-size: 20px;">📌</span>' : ''}
                </div>
                <div class="card-footer">
                    <div class="card-meta">
                        <span>${DateUtils.format(note.updatedAt, 'relative')}</span>
                    </div>
                    <div class="list-item-actions" style="opacity: 1;">
                        <button class="btn btn-sm btn-ghost" onclick="event.stopPropagation(); notesPage.editNote('${note.id}')">Edit</button>
                        <button class="btn btn-sm btn-ghost" onclick="event.stopPropagation(); notesPage.deleteNote('${note.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    stripHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }

    async selectNotebook(notebookId) {
        this.selectedNotebook = this.selectedNotebook === notebookId ? null : notebookId;
        await this.loadNotebooks();
        await this.renderNotes();
        
        const title = document.getElementById('notes-title');
        if (title) {
            if (this.selectedNotebook) {
                const notebook = this.notebooks.find(n => n.id === this.selectedNotebook);
                title.textContent = notebook ? notebook.name : 'All Notes';
            } else {
                title.textContent = 'All Notes';
            }
        }
    }

    handleSearch(query) {
        this.searchQuery = query;
        this.renderNotes();
    }

    async createNote() {
        const note = {
            id: Helpers.generateId(),
            title: '',
            content: '',
            notebookId: this.selectedNotebook,
            pinned: false,
            tags: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        await db.saveNote(note);
        await this.loadNotes();
        this.openNote(note.id);
        toast.success('Note created', 'Your new note has been created');
    }

    async createNotebook() {
        const name = prompt('Enter notebook name:');
        if (!name) return;

        const colors = ['#8B7355', '#5B8C9F', '#5B8C5A', '#C47A4A', '#8B6B9F', '#C47A8B'];
        const notebook = {
            id: Helpers.generateId(),
            name,
            color: colors[Math.floor(Math.random() * colors.length)],
            createdAt: Date.now()
        };

        await db.saveNotebook(notebook);
        await this.loadNotebooks();
        toast.success('Notebook created', `"${name}" has been created`);
    }

    openNote(noteId) {
        router.navigate('notes', { noteId });
    }

    async editNote(noteId) {
        const note = await db.getNote(noteId);
        if (!note) return;

        const content = `
            <form id="note-form" onsubmit="event.preventDefault(); notesPage.saveNote('${noteId}');">
                <div class="form-group">
                    <label class="form-label">Title</label>
                    <input type="text" class="form-input" id="note-title" value="${note.title || ''}" placeholder="Note title...">
                </div>
                <div class="form-group">
                    <label class="form-label">Content</label>
                    <textarea class="form-textarea" id="note-content" rows="10" placeholder="Write your note here... (Markdown supported)">${note.content || ''}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Notebook</label>
                    <select class="form-select" id="note-notebook">
                        <option value="">None</option>
                        ${this.notebooks.map(nb => `
                            <option value="${nb.id}" ${note.notebookId === nb.id ? 'selected' : ''}>${nb.name}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="checkbox">
                        <input type="checkbox" id="note-pinned" ${note.pinned ? 'checked' : ''}>
                        <span>Pin note</span>
                    </label>
                </div>
            </form>
        `;

        modal.open({
            title: 'Edit Note',
            content,
            size: 'lg',
            footer: `
                <button class="btn btn-secondary" onclick="modal.close()">Cancel</button>
                <button class="btn btn-primary" onclick="notesPage.saveNote('${noteId}')">Save</button>
            `,
            onClose: () => {
                this.loadNotes();
            }
        });
    }

    async saveNote(noteId) {
        const title = document.getElementById('note-title')?.value || '';
        const content = document.getElementById('note-content')?.value || '';
        const notebookId = document.getElementById('note-notebook')?.value || null;
        const pinned = document.getElementById('note-pinned')?.checked || false;

        const note = await db.getNote(noteId);
        if (note) {
            note.title = title;
            note.content = content;
            note.notebookId = notebookId;
            note.pinned = pinned;
            await db.saveNote(note);
            
            toast.success('Note saved', 'Your note has been updated');
            modal.close();
            await this.loadNotes();
        }
    }

    async deleteNote(noteId) {
        if (!confirm('Are you sure you want to delete this note?')) return;

        await db.deleteNote(noteId);
        await this.loadNotes();
        toast.success('Note deleted', 'The note has been removed');
    }

    toggleView() {
        // Toggle between grid and list view
        const grid = document.getElementById('notes-grid');
        if (grid) {
            grid.classList.toggle('notes-list-view');
        }
    }
}

// Make it globally accessible for onclick handlers
window.notesPage = new NotesPage();