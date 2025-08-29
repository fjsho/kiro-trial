/**
 * Integration Test: 空文字で保存すると変更が破棄される
 *
 * This test verifies that when a user edits a task and tries to save with empty text,
 * the changes are discarded and the original text is preserved.
 *
 * Requirements: 4.4 - IF 編集後のテキストが空の場合 THEN システムは変更を破棄し元のテキストを保持する
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UIController } from '../controllers/UIController.js';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Task Edit Empty Validation - Integration Test', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorageMock.clear();
    vi.clearAllMocks();

    // Set up DOM
    document.body.innerHTML = `
      <div id="app">
        <form id="add-task-form">
          <input type="text" id="new-task-input" placeholder="新しいタスクを入力..." />
          <button type="submit">追加</button>
        </form>
        
        <div class="filter-section">
          <button class="filter-btn active" data-filter="all" aria-pressed="true">すべて</button>
          <button class="filter-btn" data-filter="active" aria-pressed="false">未完了</button>
          <button class="filter-btn" data-filter="completed" aria-pressed="false">完了済み</button>
        </div>
        
        <ul id="task-list" role="list"></ul>
        
        <div id="stats">
          <span id="stats-text">0 個中 0 個完了</span>
        </div>
        
        <div id="empty-state" style="display: block;">
          タスクがありません
        </div>
      </div>
    `;

    // DOM setup complete
    void new UIController();
  });

  it('should discard changes when saving with empty text via Enter key', async () => {
    // Add a task first
    const taskInput = document.getElementById(
      'new-task-input'
    ) as HTMLInputElement;
    taskInput.value = 'Original Task Text';

    const form = document.getElementById('add-task-form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));

    // Wait for task to be added
    await new Promise(resolve => setTimeout(resolve, 0));

    // Find the task text element
    const taskText = document.querySelector('.task-text') as HTMLElement;
    expect(taskText).toBeTruthy();
    expect(taskText.textContent).toBe('Original Task Text');

    // Double-click to enter edit mode
    taskText.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));

    // Find the edit input
    const editInput = document.querySelector(
      '.task-edit-input'
    ) as HTMLInputElement;
    expect(editInput).toBeTruthy();
    expect(editInput.value).toBe('Original Task Text');

    // Clear the input (empty text)
    editInput.value = '';

    // Press Enter to save
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
    });
    editInput.dispatchEvent(enterEvent);

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0));

    // Verify that the original text is preserved
    const updatedTaskText = document.querySelector('.task-text') as HTMLElement;
    expect(updatedTaskText.textContent).toBe('Original Task Text');

    // Verify that edit mode is exited
    const editInputAfter = document.querySelector('.task-edit-input');
    expect(editInputAfter).toBeNull();

    // Verify that task text is visible again
    expect(updatedTaskText.style.display).toBe('');
  });

  it('should discard changes when saving with empty text via blur event', async () => {
    // Add a task first
    const taskInput = document.getElementById(
      'new-task-input'
    ) as HTMLInputElement;
    taskInput.value = 'Another Original Text';

    const form = document.getElementById('add-task-form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));

    // Wait for task to be added
    await new Promise(resolve => setTimeout(resolve, 0));

    // Find the task text element
    const taskText = document.querySelector('.task-text') as HTMLElement;
    expect(taskText).toBeTruthy();
    expect(taskText.textContent).toBe('Another Original Text');

    // Double-click to enter edit mode
    taskText.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));

    // Find the edit input
    const editInput = document.querySelector(
      '.task-edit-input'
    ) as HTMLInputElement;
    expect(editInput).toBeTruthy();
    expect(editInput.value).toBe('Another Original Text');

    // Clear the input (empty text)
    editInput.value = '';

    // Trigger blur event to save
    editInput.dispatchEvent(new FocusEvent('blur', { bubbles: true }));

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0));

    // Verify that the original text is preserved
    const updatedTaskText = document.querySelector('.task-text') as HTMLElement;
    expect(updatedTaskText.textContent).toBe('Another Original Text');

    // Verify that edit mode is exited
    const editInputAfter = document.querySelector('.task-edit-input');
    expect(editInputAfter).toBeNull();

    // Verify that task text is visible again
    expect(updatedTaskText.style.display).toBe('');
  });

  it('should discard changes when saving with whitespace-only text', async () => {
    // Add a task first
    const taskInput = document.getElementById(
      'new-task-input'
    ) as HTMLInputElement;
    taskInput.value = 'Whitespace Test Task';

    const form = document.getElementById('add-task-form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));

    // Wait for task to be added
    await new Promise(resolve => setTimeout(resolve, 0));

    // Find the task text element
    const taskText = document.querySelector('.task-text') as HTMLElement;
    expect(taskText).toBeTruthy();
    expect(taskText.textContent).toBe('Whitespace Test Task');

    // Double-click to enter edit mode
    taskText.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));

    // Find the edit input
    const editInput = document.querySelector(
      '.task-edit-input'
    ) as HTMLInputElement;
    expect(editInput).toBeTruthy();
    expect(editInput.value).toBe('Whitespace Test Task');

    // Set input to whitespace-only text
    editInput.value = '   \t\n   ';

    // Press Enter to save
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
    });
    editInput.dispatchEvent(enterEvent);

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0));

    // Verify that the original text is preserved
    const updatedTaskText = document.querySelector('.task-text') as HTMLElement;
    expect(updatedTaskText.textContent).toBe('Whitespace Test Task');

    // Verify that edit mode is exited
    const editInputAfter = document.querySelector('.task-edit-input');
    expect(editInputAfter).toBeNull();
  });
});
