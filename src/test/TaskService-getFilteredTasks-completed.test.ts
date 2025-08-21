import { describe, it, expect, beforeEach } from "vitest";
import { TaskService } from "../services/TaskService";
import { LocalStorageTaskRepository } from "../repositories/LocalStorageTaskRepository";

describe("TaskService - getFilteredTasks('completed')", () => {
  let taskService: TaskService;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    const repository = new LocalStorageTaskRepository();
    taskService = new TaskService(repository);
  });

  it('should return only completed tasks when filter is "completed"', async () => {
    // Arrange - Add tasks with mixed completion status
    const activeTask1 = await taskService.addTask("Active Task 1");
    const completedTask1 = await taskService.addTask("Completed Task 1");
    const activeTask2 = await taskService.addTask("Active Task 2");
    const completedTask2 = await taskService.addTask("Completed Task 2");

    // Complete some tasks
    await taskService.toggleTask(completedTask1.id);
    await taskService.toggleTask(completedTask2.id);

    // Act
    const result = await taskService.getFilteredTasks("completed");

    // Assert
    expect(result).toHaveLength(2);
    expect(result.every((task) => task.completed)).toBe(true);

    const resultIds = result.map((task) => task.id);
    expect(resultIds).toContain(completedTask1.id);
    expect(resultIds).toContain(completedTask2.id);
    expect(resultIds).not.toContain(activeTask1.id);
    expect(resultIds).not.toContain(activeTask2.id);
  });

  it("should return empty array when no completed tasks exist", async () => {
    // Arrange - Add only active tasks
    await taskService.addTask("Active Task 1");
    await taskService.addTask("Active Task 2");

    // Act
    const result = await taskService.getFilteredTasks("completed");

    // Assert
    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it("should return all tasks when all tasks are completed", async () => {
    // Arrange - Add tasks and complete all of them
    const task1 = await taskService.addTask("Task 1");
    const task2 = await taskService.addTask("Task 2");
    const task3 = await taskService.addTask("Task 3");

    await taskService.toggleTask(task1.id);
    await taskService.toggleTask(task2.id);
    await taskService.toggleTask(task3.id);

    // Act
    const result = await taskService.getFilteredTasks("completed");

    // Assert
    expect(result).toHaveLength(3);
    expect(result.every((task) => task.completed)).toBe(true);

    const resultIds = result.map((task) => task.id);
    expect(resultIds).toContain(task1.id);
    expect(resultIds).toContain(task2.id);
    expect(resultIds).toContain(task3.id);
  });

  it("should return empty array when no tasks exist", async () => {
    // Act - No tasks added
    const result = await taskService.getFilteredTasks("completed");

    // Assert
    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it("should maintain task properties correctly for completed tasks", async () => {
    // Arrange
    const task = await taskService.addTask("Test Task");
    await taskService.toggleTask(task.id);

    // Act
    const result = await taskService.getFilteredTasks("completed");

    // Assert
    expect(result).toHaveLength(1);
    const completedTask = result[0];
    expect(completedTask.id).toBe(task.id);
    expect(completedTask.text).toBe("Test Task");
    expect(completedTask.completed).toBe(true);
    expect(completedTask.createdAt).toBeInstanceOf(Date);
  });

  it("should update results when task completion status changes", async () => {
    // Arrange
    const task = await taskService.addTask("Toggle Task");

    // Initially no completed tasks
    let result = await taskService.getFilteredTasks("completed");
    expect(result).toHaveLength(0);

    // Complete the task
    await taskService.toggleTask(task.id);
    result = await taskService.getFilteredTasks("completed");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(task.id);

    // Uncomplete the task
    await taskService.toggleTask(task.id);
    result = await taskService.getFilteredTasks("completed");
    expect(result).toHaveLength(0);
  });
});
