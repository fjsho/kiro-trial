import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { LocalStorageTaskRepository } from "../repositories/LocalStorageTaskRepository";
import { TaskModel } from "../models/Task";
import type { Task } from "../models/Task";

describe("LocalStorageTaskRepository", () => {
  let repository: LocalStorageTaskRepository;
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};

    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
        clear: vi.fn(() => {
          mockLocalStorage = {};
        }),
        length: 0,
        key: vi.fn(),
      },
      writable: true,
    });

    repository = new LocalStorageTaskRepository();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getTasks", () => {
    it("should return empty array when no tasks are stored", async () => {
      const tasks = await repository.getTasks();

      expect(tasks).toEqual([]);
      expect(localStorage.getItem).toHaveBeenCalledWith("todoApp_tasks");
    });

    it("should return tasks from localStorage", async () => {
      const storedTasks = [
        {
          id: "1",
          text: "Test task 1",
          completed: false,
          createdAt: "2023-01-01T00:00:00.000Z",
        },
        {
          id: "2",
          text: "Test task 2",
          completed: true,
          createdAt: "2023-01-02T00:00:00.000Z",
        },
      ];
      mockLocalStorage["todoApp_tasks"] = JSON.stringify(storedTasks);

      const tasks = await repository.getTasks();

      expect(tasks).toHaveLength(2);
      expect(tasks[0]).toBeInstanceOf(TaskModel);
      expect(tasks[0].id).toBe("1");
      expect(tasks[0].text).toBe("Test task 1");
      expect(tasks[0].completed).toBe(false);
      expect(tasks[0].createdAt).toEqual(new Date("2023-01-01T00:00:00.000Z"));

      expect(tasks[1]).toBeInstanceOf(TaskModel);
      expect(tasks[1].id).toBe("2");
      expect(tasks[1].text).toBe("Test task 2");
      expect(tasks[1].completed).toBe(true);
      expect(tasks[1].createdAt).toEqual(new Date("2023-01-02T00:00:00.000Z"));
    });

    it("should return empty array when localStorage contains invalid JSON", async () => {
      mockLocalStorage["todoApp_tasks"] = "invalid json";
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const tasks = await repository.getTasks();

      expect(tasks).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to load tasks from localStorage:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should handle localStorage access errors gracefully", async () => {
      vi.mocked(localStorage.getItem).mockImplementation(() => {
        throw new Error("localStorage access denied");
      });
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const tasks = await repository.getTasks();

      expect(tasks).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to load tasks from localStorage:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("addTask", () => {
    it("should add a new task to empty storage", async () => {
      const newTask = new TaskModel(
        "1",
        "New task",
        false,
        new Date("2023-01-01T00:00:00.000Z")
      );

      const result = await repository.addTask(newTask);

      expect(result).toBe(newTask);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "todoApp_tasks",
        JSON.stringify([
          {
            id: "1",
            text: "New task",
            completed: false,
            createdAt: "2023-01-01T00:00:00.000Z",
          },
        ])
      );
    });

    it("should add a new task to existing tasks", async () => {
      // Setup existing tasks
      const existingTasks = [
        {
          id: "1",
          text: "Existing task",
          completed: false,
          createdAt: "2023-01-01T00:00:00.000Z",
        },
      ];
      mockLocalStorage["todoApp_tasks"] = JSON.stringify(existingTasks);

      const newTask = new TaskModel(
        "2",
        "New task",
        false,
        new Date("2023-01-02T00:00:00.000Z")
      );

      const result = await repository.addTask(newTask);

      expect(result).toBe(newTask);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "todoApp_tasks",
        JSON.stringify([
          {
            id: "1",
            text: "Existing task",
            completed: false,
            createdAt: "2023-01-01T00:00:00.000Z",
          },
          {
            id: "2",
            text: "New task",
            completed: false,
            createdAt: "2023-01-02T00:00:00.000Z",
          },
        ])
      );
    });

    it("should throw error when localStorage.setItem fails", async () => {
      vi.mocked(localStorage.setItem).mockImplementation(() => {
        throw new Error("Storage quota exceeded");
      });

      const newTask = new TaskModel("1", "New task");

      await expect(repository.addTask(newTask)).rejects.toThrow(
        "Failed to add task: Failed to save tasks to localStorage: Storage quota exceeded"
      );
    });

    it("should throw error when getTasks fails", async () => {
      vi.mocked(localStorage.getItem).mockImplementation(() => {
        throw new Error("localStorage access denied");
      });
      vi.spyOn(console, "error").mockImplementation(() => {});

      const newTask = new TaskModel("1", "New task");

      // Since getTasks returns empty array on error, addTask should still work
      const result = await repository.addTask(newTask);
      expect(result).toBe(newTask);
    });
  });

  describe("updateTask", () => {
    beforeEach(() => {
      // Setup existing tasks
      const existingTasks = [
        {
          id: "1",
          text: "Task 1",
          completed: false,
          createdAt: "2023-01-01T00:00:00.000Z",
        },
        {
          id: "2",
          text: "Task 2",
          completed: true,
          createdAt: "2023-01-02T00:00:00.000Z",
        },
      ];
      mockLocalStorage["todoApp_tasks"] = JSON.stringify(existingTasks);
    });

    it("should update an existing task", async () => {
      const updates = { text: "Updated task", completed: true };

      const result = await repository.updateTask("1", updates);

      expect(result.id).toBe("1");
      expect(result.text).toBe("Updated task");
      expect(result.completed).toBe(true);
      expect(result.createdAt).toEqual(new Date("2023-01-01T00:00:00.000Z"));

      expect(localStorage.setItem).toHaveBeenCalledWith(
        "todoApp_tasks",
        JSON.stringify([
          {
            id: "1",
            text: "Updated task",
            completed: true,
            createdAt: "2023-01-01T00:00:00.000Z",
          },
          {
            id: "2",
            text: "Task 2",
            completed: true,
            createdAt: "2023-01-02T00:00:00.000Z",
          },
        ])
      );
    });

    it("should update only specified fields", async () => {
      const updates = { completed: true };

      const result = await repository.updateTask("1", updates);

      expect(result.id).toBe("1");
      expect(result.text).toBe("Task 1"); // unchanged
      expect(result.completed).toBe(true); // updated
      expect(result.createdAt).toEqual(new Date("2023-01-01T00:00:00.000Z")); // unchanged
    });

    it("should throw error when task is not found", async () => {
      const updates = { text: "Updated task" };

      await expect(
        repository.updateTask("nonexistent", updates)
      ).rejects.toThrow(
        "Failed to update task: Task with id nonexistent not found"
      );
    });

    it("should throw error when localStorage.setItem fails", async () => {
      vi.mocked(localStorage.setItem).mockImplementation(() => {
        throw new Error("Storage quota exceeded");
      });

      const updates = { text: "Updated task" };

      await expect(repository.updateTask("1", updates)).rejects.toThrow(
        "Failed to update task: Failed to save tasks to localStorage: Storage quota exceeded"
      );
    });

    it("should throw error when getTasks fails", async () => {
      vi.mocked(localStorage.getItem).mockImplementation(() => {
        throw new Error("localStorage access denied");
      });
      vi.spyOn(console, "error").mockImplementation(() => {});

      const updates = { text: "Updated task" };

      await expect(repository.updateTask("1", updates)).rejects.toThrow(
        "Failed to update task: Task with id 1 not found"
      );
    });
  });

  describe("deleteTask", () => {
    beforeEach(() => {
      // Setup existing tasks
      const existingTasks = [
        {
          id: "1",
          text: "Task 1",
          completed: false,
          createdAt: "2023-01-01T00:00:00.000Z",
        },
        {
          id: "2",
          text: "Task 2",
          completed: true,
          createdAt: "2023-01-02T00:00:00.000Z",
        },
      ];
      mockLocalStorage["todoApp_tasks"] = JSON.stringify(existingTasks);
    });

    it("should delete an existing task", async () => {
      await repository.deleteTask("1");

      expect(localStorage.setItem).toHaveBeenCalledWith(
        "todoApp_tasks",
        JSON.stringify([
          {
            id: "2",
            text: "Task 2",
            completed: true,
            createdAt: "2023-01-02T00:00:00.000Z",
          },
        ])
      );
    });

    it("should delete the correct task when multiple tasks exist", async () => {
      await repository.deleteTask("2");

      expect(localStorage.setItem).toHaveBeenCalledWith(
        "todoApp_tasks",
        JSON.stringify([
          {
            id: "1",
            text: "Task 1",
            completed: false,
            createdAt: "2023-01-01T00:00:00.000Z",
          },
        ])
      );
    });

    it("should throw error when task is not found", async () => {
      await expect(repository.deleteTask("nonexistent")).rejects.toThrow(
        "Failed to delete task: Task with id nonexistent not found"
      );
    });

    it("should throw error when localStorage.setItem fails", async () => {
      vi.mocked(localStorage.setItem).mockImplementation(() => {
        throw new Error("Storage quota exceeded");
      });

      await expect(repository.deleteTask("1")).rejects.toThrow(
        "Failed to delete task: Failed to save tasks to localStorage: Storage quota exceeded"
      );
    });

    it("should throw error when getTasks fails", async () => {
      vi.mocked(localStorage.getItem).mockImplementation(() => {
        throw new Error("localStorage access denied");
      });
      vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(repository.deleteTask("1")).rejects.toThrow(
        "Failed to delete task: Task with id 1 not found"
      );
    });
  });

  describe("serialization and deserialization", () => {
    it("should correctly serialize and deserialize tasks", async () => {
      const originalTask = new TaskModel(
        "test-id",
        "Test task",
        true,
        new Date("2023-01-01T12:30:45.123Z")
      );

      // Add task (this will serialize it)
      await repository.addTask(originalTask);

      // Get tasks (this will deserialize it)
      const tasks = await repository.getTasks();

      expect(tasks).toHaveLength(1);
      const deserializedTask = tasks[0];

      expect(deserializedTask).toBeInstanceOf(TaskModel);
      expect(deserializedTask.id).toBe(originalTask.id);
      expect(deserializedTask.text).toBe(originalTask.text);
      expect(deserializedTask.completed).toBe(originalTask.completed);
      expect(deserializedTask.createdAt).toEqual(originalTask.createdAt);
    });

    it("should handle Date serialization correctly", async () => {
      const task = new TaskModel(
        "1",
        "Test",
        false,
        new Date("2023-12-25T15:30:00.000Z")
      );

      await repository.addTask(task);

      // Check what was actually stored
      const storedData = mockLocalStorage["todoApp_tasks"];
      const parsedData = JSON.parse(storedData);

      expect(parsedData[0].createdAt).toBe("2023-12-25T15:30:00.000Z");

      // Verify deserialization
      const tasks = await repository.getTasks();
      expect(tasks[0].createdAt).toEqual(new Date("2023-12-25T15:30:00.000Z"));
    });

    it("should handle invalid date strings during deserialization", async () => {
      // Manually set invalid date in storage
      mockLocalStorage["todoApp_tasks"] = JSON.stringify([
        {
          id: "1",
          text: "Test task",
          completed: false,
          createdAt: "invalid-date",
        },
      ]);

      const tasks = await repository.getTasks();

      expect(tasks).toHaveLength(1);
      expect(tasks[0].createdAt).toBeInstanceOf(Date);
      expect(isNaN(tasks[0].createdAt.getTime())).toBe(true); // Invalid Date
    });
  });

  describe("error handling", () => {
    it("should handle localStorage quota exceeded error", async () => {
      vi.mocked(localStorage.setItem).mockImplementation(() => {
        const error = new Error("QuotaExceededError");
        error.name = "QuotaExceededError";
        throw error;
      });

      const task = new TaskModel("1", "Test task");

      await expect(repository.addTask(task)).rejects.toThrow(
        "Failed to add task: Failed to save tasks to localStorage: QuotaExceededError"
      );
    });

    it("should handle localStorage access denied error", async () => {
      vi.mocked(localStorage.getItem).mockImplementation(() => {
        throw new Error("Access denied");
      });
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const tasks = await repository.getTasks();

      expect(tasks).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should handle malformed JSON in localStorage", async () => {
      mockLocalStorage["todoApp_tasks"] = '{"incomplete": json}';
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const tasks = await repository.getTasks();

      expect(tasks).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to load tasks from localStorage:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should handle null localStorage values", async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const tasks = await repository.getTasks();

      expect(tasks).toEqual([]);
    });

    it("should handle undefined localStorage values", async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(undefined as any);

      const tasks = await repository.getTasks();

      expect(tasks).toEqual([]);
    });
  });

  describe("storage key consistency", () => {
    it("should use consistent storage key across all operations", async () => {
      const task = new TaskModel("1", "Test task");

      // Add task
      await repository.addTask(task);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "todoApp_tasks",
        expect.any(String)
      );

      // Get tasks
      await repository.getTasks();
      expect(localStorage.getItem).toHaveBeenCalledWith("todoApp_tasks");

      // Update task
      await repository.updateTask("1", { text: "Updated" });
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "todoApp_tasks",
        expect.any(String)
      );

      // Delete task
      await repository.deleteTask("1");
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "todoApp_tasks",
        expect.any(String)
      );
    });
  });
});
