// Task Manager Class
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.taskIdCounter = this.getNextId();
        this.initializeEventListeners();
        this.renderTasks();
    }

    // Load tasks from localStorage
    loadTasks() {
        try {
            const tasksJson = localStorage.getItem('tasks');
            return tasksJson ? JSON.parse(tasksJson) : [];
        } catch (e) {
            console.error("Failed to load tasks", e);
            return [];
        }
    }

    // Save tasks to localStorage
    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
        this.renderTasks();
    }

    // Get next available ID
    getNextId() {
        if (this.tasks.length === 0) return 1;
        return Math.max(...this.tasks.map(task => task.id)) + 1;
    }

    // Add a new task
    addTask(description) {
        if (!description.trim()) return;

        const task = {
            id: this.taskIdCounter++,
            description: description.trim(),
            completed: false,
            createdAt: new Date().toISOString(),
            isNew: true // Flag for animation
        };

        this.tasks.unshift(task); // Add to top
        this.saveTasks();
        
        // Remove 'isNew' flag after animation
        setTimeout(() => {
            const t = this.tasks.find(x => x.id === task.id);
            if(t) t.isNew = false;
            this.saveTasksWithoutRender(); // Save state without re-rendering to avoid jump
        }, 500);
    }

    // Save without re-rendering (helper)
    saveTasksWithoutRender() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    // Toggle task completion
    toggleComplete(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
        }
    }

    // Delete a task
    deleteTask(taskId) {
        const taskElement = document.querySelector(`li[data-id="${taskId}"]`);
        if (taskElement) {
            // Add deletion animation class
            taskElement.classList.add('deleting');
            
            // Wait for animation to finish before removing from state
            setTimeout(() => {
                this.tasks = this.tasks.filter(t => t.id !== taskId);
                this.saveTasks();
            }, 400); 
        } else {
            // Fallback if element not found
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
        }
    }

    // Render all tasks to the UI
    renderTasks() {
        const taskListElement = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');
        const taskCountElement = document.getElementById('taskCount');

        // Update count
        const activeCount = this.tasks.filter(t => !t.completed).length;
        const totalCount = this.tasks.length;
        taskCountElement.textContent = `${activeCount} active / ${totalCount} total`;

        // Handle empty state
        if (this.tasks.length === 0) {
            taskListElement.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        taskListElement.innerHTML = '';

        this.tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''} ${task.isNew ? 'new-task' : ''}`;
            li.dataset.id = task.id;

            li.innerHTML = `
                <div class="task-content">
                    <button class="check-btn" aria-label="Toggle Completion">
                        ${task.completed ? '<i class="fa-solid fa-check"></i>' : ''}
                    </button>
                    <span class="task-text">${this.escapeHtml(task.description)}</span>
                </div>
                <button class="delete-btn" aria-label="Delete Task">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;

            // Add Event Listeners directly to elements
            const checkBtn = li.querySelector('.check-btn');
            checkBtn.addEventListener('click', () => this.toggleComplete(task.id));

            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

            taskListElement.appendChild(li);
        });
    }

    // Helper to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initialize event listeners
    initializeEventListeners() {
        const addTaskBtn = document.getElementById('addTaskBtn');
        const taskInput = document.getElementById('taskInput');

        const handleAdd = () => {
            this.addTask(taskInput.value);
            taskInput.value = '';
            taskInput.focus();
        };

        addTaskBtn.addEventListener('click', handleAdd);

        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleAdd();
            }
        });
    }
}

// Initialize the Task Manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});
