import { describe, it, expect, beforeEach, vi } from "vitest";
import { LocalStorageTaskRepository } from "../repositories/LocalStorageTaskRepository";
import { TaskModel } from "../models/Task";

describe("LocalStorageTaskRepository - getTasks() Initialization", () => {
  let repository: LocalStorageTaskRepository;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    repository = new LocalStorageTaskRepository();
  });

  describe("Initial Load Scenarios", () => {
    it("should return empty array when localStorage is empty", async () => {
      // Ensure localStorage is completely empty
      localStorage.clear();

      const tasks = await repository.getTasks();

      expect(tasks).toEqual([]);
      expect(tasks).toHaveLength(0);
    });

    it("should return empty array when storage key does not exist", async () => {
      // Set some other data in localStorage but not our key
      localStorage.setItem("other_key", "some data");

      const tasks = await repository.getTasks();

      expect(tasks).toEqual([]);
      expect(tasks).toHaveLength(0);
    });

    it("should load and deserialize tasks correctly from localStorage", async () => {
      // Manually set valid task data in localStorage
      const storedTasks = [
        {
          id: "task-1",
          text: "Test Task 1",
          completed: false,
          createdAt: "2023-01-01T00:00:00.000Z",
        },
        {
          id: "task-2",
          text: "Test Task 2",
          completed: true,
          createdAt: "2023-01-02T00:00:00.000Z",
        },
      ];
      localStorage.setItem("todoApp_tasks", JSON.stringify(storedTasks));

      const tasks = await repository.getTasks();

      expect(tasks).toHaveLength(2);

      // Verify first task
      expect(tasks[0]).toBeInstanceOf(TaskModel);
      expect(tasks[0].id).toBe("task-1");
      expect(tasks[0].text).toBe("Test Task 1");
      expect(tasks[0].completed).toBe(false);
      expect(tasks[0].createdAt).toEqual(new Date("2023-01-01T00:00:00.000Z"));

      // Verify second task
      expect(tasks[1]).toBeInstanceOf(TaskModel);
      expect(tasks[1].id).toBe("task-2");
      expect(tasks[1].text).toBe("Test Task 2");
      expect(tasks[1].completed).toBe(true);
      expect(tasks[1].createdAt).toEqual(new Date("2023-01-02T00:00:00.000Z"));
    });

    it("should preserve task order from localStorage", async () => {
      // Set tasks in specific order
      const storedTasks = [
        {
          id: "task-3",
          text: "Third Task",
          completed: false,
          createdAt: "2023-01-03T00:00:00.000Z",
        },
        {
          id: "task-1",
          text: "First Task",
          completed: true,
          createdAt: "2023-01-01T00:00:00.000Z",
        },
        {
          id: "task-2",
          text: "Second Task",
          completed: false,
          createdAt: "2023-01-02T00:00:00.000Z",
        },
      ];
      localStorage.setItem("todoApp_tasks", JSON.stringify(storedTasks));

      const tasks = await repository.getTasks();

      expect(tasks).toHaveLength(3);
      expect(tasks[0].text).toBe("Third Task");
      expect(tasks[1].text).toBe("First Task");
      expect(tasks[2].text).toBe("Second Task");
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid JSON data gracefully", async () => {
      // Set invalid JSON in localStorage
      localStorage.setItem("todoApp_tasks", "invalid json data");

      // Should not throw error and return empty array
      const tasks = await repository.getTasks();

      expect(tasks).toEqual([]);
      expect(tasks).toHaveLength(0);
    });

    it("should handle malformed task objects gracefully", async () => {
      // Set JSON that parses but has invalid task structure
      localStorage.setItem(
        "todoApp_tasks",
        JSON.stringify([
          { id: "task-1" }, // missing required fields
          { text: "Task without ID" }, // missing id
          "not an object", // not even an object
        ])
      );

      // Should handle gracefully and return empty array
      const tasks = await repository.getTasks();

      expect(tasks).toEqual([]);
      expect(tasks).toHaveLength(0);
    });

    it("should handle localStorage access errors", async () => {
      // Mock localStorage.getItem to throw an error
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn().mockImplementation(() => {
        throw new Error("localStorage access denied");
      });

      try {
        const tasks = await repository.getTasks();

        expect(tasks).toEqual([]);
        expect(tasks).toHaveLength(0);
      } finally {
        // Restore original implementation
        localStorage.getItem = originalGetItem;
      }
    });

    it("should handle Date parsing errors in createdAt field", async () => {
      // Set task with invalid date
      const storedTasks = [
        {
          id: "task-1",
          text: "Test Task",
          completed: false,
          createdAt: "invalid date string",
        },
      ];
      localStorage.setItem("todoApp_tasks", JSON.stringify(storedTasks));

      // Should handle gracefully
      const tasks = await repository.getTasks();

      expect(tasks).toEqual([]);
      expect(tasks).toHaveLength(0);
    });
  });

  describe("Data Type Validation", () => {
    it("should handle null value in localStorage", async () => {
      // Explicitly set null (though localStorage.getItem returns null for missing keys)
      localStorage.setItem("todoApp_tasks", "null");

      const tasks = await repository.getTasks();

      expect(tasks).toEqual([]);
      expect(tasks).toHaveLength(0);
    });

    it("should handle empty string in localStorage", async () => {
      localStorage.setItem("todoApp_tasks", "");

      const tasks = await repository.getTasks();

      expect(tasks).toEqual([]);
      expect(tasks).toHaveLength(0);
    });

    it("should handle empty array in localStorage", async () => {
      localStorage.setItem("todoApp_tasks", "[]");

      const tasks = await repository.getTasks();

      expect(tasks).toEqual([]);
      expect(tasks).toHaveLength(0);
    });
  });
});
