import { describe, it, expect, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/dom";
import { UIController } from "../controllers/UIController.js";

describe("Task Addition E2E", () => {
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

  it("should add a new task when user enters text and clicks add button", async () => {
    // Arrange
    const taskInput = screen.getByRole("textbox") as HTMLInputElement;
    const form = document.getElementById("add-task-form") as HTMLFormElement;
    const taskList = document.getElementById("task-list")!;

    const taskText = "テストタスク";

    // Act
    fireEvent.change(taskInput, { target: { value: taskText } });
    fireEvent.submit(form);

    // Wait for async operation to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

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

    // Wait for async operation to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

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

    // Wait for any potential async operation
    await new Promise((resolve) => setTimeout(resolve, 0));

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

    // Wait for async operation to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Assert
    const taskItems = taskList.querySelectorAll(".task-item");
    expect(taskItems).toHaveLength(1);

    const addedTask = taskItems[0];
    const taskTextElement = addedTask.querySelector(".task-text");
    expect(taskTextElement).toHaveTextContent(taskText);

    // Verify input field is cleared after adding task
    expect(taskInput.value).toBe("");
  });

  it("should NOT add a task when empty string is submitted", async () => {
    // Arrange
    const taskInput = screen.getByRole("textbox") as HTMLInputElement;
    const form = document.getElementById("add-task-form") as HTMLFormElement;
    const taskList = document.getElementById("task-list")!;

    // Act - Try to submit empty string
    fireEvent.change(taskInput, { target: { value: "" } });
    fireEvent.submit(form);

    // Wait for any potential async operation
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Assert
    const taskItems = taskList.querySelectorAll(".task-item");
    expect(taskItems).toHaveLength(0); // No task should be added

    // Verify input field remains empty
    expect(taskInput.value).toBe("");
  });

  it("should NOT add a task when only whitespace is submitted", async () => {
    // Arrange
    const taskInput = screen.getByRole("textbox") as HTMLInputElement;
    const form = document.getElementById("add-task-form") as HTMLFormElement;
    const taskList = document.getElementById("task-list")!;

    const whitespaceText = "   \t  ";

    // Act - Try to submit only whitespace
    fireEvent.change(taskInput, { target: { value: whitespaceText } });
    fireEvent.submit(form);

    // Wait for any potential async operation
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Assert
    const taskItems = taskList.querySelectorAll(".task-item");
    expect(taskItems).toHaveLength(0); // No task should be added

    // Verify input field retains original value (not cleared since validation failed)
    expect(taskInput.value).toBe(whitespaceText);
  });

  it("should NOT add a task when empty string is submitted via Enter key", async () => {
    // Arrange
    const taskInput = screen.getByRole("textbox") as HTMLInputElement;
    const taskList = document.getElementById("task-list")!;

    // Act - Try to submit empty string via Enter key
    fireEvent.change(taskInput, { target: { value: "" } });
    fireEvent.keyDown(taskInput, {
      key: "Enter",
      code: "Enter",
      isComposing: false,
    });

    // Wait for any potential async operation
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Assert
    const taskItems = taskList.querySelectorAll(".task-item");
    expect(taskItems).toHaveLength(0); // No task should be added

    // Verify input field remains empty
    expect(taskInput.value).toBe("");
  });

  it("should NOT add a task when text exceeds maximum length", async () => {
    // Arrange
    const taskInput = screen.getByRole("textbox") as HTMLInputElement;
    const form = document.getElementById("add-task-form") as HTMLFormElement;
    const taskList = document.getElementById("task-list")!;

    // Create a string longer than 500 characters
    const longText = "a".repeat(501);

    // Act - Try to submit text that exceeds maximum length
    fireEvent.change(taskInput, { target: { value: longText } });
    fireEvent.submit(form);

    // Wait for any potential async operation
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Assert
    const taskItems = taskList.querySelectorAll(".task-item");
    expect(taskItems).toHaveLength(0); // No task should be added

    // Verify input field retains the long text
    expect(taskInput.value).toBe(longText);
  });

  it("should persist added tasks to LocalStorage and display them in the list", async () => {
    // Arrange
    const taskInput = screen.getByRole("textbox") as HTMLInputElement;
    const form = document.getElementById("add-task-form") as HTMLFormElement;
    const taskList = document.getElementById("task-list")!;

    const taskText1 = "永続化テストタスク1";
    const taskText2 = "永続化テストタスク2";

    // Act - Add first task
    fireEvent.change(taskInput, { target: { value: taskText1 } });
    fireEvent.submit(form);

    // Wait for async operation to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Add second task
    fireEvent.change(taskInput, { target: { value: taskText2 } });
    fireEvent.submit(form);

    // Wait for async operation to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Assert - Tasks should be displayed in the list
    const taskItems = taskList.querySelectorAll(".task-item");
    expect(taskItems).toHaveLength(2);

    const firstTaskText = taskItems[0].querySelector(".task-text");
    const secondTaskText = taskItems[1].querySelector(".task-text");
    expect(firstTaskText).toHaveTextContent(taskText1);
    expect(secondTaskText).toHaveTextContent(taskText2);

    // Assert - Tasks should be persisted in LocalStorage
    const storedTasks = localStorage.getItem("todoApp_tasks");
    expect(storedTasks).toBeTruthy();

    const parsedTasks = JSON.parse(storedTasks!);
    expect(parsedTasks).toHaveLength(2);
    expect(parsedTasks[0].text).toBe(taskText1);
    expect(parsedTasks[0].completed).toBe(false);
    expect(parsedTasks[1].text).toBe(taskText2);
    expect(parsedTasks[1].completed).toBe(false);

    // Verify task IDs are generated and stored
    expect(parsedTasks[0].id).toBeTruthy();
    expect(parsedTasks[1].id).toBeTruthy();
    expect(parsedTasks[0].id).not.toBe(parsedTasks[1].id);

    // Verify createdAt timestamps are stored
    expect(parsedTasks[0].createdAt).toBeTruthy();
    expect(parsedTasks[1].createdAt).toBeTruthy();
  });

  it("should load and display tasks from LocalStorage on initialization", async () => {
    // Arrange - Pre-populate LocalStorage with tasks
    const existingTasks = [
      {
        id: "test-id-1",
        text: "既存タスク1",
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "test-id-2",
        text: "既存タスク2",
        completed: true,
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem("todoApp_tasks", JSON.stringify(existingTasks));

    // Re-initialize the DOM and UIController to simulate page reload
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
              <!-- Tasks will be loaded here -->
            </ul>
          </section>
        </main>
      </div>
    `;

    // Act - Initialize UIController (should load tasks from LocalStorage)
    new UIController();

    // Wait for async initialization to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Assert - Tasks should be displayed in the list
    const taskList = document.getElementById("task-list")!;
    const taskItems = taskList.querySelectorAll(".task-item");
    expect(taskItems).toHaveLength(2);

    const firstTaskText = taskItems[0].querySelector(".task-text");
    const secondTaskText = taskItems[1].querySelector(".task-text");
    expect(firstTaskText).toHaveTextContent("既存タスク1");
    expect(secondTaskText).toHaveTextContent("既存タスク2");

    // Verify completed task has proper checkbox state
    const firstCheckbox = taskItems[0].querySelector(
      ".task-checkbox"
    ) as HTMLInputElement;
    const secondCheckbox = taskItems[1].querySelector(
      ".task-checkbox"
    ) as HTMLInputElement;
    expect(firstCheckbox.checked).toBe(false);
    expect(secondCheckbox.checked).toBe(true);
  });

  it("should clear the input field after successfully adding a task via form submission", async () => {
    // Arrange
    const taskInput = screen.getByRole("textbox") as HTMLInputElement;
    const form = document.getElementById("add-task-form") as HTMLFormElement;
    const taskText = "入力フィールドクリアテスト";

    // Act
    fireEvent.change(taskInput, { target: { value: taskText } });

    // Verify input has the text before submission
    expect(taskInput.value).toBe(taskText);

    fireEvent.submit(form);

    // Wait for async operation to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Assert - Input field should be cleared after successful task addition
    expect(taskInput.value).toBe("");
  });

  it("should clear the input field after successfully adding a task via Enter key", async () => {
    // Arrange
    const taskInput = screen.getByRole("textbox") as HTMLInputElement;
    const taskText = "Enterキーでの入力フィールドクリアテスト";

    // Act
    fireEvent.change(taskInput, { target: { value: taskText } });

    // Verify input has the text before submission
    expect(taskInput.value).toBe(taskText);

    fireEvent.keyDown(taskInput, {
      key: "Enter",
      code: "Enter",
      isComposing: false,
    });

    // Wait for async operation to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Assert - Input field should be cleared after successful task addition
    expect(taskInput.value).toBe("");
  });

  it("should NOT clear the input field when task addition fails due to validation", async () => {
    // Arrange
    const taskInput = screen.getByRole("textbox") as HTMLInputElement;
    const form = document.getElementById("add-task-form") as HTMLFormElement;
    const invalidText = "   "; // Only whitespace - should fail validation

    // Act
    fireEvent.change(taskInput, { target: { value: invalidText } });

    // Verify input has the invalid text before submission
    expect(taskInput.value).toBe(invalidText);

    fireEvent.submit(form);

    // Wait for any potential async operation
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Assert - Input field should NOT be cleared when validation fails
    expect(taskInput.value).toBe(invalidText);

    // Verify no task was added
    const taskList = document.getElementById("task-list")!;
    const taskItems = taskList.querySelectorAll(".task-item");
    expect(taskItems).toHaveLength(0);
  });
});
