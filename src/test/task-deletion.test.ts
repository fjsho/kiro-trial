import { describe, it, expect, beforeEach, vi } from "vitest";
import { UIController } from "../controllers/UIController.js";

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
    Object.keys(localStorageData).forEach(
      (key) => delete localStorageData[key]
    );
  }),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Task Deletion Integration Tests", () => {
  let container: HTMLElement;

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

    container = document.getElementById("app")!;
  });

  it("should delete task when delete button is clicked", async () => {
    // Initialize UIController
    const uiController = new UIController();

    // Add a task first
    const taskInput = document.getElementById(
      "new-task-input"
    ) as HTMLInputElement;
    const addForm = document.getElementById("add-task-form") as HTMLFormElement;

    taskInput.value = "Test task to delete";
    addForm.dispatchEvent(new Event("submit"));

    // Wait for task to be added
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Verify task was added
    const taskList = document.getElementById("task-list")!;
    expect(taskList.children.length).toBe(1);

    // Find the delete button
    const deleteButton = taskList.querySelector(
      ".delete-btn"
    ) as HTMLButtonElement;
    expect(deleteButton).toBeTruthy();
    expect(deleteButton.textContent?.trim()).toBe("×");

    // Click the delete button
    deleteButton.click();

    // Wait for deletion to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Verify task was deleted from DOM
    expect(taskList.children.length).toBe(0);

    // Verify empty state is shown
    const emptyState = document.getElementById("empty-state")!;
    expect(emptyState.style.display).toBe("block");

    // Verify stats are updated
    const statsText = document.getElementById("stats-text")!;
    expect(statsText.textContent).toBe("0 個中 0 個完了");
  });

  it("should delete the correct task when multiple tasks exist", async () => {
    // Initialize UIController
    const uiController = new UIController();

    // Add multiple tasks
    const taskInput = document.getElementById(
      "new-task-input"
    ) as HTMLInputElement;
    const addForm = document.getElementById("add-task-form") as HTMLFormElement;

    // Add first task
    taskInput.value = "First task";
    addForm.dispatchEvent(new Event("submit"));
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Add second task
    taskInput.value = "Second task";
    addForm.dispatchEvent(new Event("submit"));
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Add third task
    taskInput.value = "Third task";
    addForm.dispatchEvent(new Event("submit"));
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Verify all tasks were added
    const taskList = document.getElementById("task-list")!;
    expect(taskList.children.length).toBe(3);

    // Get the second task's delete button
    const secondTaskItem = taskList.children[1] as HTMLElement;
    const secondTaskText = secondTaskItem.querySelector(".task-text")!;
    expect(secondTaskText.textContent).toBe("Second task");

    const deleteButton = secondTaskItem.querySelector(
      ".delete-btn"
    ) as HTMLButtonElement;
    expect(deleteButton).toBeTruthy();

    // Click the delete button for the second task
    deleteButton.click();

    // Wait for deletion to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Verify only the second task was deleted
    expect(taskList.children.length).toBe(2);

    // Verify remaining tasks are correct
    const remainingTasks = Array.from(taskList.children).map(
      (item) => item.querySelector(".task-text")!.textContent
    );
    expect(remainingTasks).toEqual(["First task", "Third task"]);

    // Verify stats are updated
    const statsText = document.getElementById("stats-text")!;
    expect(statsText.textContent).toBe("2 個中 0 個完了");
  });
});
