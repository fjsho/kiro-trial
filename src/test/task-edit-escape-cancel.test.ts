/**
 * Integration Test: Escape キーで編集がキャンセルされる
 * E2E レベルでの編集キャンセル確認
 */

import { beforeEach, describe, expect, it } from "vitest";

describe("Task Edit Escape Cancel - Integration Test", () => {
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
  });

  it("should cancel edit and restore original text when Escape key is pressed", async () => {
    // Import UIController dynamically to ensure fresh instance
    const { UIController } = await import("../controllers/UIController.js");
    const controller = new UIController();

    // Add a task first
    const taskInput = document.getElementById(
      "new-task-input"
    ) as HTMLInputElement;
    const originalText = "Original task text";
    taskInput.value = originalText;

    // Trigger task addition
    const form = document.getElementById("add-task-form") as HTMLFormElement;
    form.dispatchEvent(new Event("submit"));

    // Wait for task to be added to DOM
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Find the task item
    const taskItem = document.querySelector(".task-item") as HTMLElement;
    expect(taskItem).toBeTruthy();

    const taskText = taskItem.querySelector(".task-text") as HTMLElement;
    expect(taskText).toBeTruthy();
    expect(taskText.textContent).toBe(originalText);

    // Double-click to enter edit mode
    taskText.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));

    // Wait for edit mode to be activated
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Verify edit mode is active
    const editInput = taskItem.querySelector(
      ".task-edit-input"
    ) as HTMLInputElement;
    expect(editInput).toBeTruthy();
    expect(editInput.value).toBe(originalText);
    expect(taskText.style.display).toBe("none");

    // Modify the text in edit input
    const modifiedText = "Modified text that should be discarded";
    editInput.value = modifiedText;
    expect(editInput.value).toBe(modifiedText);

    // Press Escape key to cancel edit
    const escapeEvent = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });
    editInput.dispatchEvent(escapeEvent);

    // Wait for edit mode to be exited
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Verify edit mode is exited and original text is restored
    const editInputAfter = taskItem.querySelector(".task-edit-input");
    expect(editInputAfter).toBeNull(); // Edit input should be removed

    const taskTextAfter = taskItem.querySelector(".task-text") as HTMLElement;
    expect(taskTextAfter).toBeTruthy();
    expect(taskTextAfter.style.display).toBe(""); // Should be visible again
    expect(taskTextAfter.textContent).toBe(originalText); // Original text should be preserved

    // Verify the task was not updated in storage
    const tasks = JSON.parse(localStorage.getItem("todoApp_tasks") || "[]");
    expect(tasks).toHaveLength(1);
    expect(tasks[0].text).toBe(originalText);
  });

  it("should handle Escape key press when not in edit mode gracefully", async () => {
    // Import UIController dynamically to ensure fresh instance
    const { UIController } = await import("../controllers/UIController.js");
    const controller = new UIController();

    // Add a task first
    const taskInput = document.getElementById(
      "new-task-input"
    ) as HTMLInputElement;
    const originalText = "Test task";
    taskInput.value = originalText;

    // Trigger task addition
    const form = document.getElementById("add-task-form") as HTMLFormElement;
    form.dispatchEvent(new Event("submit"));

    // Wait for task to be added to DOM
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Find the task item
    const taskItem = document.querySelector(".task-item") as HTMLElement;
    expect(taskItem).toBeTruthy();

    const taskText = taskItem.querySelector(".task-text") as HTMLElement;
    expect(taskText).toBeTruthy();

    // Press Escape key when NOT in edit mode (should do nothing)
    const escapeEvent = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });
    taskText.dispatchEvent(escapeEvent);

    // Wait a moment
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Verify nothing changed
    expect(taskText.textContent).toBe(originalText);
    expect(taskText.style.display).toBe("");

    // Verify no edit input was created
    const editInput = taskItem.querySelector(".task-edit-input");
    expect(editInput).toBeNull();
  });
});
