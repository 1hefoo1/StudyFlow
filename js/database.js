// Database Layer - Manages all data operations
import { storage } from './core/storage.js';

export class Database {
    constructor() {
        this.initializeData();
    }

    // Initialize default data
    async initializeData() {
        const settings = await storage.get('settings');
        if (!settings) {
            await storage.set('settings', {
                theme: 'light',
                accent: 'default',
                fontSize: 'medium',
                sidebarCollapsed: false,
                notifications: true,
                soundEnabled: true,
                autoSave: true,
                defaultView: 'dashboard'
            });
        }

        // Initialize notebooks
        const notebooks = await storage.get('notebooks');
        if (!notebooks || notebooks.length === 0) {
            await storage.set('notebooks', [
                { id: 'default', name: 'Personal', color: '#8B7355', createdAt: Date.now() },
                { id: 'work', name: 'Work', color: '#5B8C9F', createdAt: Date.now() },
                { id: 'study', name: 'Study', color: '#5B8C5A', createdAt: Date.now() }
            ]);
        }

        // Initialize subjects
        const subjects = await storage.get('subjects');
        if (!subjects || subjects.length === 0) {
            await storage.set('subjects', [
                { id: 'math', name: 'Mathematics', color: '#5B8C9F', icon: '📐' },
                { id: 'science', name: 'Science', color: '#5B8C5A', icon: '🔬' },
                { id: 'history', name: 'History', color: '#C47A4A', icon: '📚' },
                { id: 'language', name: 'Languages', color: '#8B6B9F', icon: '🌍' }
            ]);
        }
    }

    // ==================== NOTES ====================
    
    async getNotes() {
        return await storage.get('notes') || [];
    }

    async getNote(id) {
        const notes = await this.getNotes();
        return notes.find(note => note.id === id);
    }

    async saveNote(note) {
        const notes = await this.getNotes();
        const existingIndex = notes.findIndex(n => n.id === note.id);
        
        note.updatedAt = Date.now();
        
        if (existingIndex >= 0) {
            notes[existingIndex] = note;
        } else {
            note.createdAt = Date.now();
            notes.unshift(note);
        }
        
        await storage.set('notes', notes);
        return note;
    }

    async deleteNote(id) {
        const notes = await this.getNotes();
        const filtered = notes.filter(note => note.id !== id);
        await storage.set('notes', filtered);
    }

    async pinNote(id, pinned) {
        const notes = await this.getNotes();
        const note = notes.find(n => n.id === id);
        if (note) {
            note.pinned = pinned;
            note.updatedAt = Date.now();
            await storage.set('notes', notes);
        }
    }

    // ==================== TASKS ====================
    
    async getTasks() {
        return await storage.get('tasks') || [];
    }

    async getTask(id) {
        const tasks = await this.getTasks();
        return tasks.find(task => task.id === id);
    }

    async saveTask(task) {
        const tasks = await this.getTasks();
        const existingIndex = tasks.findIndex(t => t.id === task.id);
        
        task.updatedAt = Date.now();
        
        if (existingIndex >= 0) {
            tasks[existingIndex] = task;
        } else {
            task.createdAt = Date.now();
            tasks.push(task);
        }
        
        await storage.set('tasks', tasks);
        return task;
    }

    async deleteTask(id) {
        const tasks = await this.getTasks();
        const filtered = tasks.filter(task => task.id !== id);
        await storage.set('tasks', filtered);
    }

