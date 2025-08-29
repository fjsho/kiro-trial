import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UIController } from '../controllers/UIController.js';

// Mock localStorage with actual storage behavior
const localStorageData: Record<string, string> = {};

const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageData[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageData[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageData[key];
  }),
  clear: vi.fn(() => {
    Object.keys(localStorageData).forEach(key => delete localStorageData[key]);
  }),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Task Deletion Statistics Integration Tests', () => {
  let _container: HTMLElement;

  beforeEach(() => {
    // Reset localStorage mock
    vi.clearAllMocks();
    localStorageMock.clear();

    // Set up DOM
    document.body.innerHTML = `
      <div id="app">
        <header class="app-header">
          <h1>Simple TODO App</h1>
          <div class="stats" role="status" aria-live="polite">
            <span id="stats-text">0 個中 0 個完了</span>
          </div>
        </header>

        <main class="app-main">
          <section class="input-section">
            <form id="add-task-form" class="add-task-form">
              <input 
                type="text" 
                id="new-task-input" 
                class="new-task-input"
                placeholder="新しいタスクを入力..."
                maxlength="500"
                required
              />
              <button type="submit" id="add-task-btn" class="add-task-btn">
                追加
              </button>
            </form>
          </section>

          <section class="task-list-section">
            <ul id="task-list" class="task-list" role="list">
              <!-- Tasks will be dynamically added here -->
            </ul>
            <div id="empty-state" class="empty-state" style="display: none;">
              <p>タスクがありません。新しいタスクを追加してください。</p>
            </div>
          </section>
        </main>
      </div>
    `;

    _container = document.getElementById('app')!;
  });

  it("should update statistics from '1 個中 0 個完了' to '0 個中 0 個完了' when deleting an incomplete task", async () => {
    // Initialize UIController
    new UIController();

    // Add a task
    const taskInput = document.getElementById(
      'new-task-input'
    ) as HTMLInputElement;
    const addForm = document.getElementById('add-task-form') as HTMLFormElement;

    taskInput.value = 'Task to delete';
    addForm.dispatchEvent(new Event('submit'));

    // Wait for task to be added
    await new Promise(resolve => setTimeout(resolve, 0));

    // Verify initial statistics
    let statsText = document.getElementById('stats-text')!;
    expect(statsText.textContent).toBe('1 個中 0 個完了');

    // Find and click the delete button
    const taskList = document.getElementById('task-list')!;
    const deleteButton = taskList.querySelector(
      '.delete-btn'
    ) as HTMLButtonElement;
    expect(deleteButton).toBeTruthy();

    deleteButton.click();

    // Wait for deletion to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    // Verify statistics are updated after deletion
    statsText = document.getElementById('stats-text')!;
    expect(statsText.textContent).toBe('0 個中 0 個完了');
  });

  it("should update statistics from '1 個中 1 個完了' to '0 個中 0 個完了' when deleting a completed task", async () => {
    // Initialize UIController
    new UIController();

    // Add a task
    const taskInput = document.getElementById(
      'new-task-input'
    ) as HTMLInputElement;
    const addForm = document.getElementById('add-task-form') as HTMLFormElement;

    taskInput.value = 'Completed task to delete';
    addForm.dispatchEvent(new Event('submit'));

    // Wait for task to be added
    await new Promise(resolve => setTimeout(resolve, 0));

    // Complete the task
    const checkbox = document.querySelector(
      '.task-checkbox'
    ) as HTMLInputElement;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));

    // Wait for completion to be processed
    await new Promise(resolve => setTimeout(resolve, 0));

    // Verify statistics after completion
    let statsText = document.getElementById('stats-text')!;
    expect(statsText.textContent).toBe('1 個中 1 個完了');

    // Find and click the delete button
    const taskList = document.getElementById('task-list')!;
    const deleteButton = taskList.querySelector(
      '.delete-btn'
    ) as HTMLButtonElement;
    expect(deleteButton).toBeTruthy();

    deleteButton.click();

    // Wait for deletion to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    // Verify statistics are updated after deletion
    statsText = document.getElementById('stats-text')!;
    expect(statsText.textContent).toBe('0 個中 0 個完了');
  });

  it("should update statistics from '3 個中 2 個完了' to '2 個中 1 個完了' when deleting one completed task", async () => {
    // Initialize UIController
    new UIController();

    const taskInput = document.getElementById(
      'new-task-input'
    ) as HTMLInputElement;
    const addForm = document.getElementById('add-task-form') as HTMLFormElement;

    // Add three tasks
    taskInput.value = 'First task';
    addForm.dispatchEvent(new Event('submit'));
    await new Promise(resolve => setTimeout(resolve, 0));

    taskInput.value = 'Second task';
    addForm.dispatchEvent(new Event('submit'));
    await new Promise(resolve => setTimeout(resolve, 0));

    taskInput.value = 'Third task';
    addForm.dispatchEvent(new Event('submit'));
    await new Promise(resolve => setTimeout(resolve, 0));

    // Complete first and second tasks
    const taskList = document.getElementById('task-list')!;
    const checkboxes = taskList.querySelectorAll(
      '.task-checkbox'
    ) as NodeListOf<HTMLInputElement>;

    checkboxes[0].checked = true;
    checkboxes[0].dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, 0));

    checkboxes[1].checked = true;
    checkboxes[1].dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, 0));

    // Verify initial statistics
    let statsText = document.getElementById('stats-text')!;
    expect(statsText.textContent).toBe('3 個中 2 個完了');

    // Delete the first task (which is completed)
    const deleteButtons = taskList.querySelectorAll(
      '.delete-btn'
    ) as NodeListOf<HTMLButtonElement>;
    deleteButtons[0].click();

    // Wait for deletion to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    // Verify statistics are updated after deletion
    statsText = document.getElementById('stats-text')!;
    expect(statsText.textContent).toBe('2 個中 1 個完了');
  });

  it("should update statistics from '3 個中 1 個完了' to '2 個中 1 個完了' when deleting one incomplete task", async () => {
    // Initialize UIController
    new UIController();

    const taskInput = document.getElementById(
      'new-task-input'
    ) as HTMLInputElement;
    const addForm = document.getElementById('add-task-form') as HTMLFormElement;

    // Add three tasks
    taskInput.value = 'First task';
    addForm.dispatchEvent(new Event('submit'));
    await new Promise(resolve => setTimeout(resolve, 0));

    taskInput.value = 'Second task';
    addForm.dispatchEvent(new Event('submit'));
    await new Promise(resolve => setTimeout(resolve, 0));

    taskInput.value = 'Third task';
    addForm.dispatchEvent(new Event('submit'));
    await new Promise(resolve => setTimeout(resolve, 0));

    // Complete only the second task
    const taskList = document.getElementById('task-list')!;
    const checkboxes = taskList.querySelectorAll(
      '.task-checkbox'
    ) as NodeListOf<HTMLInputElement>;

    checkboxes[1].checked = true;
    checkboxes[1].dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, 0));

    // Verify initial statistics
    let statsText = document.getElementById('stats-text')!;
    expect(statsText.textContent).toBe('3 個中 1 個完了');

    // Delete the first task (which is incomplete)
    const deleteButtons = taskList.querySelectorAll(
      '.delete-btn'
    ) as NodeListOf<HTMLButtonElement>;
    deleteButtons[0].click();

    // Wait for deletion to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    // Verify statistics are updated after deletion
    statsText = document.getElementById('stats-text')!;
    expect(statsText.textContent).toBe('2 個中 1 個完了');
  });
});
