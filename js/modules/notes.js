// Notes Module - Business logic for notes
export class NotesModule {
    constructor() {
        this.notes = [];
        this.notebooks = [];
        this.currentNote = null;
    }

    async init() {
        await this.loadNotebooks();
        await this.loadNotes();
    }

    // Load notebooks
    async loadNotebooks() {
        this.notebooks = await db.getNotebooks();
    }

    // Load notes
    async loadNotes() {
        this.notes = await db.getNotes();
    }

    // Get notes by notebook
    async getNotesByNotebook(notebookId) {
        if (!notebookId) return this.notes;
        return this.notes.filter(note => note.notebookId === notebookId);
    }

    // Search notes
    searchNotes(query) {
        if (!query) return this.notes;
        
        const lowerQuery = query.toLowerCase();
        return this.notes.filter(note => 
            note.title?.toLowerCase().includes(lowerQuery) ||
            note.content?.toLowerCase().includes(lowerQuery) ||
            note.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    }

    // Create note
    async createNote(data = {}) {
        const note = {
            id: Helpers.generateId(),
            title: data.title || '',
            content: data.content || '',
            notebookId: data.notebookId || null,
            pinned: false,
            tags: data.tags || [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        await db.saveNote(note);
        await this.loadNotes();
        return note;
    }

    // Update note
    async updateNote(noteId, updates) {
        const note = await db.getNote(noteId);
        if (!note) return null;

        Object.assign(note, updates, { updatedAt: Date.now() });
        await db.saveNote(note);
        await this.loadNotes();
        return note;
    }

    // Delete note
    async deleteNote(noteId) {
        await db.deleteNote(noteId);
        await this.loadNotes();
    }

    // Toggle pin
    async togglePin(noteId) {
        const note = await db.getNote(noteId);
        if (note) {
            note.pinned = !note.pinned;
            note.updatedAt = Date.now();
            await db.saveNote(note);
            await this.loadNotes();
            return note.pinned;
        }
        return false;
    }

    // Get pinned notes
    getPinnedNotes() {
        return this.notes.filter(note => note.pinned);
    }

    // Get recent notes
    getRecentNotes(limit = 10) {
        return this.notes
            .sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt))
            .slice(0, limit);
    }

    // Create notebook
    async createNotebook(name, color = null) {
        const colors = ['#8B7355', '#5B8C9F', '#5B8C5A', '#C47A4A', '#8B6B9F', '#C47A8B'];
        const notebook = {
            id: Helpers.generateId(),
            name,
            color: color || colors[Math.floor(Math.random() * colors.length)],
            createdAt: Date.now()
        };

        await db.saveNotebook(notebook);
        await this.loadNotebooks();
        return notebook;
    }

    // Delete notebook
    async deleteNotebook(notebookId) {
        await db.deleteNotebook(notebookId);
        await this.loadNotebooks();
        
        // Remove notebook from notes
        const notes = await this.getNotesByNotebook(notebookId);
        for (const note of notes) {
            note.notebookId = null;
            await db.saveNote(note);
        }
        await this.loadNotes();
    }

    // Get notebook stats
    async getNotebookStats(notebookId) {
        const notes = await this.getNotesByNotebook(notebookId);
        return {
            totalNotes: notes.length,
            pinnedNotes: notes.filter(n => n.pinned).length,
            lastUpdated: notes.length > 0 ? Math.max(...notes.map(n => n.updatedAt || n.createdAt)) : null
        };
    }

    // Export notes
    async exportNotes() {
        return {
            notes: this.notes,
            notebooks: this.notebooks,
            exportedAt: Date.now()
        };
    }

    // Import notes
    async importNotes(data) {
        if (data.notebooks) {
            for (const notebook of data.notebooks) {
                await db.saveNotebook(notebook);
            }
        }
        
        if (data.notes) {
            for (const note of data.notes) {
                await db.saveNote(note);
            }
        }
        
        await this.loadNotebooks();
        await this.loadNotes();
    }

    // Strip HTML from content
    stripHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }

    // Get word count
    getWordCount(text) {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    // Get reading time
    getReadingTime(text) {
        const words = this.getWordCount(text);
        const wordsPerMinute = 200;
        const minutes = Math.ceil(words / wordsPerMinute);
        return minutes;
    }
}

// Singleton instance
export const notesModule = new NotesModule();