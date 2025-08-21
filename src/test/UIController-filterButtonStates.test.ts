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

describe("UIController Filter Button States Unit Tests", () => {
  let uiController: UIController;

  beforeEach(() => {
    // Reset localStorage mock
    localStorageMock.clear();
    vi.clearAllMocks();

    // Set up minimal DOM for UIController initialization
    document.body.innerHTML = `
      <div id="app">
        <form id="add-task-form">
          <input type="text" id="new-task-input" />
        </form>
        <ul id="task-list"></ul>
        <div id="stats-text"></div>
        <div id="empty-state"></div>
        
        <!-- Filter buttons for testing -->
        <button id="filter-all" class="filter-btn active" data-filter="all" aria-pressed="true">すべて</button>
        <button id="filter-active" class="filter-btn" data-filter="active" aria-pressed="false">未完了</button>
        <button id="filter-completed" class="filter-btn" data-filter="completed" aria-pressed="false">完了済み</button>
      </div>
    `;

    uiController = new UIController();
  });

  describe("updateFilterButtonStates method", () => {
    it("should set 'all' button as active and others as inactive", async () => {
      const allButton = document.getElementById(
        "filter-all"
      ) as HTMLButtonElement;
      const activeButton = document.getElementById(
        "filter-active"
      ) as HTMLButtonElement;
      const completedButton = document.getElementById(
        "filter-completed"
      ) as HTMLButtonElement;

      // First set a different button as active to test the change
      activeButton.classList.add("active");
      activeButton.setAttribute("aria-pressed", "true");
      allButton.classList.remove("active");
      allButton.setAttribute("aria-pressed", "false");

      // Call handleFilterChange to trigger updateFilterButtonStates
      await uiController.handleFilterChange("all");

      // Verify 'all' button is active
      expect(allButton.classList.contains("active")).toBe(true);
      expect(allButton.getAttribute("aria-pressed")).toBe("true");

      // Verify other buttons are inactive
      expect(activeButton.classList.contains("active")).toBe(false);
      expect(activeButton.getAttribute("aria-pressed")).toBe("false");
      expect(completedButton.classList.contains("active")).toBe(false);
      expect(completedButton.getAttribute("aria-pressed")).toBe("false");
    });

    it("should set 'active' button as active and others as inactive", async () => {
      const allButton = document.getElementById(
        "filter-all"
      ) as HTMLButtonElement;
      const activeButton = document.getElementById(
        "filter-active"
      ) as HTMLButtonElement;
      const completedButton = document.getElementById(
        "filter-completed"
      ) as HTMLButtonElement;

      // Call handleFilterChange to trigger updateFilterButtonStates
      await uiController.handleFilterChange("active");

      // Verify 'active' button is active
      expect(activeButton.classList.contains("active")).toBe(true);
      expect(activeButton.getAttribute("aria-pressed")).toBe("true");

      // Verify other buttons are inactive
      expect(allButton.classList.contains("active")).toBe(false);
      expect(allButton.getAttribute("aria-pressed")).toBe("false");
      expect(completedButton.classList.contains("active")).toBe(false);
      expect(completedButton.getAttribute("aria-pressed")).toBe("false");
    });

    it("should set 'completed' button as active and others as inactive", async () => {
      const allButton = document.getElementById(
        "filter-all"
      ) as HTMLButtonElement;
      const activeButton = document.getElementById(
        "filter-active"
      ) as HTMLButtonElement;
      const completedButton = document.getElementById(
        "filter-completed"
      ) as HTMLButtonElement;

      // Call handleFilterChange to trigger updateFilterButtonStates
      await uiController.handleFilterChange("completed");

      // Verify 'completed' button is active
      expect(completedButton.classList.contains("active")).toBe(true);
      expect(completedButton.getAttribute("aria-pressed")).toBe("true");

      // Verify other buttons are inactive
      expect(allButton.classList.contains("active")).toBe(false);
      expect(allButton.getAttribute("aria-pressed")).toBe("false");
      expect(activeButton.classList.contains("active")).toBe(false);
      expect(activeButton.getAttribute("aria-pressed")).toBe("false");
    });

    it("should handle missing filter buttons gracefully", async () => {
      // Remove all filter buttons
      document.querySelectorAll(".filter-btn").forEach((btn) => btn.remove());

      // This should not throw an error
      expect(async () => {
        await uiController.handleFilterChange("all");
      }).not.toThrow();
    });

    it("should handle buttons without data-filter attribute", async () => {
      // Add a button without data-filter attribute
      const invalidButton = document.createElement("button");
      invalidButton.className = "filter-btn";
      invalidButton.textContent = "Invalid";
      document.body.appendChild(invalidButton);

      // This should not throw an error and should set the button as inactive
      await uiController.handleFilterChange("all");

      // Invalid button should not have active class but should have aria-pressed="false"
      expect(invalidButton.classList.contains("active")).toBe(false);
      expect(invalidButton.getAttribute("aria-pressed")).toBe("false");
    });

    it("should properly toggle between different filter states", async () => {
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

      // Start with 'all'
      await uiController.handleFilterChange("all");
      expect(allButton.classList.contains("active")).toBe(true);
      expect(activeButton.classList.contains("active")).toBe(false);
      expect(completedButton.classList.contains("active")).toBe(false);

      // Switch to 'active'
      await uiController.handleFilterChange("active");
      expect(allButton.classList.contains("active")).toBe(false);
      expect(activeButton.classList.contains("active")).toBe(true);
      expect(completedButton.classList.contains("active")).toBe(false);

      // Switch to 'completed'
      await uiController.handleFilterChange("completed");
      expect(allButton.classList.contains("active")).toBe(false);
      expect(activeButton.classList.contains("active")).toBe(false);
      expect(completedButton.classList.contains("active")).toBe(true);

      // Switch back to 'all'
      await uiController.handleFilterChange("all");
      expect(allButton.classList.contains("active")).toBe(true);
      expect(activeButton.classList.contains("active")).toBe(false);
      expect(completedButton.classList.contains("active")).toBe(false);
    });
  });
});
