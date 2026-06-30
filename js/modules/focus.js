// Focus Module - Business logic for focus timer
export class FocusModule {
    constructor() {
        this.sessions = [];
        this.settings = {
            focusDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            sessionsBeforeLongBreak: 4
        };
    }

    async init() {
        await this.loadSettings();
        await this.loadSessions();
    }

    // Load settings
    async loadSettings() {
        const settings = await db.getSettings();
        if (settings.focusDuration) this.settings.focusDuration = settings.focusDuration;
        if (settings.shortBreakDuration) this.settings.shortBreakDuration = settings.shortBreakDuration;
        if (settings.longBreakDuration) this.settings.longBreakDuration = settings.longBreakDuration;
        if (settings.sessionsBeforeLongBreak) this.settings.sessionsBeforeLongBreak = settings.sessionsBeforeLongBreak;
    }

    // Load sessions
    async loadSessions() {
        this.sessions = await db.getFocusSessions();
    }

    // Save focus session
    async saveSession(duration, type = 'focus') {
        const session = {
            duration,
            type,
            completedAt: Date.now()
        };

        await db.saveFocusSession(session);
        await db.incrementStudyTime(duration);
        await this.loadSessions();
        
        return session;
    }

    // Get today's focus time
    getTodayFocusTime() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return this.sessions
            .filter(session => session.startTime >= today.getTime())
            .reduce((total, session) => total + (session.duration || 0), 0);
    }

    // Get sessions for date range
    getSessionsForRange(startDate, endDate) {
        return this.sessions.filter(session => {
            return session.startTime >= startDate && session.startTime <= endDate;
        });
    }

    // Get weekly focus time
    getWeeklyFocusTime() {
        const weekStart = DateUtils.startOfWeek(Date.now());
        const weekEnd = DateUtils.endOfWeek(Date.now());
        
        return this.getSessionsForRange(weekStart, weekEnd)
            .reduce((total, session) => total + (session.duration || 0), 0);
    }

    // Get monthly focus time
    getMonthlyFocusTime() {
        const monthStart = DateUtils.startOfMonth(Date.now());
        const monthEnd = DateUtils.endOfMonth(Date.now());
        
        return this.getSessionsForRange(monthStart, monthEnd)
            .reduce((total, session) => total + (session.duration || 0), 0);
    }

    // Get session statistics
    getStats() {
        const todayFocus = this.getTodayFocusTime();
        const weeklyFocus = this.getWeeklyFocusTime();
        const monthlyFocus = this.getMonthlyFocusTime();
        
        const totalSessions = this.sessions.length;
        const totalFocusTime = this.sessions.reduce((total, session) => total + (session.duration || 0), 0);
        
        const averageSessionDuration = totalSessions > 0 
            ? totalFocusTime / totalSessions 
            : 0;

        return {
            todayFocus,
            weeklyFocus,
            monthlyFocus,
            totalFocusTime,
            totalSessions,
            averageSessionDuration,
            weeklyGoal: this.settings.weeklyGoal || (10 * 60 * 60 * 1000), // 10 hours
            weeklyProgress: weeklyFocus
        };
    }

    // Get focus streak
    getStreak() {
        if (this.sessions.length === 0) return 0;
        
        const sortedSessions = [...this.sessions].sort((a, b) => b.startTime - a.startTime);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let streak = 0;
        let currentDate = today.getTime();
        
        for (const session of sortedSessions) {
            const sessionDate = new Date(session.startTime);
            sessionDate.setHours(0, 0, 0, 0);
            const sessionTime = sessionDate.getTime();
            
            if (sessionTime === currentDate) {
                streak++;
                currentDate -= 24 * 60 * 60 * 1000; // Go to previous day
            } else if (sessionTime < currentDate) {
                break;
            }
        }
        
        return streak;
    }

    // Get productivity by hour
    getProductivityByHour() {
        const hourlyData = new Array(24).fill(0);
        
        this.sessions.forEach(session => {
            const date = new Date(session.startTime);
            const hour = date.getHours();
            hourlyData[hour] += session.duration || 0;
        });
        
        return hourlyData;
    }

    // Get productivity by day of week
    getProductivityByDay() {
        const dailyData = new Array(7).fill(0);
        
        this.sessions.forEach(session => {
            const date = new Date(session.startTime);
            const day = date.getDay();
            dailyData[day] += session.duration || 0;
        });
        
        return dailyData;
    }

    // Update settings
    async updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        await db.updateSettings(this.settings);
    }

    // Export sessions
    async exportSessions() {
        return {
            sessions: this.sessions,
            settings: this.settings,
            exportedAt: Date.now()
        };
    }

    // Import sessions
    async importSessions(data) {
        if (data.sessions) {
            for (const session of data.sessions) {
                await db.saveFocusSession(session);
            }
        }
        await this.loadSessions();
    }

    // Clear all sessions
    async clearSessions() {
        const sessions = await db.getFocusSessions();
        for (const session of sessions) {
            await db.deleteFocusSession(session.id);
        }
        await this.loadSessions();
    }
}

// Singleton instance
export const focusModule = new FocusModule();