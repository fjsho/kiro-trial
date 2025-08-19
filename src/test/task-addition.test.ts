import { describe, it, expect, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/dom";
import { UIController } from "../controllers/UIController.js";

describe("Task Addition E2E", () => {
  beforeEach(() => {
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

  it("should add a new task when user enters text and clicks add button", async () => {
    // Arrange
    const taskInput = screen.getByRole("textbox") as HTMLInputElement;
    const form = document.getElementById("add-task-form") as HTMLFormElement;
    const taskList = document.getElementById("task-list")!;

    const taskText = "テストタスク";

    // Act
    fireEvent.change(taskInput, { target: { value: taskText } });
    fireEvent.submit(form);

    // Assert
    const taskItems = taskList.querySelectorAll(".task-item");
    expect(taskItems).toHaveLength(1);

    const addedTask = taskItems[0];
    const taskTextElement = addedTask.querySelector(".task-text");
    expect(taskTextElement).toHaveTextContent(taskText);

    // Verify the task has proper structure
    const checkbox = addedTask.querySelector(
      ".task-checkbox"
    ) as HTMLInputElement;
    expect(checkbox).toBeTruthy();
    expect(checkbox.checked).toBe(false);

    const deleteButton = addedTask.querySelector(".delete-btn");
    expect(deleteButton).toBeTruthy();
  });

  it("should add a new task when user enters text and presses Enter key", async () => {
    // Arrange
    const taskInput = screen.getByRole("textbox") as HTMLInputElement;
    const taskList = document.getElementById("task-list")!;

    const taskText = "Enterキーで追加されるタスク";

    // Act
    fireEvent.change(taskInput, { target: { value: taskText } });
    fireEvent.keyDown(taskInput, { key: "Enter", code: "Enter" });

    // Assert
    const taskItems = taskList.querySelectorAll(".task-item");
    expect(taskItems).toHaveLength(1);

    const addedTask = taskItems[0];
    const taskTextElement = addedTask.querySelector(".task-text");
    expect(taskTextElement).toHaveTextContent(taskText);

    // Verify the task has proper structure
    const checkbox = addedTask.querySelector(
      ".task-checkbox"
    ) as HTMLInputElement;
    expect(checkbox).toBeTruthy();
    expect(checkbox.checked).toBe(false);

    const deleteButton = addedTask.querySelector(".delete-btn");
    expect(deleteButton).toBeTruthy();

    // Verify input field is cleared after adding task
    expect(taskInput.value).toBe("");
  });

  it("should NOT add a task when Enter key is pressed during IME composition", async () => {
    // Arrange
    const taskInput = screen.getByRole("textbox") as HTMLInputElement;
    const taskList = document.getElementById("task-list")!;

    const taskText = "日本語入力テスト";

    // Act
    fireEvent.change(taskInput, { target: { value: taskText } });
    // Simulate Enter key press during IME composition (isComposing: true)
    fireEvent.keyDown(taskInput, {
      key: "Enter",
      code: "Enter",
      isComposing: true,
    });

    // Assert
    const taskItems = taskList.querySelectorAll(".task-item");
    expect(taskItems).toHaveLength(0); // No task should be added

    // Verify input field still contains the text
    expect(taskInput.value).toBe(taskText);
  });

  it("should add a task when Enter key is pressed after IME composition is complete", async () => {
    // Arrange
    const taskInput = screen.getByRole("textbox") as HTMLInputElement;
    const taskList = document.getElementById("task-list")!;

    const taskText = "日本語入力完了テスト";

    // Act
    fireEvent.change(taskInput, { target: { value: taskText } });
    // Simulate Enter key press after IME composition is complete (isComposing: false)
    fireEvent.keyDown(taskInput, {
      key: "Enter",
      code: "Enter",
      isComposing: false,
    });

    // Assert
    const taskItems = taskList.querySelectorAll(".task-item");
    expect(taskItems).toHaveLength(1);

    const addedTask = taskItems[0];
    const taskTextElement = addedTask.querySelector(".task-text");
    expect(taskTextElement).toHaveTextContent(taskText);

    // Verify input field is cleared after adding task
    expect(taskInput.value).toBe("");
  });
});
