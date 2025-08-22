/**
 * Unit Tests for App class
 * Tests the application initialization logic in isolation
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock all dependencies
vi.mock("../controllers/UIController.js", () => {
  return {
    UIController: vi.fn().mockImplementation(() => {
      return {
        initializeElements: vi.fn(),
        bindEvents: vi.fn(),
        loadInitialTasks: vi.fn(),
      };
    }),
  };
});

vi.mock("../services/TaskService.js", () => {
  return {
    TaskService: vi.fn().mockImplementation(() => {
      return {
        addTask: vi.fn(),
        getTasks: vi.fn(),
        updateTask: vi.fn(),
        deleteTask: vi.fn(),
      };
    }),
  };
});

vi.mock("../repositories/LocalStorageTaskRepository.js", () => {
  return {
    LocalStorageTaskRepository: vi.fn().mockImplementation(() => {
      return {
        addTask: vi.fn(),
        getTasks: vi.fn(),
        updateTask: vi.fn(),
        deleteTask: vi.fn(),
      };
    }),
  };
});

import { App } from "../main.js";
import { UIController } from "../controllers/UIController.js";
import { TaskService } from "../services/TaskService.js";
import { LocalStorageTaskRepository } from "../repositories/LocalStorageTaskRepository.js";

describe("App Unit Tests", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Reset DOM with required elements
    document.body.innerHTML = `
      <div id="app">
        <header>
          <h1>Simple Todo App</h1>
          <div id="stats-text">0 個中 0 個完了</div>
        </header>
        <main>
          <form id="add-task-form">
            <input type="text" id="new-task-input" placeholder="新しいタスクを入力..." />
            <button type="submit">追加</button>
          </form>
          <div class="filter-buttons">
            <button class="filter-btn active" data-filter="all" aria-pressed="true">すべて</button>
            <button class="filter-btn" data-filter="active" aria-pressed="false">未完了</button>
            <button class="filter-btn" data-filter="completed" aria-pressed="false">完了済み</button>
          </div>
          <ul id="task-list" role="list" aria-label="タスクリスト"></ul>
          <div id="empty-state" style="display: block;">
            <p>タスクがありません。新しいタスクを追加してください。</p>
          </div>
        </main>
        <div id="error-message" style="display: none;" role="alert" aria-live="polite"></div>
      </div>
    `;
  });

  describe("constructor", () => {
    it("should create App instance with initial state", () => {
      const app = new App();

      expect(app.getIsInitialized()).toBe(false);
      expect(app.getUIController()).toBeNull();
      expect(app.getTaskService()).toBeNull();
      expect(app.getRepository()).toBeNull();
    });

    it("should accept configuration options", () => {
      const config = { enableLogging: false, errorDisplayDuration: 3000 };
      const app = new App(config);

      expect(app.getConfig()).toEqual({
        enableLogging: false,
        errorDisplayDuration: 3000,
      });
    });

    it("should use default configuration when none provided", () => {
      const app = new App();

      expect(app.getConfig()).toEqual({
        enableLogging: true,
        errorDisplayDuration: 5000,
      });
    });
  });

  describe("init()", () => {
    it("should initialize all dependencies in correct order", async () => {
      const app = new App();

      await app.init();

      // Verify repository was created first
      expect(LocalStorageTaskRepository).toHaveBeenCalledTimes(1);
      expect(LocalStorageTaskRepository).toHaveBeenCalledWith();

      // Verify task service was created with repository
      expect(TaskService).toHaveBeenCalledTimes(1);
      expect(TaskService).toHaveBeenCalledWith(expect.any(Object));

      // Verify UI controller was created
      expect(UIController).toHaveBeenCalledTimes(1);
      expect(UIController).toHaveBeenCalledWith();

      // Verify app state
      expect(app.getIsInitialized()).toBe(true);
      expect(app.getUIController()).not.toBeNull();
      expect(app.getTaskService()).not.toBeNull();
      expect(app.getRepository()).not.toBeNull();
    });

    it("should prevent multiple initializations", async () => {
      const app = new App();

      await app.init();
      await app.init();
      await app.init();

      // Verify dependencies were only created once
      expect(LocalStorageTaskRepository).toHaveBeenCalledTimes(1);
      expect(TaskService).toHaveBeenCalledTimes(1);
      expect(UIController).toHaveBeenCalledTimes(1);

      expect(app.getIsInitialized()).toBe(true);
    });

    it("should validate DOM requirements before initialization", async () => {
      // Remove required element
      document.getElementById("task-list")?.remove();

      const app = new App();

      await expect(app.init()).rejects.toThrow(
        "Missing required DOM elements: task-list"
      );

      expect(app.getIsInitialized()).toBe(false);
    });

    it("should handle initialization errors gracefully", async () => {
      vi.mocked(UIController).mockImplementationOnce(() => {
        throw new Error("UIController initialization failed");
      });

      const app = new App();

      await expect(app.init()).rejects.toThrow(
        "UIController initialization failed"
      );

      expect(app.getIsInitialized()).toBe(false);

      // Verify error message is displayed
      const errorElement = document.getElementById("error-message");
      expect(errorElement?.textContent).toBe(
        "アプリケーションの初期化に失敗しました。ページを再読み込みしてください。"
      );
      expect(errorElement?.style.display).toBe("block");
    });

    it("should handle missing error element gracefully", async () => {
      // Remove error element from DOM
      document.getElementById("error-message")?.remove();

      const app = new App();

      // Should throw DOM validation error first
      await expect(app.init()).rejects.toThrow(
        "Missing required DOM elements: error-message"
      );
    });

    it("should respect logging configuration", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      // Reset mocks to ensure clean state
      vi.clearAllMocks();

      // Test with logging disabled
      const appNoLogging = new App({ enableLogging: false });
      await appNoLogging.init();

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockClear();
      appNoLogging.reset();

      // Test with logging enabled
      const appWithLogging = new App({ enableLogging: true });
      await appWithLogging.init();

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("reset()", () => {
    it("should reset all application state", async () => {
      const app = new App();

      // Initialize first
      await app.init();
      expect(app.getIsInitialized()).toBe(true);

      // Reset
      app.reset();

      // Verify reset state
      expect(app.getIsInitialized()).toBe(false);
      expect(app.getUIController()).toBeNull();
      expect(app.getTaskService()).toBeNull();
      expect(app.getRepository()).toBeNull();
    });

    it("should allow re-initialization after reset", async () => {
      const app = new App();

      // Initialize, reset, and initialize again
      await app.init();
      app.reset();
      await app.init();

      // Verify dependencies were created twice
      expect(LocalStorageTaskRepository).toHaveBeenCalledTimes(2);
      expect(TaskService).toHaveBeenCalledTimes(2);
      expect(UIController).toHaveBeenCalledTimes(2);

      expect(app.getIsInitialized()).toBe(true);
    });

    it("should be safe to call reset on uninitialized app", () => {
      const app = new App();

      // Should not throw
      expect(() => app.reset()).not.toThrow();

      expect(app.getIsInitialized()).toBe(false);
      expect(app.getUIController()).toBeNull();
      expect(app.getTaskService()).toBeNull();
      expect(app.getRepository()).toBeNull();
    });
  });

  describe("getters", () => {
    it("should return correct initial values", () => {
      const app = new App();

      expect(app.getIsInitialized()).toBe(false);
      expect(app.getUIController()).toBeNull();
      expect(app.getTaskService()).toBeNull();
      expect(app.getRepository()).toBeNull();
    });

    it("should return correct values after initialization", async () => {
      const app = new App();

      await app.init();

      expect(app.getIsInitialized()).toBe(true);
      expect(app.getUIController()).not.toBeNull();
      expect(app.getTaskService()).not.toBeNull();
      expect(app.getRepository()).not.toBeNull();
    });

    it("should return correct values after reset", async () => {
      const app = new App();

      await app.init();
      app.reset();

      expect(app.getIsInitialized()).toBe(false);
      expect(app.getUIController()).toBeNull();
      expect(app.getTaskService()).toBeNull();
      expect(app.getRepository()).toBeNull();
    });
  });
});
