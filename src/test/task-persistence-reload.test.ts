import { describe, it, expect, beforeEach, vi } from "vitest";
import { TaskService } from "../services/TaskService";
import { LocalStorageTaskRepository } from "../repositories/LocalStorageTaskRepository";
import { UIController } from "../controllers/UIController";

describe("Task Persistence - Page Reload", () => {
  let taskService: TaskService;
  let repository: LocalStorageTaskRepository;
  let uiController: UIController;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Create fresh instances
    repository = new LocalStorageTaskRepository();
    taskService = new TaskService(repository);

    // Setup DOM with correct element IDs that UIController expects
    document.body.innerHTML = `
      <div id="app">
        <form id="add-task-form">
          <input id="new-task-input" type="text" placeholder="What needs to be done?" />
          <button type="submit">Add</button>
        </form>
        <ul id="task-list"></ul>
        <div id="stats-text">0 個中 0 個完了</div>
        <div id="empty-state" style="display: none;">No tasks yet</div>
        <div id="filter-buttons">
          <button class="filter-btn active" data-filter="all">All</button>
          <button class="filter-btn" data-filter="active">Active</button>
          <button class="filter-btn" data-filter="completed">Completed</button>
        </div>
      </div>
    `;

    uiController = new UIController();
  });

  it("should persist tasks after page reload simulation", async () => {
    // Add some tasks to the first "session"
    await taskService.addTask("Task 1");
    await taskService.addTask("Task 2");
    const task3 = await taskService.addTask("Task 3");

    // Toggle one task to completed
    await taskService.toggleTask(task3.id);

    // Verify tasks are in localStorage
    const storedTasks = localStorage.getItem("todoApp_tasks");
    expect(storedTasks).toBeTruthy();

    // Simulate page reload by creating new instances
    const newRepository = new LocalStorageTaskRepository();
    const newTaskService = new TaskService(newRepository);
    const newUIController = new UIController();

    // Initialize the new "session" - this should load data from localStorage
    const loadedTasks = await newTaskService.getTasks();

    // Verify all tasks are loaded correctly
    expect(loadedTasks).toHaveLength(3);
    expect(loadedTasks.find((t) => t.text === "Task 1")).toBeTruthy();
    expect(loadedTasks.find((t) => t.text === "Task 2")).toBeTruthy();
    expect(loadedTasks.find((t) => t.text === "Task 3")).toBeTruthy();

    // Verify completion state is preserved
    const task3Loaded = loadedTasks.find((t) => t.text === "Task 3");
    expect(task3Loaded?.completed).toBe(true);

    // Verify other tasks remain incomplete
    const task1Loaded = loadedTasks.find((t) => t.text === "Task 1");
    const task2Loaded = loadedTasks.find((t) => t.text === "Task 2");
    expect(task1Loaded?.completed).toBe(false);
    expect(task2Loaded?.completed).toBe(false);
  });

  it("should handle empty localStorage on first load", async () => {
    // Ensure localStorage is empty
    localStorage.clear();

    // Create new instances (simulating first app load)
    const newRepository = new LocalStorageTaskRepository();
    const newTaskService = new TaskService(newRepository);

    // Load tasks should return empty array
    const loadedTasks = await newTaskService.getTasks();
    expect(loadedTasks).toHaveLength(0);
  });

  it("should handle corrupted localStorage data gracefully", async () => {
    // Set corrupted data in localStorage
    localStorage.setItem("todoApp_tasks", "invalid json data");

    // Create new instances
    const newRepository = new LocalStorageTaskRepository();
    const newTaskService = new TaskService(newRepository);

    // Should handle corrupted data and return empty array
    const loadedTasks = await newTaskService.getTasks();
    expect(loadedTasks).toHaveLength(0);
  });

  it("should preserve task order after reload", async () => {
    // Add tasks in specific order
    const task1 = await taskService.addTask("First Task");
    const task2 = await taskService.addTask("Second Task");
    const task3 = await taskService.addTask("Third Task");

    // Simulate reload
    const newRepository = new LocalStorageTaskRepository();
    const newTaskService = new TaskService(newRepository);

    const loadedTasks = await newTaskService.getTasks();

    // Verify order is preserved (should be in creation order)
    expect(loadedTasks[0].text).toBe("First Task");
    expect(loadedTasks[1].text).toBe("Second Task");
    expect(loadedTasks[2].text).toBe("Third Task");
  });

  it("should preserve task metadata after reload", async () => {
    // Add a task and capture its metadata
    const originalTask = await taskService.addTask("Test Task");
    const originalCreatedAt = originalTask.createdAt;
    const originalId = originalTask.id;

    // Simulate reload
    const newRepository = new LocalStorageTaskRepository();
    const newTaskService = new TaskService(newRepository);

    const loadedTasks = await newTaskService.getTasks();
    const loadedTask = loadedTasks[0];

    // Verify all metadata is preserved
    expect(loadedTask.id).toBe(originalId);
    expect(loadedTask.text).toBe("Test Task");
    expect(loadedTask.completed).toBe(false);
    expect(new Date(loadedTask.createdAt).getTime()).toBe(
      originalCreatedAt.getTime()
    );
  });
});
