// Calendar Module - Business logic for calendar
export class CalendarModule {
    constructor() {
        this.events = [];
        this.currentDate = new Date();
        this.view = 'month';
    }

    async init() {
        await this.loadEvents();
    }

    // Load events
    async loadEvents() {
        this.events = await db.getEvents();
    }

    // Get events for a specific date
    getEventsForDate(date) {
        const targetDate = new Date(date).setHours(0, 0, 0, 0);
        const nextDay = new Date(date).setHours(23, 59, 59, 999);
        
        return this.events.filter(event => {
            const eventDate = event.date;
            return eventDate >= targetDate && eventDate <= nextDay;
        });
    }

    // Get events for a month
    getEventsForMonth(year, month) {
        return this.events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getFullYear() === year && eventDate.getMonth() === month;
        });
    }

    // Get events for a week
    getEventsForWeek(startDate) {
        const startOfWeek = DateUtils.startOfWeek(startDate);
        const endOfWeek = DateUtils.endOfWeek(startDate);
        
        return this.events.filter(event => {
            return event.date >= startOfWeek && event.date <= endOfWeek;
        });
    }

    // Get upcoming events
    getUpcomingEvents(days = 7) {
        const now = Date.now();
        const future = now + (days * 24 * 60 * 60 * 1000);
        
        return this.events
            .filter(event => event.date >= now && event.date <= future)
            .sort((a, b) => a.date - b.date);
    }

    // Create event
    async createEvent(data = {}) {
        const event = {
            id: Helpers.generateId(),
            title: data.title || '',
            date: data.date || Date.now(),
            time: data.time || '',
            description: data.description || '',
            color: data.color || '#8B7355',
            type: data.type || 'event',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        await db.saveEvent(event);
        await this.loadEvents();
        return event;
    }

    // Update event
    async updateEvent(eventId, updates) {
        const event = await db.getEvent(eventId);
        if (!event) return null;

        Object.assign(event, updates, { updatedAt: Date.now() });
        await db.saveEvent(event);
        await this.loadEvents();
        return event;
    }

    // Delete event
    async deleteEvent(eventId) {
        await db.deleteEvent(eventId);
        await this.loadEvents();
    }

    // Navigate to previous/next period
    navigate(direction) {
        if (this.view === 'month') {
            this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        } else {
            this.currentDate.setDate(this.currentDate.getDate() + (direction * 7));
        }
    }

    // Set view
    setView(view) {
        this.view = view;
    }

    // Get current month/year title
    getTitle() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    }

    // Get calendar grid for month view
    getCalendarGrid() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        return DateUtils.getCalendarGrid(year, month);
    }

    // Get week days for week view
    getWeekDays() {
        return DateUtils.getWeekDays(this.currentDate);
    }

    // Get events for current view
    getCurrentViewEvents() {
        if (this.view === 'month') {
            const year = this.currentDate.getFullYear();
            const month = this.currentDate.getMonth();
            return this.getEventsForMonth(year, month);
        } else {
            return this.getEventsForWeek(this.currentDate);
        }
    }

    // Get event statistics
    getStats() {
        const now = Date.now();
        const thisMonth = this.getEventsForMonth(
            new Date().getFullYear(),
            new Date().getMonth()
        );
        
        const upcoming = this.getUpcomingEvents(7);
        const today = this.getEventsForDate(now);

        return {
            total: this.events.length,
            thisMonth: thisMonth.length,
            upcoming: upcoming.length,
            today: today.length
        };
    }

    // Export events
    async exportEvents() {
        return {
            events: this.events,
            exportedAt: Date.now()
        };
    }

    // Import events
    async importEvents(data) {
        if (data.events) {
            for (const event of data.events) {
                await db.saveEvent(event);
            }
        }
        await this.loadEvents();
    }
}

// Singleton instance
export const calendarModule = new CalendarModule();