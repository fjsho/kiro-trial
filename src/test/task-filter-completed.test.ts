import { describe, it, expect, beforeEach } from 'vitest';
import { TaskService } from '../services/TaskService';
import { LocalStorageTaskRepository } from '../repositories/LocalStorageTaskRepository';
import { UIController } from '../controllers/UIController';

describe('Task Filter Completed - Integration Test', () => {
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

  it('should show only completed tasks when completed filter is selected', async () => {
    // Add some tasks with mixed completion status
    void (await taskService.addTask('Active Task 1'));
    const task2 = await taskService.addTask('Completed Task 1');
    void (await taskService.addTask('Active Task 2'));
    const task4 = await taskService.addTask('Completed Task 2');

    // Complete some tasks
    await taskService.toggleTask(task2.id);
    await taskService.toggleTask(task4.id);

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

    // Verify we have 4 tasks total
    const taskItems = container.querySelectorAll('#task-list li');
    expect(taskItems).toHaveLength(4);

    // Use UIController's handleFilterChange method
    await uiController.handleFilterChange('completed');

    // Verify only completed tasks are shown
    const filteredTaskItems = container.querySelectorAll('#task-list li');
    expect(filteredTaskItems).toHaveLength(2);

    // Verify the correct tasks are shown
    const taskTexts = Array.from(filteredTaskItems).map(
      item => item.querySelector('.task-text')?.textContent
    );
    expect(taskTexts).toContain('Completed Task 1');
    expect(taskTexts).toContain('Completed Task 2');
    expect(taskTexts).not.toContain('Active Task 1');
    expect(taskTexts).not.toContain('Active Task 2');

    // Verify completed filter button has active class
    const completedFilterBtn = container.querySelector(
      '#filter-completed'
    ) as HTMLButtonElement;
    expect(completedFilterBtn.classList.contains('active')).toBe(true);
    expect(
      container.querySelector('#filter-all')?.classList.contains('active')
    ).toBe(false);
    expect(
      container.querySelector('#filter-active')?.classList.contains('active')
    ).toBe(false);
  });

  it('should show empty list when no completed tasks exist', async () => {
    // Add tasks but don't complete any of them
    await taskService.addTask('Active Task 1');
    await taskService.addTask('Active Task 2');

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
    await uiController.handleFilterChange('completed');

    // Verify no tasks are shown
    const filteredTaskItems = container.querySelectorAll('#task-list li');
    expect(filteredTaskItems).toHaveLength(0);
  });

  it('should maintain completed filter state when tasks are toggled', async () => {
    // Add a task and complete it
    const task1 = await taskService.addTask('Task to be completed');
    await taskService.toggleTask(task1.id);

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

    // Apply completed filter
    await uiController.handleFilterChange('completed');

    // Verify the completed task is shown
    let filteredTaskItems = container.querySelectorAll('#task-list li');
    expect(filteredTaskItems).toHaveLength(1);

    // Toggle the task back to active (uncomplete it)
    await taskService.toggleTask(task1.id);

    // Refresh the filter view
    await uiController.handleFilterChange('completed');

    // Verify no tasks are shown now (since the task is no longer completed)
    filteredTaskItems = container.querySelectorAll('#task-list li');
    expect(filteredTaskItems).toHaveLength(0);
  });
});
