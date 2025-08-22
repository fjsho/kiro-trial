import { describe, it, expect, beforeEach, vi } from "vitest";
import { TaskService } from "../services/TaskService";
import type { TaskRepository } from "../repositories/TaskRepository";
import type { Task } from "../models/Task";

describe("TaskService - updateTask (Edit Validation)", () => {
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

  describe("updateTask method", () => {
    it("should update task text successfully", async () => {
      const taskId = "test-task-id";
      const originalTask: Task = {
        id: taskId,
        text: "Original text",
        completed: false,
        createdAt: new Date("2024-01-01"),
      };

      const updatedTask: Task = {
        ...originalTask,
        text: "Updated text",
      };

      // Mock repository to return updated task
      vi.mocked(mockRepository.updateTask).mockResolvedValue(updatedTask);

      // Call updateTask
      const result = await taskService.updateTask(taskId, {
        text: "Updated text",
      });

      // Verify repository was called with correct parameters
      expect(mockRepository.updateTask).toHaveBeenCalledWith(taskId, {
        text: "Updated text",
      });
      expect(mockRepository.updateTask).toHaveBeenCalledTimes(1);

      // Verify result
      expect(result).toEqual(updatedTask);
      expect(result.text).toBe("Updated text");
    });

    it("should update task completion status successfully", async () => {
      const taskId = "test-task-id";
      const originalTask: Task = {
        id: taskId,
        text: "Test task",
        completed: false,
        createdAt: new Date("2024-01-01"),
      };

      const updatedTask: Task = {
        ...originalTask,
        completed: true,
      };

      // Mock repository to return updated task
      vi.mocked(mockRepository.updateTask).mockResolvedValue(updatedTask);

      // Call updateTask
      const result = await taskService.updateTask(taskId, { completed: true });

      // Verify repository was called with correct parameters
      expect(mockRepository.updateTask).toHaveBeenCalledWith(taskId, {
        completed: true,
      });
      expect(mockRepository.updateTask).toHaveBeenCalledTimes(1);

      // Verify result
      expect(result).toEqual(updatedTask);
      expect(result.completed).toBe(true);
    });

    it("should update multiple properties at once", async () => {
      const taskId = "test-task-id";
      const originalTask: Task = {
        id: taskId,
        text: "Original text",
        completed: false,
        createdAt: new Date("2024-01-01"),
      };

      const updatedTask: Task = {
        ...originalTask,
        text: "Updated text",
        completed: true,
      };

      // Mock repository to return updated task
      vi.mocked(mockRepository.updateTask).mockResolvedValue(updatedTask);

      // Call updateTask with multiple updates
      const result = await taskService.updateTask(taskId, {
        text: "Updated text",
        completed: true,
      });

      // Verify repository was called with correct parameters
      expect(mockRepository.updateTask).toHaveBeenCalledWith(taskId, {
        text: "Updated text",
        completed: true,
      });
      expect(mockRepository.updateTask).toHaveBeenCalledTimes(1);

      // Verify result
      expect(result).toEqual(updatedTask);
      expect(result.text).toBe("Updated text");
      expect(result.completed).toBe(true);
    });

    it("should handle repository errors gracefully", async () => {
      const taskId = "test-task-id";
      const repositoryError = new Error("Repository update failed");

      // Mock repository to throw error
      vi.mocked(mockRepository.updateTask).mockRejectedValue(repositoryError);

      // Expect updateTask to throw the repository error
      await expect(
        taskService.updateTask(taskId, { text: "New text" })
      ).rejects.toThrow("Repository update failed");

      // Verify repository was called
      expect(mockRepository.updateTask).toHaveBeenCalledWith(taskId, {
        text: "New text",
      });
      expect(mockRepository.updateTask).toHaveBeenCalledTimes(1);
    });

    it("should handle empty updates object", async () => {
      const taskId = "test-task-id";
      const originalTask: Task = {
        id: taskId,
        text: "Original text",
        completed: false,
        createdAt: new Date("2024-01-01"),
      };

      // Mock repository to return original task (no changes)
      vi.mocked(mockRepository.updateTask).mockResolvedValue(originalTask);

      // Call updateTask with empty updates
      const result = await taskService.updateTask(taskId, {});

      // Verify repository was called with empty updates
      expect(mockRepository.updateTask).toHaveBeenCalledWith(taskId, {});
      expect(mockRepository.updateTask).toHaveBeenCalledTimes(1);

      // Verify result is unchanged
      expect(result).toEqual(originalTask);
    });

    it("should handle partial updates correctly", async () => {
      const taskId = "test-task-id";
      const originalTask: Task = {
        id: taskId,
        text: "Original text",
        completed: false,
        createdAt: new Date("2024-01-01"),
      };

      const updatedTask: Task = {
        ...originalTask,
        text: "Partially updated text",
      };

      // Mock repository to return updated task
      vi.mocked(mockRepository.updateTask).mockResolvedValue(updatedTask);

      // Call updateTask with only text update
      const result = await taskService.updateTask(taskId, {
        text: "Partially updated text",
      });

      // Verify repository was called with correct parameters
      expect(mockRepository.updateTask).toHaveBeenCalledWith(taskId, {
        text: "Partially updated text",
      });
      expect(mockRepository.updateTask).toHaveBeenCalledTimes(1);

      // Verify result - only text should be updated, other properties unchanged
      expect(result.text).toBe("Partially updated text");
      expect(result.completed).toBe(false); // Should remain unchanged
      expect(result.id).toBe(taskId); // Should remain unchanged
    });
  });
});
