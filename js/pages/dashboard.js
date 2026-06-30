// Dashboard Page
export class DashboardPage {
    constructor() {
        this.container = null;
    }

    render() {
        this.container = document.createElement('div');
        this.container.className = 'dashboard-page';
        this.container.innerHTML = `
            <div class="welcome-section">
                <h1 class="welcome-title">Welcome back! 👋</h1>
                <p class="welcome-subtitle">Here's what's happening with your studies today.</p>
            </div>
            
            <div class="quick-stats" id="quick-stats">
                <!-- Quick stats will be rendered here -->
            </div>
            
            <div class="dashboard-grid">
                <div class="widget" id="today-tasks-widget">
                    <div class="widget-header">
                        <h3 class="widget-title">Today's Tasks</h3>
                        <button class="widget-action" onclick="router.navigate('tasks')">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 5l5 5-5 5"/>
                            </svg>
                        </button>
                    </div>
                    <div class="widget-content" id="today-tasks">
                        <!-- Today's tasks will be rendered here -->
                    </div>
                </div>
                
                <div class="widget" id="recent-notes-widget">
                    <div class="widget-header">
                        <h3 class="widget-title">Recent Notes</h3>
                        <button class="widget-action" onclick="router.navigate('notes')">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 5l5 5-5 5"/>
                            </svg>
                        </button>
                    </div>
                    <div class="widget-content" id="recent-notes">
                        <!-- Recent notes will be rendered here -->
                    </div>
                </div>
                
                <div class="widget" id="study-progress-widget">
                    <div class="widget-header">
                        <h3 class="widget-title">Study Progress</h3>
                    </div>
                    <div class="widget-content" id="study-progress">
                        <!-- Study progress will be rendered here -->
                    </div>
                </div>
                
                <div class="widget" id="upcoming-events-widget">
                    <div class="widget-header">
                        <h3 class="widget-title">Upcoming Events</h3>
                        <button class="widget-action" onclick="router.navigate('calendar')">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 5l5 5-5 5"/>
                            </svg>
                        </button>
                    </div>
                    <div class="widget-content" id="upcoming-events">
                        <!-- Upcoming events will be rendered here -->
                    </div>
                </div>
            </div>
        `;
        
        return this.container;
    }

    async init() {
        await this.renderQuickStats();
        await this.renderTodayTasks();
        await this.renderRecentNotes();
        await this.renderStudyProgress();
        await this.renderUpcomingEvents();
    }

    getTitle() {
        return 'Dashboard';
    }

    async renderQuickStats() {
        const container = document.getElementById('quick-stats');
        if (!container) return;

        const [tasks, notes, focusTime, streak] = await Promise.all([
            db.getTasks(),
            db.getNotes(),
            db.getTodayFocusTime(),
            db.getStudyStats()
        ]);

        const pendingTasks = tasks.filter(t => !t.completed).length;
        const totalNotes = notes.length;
        const hours = Math.floor(focusTime / (1000 * 60 * 60));
        const minutes = Math.floor((focusTime % (1000 * 60 * 60)) / (1000 * 60));

        container.innerHTML = `
            <div class="quick-stat-card" onclick="router.navigate('tasks')">
                <div class="quick-stat-header">
                    <span class="quick-stat-label">Pending Tasks</span>
                    <div class="quick-stat-icon">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6l3 3 7-7"/>
                            <rect x="2" y="2" width="16" height="16" rx="2"/>
                        </svg>
                    </div>
                </div>
                <div class="quick-stat-value">${pendingTasks}</div>
                <div class="quick-stat-change">tasks to complete</div>
            </div>
            
            <div class="quick-stat-card" onclick="router.navigate('notes')">
                <div class="quick-stat-header">
                    <span class="quick-stat-label">Total Notes</span>
                    <div class="quick-stat-icon">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 4h12v12H4z"/>
                            <path d="M7 7h6M7 10h6M7 13h4"/>
                        </svg>
                    </div>
                </div>
                <div class="quick-stat-value">${totalNotes}</div>
                <div class="quick-stat-change">notes created</div>
            </div>
            
            <div class="quick-stat-card" onclick="router.navigate('focus')">
                <div class="quick-stat-header">
                    <span class="quick-stat-label">Study Time</span>
                    <div class="quick-stat-icon">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="10" cy="10" r="7"/>
                            <path d="M10 6v4l3 3"/>
                        </svg>
                    </div>
                </div>
                <div class="quick-stat-value">${hours}h ${minutes}m</div>
                <div class="quick-stat-change">today</div>
            </div>
            
            <div class="quick-stat-card">
                <div class="quick-stat-header">
                    <span class="quick-stat-label">Current Streak</span>
                    <div class="quick-stat-icon">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10 2l2 5h5l-4 3 1 5-4-3-4 3 1-5-4-3h5z"/>
                        </svg>
                    </div>
                </div>
                <div class="quick-stat-value">${streak.currentStreak}</div>
                <div class="quick-stat-change">days</div>
            </div>
        `;
    }

