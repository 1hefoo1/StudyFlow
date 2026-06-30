// Focus Page - Pomodoro Timer
import { DateUtils } from '../utils/date.js';
import { db } from '../database.js';
import { Helpers } from '../utils/helpers.js';

export class FocusPage {
    constructor() {
        this.container = null;
        this.timer = null;
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.isRunning = false;
        this.mode = 'focus'; // focus, shortBreak, longBreak
        this.sessions = 0;
        this.settings = {
            focusDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            sessionsBeforeLongBreak: 4
        };
    }

    render() {
        this.container = document.createElement('div');
        this.container.className = 'focus-page';
        this.container.innerHTML = `
            <div class="page-header">
                <div style="text-align: center; margin-bottom: var(--spacing-xl);">
                    <h1 class="page-title">Focus Mode</h1>
                    <p class="page-subtitle">Stay focused and productive</p>
                </div>
            </div>
            
            <div class="focus-container">
                <div class="focus-timer-card">
                    <div class="focus-mode-tabs" style="display: flex; justify-content: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-xl);">
                        <button class="btn btn-sm ${this.mode === 'focus' ? 'btn-primary' : 'btn-secondary'}" onclick="focusPage.setMode('focus')">Focus</button>
                        <button class="btn btn-sm ${this.mode === 'shortBreak' ? 'btn-primary' : 'btn-secondary'}" onclick="focusPage.setMode('shortBreak')">Short Break</button>
                        <button class="btn btn-sm ${this.mode === 'longBreak' ? 'btn-primary' : 'btn-secondary'}" onclick="focusPage.setMode('longBreak')">Long Break</button>
                    </div>
                    
                    <div class="focus-timer-display">
                        <div class="focus-timer-circle">
                            <svg class="focus-timer-svg" viewBox="0 0 200 200">
                                <circle class="focus-timer-bg" cx="100" cy="100" r="90"/>
                                <circle class="focus-timer-progress" cx="100" cy="100" r="90" style="stroke-dashoffset: 0;"/>
                            </svg>
                            <div class="focus-timer-text">
                                <div class="focus-timer-time" id="timer-display">${this.formatTime(this.timeLeft)}</div>
                                <div class="focus-timer-label" id="timer-label">${this.getModeLabel()}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="focus-controls" style="display: flex; justify-content: center; gap: var(--spacing-md); margin-top: var(--spacing-xl);">
                        <button class="btn btn-primary btn-lg" id="start-btn" onclick="focusPage.toggleTimer()">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="5 3 19 12 5 21 5 3"/>
                            </svg>
                            <span>Start</span>
                        </button>
                        <button class="btn btn-secondary btn-lg" onclick="focusPage.resetTimer()">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                                <path d="M3 3v5h5"/>
                            </svg>
                            <span>Reset</span>
                        </button>
                    </div>
                    
                    <div class="focus-sessions" style="text-align: center; margin-top: var(--spacing-xl);">
                        <div class="focus-sessions-label">Sessions completed</div>
                        <div class="focus-sessions-count" id="sessions-count">${this.sessions}</div>
                    </div>
                </div>
                
                <div class="focus-stats" style="margin-top: var(--spacing-xl);">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-header">
                                <span class="stat-label">Today's Focus</span>
                                <div class="stat-icon">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="10" cy="10" r="7"/>
                                        <path d="M10 6v4l3 3"/>
                                    </svg>
                                </div>
                            </div>
                            <div class="stat-value" id="today-focus">0m</div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-header">
                                <span class="stat-label">Total Sessions</span>
                                <div class="stat-icon">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M10 2l2 5h5l-4 3 1 5-4-3-4 3 1-5-4-3h5z"/>
                                    </svg>
                                </div>
                            </div>
                            <div class="stat-value" id="total-sessions">0</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return this.container;
    }

    async init() {
        // Update global reference so onclick handlers use this instance
        window.focusPage = this;
        
        await this.loadSettings();
        await this.updateStats();
    }

    getTitle() {
        return 'Focus';
    }

    getModeLabel() {
        switch (this.mode) {
            case 'focus': return 'Focus Time';
            case 'shortBreak': return 'Short Break';
            case 'longBreak': return 'Long Break';
            default: return 'Focus Time';
        }
    }

    setMode(mode) {
        this.mode = mode;
        this.resetTimer();
        
        // Update UI
        const tabs = this.container.querySelectorAll('.focus-mode-tabs .btn');
        tabs.forEach(tab => {
            tab.classList.remove('btn-primary');
            tab.classList.add('btn-secondary');
        });
        
        const modeMap = { focus: 0, shortBreak: 1, longBreak: 2 };
        if (tabs[modeMap[mode]]) {
            tabs[modeMap[mode]].classList.remove('btn-secondary');
            tabs[modeMap[mode]].classList.add('btn-primary');
        }
        
        const label = document.getElementById('timer-label');
        if (label) {
            label.textContent = this.getModeLabel();
        }
    }

    toggleTimer() {
        if (this.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        const btn = document.getElementById('start-btn');
        if (btn) {
            btn.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="6" y="4" width="4" height="16"/>
                    <rect x="14" y="4" width="4" height="16"/>
                </svg>
                <span>Pause</span>
            `;
        }
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.completeSession();
            }
        }, 1000);
    }

    pauseTimer() {
        this.isRunning = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        const btn = document.getElementById('start-btn');
        if (btn) {
            btn.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <span>Resume</span>
            `;
        }
    }

    resetTimer() {
        this.pauseTimer();
        
        switch (this.mode) {
            case 'focus':
                this.timeLeft = this.settings.focusDuration * 60;
                break;
            case 'shortBreak':
                this.timeLeft = this.settings.shortBreakDuration * 60;
                break;
            case 'longBreak':
                this.timeLeft = this.settings.longBreakDuration * 60;
                break;
        }
        
        this.updateDisplay();
        
        const btn = document.getElementById('start-btn');
        if (btn) {
            btn.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <span>Start</span>
            `;
        }
    }

    async completeSession() {
        this.pauseTimer();
        
        if (this.mode === 'focus') {
            this.sessions++;
            const duration = this.settings.focusDuration * 60 * 1000;
            await db.incrementStudyTime(duration);
            await db.saveFocusSession({
                duration,
                type: 'focus',
                completedAt: Date.now()
            });
            
            toast.success('Session complete!', `Great work! You've completed ${this.sessions} session${this.sessions > 1 ? 's' : ''} today.`);
            
            // Update sessions display
            const sessionsEl = document.getElementById('sessions-count');
            if (sessionsEl) {
                sessionsEl.textContent = this.sessions;
            }
            
            // Auto-switch to break
            if (this.sessions % this.settings.sessionsBeforeLongBreak === 0) {
                this.setMode('longBreak');
            } else {
                this.setMode('shortBreak');
            }
        } else {
            toast.info('Break over!', 'Ready to focus again?');
            this.setMode('focus');
        }
        
        await this.updateStats();
    }

    updateDisplay() {
        const display = document.getElementById('timer-display');
        if (display) {
            display.textContent = this.formatTime(this.timeLeft);
        }
        
        // Update circular progress
        const progress = this.container.querySelector('.focus-timer-progress');
        if (progress) {
            const totalTime = this.mode === 'focus' ? this.settings.focusDuration * 60 :
                             this.mode === 'shortBreak' ? this.settings.shortBreakDuration * 60 :
                             this.settings.longBreakDuration * 60;
            const percentage = this.timeLeft / totalTime;
            const circumference = 2 * Math.PI * 90;
            const offset = circumference * (1 - percentage);
            progress.style.strokeDasharray = circumference;
            progress.style.strokeDashoffset = offset;
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    async loadSettings() {
        const settings = await db.getSettings();
        if (settings.focusDuration) this.settings.focusDuration = settings.focusDuration;
        if (settings.shortBreakDuration) this.settings.shortBreakDuration = settings.shortBreakDuration;
        if (settings.longBreakDuration) this.settings.longBreakDuration = settings.longBreakDuration;
        if (settings.sessionsBeforeLongBreak) this.settings.sessionsBeforeLongBreak = settings.sessionsBeforeLongBreak;
    }

    async updateStats() {
        const todayFocus = await db.getTodayFocusTime();
        const stats = await db.getStudyStats();
        
        const todayFocusEl = document.getElementById('today-focus');
        const totalSessionsEl = document.getElementById('total-sessions');
        
        if (todayFocusEl) {
            const minutes = Math.floor(todayFocus / (1000 * 60));
            todayFocusEl.textContent = `${minutes}m`;
        }
        
        if (totalSessionsEl) {
            totalSessionsEl.textContent = stats.sessionsCompleted || 0;
        }
    }
}

// Make it globally accessible
window.focusPage = new FocusPage();