// Calendar Page
import { DateUtils } from '../utils/date.js';
import { db } from '../database.js';
import { Helpers } from '../utils/helpers.js';

export class CalendarPage {
    constructor() {
        this.container = null;
        this.currentDate = new Date();
        this.view = 'month'; // month, week
        this.events = [];
    }

    render() {
        this.container = document.createElement('div');
        this.container.className = 'calendar-page';
        this.container.innerHTML = `
            <div class="page-header">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--spacing-md);">
                    <div>
                        <h1 class="page-title">Calendar</h1>
                        <p class="page-subtitle">View and manage your schedule</p>
                    </div>
                    <button class="btn btn-primary" onclick="calendarPage.createEvent()">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10 4v12M4 10h12"/>
                        </svg>
                        <span>Add Event</span>
                    </button>
                </div>
            </div>
            
            <div class="calendar-container">
                <div class="calendar-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--spacing-lg);">
                    <div class="calendar-nav">
                        <button class="btn btn-secondary" onclick="calendarPage.navigate(-1)">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 4l-6 6 6 6"/>
                            </svg>
                        </button>
                        <h2 class="calendar-title" id="calendar-title">${this.getTitle()}</h2>
                        <button class="btn btn-secondary" onclick="calendarPage.navigate(1)">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M8 4l6 6-6 6"/>
                            </svg>
                        </button>
                    </div>
                    <div class="calendar-view-toggle">
                        <button class="btn btn-sm ${this.view === 'month' ? 'btn-primary' : 'btn-secondary'}" onclick="calendarPage.setView('month')">Month</button>
                        <button class="btn btn-sm ${this.view === 'week' ? 'btn-primary' : 'btn-secondary'}" onclick="calendarPage.setView('week')">Week</button>
                    </div>
                </div>
                
                <div class="calendar-content" id="calendar-content">
                    <!-- Calendar will be rendered here -->
                </div>
            </div>
        `;
        
        return this.container;
    }

    async init() {
        await this.loadEvents();
        await this.render();
    }

