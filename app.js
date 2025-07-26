// Todo List Application - Vietnamese
class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.projects = JSON.parse(localStorage.getItem('projects')) || [
            { id: 'personal', name: 'Cá nhân', color: '#4285f4', icon: 'fas fa-user' },
            { id: 'work', name: 'Công việc', color: '#34a853', icon: 'fas fa-briefcase' },
            { id: 'shopping', name: 'Mua sắm', color: '#fbbc04', icon: 'fas fa-shopping-cart' }
        ];
        this.currentFilter = 'all';
        this.currentProject = 'all';
        this.currentSort = 'created';
        this.searchQuery = '';
        this.isDarkTheme = localStorage.getItem('darkTheme') === 'true';
        this.isEditMode = false;
        this.editTodoId = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applyTheme();
        this.renderProjects();
        this.renderTags();
        this.renderTodos();
        this.updateCounts();
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Add todo button
        document.getElementById('add-todo').addEventListener('click', () => {
            this.showAddTodoForm();
        });

        // Cancel todo form
        document.getElementById('cancel-todo').addEventListener('click', () => {
            this.hideAddTodoForm();
        });

        // Todo form submission
        document.getElementById('todo-form').addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.isEditMode) {
                this.updateTodo();
            } else {
                this.addTodo();
            }
        });

        // Project selection
        document.querySelectorAll('.project-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectProject(item.dataset.project);
            });
        });

        // Filter selection
        document.querySelectorAll('.filter-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectFilter(item.dataset.filter);
            });
        });

        // Sort selection
        document.getElementById('sort-select').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderTodos();
        });

        // Search functionality
        const searchInput = document.getElementById('search-input');
        const clearSearch = document.getElementById('clear-search');

        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.renderTodos();
            clearSearch.style.display = this.searchQuery ? 'block' : 'none';
        });

        clearSearch.addEventListener('click', () => {
            searchInput.value = '';
            this.searchQuery = '';
            this.renderTodos();
            clearSearch.style.display = 'none';
        });

        // Add project button
        document.getElementById('add-project').addEventListener('click', () => {
            this.showProjectModal();
        });

        // Project form
        document.getElementById('project-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addProject();
        });

        // Modal close events
        document.querySelectorAll('.close, .modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideModals();
            });
        });

        // Close modal when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModals();
                }
            });
        });
    }

    // Theme Management
    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        this.applyTheme();
        localStorage.setItem('darkTheme', this.isDarkTheme);
    }

    applyTheme() {
        const themeIcon = document.querySelector('#theme-toggle i');
        if (this.isDarkTheme) {
            document.body.setAttribute('data-theme', 'dark');
            themeIcon.className = 'fas fa-sun';
        } else {
            document.body.removeAttribute('data-theme');
            themeIcon.className = 'fas fa-moon';
        }
    }

    // Todo Management
    addTodo() {
        const title = document.getElementById('todo-title').value.trim();
        const description = document.getElementById('todo-description').value.trim();
        const dueDate = document.getElementById('todo-due-date').value;
        const priority = document.getElementById('todo-priority').value;
        const project = document.getElementById('todo-project').value;
        const tagsInput = document.getElementById('todo-tags').value.trim();

        if (!title) return;

        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

        const todo = {
            id: Date.now().toString(),
            title,
            description,
            dueDate,
            priority,
            project,
            tags,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        this.todos.push(todo);
        this.saveTodos();
        this.hideAddTodoForm();
        this.renderTodos();
        this.renderTags();
        this.updateCounts();
    }

    updateTodo() {
        const todo = this.todos.find(t => t.id === this.editTodoId);
        if (!todo) return;

        todo.title = document.getElementById('todo-title').value.trim();
        todo.description = document.getElementById('todo-description').value.trim();
        todo.dueDate = document.getElementById('todo-due-date').value;
        todo.priority = document.getElementById('todo-priority').value;
        todo.project = document.getElementById('todo-project').value;
        
        const tagsInput = document.getElementById('todo-tags').value.trim();
        todo.tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

        this.saveTodos();
        this.hideAddTodoForm();
        this.renderTodos();
        this.renderTags();
        this.updateCounts();
        this.isEditMode = false;
        this.editTodoId = null;
    }

    deleteTodo(id) {
        if (confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
            this.todos = this.todos.filter(todo => todo.id !== id);
            this.saveTodos();
            this.renderTodos();
            this.renderTags();
            this.updateCounts();
        }
    }

    toggleTodoComplete(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            todo.completedAt = todo.completed ? new Date().toISOString() : null;
            this.saveTodos();
            this.renderTodos();
            this.updateCounts();
        }
    }

    editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        this.isEditMode = true;
        this.editTodoId = id;

        // Populate form with todo data
        document.getElementById('todo-title').value = todo.title;
        document.getElementById('todo-description').value = todo.description || '';
        document.getElementById('todo-due-date').value = todo.dueDate || '';
        document.getElementById('todo-priority').value = todo.priority;
        document.getElementById('todo-project').value = todo.project;
        document.getElementById('todo-tags').value = todo.tags.join(', ');

        // Update form button text
        const submitBtn = document.querySelector('#todo-form button[type="submit"]');
        submitBtn.textContent = 'Cập nhật công việc';

        this.showAddTodoForm();
    }

    // Project Management
    addProject() {
        const name = document.getElementById('project-name').value.trim();
        const color = document.getElementById('project-color').value;

        if (!name) return;

        const project = {
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name,
            color,
            icon: 'fas fa-folder'
        };

        this.projects.push(project);
        this.saveProjects();
        this.renderProjects();
        this.updateProjectSelect();
        this.hideModals();
        document.getElementById('project-form').reset();
    }

    // UI Management
    showAddTodoForm() {
        const inputSection = document.getElementById('todo-input-section');
        inputSection.style.display = 'block';
        document.getElementById('todo-title').focus();
    }

    hideAddTodoForm() {
        const inputSection = document.getElementById('todo-input-section');
        inputSection.style.display = 'none';
        document.getElementById('todo-form').reset();
        
        // Reset form state
        this.isEditMode = false;
        this.editTodoId = null;
        const submitBtn = document.querySelector('#todo-form button[type="submit"]');
        submitBtn.textContent = 'Thêm công việc';
    }

    showProjectModal() {
        document.getElementById('project-modal').classList.add('show');
    }

    hideModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }

    // Filtering and Sorting
    selectProject(projectId) {
        this.currentProject = projectId;
        
        document.querySelectorAll('.project-item').forEach(item => {
            item.classList.remove('active');
        });
        
        document.querySelector(`[data-project="${projectId}"]`).classList.add('active');
        
        this.updateViewTitle();
        this.renderTodos();
    }

    selectFilter(filter) {
        this.currentFilter = filter;
        
        document.querySelectorAll('.filter-item').forEach(item => {
            item.classList.remove('active');
        });
        
        if (filter !== 'none') {
            document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        }
        
        this.updateViewTitle();
        this.renderTodos();
    }

    updateViewTitle() {
        const titleEl = document.getElementById('current-view-title');
        
        if (this.currentFilter !== 'none') {
            const filterNames = {
                'today': 'Hôm nay',
                'upcoming': 'Sắp tới',
                'overdue': 'Quá hạn',
                'completed': 'Hoàn thành'
            };
            titleEl.textContent = filterNames[this.currentFilter] || 'Tất cả công việc';
        } else if (this.currentProject !== 'all') {
            const project = this.projects.find(p => p.id === this.currentProject);
            titleEl.textContent = project ? project.name : 'Tất cả công việc';
        } else {
            titleEl.textContent = 'Tất cả công việc';
        }
    }

    getFilteredTodos() {
        let filtered = this.todos;

        // Apply project filter
        if (this.currentProject !== 'all') {
            filtered = filtered.filter(todo => todo.project === this.currentProject);
        }

        // Apply status filter
        if (this.currentFilter === 'today') {
            const today = new Date().toISOString().split('T')[0];
            filtered = filtered.filter(todo => todo.dueDate === today && !todo.completed);
        } else if (this.currentFilter === 'upcoming') {
            const today = new Date().toISOString().split('T')[0];
            filtered = filtered.filter(todo => todo.dueDate > today && !todo.completed);
        } else if (this.currentFilter === 'overdue') {
            const today = new Date().toISOString().split('T')[0];
            filtered = filtered.filter(todo => todo.dueDate && todo.dueDate < today && !todo.completed);
        } else if (this.currentFilter === 'completed') {
            filtered = filtered.filter(todo => todo.completed);
        }

        // Apply search filter
        if (this.searchQuery) {
            filtered = filtered.filter(todo => 
                todo.title.toLowerCase().includes(this.searchQuery) ||
                todo.description.toLowerCase().includes(this.searchQuery) ||
                todo.tags.some(tag => tag.toLowerCase().includes(this.searchQuery))
            );
        }

        return filtered;
    }

    sortTodos(todos) {
        return todos.sort((a, b) => {
            switch (this.currentSort) {
                case 'due':
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                case 'priority':
                    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                case 'name':
                    return a.title.localeCompare(b.title, 'vi');
                case 'created':
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });
    }

    // Rendering
    renderTodos() {
        const todoList = document.getElementById('todo-list');
        const emptyState = document.getElementById('empty-state');
        const filtered = this.getFilteredTodos();
        const sorted = this.sortTodos(filtered);

        if (sorted.length === 0) {
            todoList.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            todoList.style.display = 'block';
            emptyState.style.display = 'none';
            
            todoList.innerHTML = sorted.map(todo => this.createTodoHTML(todo)).join('');
            
            // Add event listeners to new elements
            this.attachTodoEventListeners();
        }

        this.updateTodoCount(sorted.length);
    }

    createTodoHTML(todo) {
        const project = this.projects.find(p => p.id === todo.project);
        const dueDate = todo.dueDate ? new Date(todo.dueDate) : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let dueDateClass = '';
        let dueDateText = '';
        
        if (dueDate) {
            const dueDateTime = new Date(dueDate);
            dueDateTime.setHours(0, 0, 0, 0);
            
            if (dueDateTime < today && !todo.completed) {
                dueDateClass = 'overdue';
                dueDateText = 'Quá hạn';
            } else if (dueDateTime.getTime() === today.getTime()) {
                dueDateClass = 'due-today';
                dueDateText = 'Hôm nay';
            } else {
                dueDateText = this.formatDate(todo.dueDate);
            }
        }

        const priorityLabels = {
            low: 'Thấp',
            medium: 'Trung bình',
            high: 'Cao',
            urgent: 'Khẩn cấp'
        };

        return `
            <div class="todo-item ${todo.completed ? 'completed' : ''} ${dueDateClass}" data-id="${todo.id}">
                <div class="todo-main">
                    <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" onclick="app.toggleTodoComplete('${todo.id}')">
                        ${todo.completed ? '<i class="fas fa-check"></i>' : ''}
                    </div>
                    <div class="todo-content">
                        <div class="todo-title-text">${this.escapeHtml(todo.title)}</div>
                        ${todo.description ? `<div class="todo-description">${this.escapeHtml(todo.description)}</div>` : ''}
                        <div class="todo-meta">
                            ${todo.dueDate ? `<div class="todo-due ${dueDateClass}">
                                <i class="fas fa-calendar"></i>
                                <span>${dueDateText}</span>
                            </div>` : ''}
                            <div class="priority-badge priority-${todo.priority}">
                                ${priorityLabels[todo.priority]}
                            </div>
                            ${project ? `<div class="project-badge">
                                <i class="${project.icon}"></i>
                                <span>${project.name}</span>
                            </div>` : ''}
                            ${todo.tags.length > 0 ? `<div class="todo-tags">
                                ${todo.tags.map(tag => `<span class="tag-badge">#${tag}</span>`).join('')}
                            </div>` : ''}
                        </div>
                    </div>
                </div>
                <div class="todo-actions">
                    <button class="action-btn edit" onclick="app.editTodo('${todo.id}')" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="app.deleteTodo('${todo.id}')" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    attachTodoEventListeners() {
        // Event listeners are handled by onclick attributes in the HTML for simplicity
        // In a production app, you might want to use proper event delegation
    }

    renderProjects() {
        this.updateProjectSelect();
        // Projects in sidebar are rendered in HTML, counts are updated separately
    }

    updateProjectSelect() {
        const projectSelect = document.getElementById('todo-project');
        const currentValue = projectSelect.value;
        
        projectSelect.innerHTML = this.projects
            .filter(p => p.id !== 'all')
            .map(project => `<option value="${project.id}">${project.name}</option>`)
            .join('');
        
        if (currentValue) {
            projectSelect.value = currentValue;
        }
    }

    renderTags() {
        const tagList = document.getElementById('tag-list');
        const allTags = [...new Set(this.todos.flatMap(todo => todo.tags))];
        
        if (allTags.length === 0) {
            tagList.innerHTML = '<div class="tag-item">Chưa có thẻ nào</div>';
            return;
        }
        
        tagList.innerHTML = allTags.map(tag => 
            `<div class="tag-item" onclick="app.filterByTag('${tag}')">#${tag}</div>`
        ).join('');
    }

    filterByTag(tag) {
        const searchInput = document.getElementById('search-input');
        searchInput.value = tag;
        this.searchQuery = tag.toLowerCase();
        this.renderTodos();
        document.getElementById('clear-search').style.display = 'block';
    }

    updateCounts() {
        // All todos
        document.getElementById('all-count').textContent = this.todos.length;
        
        // Project counts
        this.projects.forEach(project => {
            if (project.id !== 'all') {
                const count = this.todos.filter(todo => todo.project === project.id).length;
                const countEl = document.getElementById(`${project.id}-count`);
                if (countEl) {
                    countEl.textContent = count;
                }
            }
        });
    }

    updateTodoCount(count) {
        const countEl = document.getElementById('todo-count');
        countEl.textContent = `${count} công việc`;
    }

    // Utility functions
    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Hôm nay';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Ngày mai';
        } else {
            return date.toLocaleDateString('vi-VN');
        }
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // Data persistence
    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    saveProjects() {
        localStorage.setItem('projects', JSON.stringify(this.projects));
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TodoApp();
});

