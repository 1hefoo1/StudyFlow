// Date Utilities
export class DateUtils {
    // Format date
    static format(date, format = 'medium') {
        const d = new Date(date);
        
        switch (format) {
            case 'short':
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            case 'medium':
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            case 'long':
                return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
            case 'time':
                return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            case 'datetime':
                return `${this.format(date, 'medium')} ${this.format(date, 'time')}`;
            case 'relative':
                return this.getRelativeTime(date);
            default:
                return d.toLocaleDateString();
        }
    }

    // Get relative time (e.g., "2 hours ago", "in 3 days")
    static getRelativeTime(date) {
        const now = Date.now();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        if (seconds < 60) return 'just now';
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
        return `${years} year${years > 1 ? 's' : ''} ago`;
    }

    // Get future relative time
    static getFutureRelativeTime(date) {
        const now = Date.now();
        const diff = date - now;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        if (seconds < 0) return 'overdue';
        if (seconds < 60) return 'in less than a minute';
        if (minutes < 60) return `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
        if (hours < 24) return `in ${hours} hour${hours > 1 ? 's' : ''}`;
        if (days < 7) return `in ${days} day${days > 1 ? 's' : ''}`;
        if (weeks < 4) return `in ${weeks} week${weeks > 1 ? 's' : ''}`;
        if (months < 12) return `in ${months} month${months > 1 ? 's' : ''}`;
        return `in ${years} year${years > 1 ? 's' : ''}`;
    }

    // Get start of day
    static startOfDay(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    }

    // Get end of day
    static endOfDay(date) {
        const d = new Date(date);
        d.setHours(23, 59, 59, 999);
        return d.getTime();
    }

    // Get start of week
    static startOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    }

    // Get end of week
    static endOfWeek(date) {
        const d = new Date(this.startOfWeek(date));
        d.setDate(d.getDate() + 6);
        d.setHours(23, 59, 59, 999);
        return d.getTime();
    }

    // Get start of month
    static startOfMonth(date) {
        const d = new Date(date);
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    }

    // Get end of month
    static endOfMonth(date) {
        const d = new Date(date);
        d.setMonth(d.getMonth() + 1);
        d.setDate(0);
        d.setHours(23, 59, 59, 999);
        return d.getTime();
    }

    // Get days in month
    static getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    // Get month name
    static getMonthName(month, short = false) {
        const date = new Date(2000, month, 1);
        return short 
            ? date.toLocaleDateString('en-US', { month: 'short' })
            : date.toLocaleDateString('en-US', { month: 'long' });
    }

    // Get day name
    static getDayName(day, short = false) {
        const date = new Date(2000, 0, day + 3); // Adjust for Monday start
        return short
            ? date.toLocaleDateString('en-US', { weekday: 'short' })
            : date.toLocaleDateString('en-US', { weekday: 'long' });
    }

    // Check if same day
    static isSameDay(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    }

    // Check if today
    static isToday(date) {
        return this.isSameDay(date, Date.now());
    }

    // Check if tomorrow
    static isTomorrow(date) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return this.isSameDay(date, tomorrow);
    }

    // Check if yesterday
    static isYesterday(date) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return this.isSameDay(date, yesterday);
    }

    // Check if weekend
    static isWeekend(date) {
        const d = new Date(date);
        const day = d.getDay();
        return day === 0 || day === 6;
    }

    // Add days
    static addDays(date, days) {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        return d.getTime();
    }

    // Add weeks
    static addWeeks(date, weeks) {
        return this.addDays(date, weeks * 7);
    }

    // Add months
    static addMonths(date, months) {
        const d = new Date(date);
        d.setMonth(d.getMonth() + months);
        return d.getTime();
    }

    // Get week number
    static getWeekNumber(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
        const week1 = new Date(d.getFullYear(), 0, 4);
        return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    }

    // Get quarter
    static getQuarter(date) {
        const d = new Date(date);
        return Math.floor(d.getMonth() / 3) + 1;
    }

    // Format duration (ms to human readable)
    static formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    // Format timer (MM:SS)
    static formatTimer(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Parse date string
    static parse(dateString) {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date.getTime();
    }

    // Get age
    static getAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }

    // Generate calendar grid for month
    static getCalendarGrid(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay() - 1; // Monday = 0
        
        const grid = [];
        
        // Previous month days
        const prevMonth = new Date(year, month, 0);
        const daysInPrevMonth = prevMonth.getDate();
        for (let i = startingDay - 1; i >= 0; i--) {
            grid.push({
                date: new Date(year, month - 1, daysInPrevMonth - i).getTime(),
                isCurrentMonth: false
            });
        }
        
        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            grid.push({
                date: new Date(year, month, i).getTime(),
                isCurrentMonth: true
            });
        }
        
        // Next month days
        const remainingDays = 42 - grid.length; // 6 rows × 7 days
        for (let i = 1; i <= remainingDays; i++) {
            grid.push({
                date: new Date(year, month + 1, i).getTime(),
                isCurrentMonth: false
            });
        }
        
        return grid;
    }

    // Get week days
    static getWeekDays(date) {
        const start = this.startOfWeek(date);
        const days = [];
        
        for (let i = 0; i < 7; i++) {
            days.push(this.addDays(start, i));
        }
        
        return days;
    }

    // Check if date is in range
    static isInRange(date, start, end) {
        const d = new Date(date).getTime();
        const s = new Date(start).getTime();
        const e = new Date(end).getTime();
        return d >= s && d <= e;
    }

    // Get next occurrence of a weekday
    static getNextWeekday(weekday) {
        const today = new Date();
        const result = new Date(today);
        result.setDate(today.getDate() + (weekday - today.getDay() + 7) % 7);
        return result.getTime();
    }

    // Format countdown
    static formatCountdown(targetDate) {
        const now = Date.now();
        const diff = targetDate - now;
        
        if (diff < 0) return 'Expired';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    }
}