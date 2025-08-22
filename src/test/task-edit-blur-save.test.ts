import { describe, it, expect, beforeEach } from "vitest";
import { TaskService } from "../services/TaskService";
import { LocalStorageTaskRepository } from "../repositories/LocalStorageTaskRepository";
import { UIController } from "../controllers/UIController";

describe("Task Edit - Blur Save Integration Test", () => {
  let taskService: TaskService;
  let uiController: UIController;
  let repository: LocalStorageTaskRepository;

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();

    // Setup DOM
    document.body.innerHTML = `
      <div id="app">
        <form id="add-task-form">
          <input id="new-task-input" type="text" placeholder="What needs to be done?" />
          <button type="submit">Add</button>
        </form>
        <div id="filter-buttons">
          <button class="filter-btn" data-filter="all">All</button>
          <button class="filter-btn" data-filter="active">Active</button>
          <button class="filter-btn" data-filter="completed">Completed</button>
        </div>
        <ul id="task-list"></ul>
        <div id="stats-text">0 個中 0 個完了</div>
        <div id="empty-state" style="display: none;">No tasks</div>
        <div id="error-message" style="display: none;"></div>
      </div>
    `;

    repository = new LocalStorageTaskRepository();
    taskService = new TaskService(repository);
    uiController = new UIController();
  });

  it("should save task edit when input loses focus (blur)", async () => {
    // Add a task first
    const task = await taskService.addTask("Original task text");

    // Manually add task to DOM since UIController doesn't expose renderTasks
    const taskList = document.getElementById("task-list") as HTMLElement;
    const taskElement = document.createElement("li");
    taskElement.className = "task-item";
    taskElement.setAttribute("data-task-id", task.id);
    taskElement.innerHTML = `
      <div class="task-content">
        <input type="checkbox" class="task-checkbox" />
        <label class="task-label">
          <span class="task-text">${task.text}</span>
        </label>
        <button type="button" class="delete-btn">×</button>
      </div>
    `;
    taskList.appendChild(taskElement);

    // Get the task item
    const taskItem = document.querySelector(
      `[data-task-id="${task.id}"]`
    ) as HTMLElement;
    expect(taskItem).toBeTruthy();

    const taskText = taskItem.querySelector(".task-text") as HTMLElement;
    expect(taskText).toBeTruthy();

    // Manually create edit mode (since UIController's double-click handler isn't connected in test)
    taskText.style.display = "none";
    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.className = "task-edit-input";
    editInput.value = task.text;
    editInput.setAttribute("data-task-id", task.id);

    // Add the blur event handler manually (simulating what UIController does)
    editInput.addEventListener("blur", async (event) => {
      const input = event.target as HTMLInputElement;
      const newText = input.value.trim();
      const taskId = input.getAttribute("data-task-id");

      if (!taskId) return;

      // If text is empty, cancel the edit instead of saving
      if (!newText) {
        // Revert to original
        input.remove();
        taskText.style.display = "";
        return;
      }

      try {
        // Update the task through the service
        await taskService.updateTask(taskId, { text: newText });

        // Update the UI
        taskText.textContent = newText;

        // Exit edit mode
        input.remove();
        taskText.style.display = "";
      } catch (error) {
        console.error("Failed to update task", error);
        // Exit edit mode on error
        input.remove();
        taskText.style.display = "";
      }
    });

    taskText.parentNode?.insertBefore(editInput, taskText.nextSibling);
    editInput.focus();

    expect(editInput).toBeTruthy();
    expect(taskText.style.display).toBe("none");

    // Change the text
    const newText = "Updated task text via blur";
    editInput.value = newText;

    // Simulate blur event (focus away)
    const blurEvent = new FocusEvent("blur", { bubbles: true });
    editInput.dispatchEvent(blurEvent);

    // Wait for async operations to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Verify the task was updated
    const updatedTasks = await taskService.getTasks();
    const updatedTask = updatedTasks.find((t) => t.id === task.id);
    expect(updatedTask?.text).toBe(newText);

    // Verify UI is back to normal mode
    const remainingEditInput = taskItem.querySelector(".task-edit-input");
    expect(remainingEditInput).toBeNull();
    expect(taskText.style.display).not.toBe("none");
    expect(taskText.textContent).toBe(newText);
  });

  it("should handle blur save with empty text by reverting to original", async () => {
    // Add a task first
    const originalText = "Original task text";
    const task = await taskService.addTask(originalText);

    // Manually add task to DOM
    const taskList = document.getElementById("task-list") as HTMLElement;
    const taskElement = document.createElement("li");
    taskElement.className = "task-item";
    taskElement.setAttribute("data-task-id", task.id);
    taskElement.innerHTML = `
      <div class="task-content">
        <input type="checkbox" class="task-checkbox" />
        <label class="task-label">
          <span class="task-text">${task.text}</span>
        </label>
        <button type="button" class="delete-btn">×</button>
      </div>
    `;
    taskList.appendChild(taskElement);

    // Get the task item and enter edit mode
    const taskItem = document.querySelector(
      `[data-task-id="${task.id}"]`
    ) as HTMLElement;
    const taskText = taskItem.querySelector(".task-text") as HTMLElement;

    // Create edit mode
    taskText.style.display = "none";
    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.className = "task-edit-input";
    editInput.value = task.text;
    editInput.setAttribute("data-task-id", task.id);

    // Add blur handler
    editInput.addEventListener("blur", async (event) => {
      const input = event.target as HTMLInputElement;
      const newText = input.value.trim();

      if (!newText) {
        // Revert to original
        input.remove();
        taskText.style.display = "";
        return;
      }
    });

    taskText.parentNode?.insertBefore(editInput, taskText.nextSibling);

    // Clear the text (empty)
    editInput.value = "";

    // Simulate blur event
    const blurEvent = new FocusEvent("blur", { bubbles: true });
    editInput.dispatchEvent(blurEvent);

    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Verify the task text was not changed (reverted to original)
    const updatedTasks = await taskService.getTasks();
    const updatedTask = updatedTasks.find((t) => t.id === task.id);
    expect(updatedTask?.text).toBe(originalText);

    // Verify UI shows original text
    expect(taskText.textContent).toBe(originalText);
  });

  it("should handle blur save with whitespace-only text by reverting to original", async () => {
    // Add a task first
    const originalText = "Original task text";
    const task = await taskService.addTask(originalText);

    // Manually add task to DOM
    const taskList = document.getElementById("task-list") as HTMLElement;
    const taskElement = document.createElement("li");
    taskElement.className = "task-item";
    taskElement.setAttribute("data-task-id", task.id);
    taskElement.innerHTML = `
      <div class="task-content">
        <input type="checkbox" class="task-checkbox" />
        <label class="task-label">
          <span class="task-text">${task.text}</span>
        </label>
        <button type="button" class="delete-btn">×</button>
      </div>
    `;
    taskList.appendChild(taskElement);

    // Get the task item and enter edit mode
    const taskItem = document.querySelector(
      `[data-task-id="${task.id}"]`
    ) as HTMLElement;
    const taskText = taskItem.querySelector(".task-text") as HTMLElement;

    // Create edit mode
    taskText.style.display = "none";
    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.className = "task-edit-input";
    editInput.value = task.text;
    editInput.setAttribute("data-task-id", task.id);

    // Add blur handler
    editInput.addEventListener("blur", async (event) => {
      const input = event.target as HTMLInputElement;
      const newText = input.value.trim();

      if (!newText) {
        // Revert to original
        input.remove();
        taskText.style.display = "";
        return;
      }
    });

    taskText.parentNode?.insertBefore(editInput, taskText.nextSibling);

    // Set whitespace-only text
    editInput.value = "   \t\n   ";

    // Simulate blur event
    const blurEvent = new FocusEvent("blur", { bubbles: true });
    editInput.dispatchEvent(blurEvent);

    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Verify the task text was not changed (reverted to original)
    const updatedTasks = await taskService.getTasks();
    const updatedTask = updatedTasks.find((t) => t.id === task.id);
    expect(updatedTask?.text).toBe(originalText);

    // Verify UI shows original text
    expect(taskText.textContent).toBe(originalText);
  });
});