    async toggleTask(id, completed) {
        const tasks = await this.getTasks();
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = completed;
            task.completedAt = completed ? Date.now() : null;
            task.updatedAt = Date.now();
            await storage.set('tasks', tasks);
        }
    }

    async getTasksByDate(date) {
        const tasks = await this.getTasks();
        const startOfDay = new Date(date).setHours(0, 0, 0, 0);
        const endOfDay = new Date(date).setHours(23, 59, 59, 999);
        
        return tasks.filter(task => {
            const dueDate = task.dueDate;
            return dueDate >= startOfDay && dueDate <= endOfDay;
        });
    }

    async getUpcomingTasks(days = 7) {
        const tasks = await this.getTasks();
        const now = Date.now();
        const future = now + (days * 24 * 60 * 60 * 1000);
        
        return tasks
            .filter(task => !task.completed && task.dueDate >= now && task.dueDate <= future)
            .sort((a, b) => a.dueDate - b.dueDate);
    }

    // ==================== CALENDAR EVENTS ====================
    
    async getEvents() {
        return await storage.get('events') || [];
    }

    async getEvent(id) {
        const events = await this.getEvents();
        return events.find(event => event.id === id);
    }

    async saveEvent(event) {
        const events = await this.getEvents();
        const existingIndex = events.findIndex(e => e.id === event.id);
        
        event.updatedAt = Date.now();
        
        if (existingIndex >= 0) {
            events[existingIndex] = event;
        } else {
            event.createdAt = Date.now();
            events.push(event);
        }
        
        await storage.set('events', events);
        return event;
    }

    async deleteEvent(id) {
        const events = await this.getEvents();
        const filtered = events.filter(event => event.id !== id);
        await storage.set('events', filtered);
    }

    async getEventsByDateRange(startDate, endDate) {
        const events = await this.getEvents();
        return events.filter(event => {
            return event.date >= startDate && event.date <= endDate;
        });
    }

    async getEventsByMonth(year, month) {
        const events = await this.getEvents();
        return events.filter(event => {
            const date = new Date(event.date);
            return date.getFullYear() === year && date.getMonth() === month;
        });
    }

    // ==================== FLASHCARDS ====================
    
    async getFlashcards() {
        return await storage.get('flashcards') || [];
    }

    async getFlashcard(id) {
        const flashcards = await this.getFlashcards();
        return flashcards.find(card => card.id === id);
    }

    async saveFlashcard(flashcard) {
        const flashcards = await this.getFlashcards();
        const existingIndex = flashcards.findIndex(f => f.id === flashcard.id);
        
        flashcard.updatedAt = Date.now();
        
        if (existingIndex >= 0) {
            flashcards[existingIndex] = flashcard;
        } else {
            flashcard.createdAt = Date.now();
            flashcards.push(flashcard);
        }
        
        await storage.set('flashcards', flashcards);
        return flashcard;
    }

    async deleteFlashcard(id) {
        const flashcards = await this.getFlashcards();
        const filtered = flashcards.filter(card => card.id !== id);
        await storage.set('flashcards', filtered);
    }

    async getFlashcardsByDeck(deckId) {
        const flashcards = await this.getFlashcards();
        return flashcards.filter(card => card.deckId === deckId);
    }

    // ==================== DECKS ====================
    
    async getDecks() {
        return await storage.get('decks') || [];
    }

    async getDeck(id) {
        const decks = await this.getDecks();
        return decks.find(deck => deck.id === id);
    }

    async saveDeck(deck) {
        const decks = await this.getDecks();
        const existingIndex = decks.findIndex(d => d.id === deck.id);
        
        deck.updatedAt = Date.now();
        
        if (existingIndex >= 0) {
            decks[existingIndex] = deck;
        } else {
            deck.createdAt = Date.now();
            decks.push(deck);
        }
        
        await storage.set('decks', decks);
        return deck;
    }

    async deleteDeck(id) {
        const decks = await this.getDecks();
        const filtered = decks.filter(deck => deck.id !== id);
        await storage.set('decks', filtered);
        
        // Also delete all flashcards in this deck
        const flashcards = await this.getFlashcards();
        const filteredFlashcards = flashcards.filter(card => card.deckId !== id);
        await storage.set('flashcards', filteredFlashcards);
    }

    // ==================== FOCUS SESSIONS ====================
    
    async getFocusSessions() {
        return await storage.get('focusSessions') || [];
    }

    async saveFocusSession(session) {
        const sessions = await this.getFocusSessions();
        session.id = Date.now().toString();
        session.createdAt = Date.now();
        sessions.push(session);
        await storage.set('focusSessions', sessions);
        return session;
    }

    async getFocusSessionsByDateRange(startDate, endDate) {
        const sessions = await this.getFocusSessions();
        return sessions.filter(session => {
            return session.startTime >= startDate && session.startTime <= endDate;
        });
    }

    async getTodayFocusTime() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sessions = await this.getFocusSessionsByDateRange(today.getTime(), Date.now());
        return sessions.reduce((total, session) => total + (session.duration || 0), 0);
    }

    // ==================== STUDY STATS ====================
    
    async getStudyStats() {
        return await storage.get('studyStats') || {
            totalStudyTime: 0,
            sessionsCompleted: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastStudyDate: null,
            weeklyGoal: 10 * 60 * 60 * 1000, // 10 hours in ms
            weeklyProgress: 0
        };
    }

    async updateStudyStats(stats) {
        await storage.set('studyStats', stats);
    }

    async incrementStudyTime(duration) {
        const stats = await this.getStudyStats();
        stats.totalStudyTime += duration;
        stats.sessionsCompleted += 1;
        
        // Update streak
        const today = new Date().toDateString();
        const lastStudy = stats.lastStudyDate ? new Date(stats.lastStudyDate).toDateString() : null;
        
        if (lastStudy !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastStudy === yesterday.toDateString()) {
                stats.currentStreak += 1;
            } else if (lastStudy !== today) {
                stats.currentStreak = 1;
            }
            
            stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
            stats.lastStudyDate = Date.now();
        }
        
        // Update weekly progress
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        
        const weekSessions = await this.getFocusSessionsByDateRange(weekStart.getTime(), Date.now());
        stats.weeklyProgress = weekSessions.reduce((total, session) => total + (session.duration || 0), 0);
        
        await this.updateStudyStats(stats);
        return stats;
    }

    // ==================== SETTINGS ====================
    
    async getSettings() {
        return await storage.get('settings') || {};
    }

    async updateSettings(settings) {
        const current = await this.getSettings();
        const updated = { ...current, ...settings };
        await storage.set('settings', updated);
        return updated;
    }

    // ==================== NOTEBOOKS ====================
    
    async getNotebooks() {
        return await storage.get('notebooks') || [];
    }

    async saveNotebook(notebook) {
        const notebooks = await this.getNotebooks();
        const existingIndex = notebooks.findIndex(n => n.id === notebook.id);
        
        if (existingIndex >= 0) {
            notebooks[existingIndex] = notebook;
        } else {
            notebook.createdAt = Date.now();
            notebooks.push(notebook);
        }
        
        await storage.set('notebooks', notebooks);
        return notebook;
    }

    async deleteNotebook(id) {
        const notebooks = await this.getNotebooks();
        const filtered = notebooks.filter(n => n.id !== id);
        await storage.set('notebooks', filtered);
    }

    // ==================== SUBJECTS ====================
    
    async getSubjects() {
        return await storage.get('subjects') || [];
    }

    async saveSubject(subject) {
        const subjects = await this.getSubjects();
        const existingIndex = subjects.findIndex(s => s.id === subject.id);
        
        if (existingIndex >= 0) {
            subjects[existingIndex] = subject;
        } else {
            subjects.push(subject);
        }
        
        await storage.set('subjects', subjects);
        return subject;
    }

    async deleteSubject(id) {
        const subjects = await this.getSubjects();
        const filtered = subjects.filter(s => s.id !== id);
        await storage.set('subjects', filtered);
    }

    // ==================== ACHIEVEMENTS ====================
    
    async getAchievements() {
        return await storage.get('achievements') || [];
    }

    async unlockAchievement(achievementId) {
        const achievements = await this.getAchievements();
        const existing = achievements.find(a => a.id === achievementId);
        
        if (!existing) {
            achievements.push({
                id: achievementId,
                unlockedAt: Date.now()
            });
            await storage.set('achievements', achievements);
            return true;
        }
        return false;
    }

    // ==================== RECENT ITEMS ====================
    
    async getRecentItems() {
        return await storage.get('recentItems') || [];
    }

    async addRecentItem(item) {
        const recent = await this.getRecentItems();
        const existingIndex = recent.findIndex(r => r.id === item.id && r.type === item.type);
        
        if (existingIndex >= 0) {
            recent.splice(existingIndex, 1);
        }
        
        item.accessedAt = Date.now();
        recent.unshift(item);
        
        // Keep only last 20 items
        const trimmed = recent.slice(0, 20);
        await storage.set('recentItems', trimmed);
    }

    // ==================== BACKUP & RESTORE ====================
    
    async exportAllData() {
        return await storage.export();
    }

    async importAllData(data) {
        try {
            await storage.import(data);
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    async clearAllData() {
        await storage.clear();
        await this.initializeData();
    }
}

// Singleton instance
export const db = new Database();