import { describe, it, expect, beforeEach } from 'vitest';
import { TaskService } from '../services/TaskService';
import { LocalStorageTaskRepository } from '../repositories/LocalStorageTaskRepository';
import { UIController } from '../controllers/UIController';

describe('Task Filter Active - Integration Test', () => {
  let taskService: TaskService;
  let uiController: UIController;
  let container: HTMLElement;

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();

    // Setup DOM
    document.body.innerHTML = `
      <div id="app">
        <form id="add-task-form">
          <input id="new-task-input" type="text" placeholder="新しいタスクを入力">
          <button type="submit">追加</button>
        </form>
        <div id="filter-buttons">
          <button id="filter-all" class="filter-btn active" data-filter="all">すべて</button>
          <button id="filter-active" class="filter-btn" data-filter="active">未完了</button>
          <button id="filter-completed" class="filter-btn" data-filter="completed">完了済み</button>
        </div>
        <ul id="task-list"></ul>
        <div id="stats-text">0 個中 0 個完了</div>
        <div id="empty-state" style="display: none;">タスクがありません</div>
        <div id="error-message" style="display: none;"></div>
      </div>
    `;

    container = document.getElementById('app')!;
    const repository = new LocalStorageTaskRepository();
    taskService = new TaskService(repository);
    uiController = new UIController();
  });

  it('should show only active tasks when active filter is selected', async () => {
    // Add some tasks with mixed completion status
    void (await taskService.addTask('Active Task 1'));
    const task2 = await taskService.addTask('Completed Task');
    void (await taskService.addTask('Active Task 2'));

    // Complete one task
    await taskService.toggleTask(task2.id);

    // Load all tasks initially (simulate what UIController does)
    const allTasks = await taskService.getTasks();
    // Manually render tasks since we're testing integration
    const taskList = container.querySelector('#task-list')!;
    taskList.innerHTML = '';
    allTasks.forEach(task => {
      const taskElement = document.createElement('li');
      taskElement.className = task.completed
        ? 'task-item completed'
        : 'task-item';
      taskElement.setAttribute('data-task-id', task.id);
      taskElement.innerHTML = `
        <div class="task-content">
          <input type="checkbox" class="task-checkbox" ${
            task.completed ? 'checked' : ''
          } />
          <span class="task-text">${task.text}</span>
          <button class="delete-btn" data-task-id="${task.id}">×</button>
        </div>
      `;
      taskList.appendChild(taskElement);
    });

    // Verify we have 3 tasks total
    const taskItems = container.querySelectorAll('#task-list li');
    expect(taskItems).toHaveLength(3);

    // Use UIController's handleFilterChange method
    await uiController.handleFilterChange('active');

    // Verify only active tasks are shown
    const filteredTaskItems = container.querySelectorAll('#task-list li');
    expect(filteredTaskItems).toHaveLength(2);

    // Verify the correct tasks are shown
    const taskTexts = Array.from(filteredTaskItems).map(
      item => item.querySelector('.task-text')?.textContent
    );
    expect(taskTexts).toContain('Active Task 1');
    expect(taskTexts).toContain('Active Task 2');
    expect(taskTexts).not.toContain('Completed Task');

    // Verify active filter button has active class
    const activeFilterBtn = container.querySelector(
      '#filter-active'
    ) as HTMLButtonElement;
    expect(activeFilterBtn.classList.contains('active')).toBe(true);
    expect(
      container.querySelector('#filter-all')?.classList.contains('active')
    ).toBe(false);
    expect(
      container.querySelector('#filter-completed')?.classList.contains('active')
    ).toBe(false);
  });

  it('should show empty list when no active tasks exist', async () => {
    // Add tasks and complete all of them
    const task1 = await taskService.addTask('Task 1');
    const task2 = await taskService.addTask('Task 2');

    await taskService.toggleTask(task1.id);
    await taskService.toggleTask(task2.id);

    // Load all tasks initially
    const allTasks = await taskService.getTasks();
    const taskList = container.querySelector('#task-list')!;
    taskList.innerHTML = '';
    allTasks.forEach(task => {
      const taskElement = document.createElement('li');
      taskElement.className = task.completed
        ? 'task-item completed'
        : 'task-item';
      taskElement.setAttribute('data-task-id', task.id);
      taskElement.innerHTML = `
        <div class="task-content">
          <input type="checkbox" class="task-checkbox" ${
            task.completed ? 'checked' : ''
          } />
          <span class="task-text">${task.text}</span>
          <button class="delete-btn" data-task-id="${task.id}">×</button>
        </div>
      `;
      taskList.appendChild(taskElement);
    });

    // Use UIController's handleFilterChange method
    await uiController.handleFilterChange('active');

    // Verify no tasks are shown
    const filteredTaskItems = container.querySelectorAll('#task-list li');
    expect(filteredTaskItems).toHaveLength(0);
  });
});
