/**
 * Unit Test: UIController 編集キャンセルロジックの詳細テスト
 * cancelEdit() と exitEditMode() メソッドの単体テスト
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { UIController } from "../controllers/UIController.js";

describe("UIController Edit Cancel Logic - Unit Test", () => {
  let controller: UIController;

  beforeEach(() => {
    // Reset DOM
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
        
        <ul id="task-list" role="list" aria-label="タスクリスト"></ul>
        
        <div id="stats">
          <span id="stats-text">0 個中 0 個完了</span>
        </div>
        
        <div id="empty-state" style="display: block;">
          タスクがありません
        </div>
      </div>
    `;

    // Clear localStorage
    localStorage.clear();

    // Create controller instance
    controller = new UIController();
  });

  describe("cancelEdit method", () => {
    it("should call exitEditMode when cancelEdit is invoked", () => {
      // Spy on the exitEditMode method
      const exitEditModeSpy = vi.spyOn(controller as any, "exitEditMode");

      // Call cancelEdit method directly
      (controller as any).cancelEdit();

      // Verify exitEditMode was called
      expect(exitEditModeSpy).toHaveBeenCalledOnce();
    });
  });

  describe("exitEditMode method", () => {
    it("should do nothing when no task is being edited", () => {
      // Ensure no task is being edited
      (controller as any).editingTaskId = null;

      // Call exitEditMode
      (controller as any).exitEditMode();

      // Should not throw any errors and complete successfully
      expect((controller as any).editingTaskId).toBeNull();
    });

    it("should clear editing state when task item is not found", () => {
      // Set editing state for non-existent task
      (controller as any).editingTaskId = "non-existent-task-id";

      // Call exitEditMode
      (controller as any).exitEditMode();

      // Should clear editing state
      expect((controller as any).editingTaskId).toBeNull();
    });

    it("should remove edit input and show original text when exiting edit mode", () => {
      // Create a mock task item in DOM
      const taskId = "test-task-id";
      const taskItem = document.createElement("li");
      taskItem.className = "task-item";
      taskItem.setAttribute("data-task-id", taskId);

      // Create task text element
      const taskText = document.createElement("span");
      taskText.className = "task-text";
      taskText.textContent = "Original text";
      taskText.style.display = "none"; // Hidden during edit

      // Create edit input element
      const editInput = document.createElement("input");
      editInput.className = "task-edit-input";
      editInput.value = "Modified text";

      // Add elements to task item
      taskItem.appendChild(taskText);
      taskItem.appendChild(editInput);

      // Add task item to DOM
      document.body.appendChild(taskItem);

      // Set editing state
      (controller as any).editingTaskId = taskId;

      // Call exitEditMode
      (controller as any).exitEditMode();

      // Verify edit input was removed
      const editInputAfter = taskItem.querySelector(".task-edit-input");
      expect(editInputAfter).toBeNull();

      // Verify task text is visible again
      expect(taskText.style.display).toBe("");

      // Verify editing state is cleared
      expect((controller as any).editingTaskId).toBeNull();
    });

    it("should handle missing task text element gracefully", () => {
      // Create a mock task item without task text element
      const taskId = "test-task-id";
      const taskItem = document.createElement("li");
      taskItem.className = "task-item";
      taskItem.setAttribute("data-task-id", taskId);

      // Create edit input element only
      const editInput = document.createElement("input");
      editInput.className = "task-edit-input";
      editInput.value = "Modified text";

      // Add elements to task item
      taskItem.appendChild(editInput);

      // Add task item to DOM
      document.body.appendChild(taskItem);

      // Set editing state
      (controller as any).editingTaskId = taskId;

      // Call exitEditMode - should not throw error
      expect(() => {
        (controller as any).exitEditMode();
      }).not.toThrow();

      // Verify edit input was still removed
      const editInputAfter = taskItem.querySelector(".task-edit-input");
      expect(editInputAfter).toBeNull();

      // Verify editing state is cleared
      expect((controller as any).editingTaskId).toBeNull();
    });

    it("should handle missing edit input element gracefully", () => {
      // Create a mock task item without edit input element
      const taskId = "test-task-id";
      const taskItem = document.createElement("li");
      taskItem.className = "task-item";
      taskItem.setAttribute("data-task-id", taskId);

      // Create task text element only
      const taskText = document.createElement("span");
      taskText.className = "task-text";
      taskText.textContent = "Original text";
      taskText.style.display = "none"; // Hidden during edit

      // Add elements to task item
      taskItem.appendChild(taskText);

      // Add task item to DOM
      document.body.appendChild(taskItem);

      // Set editing state
      (controller as any).editingTaskId = taskId;

      // Call exitEditMode - should not throw error
      expect(() => {
        (controller as any).exitEditMode();
      }).not.toThrow();

      // Verify task text is visible again
      expect(taskText.style.display).toBe("");

      // Verify editing state is cleared
      expect((controller as any).editingTaskId).toBeNull();
    });
  });

  describe("handleEditKeyDown method", () => {
    it("should call cancelEdit when Escape key is pressed", async () => {
      // Spy on the cancelEdit method
      const cancelEditSpy = vi.spyOn(controller as any, "cancelEdit");

      // Create mock edit input
      const editInput = document.createElement("input");
      editInput.className = "task-edit-input";
      editInput.setAttribute("data-task-id", "test-task-id");

      // Create Escape key event
      const escapeEvent = new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
      });

      // Spy on preventDefault
      const preventDefaultSpy = vi.spyOn(escapeEvent, "preventDefault");

      // Call handleEditKeyDown method directly
      await (controller as any).handleEditKeyDown(escapeEvent);

      // Verify preventDefault was called
      expect(preventDefaultSpy).toHaveBeenCalledOnce();

      // Verify cancelEdit was called
      expect(cancelEditSpy).toHaveBeenCalledOnce();
    });

    it("should not call cancelEdit for non-Escape keys", async () => {
      // Spy on the cancelEdit method
      const cancelEditSpy = vi.spyOn(controller as any, "cancelEdit");

      // Create mock edit input
      const editInput = document.createElement("input");
      editInput.className = "task-edit-input";
      editInput.setAttribute("data-task-id", "test-task-id");

      // Create non-Escape key event
      const keyEvent = new KeyboardEvent("keydown", {
        key: "a",
        bubbles: true,
        cancelable: true,
      });

      // Call handleEditKeyDown method directly
      await (controller as any).handleEditKeyDown(keyEvent);

      // Verify cancelEdit was NOT called
      expect(cancelEditSpy).not.toHaveBeenCalled();
    });
  });
});
