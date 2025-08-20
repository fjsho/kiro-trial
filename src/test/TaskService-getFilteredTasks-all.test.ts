import { describe, it, expect, beforeEach, vi } from "vitest";
import { TaskService } from "../services/TaskService";
import { TaskModel } from "../models/Task";
import type { TaskRepository } from "../repositories/TaskRepository";

describe('TaskService - getFilteredTasks("all") Unit Tests', () => {
  let taskService: TaskService;
  let mockRepository: TaskRepository;

  beforeEach(() => {
    // Create a mock repository
    mockRepository = {
      addTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      getTasks: vi.fn(),
    };

    taskService = new TaskService(mockRepository);
  });

  it('should return all tasks when filter is "all"', async () => {
    // Arrange
    const testTasks = [
      new TaskModel("1", "Active Task 1", false, new Date("2024-01-01")),
      new TaskModel("2", "Completed Task 1", true, new Date("2024-01-02")),
      new TaskModel("3", "Active Task 2", false, new Date("2024-01-03")),
      new TaskModel("4", "Completed Task 2", true, new Date("2024-01-04")),
    ];

    // Mock the repository to return test tasks
    vi.mocked(mockRepository.getTasks).mockResolvedValue(testTasks);

    // Act
    const result = await taskService.getFilteredTasks("all");

    // Assert
    expect(result).toHaveLength(4);
    expect(result).toEqual(testTasks);
    expect(mockRepository.getTasks).toHaveBeenCalledTimes(1);
  });

  it('should return all tasks including both completed and active when filter is "all"', async () => {
    // Arrange
    const testTasks = [
      new TaskModel("1", "Task 1", false, new Date()),
      new TaskModel("2", "Task 2", true, new Date()),
      new TaskModel("3", "Task 3", false, new Date()),
      new TaskModel("4", "Task 4", true, new Date()),
      new TaskModel("5", "Task 5", false, new Date()),
    ];

    vi.mocked(mockRepository.getTasks).mockResolvedValue(testTasks);

    // Act
    const result = await taskService.getFilteredTasks("all");

    // Assert
    expect(result).toHaveLength(5);

    // Verify both completed and active tasks are included
    const completedTasks = result.filter((task) => task.completed);
    const activeTasks = result.filter((task) => !task.completed);

    expect(completedTasks).toHaveLength(2);
    expect(activeTasks).toHaveLength(3);

    // Verify all original tasks are present
    testTasks.forEach((originalTask) => {
      expect(result).toContainEqual(originalTask);
    });
  });

  it('should return empty array when no tasks exist and filter is "all"', async () => {
    // Arrange
    vi.mocked(mockRepository.getTasks).mockResolvedValue([]);

    // Act
    const result = await taskService.getFilteredTasks("all");

    // Assert
    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
    expect(mockRepository.getTasks).toHaveBeenCalledTimes(1);
  });

  it("should handle repository errors when getting all tasks", async () => {
    // Arrange
    const errorMessage = "Repository error";
    vi.mocked(mockRepository.getTasks).mockRejectedValue(
      new Error(errorMessage)
    );

    // Act & Assert
    await expect(taskService.getFilteredTasks("all")).rejects.toThrow(
      errorMessage
    );
    expect(mockRepository.getTasks).toHaveBeenCalledTimes(1);
  });

  it('should return tasks in the same order as repository when filter is "all"', async () => {
    // Arrange
    const testTasks = [
      new TaskModel("3", "Third Task", true, new Date("2024-01-03")),
      new TaskModel("1", "First Task", false, new Date("2024-01-01")),
      new TaskModel("2", "Second Task", true, new Date("2024-01-02")),
    ];

    vi.mocked(mockRepository.getTasks).mockResolvedValue(testTasks);

    // Act
    const result = await taskService.getFilteredTasks("all");

    // Assert
    expect(result).toEqual(testTasks);
    expect(result[0].id).toBe("3");
    expect(result[1].id).toBe("1");
    expect(result[2].id).toBe("2");
  });

  it('should call repository.getTasks exactly once when filter is "all"', async () => {
    // Arrange
    const testTasks = [new TaskModel("1", "Test Task", false, new Date())];
    vi.mocked(mockRepository.getTasks).mockResolvedValue(testTasks);

    // Act
    await taskService.getFilteredTasks("all");

    // Assert
    expect(mockRepository.getTasks).toHaveBeenCalledTimes(1);
    expect(mockRepository.getTasks).toHaveBeenCalledWith();
  });

  it("should not modify original tasks when returning all tasks", async () => {
    // Arrange
    const originalTasks = [
      new TaskModel("1", "Task 1", false, new Date()),
      new TaskModel("2", "Task 2", true, new Date()),
    ];
    const tasksCopy = originalTasks.map((task) => ({ ...task }));

    vi.mocked(mockRepository.getTasks).mockResolvedValue(originalTasks);

    // Act
    const result = await taskService.getFilteredTasks("all");

    // Assert
    expect(result).toEqual(tasksCopy);
    // Verify original tasks weren't modified
    expect(originalTasks).toEqual(tasksCopy);
  });
});
