import { describe, it, expect, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/dom";
import { UIController } from "../controllers/UIController.js";

describe("Task Completion Persistence E2E", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Set up DOM with the HTML structure
    document.body.innerHTML = `
      <div id="app">
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
              <!-- Tasks will be added here -->
            </ul>
            <div id="empty-state" style="display: none;">
              タスクがありません
            </div>
          </section>
          <section class="stats-section">
            <div id="stats-text">0 個中 0 個完了</div>
          </section>
        </main>
      </div>
    `;

    // Initialize the UIController
    new UIController();
  });

  it("should persist task completion state changes to LocalStorage", async () => {
    // Arrange - Add a task first
    const taskInput = screen.getByRole("textbox") as HTMLInputElement;
    const form = document.getElementById("add-task-form") as HTMLFormElement;
    const taskList = document.getElementById("task-list")!;

    const taskText = "完了状態永続化テスト";

    // Add a task
    fireEvent.change(taskInput, { target: { value: taskText } });
    fireEvent.submit(form);

    // Wait for async operation to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Get the added task
    const taskItems = taskList.querySelectorAll(".task-item");
    expect(taskItems).toHaveLength(1);

    const taskItem = taskItems[0] as HTMLElement;
    const checkbox = taskItem.querySelector(
      ".task-checkbox"
    ) as HTMLInputElement;

    // Verify initial state in localStorage - task should be uncompleted
    let storedTasks = JSON.parse(localStorage.getItem("todoApp_tasks") || "[]");
    expect(storedTasks).toHaveLength(1);
    expect(storedTasks[0].completed).toBe(false);
    expect(storedTasks[0].text).toBe(taskText);

    // Act - Toggle task to completed
    fireEvent.click(checkbox);

    // Wait for async operation to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Assert - Task completion should be persisted to localStorage
    storedTasks = JSON.parse(localStorage.getItem("todoApp_tasks") || "[]");
    expect(storedTasks).toHaveLength(1);
    expect(storedTasks[0].completed).toBe(true);
    expect(storedTasks[0].text).toBe(taskText);

    // Act - Toggle task back to uncompleted
    fireEvent.click(checkbox);

    // Wait for async operation to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Assert - Task completion should be persisted to localStorage
    storedTasks = JSON.parse(localStorage.getItem("todoApp_tasks") || "[]");
    expect(storedTasks).toHaveLength(1);
    expect(storedTasks[0].completed).toBe(false);
    expect(storedTasks[0].text).toBe(taskText);
  });

  it("should maintain task completion state after page reload simulation", async () => {
    // Arrange - Add a task and mark it as completed
    const taskInput = screen.getByRole("textbox") as HTMLInputElement;
    const form = document.getElementById("add-task-form") as HTMLFormElement;
    const taskList = document.getElementById("task-list")!;

    const taskText = "リロード後永続化テスト";

    // Add a task
    fireEvent.change(taskInput, { target: { value: taskText } });
    fireEvent.submit(form);

    // Wait for async operation to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Get the added task and mark it as completed
    const taskItems = taskList.querySelectorAll(".task-item");
    const taskItem = taskItems[0] as HTMLElement;
    const checkbox = taskItem.querySelector(
      ".task-checkbox"
    ) as HTMLInputElement;

    // Mark as completed
    fireEvent.click(checkbox);
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Verify it's completed in localStorage
    let storedTasks = JSON.parse(localStorage.getItem("todoApp_tasks") || "[]");
    expect(storedTasks[0].completed).toBe(true);

    // Act - Simulate page reload by reinitializing the UI
    // Clear the DOM and reinitialize
    document.body.innerHTML = `
      <div id="app">
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
              <!-- Tasks will be added here -->
            </ul>
            <div id="empty-state" style="display: none;">
              タスクがありません
            </div>
          </section>
          <section class="stats-section">
            <div id="stats-text">0 個中 0 個完了</div>
          </section>
        </main>
      </div>
    `;

    // Reinitialize the UIController (simulating page reload)
    new UIController();

    // Wait for initialization to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Assert - Task should be loaded from localStorage with completed state
    const reloadedTaskList = document.getElementById("task-list")!;
    const reloadedTaskItems = reloadedTaskList.querySelectorAll(".task-item");
    expect(reloadedTaskItems).toHaveLength(1);

    const reloadedTaskItem = reloadedTaskItems[0] as HTMLElement;
    const reloadedCheckbox = reloadedTaskItem.querySelector(
      ".task-checkbox"
    ) as HTMLInputElement;

    // Verify the task is still completed after reload
    expect(reloadedCheckbox.checked).toBe(true);
    expect(reloadedTaskItem.classList.contains("completed")).toBe(true);

    // Verify localStorage still contains the completed task
    storedTasks = JSON.parse(localStorage.getItem("todoApp_tasks") || "[]");
    expect(storedTasks).toHaveLength(1);
    expect(storedTasks[0].completed).toBe(true);
    expect(storedTasks[0].text).toBe(taskText);
  });
});