// Add some sample data for demonstration (only if no existing data)
document.addEventListener('DOMContentLoaded', () => {
    const existingTodos = localStorage.getItem('todos');
    if (!existingTodos) {
        const sampleTodos = [
            {
                id: '1',
                title: 'Hoàn thành báo cáo tháng',
                description: 'Viết báo cáo tổng kết công việc tháng này',
                dueDate: new Date().toISOString().split('T')[0],
                priority: 'high',
                project: 'work',
                tags: ['báo cáo', 'tháng'],
                completed: false,
                createdAt: new Date().toISOString(),
                completedAt: null
            },
            {
                id: '2',
                title: 'Mua sắm cuối tuần',
                description: 'Mua thực phẩm và đồ gia dụng',
                dueDate: '',
                priority: 'medium',
                project: 'shopping',
                tags: ['thực phẩm', 'gia dụng'],
                completed: false,
                createdAt: new Date().toISOString(),
                completedAt: null
            },
            {
                id: '3',
                title: 'Tập thể dục',
                description: 'Chạy bộ 30 phút trong công viên',
                dueDate: '',
                priority: 'low',
                project: 'personal',
                tags: ['sức khỏe', 'thể dục'],
                completed: true,
                createdAt: new Date().toISOString(),
                completedAt: new Date().toISOString()
            }
        ];
        
        localStorage.setItem('todos', JSON.stringify(sampleTodos));
    }
});