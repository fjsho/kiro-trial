/**
 * Integration Test for Task Edit Mode - Double Click to Enter Edit Mode
 *
 * This test verifies that double-clicking on a task text enters edit mode.
 * Requirements: 4.1 - WHEN ユーザーがタスクテキストをダブルクリック THEN システムはそのタスクを編集モードに切り替える
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { UIController } from '../controllers/UIController.js';

// Setup DOM environment for testing
function setupDOM(): void {
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
            <label for="new-task-input" class="visually-hidden">新しいタスクを入力</label>
            <input 
              type="text" 
              id="new-task-input" 
              class="new-task-input"
              placeholder="新しいタスクを入力..."
              aria-describedby="input-help"
              maxlength="500"
              required
            />
            <span id="input-help" class="visually-hidden">Enterキーまたは追加ボタンでタスクを追加できます</span>
            <button type="submit" id="add-task-btn" class="add-task-btn" aria-label="タスクを追加">
              追加
            </button>
          </form>
        </section>

        <section class="filter-section">
          <h2 class="visually-hidden">タスクフィルター</h2>
          <div class="filter-buttons" role="group" aria-label="タスクフィルター">
            <button 
              type="button" 
              id="filter-all" 
              class="filter-btn active" 
              data-filter="all"
              aria-pressed="true"
            >
              すべて
            </button>
            <button 
              type="button" 
              id="filter-active" 
              class="filter-btn" 
              data-filter="active"
              aria-pressed="false"
            >
              未完了
            </button>
            <button 
              type="button" 
              id="filter-completed" 
              class="filter-btn" 
              data-filter="completed"
              aria-pressed="false"
            >
              完了済み
            </button>
          </div>
        </section>

        <section class="task-list-section">
          <h2 class="visually-hidden">タスクリスト</h2>
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
}

describe('Task Edit Mode - Double Click Integration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Setup DOM
    setupDOM();

    // Initialize UIController
    void new UIController();
  });

  it('should enter edit mode when task text is double-clicked', async () => {
    // Arrange: Add a task first
    const taskInput = document.getElementById(
      'new-task-input'
    ) as HTMLInputElement;
    const addForm = document.getElementById('add-task-form') as HTMLFormElement;

    taskInput.value = 'Test task for editing';
    addForm.dispatchEvent(new Event('submit'));

    // Wait for task to be added to DOM
    await new Promise(resolve => setTimeout(resolve, 10));

    // Get the task text element
    const taskTextElement = document.querySelector('.task-text') as HTMLElement;
    expect(taskTextElement).toBeTruthy();
    expect(taskTextElement.textContent).toBe('Test task for editing');

    // Act: Double-click on the task text
    const dblClickEvent = new MouseEvent('dblclick', {
      bubbles: true,
      cancelable: true,
    });
    taskTextElement.dispatchEvent(dblClickEvent);

    // Assert: Task should be in edit mode
    // In edit mode, the task text should be replaced with an input field
    const taskItem = taskTextElement.closest('.task-item') as HTMLElement;
    expect(taskItem).toBeTruthy();

    // Check if edit mode is active (this will fail initially - RED phase)
    const editInput = taskItem.querySelector(
      '.task-edit-input'
    ) as HTMLInputElement;
    expect(editInput).toBeTruthy();
    expect(editInput.value).toBe('Test task for editing');

    // The original task text should be hidden or replaced
    const originalTaskText = taskItem.querySelector(
      '.task-text'
    ) as HTMLElement;
    expect(originalTaskText.style.display).toBe('none');
  });

  it('should show edit input with current task text when entering edit mode', async () => {
    // Arrange: Add a task with specific text
    const taskInput = document.getElementById(
      'new-task-input'
    ) as HTMLInputElement;
    const addForm = document.getElementById('add-task-form') as HTMLFormElement;

    const originalText = 'Original task text';
    taskInput.value = originalText;
    addForm.dispatchEvent(new Event('submit'));

    // Wait for task to be added to DOM
    await new Promise(resolve => setTimeout(resolve, 10));

    // Get the task text element
    const taskTextElement = document.querySelector('.task-text') as HTMLElement;

    // Act: Double-click to enter edit mode
    const dblClickEvent = new MouseEvent('dblclick', {
      bubbles: true,
      cancelable: true,
    });
    taskTextElement.dispatchEvent(dblClickEvent);

    // Assert: Edit input should contain the original text
    const taskItem = taskTextElement.closest('.task-item') as HTMLElement;
    const editInput = taskItem.querySelector(
      '.task-edit-input'
    ) as HTMLInputElement;

    expect(editInput).toBeTruthy();
    expect(editInput.value).toBe(originalText);
    expect(editInput.type).toBe('text');
  });

  it('should focus the edit input when entering edit mode', async () => {
    // Arrange: Add a task
    const taskInput = document.getElementById(
      'new-task-input'
    ) as HTMLInputElement;
    const addForm = document.getElementById('add-task-form') as HTMLFormElement;

    taskInput.value = 'Focus test task';
    addForm.dispatchEvent(new Event('submit'));

    // Wait for task to be added to DOM
    await new Promise(resolve => setTimeout(resolve, 10));

    // Get the task text element
    const taskTextElement = document.querySelector('.task-text') as HTMLElement;

    // Act: Double-click to enter edit mode
    const dblClickEvent = new MouseEvent('dblclick', {
      bubbles: true,
      cancelable: true,
    });
    taskTextElement.dispatchEvent(dblClickEvent);

    // Assert: Edit input should be focused
    const taskItem = taskTextElement.closest('.task-item') as HTMLElement;
    const editInput = taskItem.querySelector(
      '.task-edit-input'
    ) as HTMLInputElement;

    expect(editInput).toBeTruthy();
    expect(document.activeElement).toBe(editInput);
  });
});