    async renderTodayTasks() {
        const container = document.getElementById('today-tasks');
        if (!container) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tasks = await db.getTasksByDate(today.getTime());
        const pendingTasks = tasks.filter(t => !t.completed).slice(0, 5);

        if (pendingTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="min-height: 200px; padding: var(--spacing-lg);">
                    <div class="empty-state-icon">✅</div>
                    <div class="empty-state-title">All caught up!</div>
                    <div class="empty-state-description">No pending tasks for today</div>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="today-tasks-list">
                ${pendingTasks.map(task => `
                    <div class="today-task-item" onclick="router.navigate('tasks')">
                        <div class="today-task-checkbox" onclick="event.stopPropagation(); db.toggleTask('${task.id}', true).then(() => { dashboardPage.renderTodayTasks(); dashboardPage.renderQuickStats(); })">
                            ${task.completed ? `
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M2 6l3 3 5-5"/>
                                </svg>
                            ` : ''}
                        </div>
                        <div class="today-task-content">
                            <div class="today-task-title ${task.completed ? 'completed' : ''}">${task.title}</div>
                            <div class="today-task-meta">
                                ${task.priority ? `<span class="today-task-priority priority-${task.priority}">${task.priority}</span>` : ''}
                                ${task.dueDate ? `<span>${DateUtils.format(task.dueDate, 'time')}</span>` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async renderRecentNotes() {
        const container = document.getElementById('recent-notes');
        if (!container) return;

        const notes = await db.getNotes();
        const recentNotes = notes.slice(0, 5);

        if (recentNotes.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="min-height: 200px; padding: var(--spacing-lg);">
                    <div class="empty-state-icon">📝</div>
                    <div class="empty-state-title">No notes yet</div>
                    <div class="empty-state-description">Create your first note to get started</div>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="recent-notes-list">
                ${recentNotes.map(note => `
                    <div class="recent-note-item" onclick="router.navigate('notes')">
                        <div class="recent-note-icon">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 4h12v12H4z"/>
                                <path d="M7 7h6M7 10h6M7 13h4"/>
                            </svg>
                        </div>
                        <div class="recent-note-content">
                            <div class="recent-note-title">${note.title || 'Untitled'}</div>
                            <div class="recent-note-meta">
                                ${note.pinned ? '<span class="recent-note-pinned">📌 Pinned</span>' : ''}
                                <span>${DateUtils.format(note.updatedAt, 'relative')}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async renderStudyProgress() {
        const container = document.getElementById('study-progress');
        if (!container) return;

        const stats = await db.getStudyStats();
        const weeklyGoal = stats.weeklyGoal || (10 * 60 * 60 * 1000); // 10 hours
        const weeklyProgress = stats.weeklyProgress || 0;
        const percentage = Math.min((weeklyProgress / weeklyGoal) * 100, 100);

        container.innerHTML = `
            <div class="study-progress">
                <div class="study-progress-item">
                    <div class="study-progress-header">
                        <span class="study-progress-label">Weekly Goal</span>
                        <span class="study-progress-value">${DateUtils.formatDuration(weeklyProgress)} / ${DateUtils.formatDuration(weeklyGoal)}</span>
                    </div>
                    <div class="study-progress-bar">
                        <div class="study-progress-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
                
                <div class="study-progress-item">
                    <div class="study-progress-header">
                        <span class="study-progress-label">Total Study Time</span>
                        <span class="study-progress-value">${DateUtils.formatDuration(stats.totalStudyTime)}</span>
                    </div>
                </div>
                
                <div class="study-progress-item">
                    <div class="study-progress-header">
                        <span class="study-progress-label">Sessions Completed</span>
                        <span class="study-progress-value">${stats.sessionsCompleted}</span>
                    </div>
                </div>
            </div>
        `;
    }

    async renderUpcomingEvents() {
        const container = document.getElementById('upcoming-events');
        if (!container) return;

        const events = await db.getUpcomingTasks(7);
        const calendarEvents = await db.getEvents();
        const upcomingEvents = [...events, ...calendarEvents]
            .sort((a, b) => (a.dueDate || a.date) - (b.dueDate || b.date))
            .slice(0, 5);

        if (upcomingEvents.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="min-height: 200px; padding: var(--spacing-lg);">
                    <div class="empty-state-icon">📅</div>
                    <div class="empty-state-title">No upcoming events</div>
                    <div class="empty-state-description">Your schedule is clear</div>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="upcoming-events-list">
                ${upcomingEvents.map(event => {
                    const date = event.dueDate || event.date;
                    const d = new Date(date);
                    return `
                        <div class="upcoming-event-item" onclick="router.navigate('${event.type || 'calendar'}')">
                            <div class="upcoming-event-date">
                                <div class="upcoming-event-day">${d.getDate()}</div>
                                <div class="upcoming-event-month">${DateUtils.getMonthName(d.getMonth(), true)}</div>
                            </div>
                            <div class="upcoming-event-content">
                                <div class="upcoming-event-title">${event.title}</div>
                                <div class="upcoming-event-meta">
                                    ${event.type === 'task' ? 'Task' : 'Event'}
                                    ${event.time ? `• ${event.time}` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
}

// Make it globally accessible for onclick handlers
window.dashboardPage = new DashboardPage();