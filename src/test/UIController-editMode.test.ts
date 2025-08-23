/**
 * Unit Tests for UIController Edit Mode State Management
 *
 * These tests focus on the internal logic of edit mode state management
 * in the UIController class.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UIController } from '../controllers/UIController.js';

// Mock the TaskService and LocalStorageTaskRepository
vi.mock('../services/TaskService.js');
vi.mock('../repositories/LocalStorageTaskRepository.js');

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

// Helper function to create a mock task element
function createMockTaskElement(
  taskId: string,
  taskText: string
): HTMLLIElement {
  const taskItem = document.createElement('li');
  taskItem.className = 'task-item';
  taskItem.setAttribute('data-task-id', taskId);
  taskItem.setAttribute('role', 'listitem');

  taskItem.innerHTML = `
    <div class="task-content">
      <input 
        type="checkbox" 
        id="task-checkbox-${taskId}" 
        class="task-checkbox"
        aria-describedby="task-text-${taskId}"
      />
      <label for="task-checkbox-${taskId}" class="task-label">
        <span id="task-text-${taskId}" class="task-text">${taskText}</span>
      </label>
      <button 
        type="button" 
        class="delete-btn" 
        aria-label="タスク「${taskText}」を削除"
        data-task-id="${taskId}"
      >
        ×
      </button>
    </div>
  `;

  return taskItem;
}

describe('UIController Edit Mode State Management', () => {
  let uiController: UIController;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Setup DOM
    setupDOM();

    // Initialize UIController
    uiController = new UIController();
  });

  describe('Edit Mode State Tracking', () => {
    it('should track editing state when entering edit mode', () => {
      // Arrange: Create a task element and add it to the DOM
      const taskId = 'test-task-1';
      const taskText = 'Test task for editing';
      const taskElement = createMockTaskElement(taskId, taskText);
      const taskList = document.getElementById('task-list')!;
      taskList.appendChild(taskElement);

      const taskTextElement = taskElement.querySelector(
        '.task-text'
      ) as HTMLElement;

      // Act: Trigger double-click to enter edit mode
      const dblClickEvent = new MouseEvent('dblclick', {
        bubbles: true,
        cancelable: true,
      });
      taskTextElement.dispatchEvent(dblClickEvent);

      // Assert: Should be in editing state (this will fail initially - RED phase)
      // We need to access the private editingTaskId property for testing
      // This test verifies the internal state management
      expect((uiController as any).editingTaskId).toBe(taskId);
    });

    it('should prevent entering edit mode when already editing another task', () => {
      // Arrange: Create two task elements
      const taskId1 = 'test-task-1';
      const taskId2 = 'test-task-2';
      const taskText1 = 'First task';
      const taskText2 = 'Second task';

      const taskElement1 = createMockTaskElement(taskId1, taskText1);
      const taskElement2 = createMockTaskElement(taskId2, taskText2);

      const taskList = document.getElementById('task-list')!;
      taskList.appendChild(taskElement1);
      taskList.appendChild(taskElement2);

      const taskTextElement1 = taskElement1.querySelector(
        '.task-text'
      ) as HTMLElement;
      const taskTextElement2 = taskElement2.querySelector(
        '.task-text'
      ) as HTMLElement;

      // Act: Enter edit mode for first task
      const dblClickEvent1 = new MouseEvent('dblclick', {
        bubbles: true,
        cancelable: true,
      });
      taskTextElement1.dispatchEvent(dblClickEvent1);

      // Try to enter edit mode for second task
      const dblClickEvent2 = new MouseEvent('dblclick', {
        bubbles: true,
        cancelable: true,
      });
      taskTextElement2.dispatchEvent(dblClickEvent2);

      // Assert: Should still be editing the first task only
      expect((uiController as any).editingTaskId).toBe(taskId1);

      // Second task should not have edit input
      const editInput2 = taskElement2.querySelector('.task-edit-input');
      expect(editInput2).toBeNull();
    });

    it('should clear editing state when edit mode is exited', () => {
      // Arrange: Create a task element and enter edit mode
      const taskId = 'test-task-1';
      const taskText = 'Test task for editing';
      const taskElement = createMockTaskElement(taskId, taskText);
      const taskList = document.getElementById('task-list')!;
      taskList.appendChild(taskElement);

      const taskTextElement = taskElement.querySelector(
        '.task-text'
      ) as HTMLElement;

      // Enter edit mode first
      const dblClickEvent = new MouseEvent('dblclick', {
        bubbles: true,
        cancelable: true,
      });
      taskTextElement.dispatchEvent(dblClickEvent);

      // Verify we're in edit mode
      expect((uiController as any).editingTaskId).toBe(taskId);
      expect(taskElement.querySelector('.task-edit-input')).toBeTruthy();

      // Act: Exit edit mode
      (uiController as any).exitEditMode();

      // Assert: Editing state should be cleared
      expect((uiController as any).editingTaskId).toBeNull();
      expect(taskElement.querySelector('.task-edit-input')).toBeNull();
      expect(taskTextElement.style.display).toBe('');
    });
  });

  describe('Edit Input Creation', () => {
    it('should create edit input with correct attributes', () => {
      // Arrange: Create a task element
      const taskId = 'test-task-1';
      const taskText = 'Test task for editing';
      const taskElement = createMockTaskElement(taskId, taskText);
      const taskList = document.getElementById('task-list')!;
      taskList.appendChild(taskElement);

      const taskTextElement = taskElement.querySelector(
        '.task-text'
      ) as HTMLElement;

      // Act: Enter edit mode
      const dblClickEvent = new MouseEvent('dblclick', {
        bubbles: true,
        cancelable: true,
      });
      taskTextElement.dispatchEvent(dblClickEvent);

      // Assert: Edit input should have correct attributes
      const editInput = taskElement.querySelector(
        '.task-edit-input'
      ) as HTMLInputElement;
      expect(editInput).toBeTruthy();
      expect(editInput.type).toBe('text');
      expect(editInput.className).toBe('task-edit-input');
      expect(editInput.value).toBe(taskText);
      expect(editInput.getAttribute('data-task-id')).toBe(taskId);
      expect(editInput.getAttribute('aria-label')).toBe('タスクを編集');
    });

    it('should hide original task text when edit input is created', () => {
      // Arrange: Create a task element
      const taskId = 'test-task-1';
      const taskText = 'Test task for editing';
      const taskElement = createMockTaskElement(taskId, taskText);
      const taskList = document.getElementById('task-list')!;
      taskList.appendChild(taskElement);

      const taskTextElement = taskElement.querySelector(
        '.task-text'
      ) as HTMLElement;

      // Act: Enter edit mode
      const dblClickEvent = new MouseEvent('dblclick', {
        bubbles: true,
        cancelable: true,
      });
      taskTextElement.dispatchEvent(dblClickEvent);

      // Assert: Original task text should be hidden
      expect(taskTextElement.style.display).toBe('none');
    });

    it('should focus and select text in edit input', () => {
      // Arrange: Create a task element
      const taskId = 'test-task-1';
      const taskText = 'Test task for editing';
      const taskElement = createMockTaskElement(taskId, taskText);
      const taskList = document.getElementById('task-list')!;
      taskList.appendChild(taskElement);

      const taskTextElement = taskElement.querySelector(
        '.task-text'
      ) as HTMLElement;

      // Act: Enter edit mode
      const dblClickEvent = new MouseEvent('dblclick', {
        bubbles: true,
        cancelable: true,
      });
      taskTextElement.dispatchEvent(dblClickEvent);

      // Assert: Edit input should be focused
      const editInput = taskElement.querySelector(
        '.task-edit-input'
      ) as HTMLInputElement;
      expect(document.activeElement).toBe(editInput);

      // Note: Testing text selection in JSDOM is limited, but we can verify the input is focused
    });
  });

  describe('Event Target Validation', () => {
    it('should only respond to double-clicks on task text elements', () => {
      // Arrange: Create a task element
      const taskId = 'test-task-1';
      const taskText = 'Test task for editing';
      const taskElement = createMockTaskElement(taskId, taskText);
      const taskList = document.getElementById('task-list')!;
      taskList.appendChild(taskElement);

      const checkbox = taskElement.querySelector(
        '.task-checkbox'
      ) as HTMLElement;
      const deleteButton = taskElement.querySelector(
        '.delete-btn'
      ) as HTMLElement;

      // Act: Double-click on checkbox (should not enter edit mode)
      const dblClickEvent1 = new MouseEvent('dblclick', {
        bubbles: true,
        cancelable: true,
      });
      checkbox.dispatchEvent(dblClickEvent1);

      // Assert: Should not be in edit mode
      expect((uiController as any).editingTaskId).toBeNull();
      expect(taskElement.querySelector('.task-edit-input')).toBeNull();

      // Act: Double-click on delete button (should not enter edit mode)
      const dblClickEvent2 = new MouseEvent('dblclick', {
        bubbles: true,
        cancelable: true,
      });
      deleteButton.dispatchEvent(dblClickEvent2);

      // Assert: Should still not be in edit mode
      expect((uiController as any).editingTaskId).toBeNull();
      expect(taskElement.querySelector('.task-edit-input')).toBeNull();
    });

    it('should handle double-click on task text element correctly', () => {
      // Arrange: Create a task element
      const taskId = 'test-task-1';
      const taskText = 'Test task for editing';
      const taskElement = createMockTaskElement(taskId, taskText);
      const taskList = document.getElementById('task-list')!;
      taskList.appendChild(taskElement);

      const taskTextElement = taskElement.querySelector(
        '.task-text'
      ) as HTMLElement;

      // Act: Double-click on task text (should enter edit mode)
      const dblClickEvent = new MouseEvent('dblclick', {
        bubbles: true,
        cancelable: true,
      });
      taskTextElement.dispatchEvent(dblClickEvent);

      // Assert: Should be in edit mode
      expect((uiController as any).editingTaskId).toBe(taskId);
      expect(taskElement.querySelector('.task-edit-input')).toBeTruthy();
    });
  });
});
