import { describe, it, expect, beforeEach } from 'vitest';
import { UIController } from '../controllers/UIController';
import { TaskService } from '../services/TaskService';
import { LocalStorageTaskRepository } from '../repositories/LocalStorageTaskRepository';

describe('Task Edit Persistence Integration Test', () => {
  let _uiController: UIController;
  let taskService: TaskService;
  let repository: LocalStorageTaskRepository;

  const setupDOM = () => {
    document.body.innerHTML = `
      <div id="app">
        <form id="add-task-form">
          <input id="new-task-input" type="text" placeholder="What needs to be done?" />
          <button type="submit">Add</button>
        </form>
        <ul id="task-list"></ul>
        <div id="stats-text">0 個中 0 個完了</div>
        <div id="filter-buttons">
          <button class="filter-btn active" data-filter="all">All</button>
          <button class="filter-btn" data-filter="active">Active</button>
          <button class="filter-btn" data-filter="completed">Completed</button>
        </div>
        <div id="empty-state" style="display: none;">No tasks yet</div>
      </div>
    `;
  };

  const createTaskElement = (
    taskId: string,
    taskText: string
  ): HTMLLIElement => {
    const taskElement = document.createElement('li');
    taskElement.className = 'task-item';
    taskElement.setAttribute('data-task-id', taskId);
    taskElement.innerHTML = `
      <div class="task-content">
        <input type="checkbox" class="task-checkbox" />
        <label class="task-label">
          <span class="task-text">${taskText}</span>
        </label>
        <button type="button" class="delete-btn" data-task-id="${taskId}">×</button>
      </div>
    `;
    return taskElement;
  };

  const waitForAsyncOperations = () =>
    new Promise(resolve => setTimeout(resolve, 0));

  const simulateTaskEdit = async (
    taskElement: HTMLElement,
    newText: string,
    saveMethod: 'enter' | 'blur'
  ) => {
    const taskTextSpan = taskElement.querySelector(
      '.task-text'
    ) as HTMLSpanElement;

    // Simulate double-click to enter edit mode
    const dblClickEvent = new MouseEvent('dblclick', { bubbles: true });
    taskTextSpan.dispatchEvent(dblClickEvent);

    // Get edit input and change text
    const editInput = taskElement.querySelector(
      '.task-edit-input'
    ) as HTMLInputElement;
    expect(editInput).toBeTruthy();
    editInput.value = newText;

    // Save using specified method
    if (saveMethod === 'enter') {
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
      });
      editInput.dispatchEvent(enterEvent);
    } else {
      const blurEvent = new FocusEvent('blur', { bubbles: true });
      editInput.dispatchEvent(blurEvent);
    }

    await waitForAsyncOperations();
  };

  const verifyTaskPersistence = async (
    taskId: string,
    expectedText: string
  ) => {
    // Verify in LocalStorage
    const storedTasks = JSON.parse(
      localStorage.getItem('todoApp_tasks') || '[]'
    );
    expect(storedTasks).toHaveLength(1);
    expect(storedTasks[0].text).toBe(expectedText);
    expect(storedTasks[0].id).toBe(taskId);

    // Verify through TaskService
    const persistedTasks = await taskService.getTasks();
    expect(persistedTasks).toHaveLength(1);
    expect(persistedTasks[0].text).toBe(expectedText);
    expect(persistedTasks[0].id).toBe(taskId);
  };

  beforeEach(() => {
    localStorage.clear();
    setupDOM();
    repository = new LocalStorageTaskRepository();
    taskService = new TaskService(repository);
    _uiController = new UIController();
  });

  it('should persist edited task content to LocalStorage when saving with Enter key', async () => {
    // Add a task first
    await taskService.addTask('Original task text');
    const tasks = await taskService.getTasks();
    const taskId = tasks[0].id;

    // Render the task manually
    const taskElement = createTaskElement(taskId, tasks[0].text);
    document.getElementById('task-list')!.appendChild(taskElement);

    // Simulate edit and save with Enter
    await simulateTaskEdit(taskElement, 'Updated task text', 'enter');

    // Verify edit mode is exited
    const updatedEditInput = taskElement.querySelector('.task-edit-input');
    expect(updatedEditInput).toBeFalsy();

    // Verify UI is updated
    const updatedTaskTextSpan = taskElement.querySelector(
      '.task-text'
    ) as HTMLSpanElement;
    expect(updatedTaskTextSpan.textContent).toBe('Updated task text');

    // Verify persistence
    await verifyTaskPersistence(taskId, 'Updated task text');
  });

  it('should persist edited task content to LocalStorage when saving with blur event', async () => {
    // Add a task first
    await taskService.addTask('Original blur task');
    const tasks = await taskService.getTasks();
    const taskId = tasks[0].id;

    // Render the task manually
    const taskElement = createTaskElement(taskId, tasks[0].text);
    document.getElementById('task-list')!.appendChild(taskElement);

    // Simulate edit and save with blur
    await simulateTaskEdit(taskElement, 'Updated via blur', 'blur');

    // Verify persistence
    await verifyTaskPersistence(taskId, 'Updated via blur');
  });
});
