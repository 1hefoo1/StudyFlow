// Tasks Page
import { DateUtils } from '../utils/date.js';
import { db } from '../database.js';
import { Helpers } from '../utils/helpers.js';

export class TasksPage {
    constructor() {
        this.container = null;
        this.tasks = [];
        this.filter = 'all'; // all, pending, completed, today, upcoming
    }

    render() {
        this.container = document.createElement('div');
        this.container.className = 'tasks-page';
        this.container.innerHTML = `
            <div class="page-header">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--spacing-md);">
                    <div>
                        <h1 class="page-title">Tasks</h1>
                        <p class="page-subtitle">Manage your daily tasks and stay organized</p>
                    </div>
                    <button class="btn btn-primary" onclick="tasksPage.createTask()">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10 4v12M4 10h12"/>
                        </svg>
                        <span>New Task</span>
                    </button>
                </div>
            </div>
            
            <div class="tasks-layout">
                <div class="tasks-filters" style="margin-bottom: var(--spacing-lg);">
                    <div class="tabs">
                        <div class="tab ${this.filter === 'all' ? 'active' : ''}" onclick="tasksPage.setFilter('all')">All</div>
                        <div class="tab ${this.filter === 'pending' ? 'active' : ''}" onclick="tasksPage.setFilter('pending')">Pending</div>
                        <div class="tab ${this.filter === 'completed' ? 'active' : ''}" onclick="tasksPage.setFilter('completed')">Completed</div>
                        <div class="tab ${this.filter === 'today' ? 'active' : ''}" onclick="tasksPage.setFilter('today')">Today</div>
                        <div class="tab ${this.filter === 'upcoming' ? 'active' : ''}" onclick="tasksPage.setFilter('upcoming')">Upcoming</div>
                    </div>
                </div>
                
                <div class="tasks-list" id="tasks-list">
                    <!-- Tasks will be rendered here -->
                </div>
                
                <div class="empty-state" id="tasks-empty" style="display: none;">
                    <div class="empty-state-icon">✅</div>
                    <div class="empty-state-title">No tasks found</div>
                    <div class="empty-state-description">Create a new task to get started</div>
                    <button class="btn btn-primary" onclick="tasksPage.createTask()">Create Task</button>
                </div>
            </div>
        `;
        
        return this.container;
    }

    async init() {
        // Update global reference so onclick handlers use this instance
        window.tasksPage = this;
        
        await this.loadTasks();
    }

    getTitle() {
        return 'Tasks';
    }

