/**
 * Integration Test for Application Initialization
 * Tests the complete application startup process from main.ts entry point
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the UIController to test initialization
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

import { App } from "../main.js";
import { UIController } from "../controllers/UIController.js";

describe("Application Initialization Integration Tests", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Reset DOM
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

  it("should initialize the App class successfully", async () => {
    const app = new App();

    // Verify initial state
    expect(app.getIsInitialized()).toBe(false);
    expect(app.getUIController()).toBeNull();
    expect(app.getTaskService()).toBeNull();

    // Initialize the app
    await app.init();

    // Verify initialization
    expect(app.getIsInitialized()).toBe(true);
    expect(UIController).toHaveBeenCalledTimes(1);
    expect(app.getUIController()).not.toBeNull();
    expect(app.getTaskService()).not.toBeNull();
  });

  it("should prevent multiple initializations", async () => {
    const app = new App();

    // Initialize twice
    await app.init();
    await app.init();

    // Verify UIController was only created once
    expect(UIController).toHaveBeenCalledTimes(1);
    expect(app.getIsInitialized()).toBe(true);
  });

  it("should handle initialization errors gracefully", async () => {
    // Mock UIController to throw an error
    vi.mocked(UIController).mockImplementationOnce(() => {
      throw new Error("Initialization failed");
    });

    // Mock console.error to verify error handling
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const app = new App();

    // Expect initialization to throw
    await expect(app.init()).rejects.toThrow("Initialization failed");

    // Verify error was logged
    expect(consoleSpy).toHaveBeenCalledWith(
      "[TodoApp] Failed to initialize application: Error: Initialization failed"
    );

    // Verify error message is displayed
    const errorElement = document.getElementById("error-message");
    expect(errorElement?.textContent).toBe(
      "アプリケーションの初期化に失敗しました。ページを再読み込みしてください。"
    );
    expect(errorElement?.style.display).toBe("block");

    // Verify app state remains uninitialized
    expect(app.getIsInitialized()).toBe(false);

    consoleSpy.mockRestore();
  });

  it("should reset application state properly", async () => {
    const app = new App();

    // Initialize the app
    await app.init();
    expect(app.getIsInitialized()).toBe(true);

    // Reset the app
    app.reset();

    // Verify reset state
    expect(app.getIsInitialized()).toBe(false);
    expect(app.getUIController()).toBeNull();
    expect(app.getTaskService()).toBeNull();
  });

  it("should initialize with proper dependency injection", async () => {
    const app = new App();

    await app.init();

    // Verify that both UI controller and task service are initialized
    expect(app.getUIController()).not.toBeNull();
    expect(app.getTaskService()).not.toBeNull();

    // Verify UIController was instantiated
    expect(UIController).toHaveBeenCalledTimes(1);
  });

  it("should verify required DOM elements exist", () => {
    // Verify required DOM elements exist for initialization
    expect(document.getElementById("task-list")).toBeTruthy();
    expect(document.getElementById("add-task-form")).toBeTruthy();
    expect(document.getElementById("new-task-input")).toBeTruthy();
    expect(document.getElementById("stats-text")).toBeTruthy();
    expect(document.getElementById("error-message")).toBeTruthy();
  });
});
