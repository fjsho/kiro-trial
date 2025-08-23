import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UIController } from '../controllers/UIController.js';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('localStorage', localStorageMock);

describe('UIController Strikethrough Unit Tests', () => {
  let uiController: UIController;

  beforeEach(() => {
    // Reset localStorage mock
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();

    // Set up minimal DOM
    document.body.innerHTML = `
      <div id="app">
        <form id="add-task-form">
          <input type="text" id="new-task-input" />
          <button type="submit" id="add-task-btn">Add</button>
        </form>
        <ul id="task-list"></ul>
        <div id="empty-state" style="display: none;"></div>
        <span id="stats-text">0 個中 0 個完了</span>
      </div>
    `;

    uiController = new UIController();
  });

  describe('updateTaskItemCompletionState method', () => {
    let taskItem: HTMLElement;

    beforeEach(() => {
      // Create a mock task item
      taskItem = document.createElement('li');
      taskItem.className = 'task-item';
      taskItem.setAttribute('data-task-id', 'test-task-id');
      taskItem.innerHTML = `
        <div class="task-content">
          <input type="checkbox" class="task-checkbox" />
          <label class="task-label">
            <span class="task-text">Test task</span>
          </label>
          <button class="delete-btn">×</button>
        </div>
      `;
      document.body.appendChild(taskItem);
    });

    it("should add 'completed' class when task is marked as completed", () => {
      // Initially, task should not have completed class
      expect(taskItem.classList.contains('completed')).toBe(false);

      // Access the private method through reflection for testing
      const updateMethod = (uiController as any).updateTaskItemCompletionState;

      // Call the method to mark task as completed
      updateMethod.call(uiController, taskItem, true);

      // Verify the completed class is added
      expect(taskItem.classList.contains('completed')).toBe(true);
    });

    it("should remove 'completed' class when task is marked as not completed", () => {
      // Start with a completed task
      taskItem.classList.add('completed');
      expect(taskItem.classList.contains('completed')).toBe(true);

      // Access the private method through reflection for testing
      const updateMethod = (uiController as any).updateTaskItemCompletionState;

      // Call the method to mark task as not completed
      updateMethod.call(uiController, taskItem, false);

      // Verify the completed class is removed
      expect(taskItem.classList.contains('completed')).toBe(false);
    });

    it('should handle multiple calls correctly', () => {
      const updateMethod = (uiController as any).updateTaskItemCompletionState;

      // Initially not completed
      expect(taskItem.classList.contains('completed')).toBe(false);

      // Mark as completed
      updateMethod.call(uiController, taskItem, true);
      expect(taskItem.classList.contains('completed')).toBe(true);

      // Mark as not completed
      updateMethod.call(uiController, taskItem, false);
      expect(taskItem.classList.contains('completed')).toBe(false);

      // Mark as completed again
      updateMethod.call(uiController, taskItem, true);
      expect(taskItem.classList.contains('completed')).toBe(true);
    });

    it("should not add duplicate 'completed' classes", () => {
      const updateMethod = (uiController as any).updateTaskItemCompletionState;

      // Mark as completed twice
      updateMethod.call(uiController, taskItem, true);
      updateMethod.call(uiController, taskItem, true);

      // Should only have one 'completed' class
      const completedClasses = taskItem.className
        .split(' ')
        .filter(cls => cls === 'completed');
      expect(completedClasses.length).toBe(1);
      expect(taskItem.classList.contains('completed')).toBe(true);
    });

    it("should not throw error when removing non-existent 'completed' class", () => {
      const updateMethod = (uiController as any).updateTaskItemCompletionState;

      // Initially not completed
      expect(taskItem.classList.contains('completed')).toBe(false);

      // Try to remove completed class (should not throw)
      expect(() => {
        updateMethod.call(uiController, taskItem, false);
      }).not.toThrow();

      // Should still not be completed
      expect(taskItem.classList.contains('completed')).toBe(false);
    });
  });

  describe('CSS class integration with strikethrough styling', () => {
    it('should apply strikethrough when completed class is added', () => {
      // Create a task item with proper structure
      const taskItem = document.createElement('li');
      taskItem.className = 'task-item';
      taskItem.innerHTML = `
        <div class="task-content">
          <span class="task-text">Test task</span>
        </div>
      `;

      // Add CSS for testing
      const style = document.createElement('style');
      style.textContent = `
        .task-item.completed .task-text {
          text-decoration: line-through;
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(taskItem);

      const taskText = taskItem.querySelector('.task-text') as HTMLElement;

      // Initially should not have strikethrough
      const initialStyle = window.getComputedStyle(taskText);
      expect(initialStyle.textDecoration).not.toContain('line-through');

      // Add completed class
      taskItem.classList.add('completed');

      // Should now have strikethrough
      const completedStyle = window.getComputedStyle(taskText);
      expect(completedStyle.textDecoration).toContain('line-through');

      // Clean up
      document.head.removeChild(style);
      document.body.removeChild(taskItem);
    });
  });
});