    getTitle() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    }

    navigate(direction) {
        if (this.view === 'month') {
            this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        } else {
            this.currentDate.setDate(this.currentDate.getDate() + (direction * 7));
        }
        this.render();
    }

    setView(view) {
        this.view = view;
        this.render();
    }

    async loadEvents() {
        this.events = await db.getEvents();
    }

    async render() {
        const titleEl = document.getElementById('calendar-title');
        if (titleEl) {
            titleEl.textContent = this.getTitle();
        }

        const contentEl = document.getElementById('calendar-content');
        if (!contentEl) return;

        if (this.view === 'month') {
            await this.renderMonthView(contentEl);
        } else {
            await this.renderWeekView(contentEl);
        }
    }

    async renderMonthView(container) {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const daysInMonth = DateUtils.getDaysInMonth(year, month);
        const firstDay = new Date(year, month, 1).getDay() - 1; // Monday = 0
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get events for this month
        const monthEvents = this.events.filter(event => {
            const date = new Date(event.date);
            return date.getFullYear() === year && date.getMonth() === month;
        });

        // Build calendar grid
        let html = '<div class="calendar-grid">';
        
        // Day headers
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        days.forEach(day => {
            html += `<div class="calendar-day-header">${day}</div>`;
        });

        // Previous month days
        const prevMonth = new Date(year, month, 0);
        const daysInPrevMonth = prevMonth.getDate();
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            html += `<div class="calendar-day other-month"><span>${day}</span></div>`;
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            const isToday = date.getTime() === today.getTime();
            const dayEvents = monthEvents.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate.getDate() === day;
            });

            html += `
                <div class="calendar-day ${isToday ? 'today' : ''}" onclick="calendarView.selectDate('${dateStr}')">
                    <span class="calendar-day-number">${day}</span>
                    <div class="calendar-day-events">
                        ${dayEvents.slice(0, 3).map(event => `
                            <div class="calendar-event" style="background: ${event.color || 'var(--color-accent)'};" title="${event.title}">
                                ${event.title}
                            </div>
                        `).join('')}
                        ${dayEvents.length > 3 ? `<div class="calendar-event-more">+${dayEvents.length - 3} more</div>` : ''}
                    </div>
                </div>
            `;
        }

        // Next month days
        const remainingDays = 42 - (firstDay + daysInMonth);
        for (let day = 1; day <= remainingDays; day++) {
            html += `<div class="calendar-day other-month"><span>${day}</span></div>`;
        }

        html += '</div>';
        container.innerHTML = html;
    }

    async renderWeekView(container) {
        const startOfWeek = DateUtils.startOfWeek(this.currentDate);
        const weekDays = DateUtils.getWeekDays(startOfWeek);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let html = '<div class="calendar-week-view">';
        
        for (const day of weekDays) {
            const date = new Date(day);
            const isToday = date.getTime() === today.getTime();
            const dayEvents = this.events.filter(event => {
                const eventDate = new Date(event.date);
                return DateUtils.isSameDay(eventDate, day);
            });

            html += `
                <div class="calendar-week-day ${isToday ? 'today' : ''}">
                    <div class="calendar-week-day-header">
                        <div class="calendar-week-day-name">${DateUtils.getDayName(date.getDay(), true)}</div>
                        <div class="calendar-week-day-number">${date.getDate()}</div>
                    </div>
                    <div class="calendar-week-day-events">
                        ${dayEvents.map(event => `
                            <div class="calendar-week-event" style="border-left: 3px solid ${event.color || 'var(--color-accent)'};" onclick="calendarPage.editEvent('${event.id}')">
                                <div class="calendar-week-event-title">${event.title}</div>
                                ${event.time ? `<div class="calendar-week-event-time">${event.time}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        html += '</div>';
        container.innerHTML = html;
    }

    async createEvent() {
        const content = `
            <form id="event-form" onsubmit="event.preventDefault(); calendarPage.saveEvent();">
                <div class="form-group">
                    <label class="form-label form-label-required">Event Title</label>
                    <input type="text" class="form-input" id="event-title" placeholder="Enter event title..." required>
                </div>
                <div class="form-group">
                    <label class="form-label">Date</label>
                    <input type="date" class="form-input" id="event-date">
                </div>
                <div class="form-group">
                    <label class="form-label">Time</label>
                    <input type="time" class="form-input" id="event-time">
                </div>
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-textarea" id="event-description" rows="3" placeholder="Add a description..."></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Color</label>
                    <div class="color-picker">
                        <div class="color-picker-item selected" style="background: #8B7355;" onclick="calendarPage.selectColor(this, '#8B7355')"></div>
                        <div class="color-picker-item" style="background: #5B8C9F;" onclick="calendarPage.selectColor(this, '#5B8C9F')"></div>
                        <div class="color-picker-item" style="background: #5B8C5A;" onclick="calendarPage.selectColor(this, '#5B8C5A')"></div>
                        <div class="color-picker-item" style="background: #C47A4A;" onclick="calendarPage.selectColor(this, '#C47A4A')"></div>
                        <div class="color-picker-item" style="background: #8B6B9F;" onclick="calendarPage.selectColor(this, '#8B6B9F')"></div>
                        <div class="color-picker-item" style="background: #C75050;" onclick="calendarPage.selectColor(this, '#C75050')"></div>
                    </div>
                </div>
            </form>
        `;

        modal.open({
            title: 'Add Event',
            content,
            size: 'md',
            footer: `
                <button class="btn btn-secondary" onclick="modal.close()">Cancel</button>
                <button class="btn btn-primary" onclick="calendarPage.saveEvent()">Save Event</button>
            `,
            onOpen: () => {
                const dateInput = document.getElementById('event-date');
                if (dateInput) {
                    dateInput.value = new Date().toISOString().split('T')[0];
                }
            }
        });
    }

    async saveEvent(eventId = null) {
        const title = document.getElementById('event-title')?.value;
        if (!title) {
            toast.error('Error', 'Please enter an event title');
            return;
        }

        const date = document.getElementById('event-date')?.value;
        const time = document.getElementById('event-time')?.value;
        const description = document.getElementById('event-description')?.value || '';
        const colorEl = document.querySelector('.color-picker-item.selected');
        const color = colorEl?.style.background || '#8B7355';

        const event = {
            id: eventId || Helpers.generateId(),
            title,
            date: date ? new Date(date).getTime() : Date.now(),
            time,
            description,
            color,
            createdAt: eventId ? undefined : Date.now(),
            updatedAt: Date.now()
        };

        await db.saveEvent(event);
        toast.success('Event saved', 'Your event has been created');
        modal.close();
        await this.loadEvents();
        await this.render();
    }

    async editEvent(eventId) {
        const event = await db.getEvent(eventId);
        if (!event) return;

        const eventDate = event.date ? new Date(event.date) : null;
        const dateStr = eventDate ? eventDate.toISOString().split('T')[0] : '';

        const content = `
            <form id="event-form" onsubmit="event.preventDefault(); calendarPage.saveEvent('${eventId}');">
                <div class="form-group">
                    <label class="form-label form-label-required">Event Title</label>
                    <input type="text" class="form-input" id="event-title" value="${event.title || ''}" placeholder="Enter event title..." required>
                </div>
                <div class="form-group">
                    <label class="form-label">Date</label>
                    <input type="date" class="form-input" id="event-date" value="${dateStr}">
                </div>
                <div class="form-group">
                    <label class="form-label">Time</label>
                    <input type="time" class="form-input" id="event-time" value="${event.time || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-textarea" id="event-description" rows="3" placeholder="Add a description...">${event.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Color</label>
                    <div class="color-picker">
                        ${['#8B7355', '#5B8C9F', '#5B8C5A', '#C47A4A', '#8B6B9F', '#C75050'].map(color => `
                            <div class="color-picker-item ${event.color === color ? 'selected' : ''}" 
                                 style="background: ${color};" 
                                 onclick="calendarPage.selectColor(this, '${color}')"></div>
                        `).join('')}
                    </div>
                </div>
            </form>
        `;

        modal.open({
            title: 'Edit Event',
            content,
            size: 'md',
            footer: `
                <button class="btn btn-secondary" onclick="modal.close()">Cancel</button>
                <button class="btn btn-primary" onclick="calendarPage.saveEvent('${eventId}')">Save Changes</button>
            `
        });
    }

    selectColor(element, color) {
        document.querySelectorAll('.color-picker-item').forEach(item => {
            item.classList.remove('selected');
        });
        element.classList.add('selected');
    }

    async deleteEvent(eventId) {
        if (!confirm('Are you sure you want to delete this event?')) return;

        await db.deleteEvent(eventId);
        await this.loadEvents();
        await this.render();
        toast.success('Event deleted', 'The event has been removed');
    }
}

// Make it globally accessible
window.calendarPage = new CalendarPage();