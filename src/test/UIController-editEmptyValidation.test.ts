/**
 * Unit Test: UIController 編集時の空文字バリデーション
 *
 * This test focuses on the specific validation logic for empty text during task editing.
 * Tests the internal behavior of the UIController when handling empty text in edit mode.
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

describe('UIController Edit Empty Validation - Unit Test', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorageMock.clear();
    vi.clearAllMocks();

    // Set up minimal DOM
    document.body.innerHTML = `
      <div id="app">
        <form id="add-task-form">
          <input type="text" id="new-task-input" />
          <button type="submit">追加</button>
        </form>
        <ul id="task-list" role="list"></ul>
        <div id="stats">
          <span id="stats-text">0 個中 0 個完了</span>
        </div>
        <div id="empty-state">タスクがありません</div>
      </div>
    `;

    new UIController();
  });

  it('should call cancelEdit when saveEditedTask receives empty text', async () => {
    // Add a task first
    const taskInput = document.getElementById(
      'new-task-input'
    ) as HTMLInputElement;
    taskInput.value = 'Test Task';

    const form = document.getElementById('add-task-form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));

    await new Promise(resolve => setTimeout(resolve, 0));

    // Enter edit mode
    const taskText = document.querySelector('.task-text') as HTMLElement;
    taskText.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));

    // Get the edit input
    const editInput = document.querySelector(
      '.task-edit-input'
    ) as HTMLInputElement;
    expect(editInput).toBeTruthy();

    // Spy on the cancelEdit method by checking if edit mode is properly exited
    const originalTaskText = taskText.textContent;

    // Set empty value and trigger save
    editInput.value = '';

    // Call the private method indirectly through keydown event
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
    });
    editInput.dispatchEvent(enterEvent);

    await new Promise(resolve => setTimeout(resolve, 0));

    // Verify that edit was cancelled (original text preserved)
    const finalTaskText = document.querySelector('.task-text') as HTMLElement;
    expect(finalTaskText.textContent).toBe(originalTaskText);

    // Verify edit mode was exited
    const editInputAfter = document.querySelector('.task-edit-input');
    expect(editInputAfter).toBeNull();
  });

  it('should call cancelEdit when saveEditedTask receives whitespace-only text', async () => {
    // Add a task first
    const taskInput = document.getElementById(
      'new-task-input'
    ) as HTMLInputElement;
    taskInput.value = 'Whitespace Test';

    const form = document.getElementById('add-task-form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));

    await new Promise(resolve => setTimeout(resolve, 0));

    // Enter edit mode
    const taskText = document.querySelector('.task-text') as HTMLElement;
    taskText.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));

    // Get the edit input
    const editInput = document.querySelector(
      '.task-edit-input'
    ) as HTMLInputElement;
    expect(editInput).toBeTruthy();

    const originalTaskText = taskText.textContent;

    // Set whitespace-only value and trigger save
    editInput.value = '   \t\n   ';

    // Trigger blur event
    editInput.dispatchEvent(new FocusEvent('blur', { bubbles: true }));

    await new Promise(resolve => setTimeout(resolve, 0));

    // Verify that edit was cancelled (original text preserved)
    const finalTaskText = document.querySelector('.task-text') as HTMLElement;
    expect(finalTaskText.textContent).toBe(originalTaskText);

    // Verify edit mode was exited
    const editInputAfter = document.querySelector('.task-edit-input');
    expect(editInputAfter).toBeNull();
  });

  it('should not call TaskService.updateTask when text is empty', async () => {
    // This test verifies that the service layer is not called for empty text
    // We'll spy on localStorage to ensure no update calls are made

    // Add a task first
    const taskInput = document.getElementById(
      'new-task-input'
    ) as HTMLInputElement;
    taskInput.value = 'Service Test Task';

    const form = document.getElementById('add-task-form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));

    await new Promise(resolve => setTimeout(resolve, 0));

    // Clear localStorage spy calls from task addition
    vi.clearAllMocks();

    // Enter edit mode
    const taskText = document.querySelector('.task-text') as HTMLElement;
    taskText.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));

    // Get the edit input
    const editInput = document.querySelector(
      '.task-edit-input'
    ) as HTMLInputElement;
    expect(editInput).toBeTruthy();

    // Set empty value and trigger save
    editInput.value = '';

    // Trigger save via Enter key
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
    });
    editInput.dispatchEvent(enterEvent);

    await new Promise(resolve => setTimeout(resolve, 0));

    // Verify that localStorage.setItem was not called (no update to repository)
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('should preserve original text when empty validation triggers', async () => {
    // Add a task first
    const taskInput = document.getElementById(
      'new-task-input'
    ) as HTMLInputElement;
    taskInput.value = 'Original Text Preservation Test';

    const form = document.getElementById('add-task-form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));

    await new Promise(resolve => setTimeout(resolve, 0));

    // Store original text
    const taskText = document.querySelector('.task-text') as HTMLElement;
    const originalText = taskText.textContent;
    expect(originalText).toBe('Original Text Preservation Test');

    // Enter edit mode
    taskText.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));

    // Get the edit input
    const editInput = document.querySelector(
      '.task-edit-input'
    ) as HTMLInputElement;
    expect(editInput).toBeTruthy();
    expect(editInput.value).toBe(originalText);

    // Modify to empty and save
    editInput.value = '';

    // Trigger save
    editInput.dispatchEvent(new FocusEvent('blur', { bubbles: true }));

    await new Promise(resolve => setTimeout(resolve, 0));

    // Verify original text is preserved
    const finalTaskText = document.querySelector('.task-text') as HTMLElement;
    expect(finalTaskText.textContent).toBe(originalText);
    expect(finalTaskText.style.display).toBe(''); // Should be visible
  });
});
