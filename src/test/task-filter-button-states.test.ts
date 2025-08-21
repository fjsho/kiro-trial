import { describe, it, expect, beforeEach, vi } from "vitest";
import { UIController } from "../controllers/UIController.js";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Filter Button States Integration Tests", () => {
  let uiController: UIController;

  beforeEach(() => {
    // Reset localStorage mock
    localStorageMock.clear();
    vi.clearAllMocks();

    // Set up DOM
    document.body.innerHTML = `
      <div id="app">
        <header class="app-header">
          <h1>Simple TODO App</h1>
          <div class="stats" role="status" aria-live="polite">
            <span id="stats-text">0 個中 0 個完了</span>
          </div>
        </header>

        <main class="app-main">
          <section class="input-section">
            <form id="add-task-form" class="add-task-form">
              <input 
                type="text" 
                id="new-task-input" 
                class="new-task-input"
                placeholder="新しいタスクを入力..."
              />
              <button type="submit" id="add-task-btn" class="add-task-btn">
                追加
              </button>
            </form>
          </section>

          <section class="filter-section">
            <div class="filter-buttons" role="group" aria-label="タスクフィルター">
              <button 
                type="button" 
                id="filter-all" 
                class="filter-btn active" 
                data-filter="all"
                aria-pressed="true"
              >
                すべて
              </button>
              <button 
                type="button" 
                id="filter-active" 
                class="filter-btn" 
                data-filter="active"
                aria-pressed="false"
              >
                未完了
              </button>
              <button 
                type="button" 
                id="filter-completed" 
                class="filter-btn" 
                data-filter="completed"
                aria-pressed="false"
              >
                完了済み
              </button>
            </div>
          </section>

          <section class="task-list-section">
            <ul id="task-list" class="task-list" role="list">
            </ul>
            <div id="empty-state" class="empty-state" style="display: none;">
              <p>タスクがありません。新しいタスクを追加してください。</p>
            </div>
          </section>
        </main>
      </div>
    `;

    // Initialize UIController
    uiController = new UIController();
  });

  describe("Filter Button Active State Management", () => {
    it("should have 'all' filter button active by default", () => {
      const allButton = document.getElementById(
        "filter-all"
      ) as HTMLButtonElement;
      const activeButton = document.getElementById(
        "filter-active"
      ) as HTMLButtonElement;
      const completedButton = document.getElementById(
        "filter-completed"
      ) as HTMLButtonElement;

      expect(allButton.classList.contains("active")).toBe(true);
      expect(allButton.getAttribute("aria-pressed")).toBe("true");
      expect(activeButton.classList.contains("active")).toBe(false);
      expect(activeButton.getAttribute("aria-pressed")).toBe("false");
      expect(completedButton.classList.contains("active")).toBe(false);
      expect(completedButton.getAttribute("aria-pressed")).toBe("false");
    });

    it("should switch active state when clicking 'active' filter button", async () => {
      const allButton = document.getElementById(
        "filter-all"
      ) as HTMLButtonElement;
      const activeButton = document.getElementById(
        "filter-active"
      ) as HTMLButtonElement;
      const completedButton = document.getElementById(
        "filter-completed"
      ) as HTMLButtonElement;

      // Click the active filter button
      activeButton.click();

      // Wait for async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Check that active button is now active
      expect(activeButton.classList.contains("active")).toBe(true);
      expect(activeButton.getAttribute("aria-pressed")).toBe("true");

      // Check that other buttons are not active
      expect(allButton.classList.contains("active")).toBe(false);
      expect(allButton.getAttribute("aria-pressed")).toBe("false");
      expect(completedButton.classList.contains("active")).toBe(false);
      expect(completedButton.getAttribute("aria-pressed")).toBe("false");
    });

    it("should switch active state when clicking 'completed' filter button", async () => {
      const allButton = document.getElementById(
        "filter-all"
      ) as HTMLButtonElement;
      const activeButton = document.getElementById(
        "filter-active"
      ) as HTMLButtonElement;
      const completedButton = document.getElementById(
        "filter-completed"
      ) as HTMLButtonElement;

      // Click the completed filter button
      completedButton.click();

      // Wait for async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Check that completed button is now active
      expect(completedButton.classList.contains("active")).toBe(true);
      expect(completedButton.getAttribute("aria-pressed")).toBe("true");

      // Check that other buttons are not active
      expect(allButton.classList.contains("active")).toBe(false);
      expect(allButton.getAttribute("aria-pressed")).toBe("false");
      expect(activeButton.classList.contains("active")).toBe(false);
      expect(activeButton.getAttribute("aria-pressed")).toBe("false");
    });

    it("should switch back to 'all' filter button when clicked", async () => {
      const allButton = document.getElementById(
        "filter-all"
      ) as HTMLButtonElement;
      const activeButton = document.getElementById(
        "filter-active"
      ) as HTMLButtonElement;
      const completedButton = document.getElementById(
        "filter-completed"
      ) as HTMLButtonElement;

      // First click active filter
      activeButton.click();
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Then click all filter
      allButton.click();
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Check that all button is now active
      expect(allButton.classList.contains("active")).toBe(true);
      expect(allButton.getAttribute("aria-pressed")).toBe("true");

      // Check that other buttons are not active
      expect(activeButton.classList.contains("active")).toBe(false);
      expect(activeButton.getAttribute("aria-pressed")).toBe("false");
      expect(completedButton.classList.contains("active")).toBe(false);
      expect(completedButton.getAttribute("aria-pressed")).toBe("false");
    });

    it("should maintain active state consistency when switching between filters", async () => {
      const allButton = document.getElementById(
        "filter-all"
      ) as HTMLButtonElement;
      const activeButton = document.getElementById(
        "filter-active"
      ) as HTMLButtonElement;
      const completedButton = document.getElementById(
        "filter-completed"
      ) as HTMLButtonElement;

      // Test sequence: all -> active -> completed -> all

      // Click active
      activeButton.click();
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(activeButton.classList.contains("active")).toBe(true);
      expect(allButton.classList.contains("active")).toBe(false);
      expect(completedButton.classList.contains("active")).toBe(false);

      // Click completed
      completedButton.click();
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(completedButton.classList.contains("active")).toBe(true);
      expect(allButton.classList.contains("active")).toBe(false);
      expect(activeButton.classList.contains("active")).toBe(false);

      // Click all
      allButton.click();
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(allButton.classList.contains("active")).toBe(true);
      expect(activeButton.classList.contains("active")).toBe(false);
      expect(completedButton.classList.contains("active")).toBe(false);
    });
  });
});
