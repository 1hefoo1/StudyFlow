// StudyFlow - Main Application Entry Point
import { router } from './router.js';
import { db } from './database.js';
import { modal } from './ui/modal.js';
import { toast } from './ui/toast.js';
import { commandPalette } from './ui/commandPalette.js';
import { DashboardPage } from './pages/dashboard.js';
import { NotesPage } from './pages/notes.js';
import { TasksPage } from './pages/tasks.js';
import { CalendarPage } from './pages/calendar.js';
import { FocusPage } from './pages/focus.js';
import { FlashcardsPage } from './pages/flashcards.js';
import { SettingsPage } from './pages/settings.js';

class App {
    constructor() {
        this.init();
    }

    async init() {
        try {
            // Initialize database
            await db.initializeData();
            
            // Register routes
            this.registerRoutes();
            
            // Initialize router (after routes are registered)
            router.init();
            
            // Register command palette commands
            this.registerCommands();
            
            // Setup global event listeners
            this.setupEventListeners();
            
            // Apply saved settings
            await this.applySettings();
            
            // Show welcome toast
            setTimeout(() => {
                toast.info('Welcome to StudyFlow', 'Press Ctrl+K to open command palette');
            }, 1000);
            
            console.log('StudyFlow initialized successfully');
        } catch (error) {
            console.error('Failed to initialize StudyFlow:', error);
            toast.error('Initialization Error', 'Failed to load the application');
        }
    }

    registerRoutes() {
        router.register('dashboard', DashboardPage);
        router.register('notes', NotesPage);
        router.register('tasks', TasksPage);
        router.register('calendar', CalendarPage);
        router.register('focus', FocusPage);
        router.register('flashcards', FlashcardsPage);
        router.register('settings', SettingsPage);
    }

    registerCommands() {
        // Navigation commands
        commandPalette.registerAll([
            {
                id: 'goto-dashboard',
                title: 'Go to Dashboard',
                description: 'View your dashboard',
                icon: '📊',
                shortcut: 'G D',
                category: 'Navigation',
                action: () => router.navigate('dashboard')
            },
            {
                id: 'goto-notes',
                title: 'Go to Notes',
                description: 'View and manage notes',
                icon: '📝',
                shortcut: 'G N',
                category: 'Navigation',
                action: () => router.navigate('notes')
            },
            {
                id: 'goto-tasks',
                title: 'Go to Tasks',
                description: 'View and manage tasks',
                icon: '✅',
                shortcut: 'G T',
                category: 'Navigation',
                action: () => router.navigate('tasks')
            },
            {
                id: 'goto-calendar',
                title: 'Go to Calendar',
                description: 'View your calendar',
                icon: '📅',
                shortcut: 'G C',
                category: 'Navigation',
                action: () => router.navigate('calendar')
            },
            {
                id: 'goto-focus',
                title: 'Go to Focus Mode',
                description: 'Start focusing',
                icon: '🎯',
                shortcut: 'G F',
                category: 'Navigation',
                action: () => router.navigate('focus')
            },
            {
                id: 'goto-flashcards',
                title: 'Go to Flashcards',
                description: 'Study with flashcards',
                icon: '🎴',
                shortcut: 'G S',
                category: 'Navigation',
                action: () => router.navigate('flashcards')
            },
            {
                id: 'goto-settings',
                title: 'Go to Settings',
                description: 'Manage your settings',
                icon: '⚙️',
                shortcut: 'G S',
                category: 'Navigation',
                action: () => router.navigate('settings')
            },
            // Quick actions
            {
                id: 'new-note',
                title: 'Create New Note',
                description: 'Create a new note',
                icon: '📝',
                shortcut: 'N N',
                category: 'Quick Actions',
                action: () => {
                    router.navigate('notes');
                    setTimeout(() => notesPage.createNote(), 100);
                }
            },
            {
                id: 'new-task',
                title: 'Create New Task',
                description: 'Create a new task',
                icon: '✅',
                shortcut: 'N T',
                category: 'Quick Actions',
                action: () => {
                    router.navigate('tasks');
                    setTimeout(() => tasksPage.createTask(), 100);
                }
            },
            {
                id: 'new-event',
                title: 'Create New Event',
                description: 'Add a calendar event',
                icon: '📅',
                shortcut: 'N E',
                category: 'Quick Actions',
                action: () => {
                    router.navigate('calendar');
                    setTimeout(() => calendarPage.createEvent(), 100);
                }
            },
            {
                id: 'start-focus',
                title: 'Start Focus Timer',
                description: 'Begin a focus session',
                icon: '🎯',
                shortcut: 'F S',
                category: 'Quick Actions',
                action: () => {
                    router.navigate('focus');
                    setTimeout(() => focusPage.startTimer(), 100);
                }
            }
        ]);
    }

    setupEventListeners() {
        // Handle online/offline status
        window.addEventListener('online', () => {
            toast.success('Back Online', 'Your connection has been restored');
        });
        
        window.addEventListener('offline', () => {
            toast.warning('Offline Mode', 'You are currently offline');
        });
        
        // Handle before unload
        window.addEventListener('beforeunload', (e) => {
            // Check if there are unsaved changes
            // This is a simplified version
            e.preventDefault();
            e.returnValue = '';
        });
        
        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K - Command Palette
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                commandPalette.toggle();
            }
            
            // Ctrl/Cmd + N - New Note
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                router.navigate('notes');
                setTimeout(() => notesPage.createNote(), 100);
            }
            
            // Ctrl/Cmd + T - New Task
            if ((e.ctrlKey || e.metaKey) && e.key === 't') {
                e.preventDefault();
                router.navigate('tasks');
                setTimeout(() => tasksPage.createTask(), 100);
            }
            
            // Escape - Close modals/command palette
            if (e.key === 'Escape') {
                if (commandPalette.isVisible()) {
                    commandPalette.close();
                } else if (modal.isOpen()) {
                    modal.close();
                }
            }
        });
        
        // Handle sidebar navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (page) {
                    router.navigate(page);
                }
            });
        });
        
        // Handle mobile menu toggle
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.overlay');
        
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                if (overlay) overlay.classList.toggle('active');
            });
        }
        
        if (overlay) {
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            });
        }
    }

    async applySettings() {
        const settings = await db.getSettings();
        
        // Apply theme
        if (settings.theme) {
            document.documentElement.setAttribute('data-theme', settings.theme);
        }
        
        // Apply accent color
        if (settings.accent) {
            document.documentElement.setAttribute('data-accent', settings.accent);
        }
        
        // Apply font size
        if (settings.fontSize) {
            document.documentElement.setAttribute('data-font-size', settings.fontSize);
        }
        
        // Apply sidebar collapsed state
        if (settings.sidebarCollapsed) {
            document.querySelector('.sidebar')?.classList.add('collapsed');
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Export for module usage
export default App;