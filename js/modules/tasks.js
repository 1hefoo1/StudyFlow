// Tasks Module - Business logic for tasks
export class TasksModule {
    constructor() {
        this.tasks = [];
    }

    async init() {
        await this.loadTasks();
    }

    // Load all tasks
    async loadTasks() {
        this.tasks = await db.getTasks();
    }

    // Get tasks by filter
    getTasks(filter = 'all') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStart = today.getTime();
        const todayEnd = todayStart + (24 * 60 * 60 * 1000) - 1;
        const nextWeek = todayStart + (7 * 24 * 60 * 60 * 1000);

        switch (filter) {
            case 'pending':
                return this.tasks.filter(t => !t.completed);
            case 'completed':
                return this.tasks.filter(t => t.completed);
            case 'today':
                return this.tasks.filter(t => {
                    const dueDate = t.dueDate;
                    return dueDate >= todayStart && dueDate <= todayEnd;
                });
            case 'upcoming':
                return this.tasks.filter(t => {
                    const dueDate = t.dueDate;
                    return !t.completed && dueDate >= todayStart && dueDate <= nextWeek;
                });
            default:
                return this.tasks;
        }
    }

    // Get today's tasks
    getTodayTasks() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return db.getTasksByDate(today.getTime());
    }

    // Get upcoming tasks
    getUpcomingTasks(days = 7) {
        return db.getUpcomingTasks(days);
    }

    // Create task
    async createTask(data = {}) {
        const task = {
            id: Helpers.generateId(),
            title: data.title || '',
            description: data.description || '',
            dueDate: data.dueDate || null,
            priority: data.priority || 'medium',
            recurring: data.recurring || '',
            completed: false,
            completedAt: null,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        await db.saveTask(task);
        await this.loadTasks();
        return task;
    }

    // Update task
    async updateTask(taskId, updates) {
        const task = await db.getTask(taskId);
        if (!task) return null;

        Object.assign(task, updates, { updatedAt: Date.now() });
        await db.saveTask(task);
        await this.loadTasks();
        return task;
    }

    // Delete task
    async deleteTask(taskId) {
        await db.deleteTask(taskId);
        await this.loadTasks();
    }

    // Toggle task completion
    async toggleComplete(taskId, completed = true) {
        const task = await db.getTask(taskId);
        if (task) {
            task.completed = completed;
            task.completedAt = completed ? Date.now() : null;
            task.updatedAt = Date.now();
            await db.saveTask(task);
            await this.loadTasks();
            return task;
        }
        return null;
    }

    // Get pending count
    getPendingCount() {
        return this.tasks.filter(t => !t.completed).length;
    }

    // Get completed count
    getCompletedCount() {
        return this.tasks.filter(t => t.completed).length;
    }

    // Get tasks by priority
    getTasksByPriority(priority) {
        return this.tasks.filter(t => t.priority === priority && !t.completed);
    }

    // Sort tasks
    sortTasks(tasks, sortBy = 'dueDate') {
        return [...tasks].sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            const priorityDiff = (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
            if (priorityDiff !== 0) return priorityDiff;

            switch (sortBy) {
                case 'dueDate':
                    return (a.dueDate || 0) - (b.dueDate || 0);
                case 'createdAt':
                    return (b.createdAt || 0) - (a.createdAt || 0);
                case 'priority':
                    return priorityDiff;
                default:
                    return 0;
            }
        });
    }

    // Get overdue tasks
    getOverdueTasks() {
        const now = Date.now();
        return this.tasks.filter(t => 
            !t.completed && 
            t.dueDate && 
            t.dueDate < now
        );
    }

    // Get task statistics
    getStats() {
        const total = this.tasks.length;
        const completed = this.getCompletedCount();
        const pending = this.getPendingCount();
        const overdue = this.getOverdueTasks().length;
        
        const highPriority = this.getTasksByPriority('high').length;
        const mediumPriority = this.getTasksByPriority('medium').length;
        const lowPriority = this.getTasksByPriority('low').length;

        return {
            total,
            completed,
            pending,
            overdue,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            byPriority: {
                high: highPriority,
                medium: mediumPriority,
                low: lowPriority
            }
        };
    }

    // Export tasks
    async exportTasks() {
        return {
            tasks: this.tasks,
            exportedAt: Date.now()
        };
    }

    // Import tasks
    async importTasks(data) {
        if (data.tasks) {
            for (const task of data.tasks) {
                await db.saveTask(task);
            }
        }
        await this.loadTasks();
    }

    // Clear completed tasks
    async clearCompleted() {
        const completedTasks = this.tasks.filter(t => t.completed);
        for (const task of completedTasks) {
            await db.deleteTask(task.id);
        }
        await this.loadTasks();
    }
}

// Singleton instance
export const tasksModule = new TasksModule();