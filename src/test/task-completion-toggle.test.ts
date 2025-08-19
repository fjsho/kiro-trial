import { describe, it, expect, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/dom";
import { UIController } from "../controllers/UIController.js";

describe("Task Completion Toggle E2E", () => {
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
          </section>
        </main>
      </div>
    `;

    // Initialize the UIController
    new UIController();
  });

  it("should toggle task completion state when checkbox is clicked", async () => {
    // Arrange - Add a task first
    const taskInput = screen.getByRole("textbox") as HTMLInputElement;
    const form = document.getElementById("add-task-form") as HTMLFormElement;
    const taskList = document.getElementById("task-list")!;

    const taskText = "完了状態切り替えテスト";

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

    // Verify initial state - task should be uncompleted
    expect(checkbox.checked).toBe(false);
    expect(taskItem.classList.contains("completed")).toBe(false);

    // Act - Click the checkbox to toggle completion
    fireEvent.click(checkbox);

    // Wait for async operation to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Assert - Task should now be completed
    expect(checkbox.checked).toBe(true);
    expect(taskItem.classList.contains("completed")).toBe(true);

    // Act - Click the checkbox again to toggle back
    fireEvent.click(checkbox);

    // Wait for async operation to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Assert - Task should now be uncompleted again
    expect(checkbox.checked).toBe(false);
    expect(taskItem.classList.contains("completed")).toBe(false);
  });

  it("should persist task completion state to LocalStorage", async () => {
    // Arrange - Add a task first
    const taskInput = screen.getByRole("textbox") as HTMLInputElement;
    const form = document.getElementById("add-task-form") as HTMLFormElement;
    const taskList = document.getElementById("task-list")!;

    const taskText = "永続化テストタスク";

    // Add a task
    fireEvent.change(taskInput, { target: { value: taskText } });
    fireEvent.submit(form);

    // Wait for async operation to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Get the added task
    const taskItems = taskList.querySelectorAll(".task-item");
    const taskItem = taskItems[0] as HTMLElement;
    const checkbox = taskItem.querySelector(
      ".task-checkbox"
    ) as HTMLInputElement;

    // Verify initial state in localStorage
    let storedTasks = JSON.parse(localStorage.getItem("todoApp_tasks") || "[]");
    expect(storedTasks).toHaveLength(1);
    expect(storedTasks[0].completed).toBe(false);

    // Act - Toggle task to completed
    fireEvent.click(checkbox);

    // Wait for async operation to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Assert - Task completion should be persisted to localStorage
    storedTasks = JSON.parse(localStorage.getItem("todoApp_tasks") || "[]");
    expect(storedTasks).toHaveLength(1);
    expect(storedTasks[0].completed).toBe(true);

    // Act - Toggle task back to uncompleted
    fireEvent.click(checkbox);

    // Wait for async operation to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Assert - Task completion should be persisted to localStorage
    storedTasks = JSON.parse(localStorage.getItem("todoApp_tasks") || "[]");
    expect(storedTasks).toHaveLength(1);
    expect(storedTasks[0].completed).toBe(false);
  });
});
