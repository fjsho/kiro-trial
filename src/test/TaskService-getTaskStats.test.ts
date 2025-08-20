import { describe, it, expect, beforeEach, vi } from "vitest";
import { TaskService } from "../services/TaskService.js";
import type { TaskRepository } from "../repositories/TaskRepository.js";
import { TaskModel } from "../models/Task.js";

describe("TaskService.getTaskStats() Unit Tests", () => {
  let taskService: TaskService;
  let mockRepository: TaskRepository;

  beforeEach(() => {
    // Create mock repository
    mockRepository = {
      addTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      getTasks: vi.fn(),
    };

    taskService = new TaskService(mockRepository);
  });

  it("should return correct stats for empty task list", async () => {
    // Arrange
    vi.mocked(mockRepository.getTasks).mockResolvedValue([]);

    // Act
    const stats = await taskService.getTaskStats();

    // Assert
    expect(stats).toEqual({
      total: 0,
      completed: 0,
      active: 0,
    });
    expect(mockRepository.getTasks).toHaveBeenCalledOnce();
  });

  it("should return correct stats for tasks with no completed tasks", async () => {
    // Arrange
    const tasks = [
      new TaskModel("1", "Task 1", false),
      new TaskModel("2", "Task 2", false),
      new TaskModel("3", "Task 3", false),
    ];
    vi.mocked(mockRepository.getTasks).mockResolvedValue(tasks);

    // Act
    const stats = await taskService.getTaskStats();

    // Assert
    expect(stats).toEqual({
      total: 3,
      completed: 0,
      active: 3,
    });
    expect(mockRepository.getTasks).toHaveBeenCalledOnce();
  });

  it("should return correct stats for tasks with all completed tasks", async () => {
    // Arrange
    const tasks = [
      new TaskModel("1", "Task 1", true),
      new TaskModel("2", "Task 2", true),
    ];
    vi.mocked(mockRepository.getTasks).mockResolvedValue(tasks);

    // Act
    const stats = await taskService.getTaskStats();

    // Assert
    expect(stats).toEqual({
      total: 2,
      completed: 2,
      active: 0,
    });
    expect(mockRepository.getTasks).toHaveBeenCalledOnce();
  });

  it("should return correct stats for mixed completed and active tasks", async () => {
    // Arrange
    const tasks = [
      new TaskModel("1", "Task 1", true), // completed
      new TaskModel("2", "Task 2", false), // active
      new TaskModel("3", "Task 3", true), // completed
      new TaskModel("4", "Task 4", false), // active
      new TaskModel("5", "Task 5", false), // active
    ];
    vi.mocked(mockRepository.getTasks).mockResolvedValue(tasks);

    // Act
    const stats = await taskService.getTaskStats();

    // Assert
    expect(stats).toEqual({
      total: 5,
      completed: 2,
      active: 3,
    });
    expect(mockRepository.getTasks).toHaveBeenCalledOnce();
  });

  it("should return correct stats for single completed task", async () => {
    // Arrange
    const tasks = [new TaskModel("1", "Single completed task", true)];
    vi.mocked(mockRepository.getTasks).mockResolvedValue(tasks);

    // Act
    const stats = await taskService.getTaskStats();

    // Assert
    expect(stats).toEqual({
      total: 1,
      completed: 1,
      active: 0,
    });
    expect(mockRepository.getTasks).toHaveBeenCalledOnce();
  });

  it("should return correct stats for single active task", async () => {
    // Arrange
    const tasks = [new TaskModel("1", "Single active task", false)];
    vi.mocked(mockRepository.getTasks).mockResolvedValue(tasks);

    // Act
    const stats = await taskService.getTaskStats();

    // Assert
    expect(stats).toEqual({
      total: 1,
      completed: 0,
      active: 1,
    });
    expect(mockRepository.getTasks).toHaveBeenCalledOnce();
  });

  it("should handle repository errors gracefully", async () => {
    // Arrange
    const error = new Error("Repository error");
    vi.mocked(mockRepository.getTasks).mockRejectedValue(error);

    // Act & Assert
    await expect(taskService.getTaskStats()).rejects.toThrow(
      "Repository error"
    );
    expect(mockRepository.getTasks).toHaveBeenCalledOnce();
  });

  it("should calculate stats correctly with large number of tasks", async () => {
    // Arrange
    const tasks = [];
    const totalTasks = 100;
    const completedTasks = 37;

    // Create 37 completed tasks
    for (let i = 0; i < completedTasks; i++) {
      tasks.push(new TaskModel(`completed-${i}`, `Completed Task ${i}`, true));
    }

    // Create 63 active tasks
    for (let i = 0; i < totalTasks - completedTasks; i++) {
      tasks.push(new TaskModel(`active-${i}`, `Active Task ${i}`, false));
    }

    vi.mocked(mockRepository.getTasks).mockResolvedValue(tasks);

    // Act
    const stats = await taskService.getTaskStats();

    // Assert
    expect(stats).toEqual({
      total: 100,
      completed: 37,
      active: 63,
    });
    expect(mockRepository.getTasks).toHaveBeenCalledOnce();
  });
});
