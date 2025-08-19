import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  type MockedFunction,
} from "vitest";
import {
  TaskService,
  type FilterType,
  type TaskStats,
} from "../services/TaskService";
import type { TaskRepository } from "../repositories/TaskRepository";
import { TaskModel } from "../models/Task";
import type { Task } from "../models/Task";

// Mock the idGenerator module
vi.mock("../utils/idGenerator.js", () => ({
  generateTaskId: vi.fn(() => "mock-task-id"),
}));

describe("TaskService", () => {
  let taskService: TaskService;
  let mockRepository: TaskRepository;

  // Mock repository methods
  const mockAddTask = vi.fn() as MockedFunction<TaskRepository["addTask"]>;
  const mockUpdateTask = vi.fn() as MockedFunction<
    TaskRepository["updateTask"]
  >;
  const mockDeleteTask = vi.fn() as MockedFunction<
    TaskRepository["deleteTask"]
  >;
  const mockGetTasks = vi.fn() as MockedFunction<TaskRepository["getTasks"]>;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create mock repository
    mockRepository = {
      addTask: mockAddTask,
      updateTask: mockUpdateTask,
      deleteTask: mockDeleteTask,
      getTasks: mockGetTasks,
    };

    // Create TaskService instance with mock repository
    taskService = new TaskService(mockRepository);
  });

  describe("addTask()", () => {
    describe("正常系", () => {
      it("should add a task with valid text", async () => {
        const taskText = "Test task";
        const expectedTask = new TaskModel("mock-task-id", taskText);
        mockAddTask.mockResolvedValue(expectedTask);

        const result = await taskService.addTask(taskText);

        expect(mockAddTask).toHaveBeenCalledWith(
          expect.objectContaining({
            id: "mock-task-id",
            text: taskText,
            completed: false,
            createdAt: expect.any(Date),
          })
        );
        expect(result).toEqual(expectedTask);
      });

      it("should trim whitespace from task text", async () => {
        const taskText = "  Test task  ";
        const trimmedText = "Test task";
        const expectedTask = new TaskModel("mock-task-id", trimmedText);
        mockAddTask.mockResolvedValue(expectedTask);

        await taskService.addTask(taskText);

        expect(mockAddTask).toHaveBeenCalledWith(
          expect.objectContaining({
            text: trimmedText,
          })
        );
      });

      it("should handle maximum length text", async () => {
        const maxLengthText = "a".repeat(500);
        const expectedTask = new TaskModel("mock-task-id", maxLengthText);
        mockAddTask.mockResolvedValue(expectedTask);

        const result = await taskService.addTask(maxLengthText);

        expect(mockAddTask).toHaveBeenCalledWith(
          expect.objectContaining({
            text: maxLengthText,
          })
        );
        expect(result).toEqual(expectedTask);
      });
    });

    describe("異常系", () => {
      it("should throw error for empty text", async () => {
        await expect(taskService.addTask("")).rejects.toThrow(
          "Task text cannot be empty"
        );
        expect(mockAddTask).not.toHaveBeenCalled();
      });

      it("should throw error for whitespace-only text", async () => {
        await expect(taskService.addTask("   ")).rejects.toThrow(
          "Task text cannot be empty"
        );
        expect(mockAddTask).not.toHaveBeenCalled();
      });

      it("should throw error for text exceeding maximum length", async () => {
        const tooLongText = "a".repeat(501);

        await expect(taskService.addTask(tooLongText)).rejects.toThrow(
          "Task text cannot exceed 500 characters"
        );
        expect(mockAddTask).not.toHaveBeenCalled();
      });

      it("should throw error for null text", async () => {
        await expect(taskService.addTask(null as any)).rejects.toThrow(
          "Task text cannot be empty"
        );
        expect(mockAddTask).not.toHaveBeenCalled();
      });

      it("should throw error for undefined text", async () => {
        await expect(taskService.addTask(undefined as any)).rejects.toThrow(
          "Task text cannot be empty"
        );
        expect(mockAddTask).not.toHaveBeenCalled();
      });
    });
  });

  describe("validateTaskText()", () => {
    // Note: validateTaskText is private, so we test it through addTask()
    describe("バリデーションテスト", () => {
      it("should accept valid text with minimum length", async () => {
        const validText = "a";
        const expectedTask = new TaskModel("mock-task-id", validText);
        mockAddTask.mockResolvedValue(expectedTask);

        await expect(taskService.addTask(validText)).resolves.not.toThrow();
      });

      it("should accept valid text with maximum length", async () => {
        const validText = "a".repeat(500);
        const expectedTask = new TaskModel("mock-task-id", validText);
        mockAddTask.mockResolvedValue(expectedTask);

        await expect(taskService.addTask(validText)).resolves.not.toThrow();
      });

      it("should reject text that is too long", async () => {
        const invalidText = "a".repeat(501);

        await expect(taskService.addTask(invalidText)).rejects.toThrow(
          "Task text cannot exceed 500 characters"
        );
      });

      it("should reject empty text after trimming", async () => {
        await expect(taskService.addTask("   ")).rejects.toThrow(
          "Task text cannot be empty"
        );
      });
    });
  });

  describe("updateTask()", () => {
    it("should update a task with provided updates", async () => {
      const taskId = "test-id";
      const updates = { text: "Updated task", completed: true };
      const updatedTask = new TaskModel(taskId, "Updated task", true);
      mockUpdateTask.mockResolvedValue(updatedTask);

      const result = await taskService.updateTask(taskId, updates);

      expect(mockUpdateTask).toHaveBeenCalledWith(taskId, updates);
      expect(result).toEqual(updatedTask);
    });

    it("should update task with partial updates", async () => {
      const taskId = "test-id";
      const updates = { completed: true };
      const updatedTask = new TaskModel(taskId, "Original task", true);
      mockUpdateTask.mockResolvedValue(updatedTask);

      const result = await taskService.updateTask(taskId, updates);

      expect(mockUpdateTask).toHaveBeenCalledWith(taskId, updates);
      expect(result).toEqual(updatedTask);
    });

    it("should handle repository errors", async () => {
      const taskId = "test-id";
      const updates = { text: "Updated task" };
      const error = new Error("Repository error");
      mockUpdateTask.mockRejectedValue(error);

      await expect(taskService.updateTask(taskId, updates)).rejects.toThrow(
        "Repository error"
      );
    });
  });

  describe("deleteTask()", () => {
    it("should delete a task by id", async () => {
      const taskId = "test-id";
      mockDeleteTask.mockResolvedValue();

      await taskService.deleteTask(taskId);

      expect(mockDeleteTask).toHaveBeenCalledWith(taskId);
    });

    it("should handle repository errors", async () => {
      const taskId = "test-id";
      const error = new Error("Repository error");
      mockDeleteTask.mockRejectedValue(error);

      await expect(taskService.deleteTask(taskId)).rejects.toThrow(
        "Repository error"
      );
    });
  });

  describe("toggleTask()", () => {
    it("should toggle task from incomplete to complete", async () => {
      const taskId = "test-id";
      const originalTask = new TaskModel(taskId, "Test task", false);
      const toggledTask = new TaskModel(taskId, "Test task", true);

      mockGetTasks.mockResolvedValue([originalTask]);
      mockUpdateTask.mockResolvedValue(toggledTask);

      const result = await taskService.toggleTask(taskId);

      expect(mockGetTasks).toHaveBeenCalled();
      expect(mockUpdateTask).toHaveBeenCalledWith(taskId, { completed: true });
      expect(result).toEqual(toggledTask);
    });

    it("should toggle task from complete to incomplete", async () => {
      const taskId = "test-id";
      const originalTask = new TaskModel(taskId, "Test task", true);
      const toggledTask = new TaskModel(taskId, "Test task", false);

      mockGetTasks.mockResolvedValue([originalTask]);
      mockUpdateTask.mockResolvedValue(toggledTask);

      const result = await taskService.toggleTask(taskId);

      expect(mockGetTasks).toHaveBeenCalled();
      expect(mockUpdateTask).toHaveBeenCalledWith(taskId, { completed: false });
      expect(result).toEqual(toggledTask);
    });

    it("should throw error when task is not found", async () => {
      const taskId = "non-existent-id";
      mockGetTasks.mockResolvedValue([]);

      await expect(taskService.toggleTask(taskId)).rejects.toThrow(
        "Task with id non-existent-id not found"
      );
      expect(mockUpdateTask).not.toHaveBeenCalled();
    });

    it("should handle multiple tasks and find the correct one", async () => {
      const taskId = "task-2";
      const tasks = [
        new TaskModel("task-1", "Task 1", false),
        new TaskModel("task-2", "Task 2", false),
        new TaskModel("task-3", "Task 3", true),
      ];
      const toggledTask = new TaskModel(taskId, "Task 2", true);

      mockGetTasks.mockResolvedValue(tasks);
      mockUpdateTask.mockResolvedValue(toggledTask);

      const result = await taskService.toggleTask(taskId);

      expect(mockUpdateTask).toHaveBeenCalledWith(taskId, { completed: true });
      expect(result).toEqual(toggledTask);
    });
  });

  describe("getFilteredTasks()", () => {
    const mockTasks: Task[] = [
      new TaskModel("task-1", "Active task 1", false),
      new TaskModel("task-2", "Completed task 1", true),
      new TaskModel("task-3", "Active task 2", false),
      new TaskModel("task-4", "Completed task 2", true),
      new TaskModel("task-5", "Active task 3", false),
    ];

    beforeEach(() => {
      mockGetTasks.mockResolvedValue(mockTasks);
    });

    describe("フィルタリングロジックのテスト", () => {
      it("should return all tasks when filter is 'all'", async () => {
        const result = await taskService.getFilteredTasks("all");

        expect(mockGetTasks).toHaveBeenCalled();
        expect(result).toEqual(mockTasks);
        expect(result).toHaveLength(5);
      });

      it("should return only active tasks when filter is 'active'", async () => {
        const result = await taskService.getFilteredTasks("active");

        expect(mockGetTasks).toHaveBeenCalled();
        expect(result).toHaveLength(3);
        expect(result.every((task) => !task.completed)).toBe(true);
        expect(result.map((task) => task.id)).toEqual([
          "task-1",
          "task-3",
          "task-5",
        ]);
      });

      it("should return only completed tasks when filter is 'completed'", async () => {
        const result = await taskService.getFilteredTasks("completed");

        expect(mockGetTasks).toHaveBeenCalled();
        expect(result).toHaveLength(2);
        expect(result.every((task) => task.completed)).toBe(true);
        expect(result.map((task) => task.id)).toEqual(["task-2", "task-4"]);
      });

      it("should handle empty task list", async () => {
        mockGetTasks.mockResolvedValue([]);

        const allResult = await taskService.getFilteredTasks("all");
        const activeResult = await taskService.getFilteredTasks("active");
        const completedResult = await taskService.getFilteredTasks("completed");

        expect(allResult).toEqual([]);
        expect(activeResult).toEqual([]);
        expect(completedResult).toEqual([]);
      });

      it("should handle all tasks being active", async () => {
        const allActiveTasks = [
          new TaskModel("task-1", "Active task 1", false),
          new TaskModel("task-2", "Active task 2", false),
        ];
        mockGetTasks.mockResolvedValue(allActiveTasks);

        const activeResult = await taskService.getFilteredTasks("active");
        const completedResult = await taskService.getFilteredTasks("completed");

        expect(activeResult).toEqual(allActiveTasks);
        expect(completedResult).toEqual([]);
      });

      it("should handle all tasks being completed", async () => {
        const allCompletedTasks = [
          new TaskModel("task-1", "Completed task 1", true),
          new TaskModel("task-2", "Completed task 2", true),
        ];
        mockGetTasks.mockResolvedValue(allCompletedTasks);

        const activeResult = await taskService.getFilteredTasks("active");
        const completedResult = await taskService.getFilteredTasks("completed");

        expect(activeResult).toEqual([]);
        expect(completedResult).toEqual(allCompletedTasks);
      });

      it("should default to 'all' for invalid filter type", async () => {
        const result = await taskService.getFilteredTasks(
          "invalid" as FilterType
        );

        expect(result).toEqual(mockTasks);
        expect(result).toHaveLength(5);
      });
    });
  });
  describe("getTaskStats()", () => {
    describe("統計計算のテスト", () => {
      it("should calculate stats for mixed tasks", async () => {
        const mockTasks: Task[] = [
          new TaskModel("task-1", "Active task 1", false),
          new TaskModel("task-2", "Completed task 1", true),
          new TaskModel("task-3", "Active task 2", false),
          new TaskModel("task-4", "Completed task 2", true),
          new TaskModel("task-5", "Active task 3", false),
        ];
        mockGetTasks.mockResolvedValue(mockTasks);

        const result = await taskService.getTaskStats();

        expect(mockGetTasks).toHaveBeenCalled();
        expect(result).toEqual({
          total: 5,
          completed: 2,
          active: 3,
        });
      });

      it("should calculate stats for empty task list", async () => {
        mockGetTasks.mockResolvedValue([]);

        const result = await taskService.getTaskStats();

        expect(result).toEqual({
          total: 0,
          completed: 0,
          active: 0,
        });
      });

      it("should calculate stats for all active tasks", async () => {
        const allActiveTasks: Task[] = [
          new TaskModel("task-1", "Active task 1", false),
          new TaskModel("task-2", "Active task 2", false),
          new TaskModel("task-3", "Active task 3", false),
        ];
        mockGetTasks.mockResolvedValue(allActiveTasks);

        const result = await taskService.getTaskStats();

        expect(result).toEqual({
          total: 3,
          completed: 0,
          active: 3,
        });
      });

      it("should calculate stats for all completed tasks", async () => {
        const allCompletedTasks: Task[] = [
          new TaskModel("task-1", "Completed task 1", true),
          new TaskModel("task-2", "Completed task 2", true),
        ];
        mockGetTasks.mockResolvedValue(allCompletedTasks);

        const result = await taskService.getTaskStats();

        expect(result).toEqual({
          total: 2,
          completed: 2,
          active: 0,
        });
      });

      it("should calculate stats for single task", async () => {
        const singleTask: Task[] = [
          new TaskModel("task-1", "Single task", false),
        ];
        mockGetTasks.mockResolvedValue(singleTask);

        const result = await taskService.getTaskStats();

        expect(result).toEqual({
          total: 1,
          completed: 0,
          active: 1,
        });
      });

      it("should handle repository errors", async () => {
        const error = new Error("Repository error");
        mockGetTasks.mockRejectedValue(error);

        await expect(taskService.getTaskStats()).rejects.toThrow(
          "Repository error"
        );
      });

      it("should ensure active + completed equals total", async () => {
        const mockTasks: Task[] = [
          new TaskModel("task-1", "Task 1", true),
          new TaskModel("task-2", "Task 2", false),
          new TaskModel("task-3", "Task 3", true),
          new TaskModel("task-4", "Task 4", false),
          new TaskModel("task-5", "Task 5", false),
          new TaskModel("task-6", "Task 6", true),
        ];
        mockGetTasks.mockResolvedValue(mockTasks);

        const result = await taskService.getTaskStats();

        expect(result.active + result.completed).toBe(result.total);
        expect(result).toEqual({
          total: 6,
          completed: 3,
          active: 3,
        });
      });
    });
  });

  describe("getTasks()", () => {
    it("should return all tasks from repository", async () => {
      const mockTasks: Task[] = [
        new TaskModel("task-1", "Task 1", false),
        new TaskModel("task-2", "Task 2", true),
      ];
      mockGetTasks.mockResolvedValue(mockTasks);

      const result = await taskService.getTasks();

      expect(mockGetTasks).toHaveBeenCalled();
      expect(result).toEqual(mockTasks);
    });

    it("should handle empty task list", async () => {
      mockGetTasks.mockResolvedValue([]);

      const result = await taskService.getTasks();

      expect(result).toEqual([]);
    });

    it("should handle repository errors", async () => {
      const error = new Error("Repository error");
      mockGetTasks.mockRejectedValue(error);

      await expect(taskService.getTasks()).rejects.toThrow("Repository error");
    });
  });

  describe("Integration scenarios", () => {
    it("should handle complete workflow: add, toggle, filter, stats", async () => {
      // Setup: Add a task
      const taskText = "Integration test task";
      const newTask = new TaskModel("mock-task-id", taskText, false);
      mockAddTask.mockResolvedValue(newTask);

      // Add task
      const addedTask = await taskService.addTask(taskText);
      expect(addedTask).toEqual(newTask);

      // Setup: Toggle task
      const toggledTask = new TaskModel("mock-task-id", taskText, true);
      mockGetTasks.mockResolvedValue([newTask]);
      mockUpdateTask.mockResolvedValue(toggledTask);

      // Toggle task
      const result = await taskService.toggleTask("mock-task-id");
      expect(result.completed).toBe(true);

      // Setup: Get filtered tasks and stats
      mockGetTasks.mockResolvedValue([toggledTask]);

      // Filter completed tasks
      const completedTasks = await taskService.getFilteredTasks("completed");
      expect(completedTasks).toHaveLength(1);
      expect(completedTasks[0].completed).toBe(true);

      // Get stats
      const stats = await taskService.getTaskStats();
      expect(stats).toEqual({
        total: 1,
        completed: 1,
        active: 0,
      });
    });
  });
});
