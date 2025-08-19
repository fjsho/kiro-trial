import { describe, it, expect, beforeEach, vi } from "vitest";
import { UIController } from "../controllers/UIController.js";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal("localStorage", localStorageMock);

describe("Task Strikethrough Integration Tests", () => {
  let container: HTMLElement;
  let uiController: UIController;

  beforeEach(() => {
    // Reset localStorage mock
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();

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

    container = document.getElementById("app")!;
    uiController = new UIController();
  });

  describe("Completed task strikethrough display", () => {
    // Helper function to simulate task completion state change
    const setTaskCompletionState = (
      taskItem: HTMLElement,
      checkbox: HTMLInputElement,
      completed: boolean
    ) => {
      checkbox.checked = completed;
      if (completed) {
        taskItem.classList.add("completed");
      } else {
        taskItem.classList.remove("completed");
      }
    };

    it("should apply strikethrough styling when task is completed", async () => {
      // Add a task first
      const taskInput = document.getElementById(
        "new-task-input"
      ) as HTMLInputElement;
      const addButton = document.getElementById(
        "add-task-btn"
      ) as HTMLButtonElement;

      taskInput.value = "Test task for strikethrough";
      addButton.click();

      // Wait for task to be added
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Find the task item
      const taskList = document.getElementById("task-list")!;
      const taskItem = taskList.querySelector(".task-item") as HTMLElement;
      expect(taskItem).toBeTruthy();

      // Find the checkbox and task text
      const checkbox = taskItem.querySelector(
        ".task-checkbox"
      ) as HTMLInputElement;
      const taskText = taskItem.querySelector(".task-text") as HTMLElement;

      expect(checkbox).toBeTruthy();
      expect(taskText).toBeTruthy();

      // Initially, task should not be completed
      expect(taskItem.classList.contains("completed")).toBe(false);
      expect(checkbox.checked).toBe(false);

      // Check the computed style for strikethrough (should not have it initially)
      const initialStyle = window.getComputedStyle(taskText);
      expect(initialStyle.textDecoration).not.toContain("line-through");

      // Simulate task completion
      setTaskCompletionState(taskItem, checkbox, true);

      // Verify the task item has the completed class
      expect(taskItem.classList.contains("completed")).toBe(true);
      expect(checkbox.checked).toBe(true);

      // Verify the strikethrough styling is applied
      const completedStyle = window.getComputedStyle(taskText);
      expect(completedStyle.textDecoration).toContain("line-through");
    });

    it("should remove strikethrough styling when task is uncompleted", async () => {
      // Add a task first
      const taskInput = document.getElementById(
        "new-task-input"
      ) as HTMLInputElement;
      const addButton = document.getElementById(
        "add-task-btn"
      ) as HTMLButtonElement;

      taskInput.value = "Test task for strikethrough removal";
      addButton.click();

      // Wait for task to be added
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Find the task item and elements
      const taskList = document.getElementById("task-list")!;
      const taskItem = taskList.querySelector(".task-item") as HTMLElement;
      const checkbox = taskItem.querySelector(
        ".task-checkbox"
      ) as HTMLInputElement;
      const taskText = taskItem.querySelector(".task-text") as HTMLElement;

      // Complete the task first
      setTaskCompletionState(taskItem, checkbox, true);

      // Verify it's completed with strikethrough
      expect(taskItem.classList.contains("completed")).toBe(true);
      const completedStyle = window.getComputedStyle(taskText);
      expect(completedStyle.textDecoration).toContain("line-through");

      // Uncomplete the task
      setTaskCompletionState(taskItem, checkbox, false);

      // Verify the completed class is removed
      expect(taskItem.classList.contains("completed")).toBe(false);
      expect(checkbox.checked).toBe(false);

      // Verify the strikethrough styling is removed
      const uncompletedStyle = window.getComputedStyle(taskText);
      expect(uncompletedStyle.textDecoration).not.toContain("line-through");
    });
  });
});
