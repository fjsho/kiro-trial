import { describe, it, expect, beforeEach } from 'vitest';
import { UIController } from '../controllers/UIController.js';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Task Statistics Update Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();

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
            </ul>
            <div id="empty-state" class="empty-state" style="display: none;">
              <p>タスクがありません。新しいタスクを追加してください。</p>
            </div>
          </section>
        </main>
      </div>
    `;
  });

  it("should display initial statistics as '0 個中 0 個完了' when no tasks exist", async () => {
    // Initialize UIController
    new UIController();

    // Wait for initial load
    await new Promise(resolve => setTimeout(resolve, 0));

    const statsText = document.getElementById('stats-text');
    expect(statsText?.textContent).toBe('0 個中 0 個完了');
  });

  it("should update statistics to '1 個中 0 個完了' when one task is added", async () => {
    // Initialize UIController
    new UIController();

    // Add a task
    const input = document.getElementById('new-task-input') as HTMLInputElement;
    const form = document.getElementById('add-task-form') as HTMLFormElement;

    input.value = 'Test task';
    form.dispatchEvent(new Event('submit'));

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0));

    const statsText = document.getElementById('stats-text');
    expect(statsText?.textContent).toBe('1 個中 0 個完了');
  });

  it("should update statistics to '1 個中 1 個完了' when one task is completed", async () => {
    // Initialize UIController
    new UIController();

    // Add a task
    const input = document.getElementById('new-task-input') as HTMLInputElement;
    const form = document.getElementById('add-task-form') as HTMLFormElement;

    input.value = 'Test task';
    form.dispatchEvent(new Event('submit'));

    // Wait for task to be added
    await new Promise(resolve => setTimeout(resolve, 0));

    // Complete the task
    const checkbox = document.querySelector(
      '.task-checkbox'
    ) as HTMLInputElement;
    expect(checkbox).toBeTruthy();

    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0));

    const statsText = document.getElementById('stats-text');
    expect(statsText?.textContent).toBe('1 個中 1 個完了');
  });

  it("should update statistics to '2 個中 1 個完了' when second task is added", async () => {
    // Initialize UIController
    new UIController();

    // Add first task and complete it
    const input = document.getElementById('new-task-input') as HTMLInputElement;
    const form = document.getElementById('add-task-form') as HTMLFormElement;

    input.value = 'First task';
    form.dispatchEvent(new Event('submit'));
    await new Promise(resolve => setTimeout(resolve, 0));

    const firstCheckbox = document.querySelector(
      '.task-checkbox'
    ) as HTMLInputElement;
    firstCheckbox.checked = true;
    firstCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, 0));

    // Add second task
    input.value = 'Second task';
    form.dispatchEvent(new Event('submit'));
    await new Promise(resolve => setTimeout(resolve, 0));

    const statsText = document.getElementById('stats-text');
    expect(statsText?.textContent).toBe('2 個中 1 個完了');
  });

  it('should update statistics when task completion status is toggled', async () => {
    // Initialize UIController
    new UIController();

    // Add a task
    const input = document.getElementById('new-task-input') as HTMLInputElement;
    const form = document.getElementById('add-task-form') as HTMLFormElement;

    input.value = 'Toggle task';
    form.dispatchEvent(new Event('submit'));
    await new Promise(resolve => setTimeout(resolve, 0));

    // Complete the task
    const checkbox = document.querySelector(
      '.task-checkbox'
    ) as HTMLInputElement;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, 0));

    let statsText = document.getElementById('stats-text');
    expect(statsText?.textContent).toBe('1 個中 1 個完了');

    // Uncomplete the task
    checkbox.checked = false;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, 0));

    statsText = document.getElementById('stats-text');
    expect(statsText?.textContent).toBe('1 個中 0 個完了');
  });
});
