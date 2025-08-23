import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UIController } from '../controllers/UIController';
import { TaskService } from '../services/TaskService';
import { LocalStorageTaskRepository } from '../repositories/LocalStorageTaskRepository';

describe('Task Edit - Enter Key Save (Integration)', () => {
  let uiController: UIController;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <div id="app">
        <form id="add-task-form">
          <input id="new-task-input" type="text" placeholder="新しいタスクを入力...">
          <button type="submit" id="add-task-btn">追加</button>
        </form>
        <div id="filter-buttons">
          <button id="filter-all" class="filter-btn active" data-filter="all">すべて</button>
          <button id="filter-active" class="filter-btn" data-filter="active">未完了</button>
          <button id="filter-completed" class="filter-btn" data-filter="completed">完了済み</button>
        </div>
        <ul id="task-list"></ul>
        <div id="task-stats">
          <span id="stats-text">0 個中 0 個完了</span>
        </div>
        <div id="empty-state" style="display: none;">タスクがありません</div>
        <div id="error-message" style="display: none;"></div>
      </div>
    `;

    // Clear localStorage
    localStorage.clear();

    // Initialize UIController (which creates its own TaskService)
    uiController = new UIController();
  });

  it('should save edited task content when Enter key is pressed', async () => {
    // Add a task through the UI
    const taskInput = document.getElementById(
      'new-task-input'
    ) as HTMLInputElement;
    const addForm = document.getElementById('add-task-form') as HTMLFormElement;

    taskInput.value = 'Original task text';
    addForm.dispatchEvent(new Event('submit', { bubbles: true }));

    // Wait for the task to be added and rendered
    await new Promise(resolve => setTimeout(resolve, 50));

    // Get the task item from the DOM
    const taskItems = document.querySelectorAll('.task-item');
    expect(taskItems.length).toBe(1);

    const taskItem = taskItems[0] as HTMLElement;
    expect(taskItem).toBeTruthy();

    const taskText = taskItem.querySelector('.task-text') as HTMLElement;
    expect(taskText).toBeTruthy();

    // Simulate double-click to enter edit mode
    const dblClickEvent = new MouseEvent('dblclick', { bubbles: true });
    taskText.dispatchEvent(dblClickEvent);

    // Check if edit mode is activated (input field should be visible)
    const editInput = taskItem.querySelector(
      '.task-edit-input'
    ) as HTMLInputElement;
    expect(editInput).toBeTruthy();
    expect(editInput.style.display).not.toBe('none');
    expect(editInput.value).toBe('Original task text');

    // Change the text
    editInput.value = 'Updated task text';

    // Simulate Enter key press
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
    });
    editInput.dispatchEvent(enterEvent);

    // Wait for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 10));

    // Check if edit mode is exited (edit input should be removed)
    const editInputAfter = taskItem.querySelector('.task-edit-input');
    expect(editInputAfter).toBeNull();
    expect(taskText.style.display).not.toBe('none');

    // Check if the text is updated in the UI
    expect(taskText.textContent).toBe('Updated task text');

    // Verify the task is updated in localStorage (since we can't access the service directly)
    const taskId = taskItem.getAttribute('data-task-id');

    // Verify persistence in localStorage
    const storedTasks = JSON.parse(
      localStorage.getItem('todoApp_tasks') || '[]'
    );
    const storedTask = storedTasks.find((t: any) => t.id === taskId);
    expect(storedTask).toBeTruthy();
    expect(storedTask.text).toBe('Updated task text');
  });

  it('should handle Enter key press when not in edit mode (should not cause errors)', async () => {
    // Add a task through the UI
    const taskInput = document.getElementById(
      'new-task-input'
    ) as HTMLInputElement;
    const addForm = document.getElementById('add-task-form') as HTMLFormElement;

    taskInput.value = 'Test task';
    addForm.dispatchEvent(new Event('submit', { bubbles: true }));

    // Wait for the task to be added and rendered
    await new Promise(resolve => setTimeout(resolve, 50));

    const taskItem = document.querySelector('.task-item') as HTMLElement;
    const taskText = taskItem.querySelector('.task-text') as HTMLElement;

    // Simulate Enter key press without entering edit mode
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
    });
    taskText.dispatchEvent(enterEvent);

    // Should not cause any errors and task should remain unchanged
    expect(taskText.textContent).toBe('Test task');
  });
});