    setFilter(filter) {
        this.filter = filter;
        this.loadTasks();
        
        // Update active tab
        const tabs = this.container.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.textContent.toLowerCase() === filter) {
                tab.classList.add('active');
            }
        });
    }

    async loadTasks() {
        this.tasks = await db.getTasks();
        await this.renderTasks();
    }

    async renderTasks() {
        const container = document.getElementById('tasks-list');
        const emptyState = document.getElementById('tasks-empty');
        if (!container) return;

        let filteredTasks = this.tasks;

        // Apply filter
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStart = today.getTime();
        const todayEnd = todayStart + (24 * 60 * 60 * 1000) - 1;

        switch (this.filter) {
            case 'pending':
                filteredTasks = filteredTasks.filter(t => !t.completed);
                break;
            case 'completed':
                filteredTasks = filteredTasks.filter(t => t.completed);
                break;
            case 'today':
                filteredTasks = filteredTasks.filter(t => {
                    const dueDate = t.dueDate;
                    return dueDate >= todayStart && dueDate <= todayEnd;
                });
                break;
            case 'upcoming':
                const nextWeek = todayStart + (7 * 24 * 60 * 60 * 1000);
                filteredTasks = filteredTasks.filter(t => {
                    const dueDate = t.dueDate;
                    return !t.completed && dueDate >= todayStart && dueDate <= nextWeek;
                });
                break;
        }

        // Sort by due date and priority
        filteredTasks.sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            const priorityDiff = (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
            if (priorityDiff !== 0) return priorityDiff;
            return (a.dueDate || 0) - (b.dueDate || 0);
        });

        if (filteredTasks.length === 0) {
            container.style.display = 'none';
            if (emptyState) emptyState.style.display = 'flex';
            return;
        }

        container.style.display = 'block';
        if (emptyState) emptyState.style.display = 'none';

        container.innerHTML = `
            <div class="list">
                ${filteredTasks.map(task => `
                    <div class="list-item ${task.completed ? 'completed' : ''}" style="${task.completed ? 'opacity: 0.7;' : ''}">
                        <div class="today-task-checkbox ${task.completed ? 'checked' : ''}" 
                             onclick="tasksPage.toggleTask('${task.id}', ${!task.completed})"
                             style="cursor: pointer;">
                            ${task.completed ? `
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M2 6l3 3 5-5"/>
                                </svg>
                            ` : ''}
                        </div>
                        <div class="list-item-content" onclick="tasksPage.editTask('${task.id}')">
                            <div class="list-item-title">${task.title}</div>
                            ${task.description ? `<div class="list-item-description">${task.description.substring(0, 100)}</div>` : ''}
                            <div class="list-item-meta" style="margin-top: var(--spacing-sm);">
                                ${task.priority ? `<span class="today-task-priority priority-${task.priority}">${task.priority}</span>` : ''}
                                ${task.dueDate ? `<span>📅 ${DateUtils.format(task.dueDate, 'medium')}</span>` : ''}
                                ${task.recurring ? `<span>🔄 ${task.recurring}</span>` : ''}
                            </div>
                        </div>
                        <div class="list-item-actions" style="opacity: 1;">
                            <button class="btn btn-sm btn-ghost" onclick="event.stopPropagation(); tasksPage.editTask('${task.id}')">Edit</button>
                            <button class="btn btn-sm btn-ghost" onclick="event.stopPropagation(); tasksPage.deleteTask('${task.id}')">Delete</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async createTask() {
        const content = `
            <form id="task-form" onsubmit="event.preventDefault(); tasksPage.saveTask();">
                <div class="form-group">
                    <label class="form-label form-label-required">Title</label>
                    <input type="text" class="form-input" id="task-title" placeholder="Enter task title..." required>
                </div>
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-textarea" id="task-description" rows="3" placeholder="Add a description..."></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Due Date</label>
                    <input type="datetime-local" class="form-input" id="task-due-date">
                </div>
                <div class="form-group">
                    <label class="form-label">Priority</label>
                    <select class="form-select" id="task-priority">
                        <option value="low">Low</option>
                        <option value="medium" selected>Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Recurring</label>
                    <select class="form-select" id="task-recurring">
                        <option value="">None</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>
            </form>
        `;

        modal.open({
            title: 'Create Task',
            content,
            size: 'md',
            footer: `
                <button class="btn btn-secondary" onclick="modal.close()">Cancel</button>
                <button class="btn btn-primary" onclick="tasksPage.saveTask()">Create Task</button>
            `,
            onOpen: () => {
                // Set default due date to today
                const dueDateInput = document.getElementById('task-due-date');
                if (dueDateInput) {
                    const now = new Date();
                    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                    dueDateInput.value = now.toISOString().slice(0, 16);
                }
            }
        });
    }

    async saveTask(taskId = null) {
        const title = document.getElementById('task-title')?.value;
        if (!title) {
            toast.error('Error', 'Please enter a task title');
            return;
        }

        const description = document.getElementById('task-description')?.value || '';
        const dueDateInput = document.getElementById('task-due-date')?.value;
        const dueDate = dueDateInput ? new Date(dueDateInput).getTime() : null;
        const priority = document.getElementById('task-priority')?.value || 'medium';
        const recurring = document.getElementById('task-recurring')?.value || '';

        const task = {
            id: taskId || Helpers.generateId(),
            title,
            description,
            dueDate,
            priority,
            recurring,
            completed: false,
            completedAt: null,
            createdAt: taskId ? undefined : Date.now(),
            updatedAt: Date.now()
        };

        await db.saveTask(task);
        toast.success('Task saved', taskId ? 'Task has been updated' : 'New task has been created');
        modal.close();
        await this.loadTasks();
    }

    async editTask(taskId) {
        const task = await db.getTask(taskId);
        if (!task) return;

        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        const dueDateStr = dueDate ? new Date(dueDate.getTime() - (dueDate.getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : '';

        const content = `
            <form id="task-form" onsubmit="event.preventDefault(); tasksPage.saveTask('${taskId}');">
                <div class="form-group">
                    <label class="form-label form-label-required">Title</label>
                    <input type="text" class="form-input" id="task-title" value="${task.title || ''}" placeholder="Enter task title..." required>
                </div>
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-textarea" id="task-description" rows="3" placeholder="Add a description...">${task.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Due Date</label>
                    <input type="datetime-local" class="form-input" id="task-due-date" value="${dueDateStr}">
                </div>
                <div class="form-group">
                    <label class="form-label">Priority</label>
                    <select class="form-select" id="task-priority">
                        <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
                        <option value="medium" ${task.priority === 'medium' || !task.priority ? 'selected' : ''}>Medium</option>
                        <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Recurring</label>
                    <select class="form-select" id="task-recurring">
                        <option value="" ${!task.recurring ? 'selected' : ''}>None</option>
                        <option value="daily" ${task.recurring === 'daily' ? 'selected' : ''}>Daily</option>
                        <option value="weekly" ${task.recurring === 'weekly' ? 'selected' : ''}>Weekly</option>
                        <option value="monthly" ${task.recurring === 'monthly' ? 'selected' : ''}>Monthly</option>
                    </select>
                </div>
            </form>
        `;

        modal.open({
            title: 'Edit Task',
            content,
            size: 'md',
            footer: `
                <button class="btn btn-secondary" onclick="modal.close()">Cancel</button>
                <button class="btn btn-primary" onclick="tasksPage.saveTask('${taskId}')">Save Changes</button>
            `
        });
    }

    async toggleTask(taskId, completed) {
        await db.toggleTask(taskId, completed);
        await this.loadTasks();
        
        if (completed) {
            toast.success('Task completed', 'Great job! Keep it up!');
        }
    }

    async deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) return;

        await db.deleteTask(taskId);
        await this.loadTasks();
        toast.success('Task deleted', 'The task has been removed');
    }
}

// Make it globally accessible for onclick handlers
window.tasksPage = new TasksPage();