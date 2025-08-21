import { describe, it, expect, beforeEach } from "vitest";
import { TaskService } from "../services/TaskService";
import { LocalStorageTaskRepository } from "../repositories/LocalStorageTaskRepository";

describe('TaskService.getFilteredTasks("active") - Unit Test', () => {
  let taskService: TaskService;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    const repository = new LocalStorageTaskRepository();
    taskService = new TaskService(repository);
  });

  it('should return only active (incomplete) tasks when filter is "active"', async () => {
    // Add tasks with mixed completion status
    const task1 = await taskService.addTask("Active Task 1");
    const task2 = await taskService.addTask("Completed Task");
    const task3 = await taskService.addTask("Active Task 2");

    // Complete one task
    await taskService.toggleTask(task2.id);

    // Get filtered tasks
    const activeTasks = await taskService.getFilteredTasks("active");

    // Verify only active tasks are returned
    expect(activeTasks).toHaveLength(2);
    expect(activeTasks.every((task) => !task.completed)).toBe(true);

    // Verify correct tasks are returned
    const taskTexts = activeTasks.map((task) => task.text);
    expect(taskTexts).toContain("Active Task 1");
    expect(taskTexts).toContain("Active Task 2");
    expect(taskTexts).not.toContain("Completed Task");
  });

  it("should return empty array when no active tasks exist", async () => {
    // Add tasks and complete all of them
    const task1 = await taskService.addTask("Task 1");
    const task2 = await taskService.addTask("Task 2");

    await taskService.toggleTask(task1.id);
    await taskService.toggleTask(task2.id);

    // Get filtered tasks
    const activeTasks = await taskService.getFilteredTasks("active");

    // Verify empty array is returned
    expect(activeTasks).toHaveLength(0);
    expect(Array.isArray(activeTasks)).toBe(true);
  });

  it("should return all tasks when all tasks are active", async () => {
    // Add multiple active tasks
    const task1 = await taskService.addTask("Active Task 1");
    const task2 = await taskService.addTask("Active Task 2");
    const task3 = await taskService.addTask("Active Task 3");

    // Get filtered tasks
    const activeTasks = await taskService.getFilteredTasks("active");

    // Verify all tasks are returned
    expect(activeTasks).toHaveLength(3);
    expect(activeTasks.every((task) => !task.completed)).toBe(true);

    // Verify correct tasks are returned
    const taskTexts = activeTasks.map((task) => task.text);
    expect(taskTexts).toContain("Active Task 1");
    expect(taskTexts).toContain("Active Task 2");
    expect(taskTexts).toContain("Active Task 3");
  });

  it("should return empty array when no tasks exist", async () => {
    // Get filtered tasks without adding any
    const activeTasks = await taskService.getFilteredTasks("active");

    // Verify empty array is returned
    expect(activeTasks).toHaveLength(0);
    expect(Array.isArray(activeTasks)).toBe(true);
  });

  it("should maintain task properties correctly for active tasks", async () => {
    // Add a task
    const originalTask = await taskService.addTask("Test Task");

    // Get filtered tasks
    const activeTasks = await taskService.getFilteredTasks("active");

    // Verify task properties are maintained
    expect(activeTasks).toHaveLength(1);
    const filteredTask = activeTasks[0];

    expect(filteredTask.id).toBe(originalTask.id);
    expect(filteredTask.text).toBe(originalTask.text);
    expect(filteredTask.completed).toBe(false);
    expect(filteredTask.createdAt).toEqual(originalTask.createdAt);
  });

  it("should not modify original tasks when filtering", async () => {
    // Add tasks
    const task1 = await taskService.addTask("Task 1");
    const task2 = await taskService.addTask("Task 2");

    // Complete one task
    await taskService.toggleTask(task2.id);

    // Get all tasks before filtering
    const allTasksBefore = await taskService.getTasks();

    // Get filtered tasks
    const activeTasks = await taskService.getFilteredTasks("active");

    // Get all tasks after filtering
    const allTasksAfter = await taskService.getTasks();

    // Verify original tasks are not modified
    expect(allTasksBefore).toEqual(allTasksAfter);
    expect(allTasksAfter).toHaveLength(2);
    expect(allTasksAfter.find((t) => t.id === task2.id)?.completed).toBe(true);
  });
});
