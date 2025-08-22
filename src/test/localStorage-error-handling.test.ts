/**
 * Integration Test: LocalStorage エラー時のエラーメッセージ表示
 *
 * このテストは LocalStorage が利用できない場合や、
 * 容量制限に達した場合のエラーハンドリングを検証します。
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { UIController } from "../controllers/UIController.js";

describe("LocalStorage Error Handling Integration Tests", () => {
  let container: HTMLElement;
  let originalLocalStorage: Storage;

  beforeEach(() => {
    // DOM セットアップ
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
              <label for="new-task-input" class="visually-hidden">新しいタスクを入力</label>
              <input 
                type="text" 
                id="new-task-input" 
                class="new-task-input"
                placeholder="新しいタスクを入力..."
                aria-describedby="input-help"
                maxlength="500"
                required
              />
              <span id="input-help" class="visually-hidden">Enterキーまたは追加ボタンでタスクを追加できます</span>
              <button type="submit" id="add-task-btn" class="add-task-btn" aria-label="タスクを追加">
                追加
              </button>
            </form>
            <!-- エラーメッセージ表示エリア -->
            <div id="error-message" class="error-message" style="display: none;" role="alert" aria-live="assertive">
            </div>
          </section>

          <section class="filter-section">
            <h2 class="visually-hidden">タスクフィルター</h2>
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
            <h2 class="visually-hidden">タスクリスト</h2>
            <ul id="task-list" class="task-list" role="list">
            </ul>
            <div id="empty-state" class="empty-state" style="display: none;">
              <p>タスクがありません。新しいタスクを追加してください。</p>
            </div>
          </section>
        </main>
      </div>
    `;

    container = document.getElementById("app")!;

    // LocalStorage の元の実装を保存
    originalLocalStorage = window.localStorage;

    // LocalStorage をクリア
    localStorage.clear();
  });

  afterEach(() => {
    // LocalStorage を元に戻す
    Object.defineProperty(window, "localStorage", {
      value: originalLocalStorage,
      writable: true,
    });

    // DOM をクリア
    document.body.innerHTML = "";
  });

  describe("LocalStorage setItem エラー", () => {
    it("LocalStorage.setItem が失敗した場合、エラーメッセージが表示される", async () => {
      // LocalStorage の setItem をモックして例外を投げる
      const mockLocalStorage = {
        ...originalLocalStorage,
        setItem: vi.fn().mockImplementation(() => {
          throw new Error(
            "Failed to save tasks to localStorage: Generic error"
          );
        }),
        getItem: vi.fn().mockReturnValue(null),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      };

      Object.defineProperty(window, "localStorage", {
        value: mockLocalStorage,
        writable: true,
      });

      // UIController を初期化
      const uiController = new UIController();

      // タスク追加を試行
      const taskInput = document.getElementById(
        "new-task-input"
      ) as HTMLInputElement;
      const addForm = document.getElementById(
        "add-task-form"
      ) as HTMLFormElement;

      taskInput.value = "Test task";

      // フォーム送信イベントを発火
      const submitEvent = new Event("submit", {
        bubbles: true,
        cancelable: true,
      });
      addForm.dispatchEvent(submitEvent);

      // エラーメッセージが表示されることを確認
      await new Promise((resolve) => setTimeout(resolve, 100)); // 非同期処理を待つ

      const errorMessage = document.getElementById("error-message");
      expect(errorMessage).toBeTruthy();
      expect(errorMessage!.style.display).not.toBe("none");
      expect(errorMessage!.textContent).toContain("保存に失敗しました");
    });
  });

  describe("LocalStorage getItem エラー", () => {
    it("LocalStorage.getItem が失敗した場合、エラーメッセージが表示される", async () => {
      // LocalStorage の getItem をモックして例外を投げる
      const mockLocalStorage = {
        ...originalLocalStorage,
        getItem: vi.fn().mockImplementation(() => {
          throw new Error("SecurityError: LocalStorage access denied");
        }),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      };

      Object.defineProperty(window, "localStorage", {
        value: mockLocalStorage,
        writable: true,
      });

      // UIController を初期化（この時点で getTasks が呼ばれてエラーが発生する）
      const uiController = new UIController();

      // エラーメッセージが表示されることを確認
      await new Promise((resolve) => setTimeout(resolve, 100)); // 非同期処理を待つ

      const errorMessage = document.getElementById("error-message");
      expect(errorMessage).toBeTruthy();
      expect(errorMessage!.style.display).not.toBe("none");
      expect(errorMessage!.textContent).toContain(
        "データの読み込みに失敗しました"
      );
    });
  });

  describe("LocalStorage 容量制限エラー", () => {
    it("LocalStorage の容量制限に達した場合、適切なエラーメッセージが表示される", async () => {
      // QuotaExceededError をシミュレート
      const mockLocalStorage = {
        ...originalLocalStorage,
        setItem: vi.fn().mockImplementation(() => {
          const error = new Error("QuotaExceededError");
          error.name = "QuotaExceededError";
          throw error;
        }),
        getItem: vi.fn().mockReturnValue(null),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      };

      Object.defineProperty(window, "localStorage", {
        value: mockLocalStorage,
        writable: true,
      });

      // UIController を初期化
      const uiController = new UIController();

      // タスク追加を試行
      const taskInput = document.getElementById(
        "new-task-input"
      ) as HTMLInputElement;
      const addForm = document.getElementById(
        "add-task-form"
      ) as HTMLFormElement;

      taskInput.value = "Test task";

      // フォーム送信イベントを発火
      const submitEvent = new Event("submit", {
        bubbles: true,
        cancelable: true,
      });
      addForm.dispatchEvent(submitEvent);

      // 容量制限エラーメッセージが表示されることを確認
      await new Promise((resolve) => setTimeout(resolve, 100)); // 非同期処理を待つ

      const errorMessage = document.getElementById("error-message");
      expect(errorMessage).toBeTruthy();
      expect(errorMessage!.style.display).not.toBe("none");
      expect(errorMessage!.textContent).toContain(
        "ストレージの容量が不足しています"
      );
    });
  });

  describe("エラーメッセージの自動非表示", () => {
    it("エラーメッセージは一定時間後に自動的に非表示になる", async () => {
      // LocalStorage エラーをシミュレート
      const mockLocalStorage = {
        ...originalLocalStorage,
        setItem: vi.fn().mockImplementation(() => {
          throw new Error("LocalStorage error");
        }),
        getItem: vi.fn().mockReturnValue(null),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      };

      Object.defineProperty(window, "localStorage", {
        value: mockLocalStorage,
        writable: true,
      });

      // UIController を初期化
      const uiController = new UIController();

      // タスク追加を試行してエラーを発生させる
      const taskInput = document.getElementById(
        "new-task-input"
      ) as HTMLInputElement;
      const addForm = document.getElementById(
        "add-task-form"
      ) as HTMLFormElement;

      taskInput.value = "Test task";

      const submitEvent = new Event("submit", {
        bubbles: true,
        cancelable: true,
      });
      addForm.dispatchEvent(submitEvent);

      // エラーメッセージが表示されることを確認
      await new Promise((resolve) => setTimeout(resolve, 100));

      const errorMessage = document.getElementById("error-message");
      expect(errorMessage!.style.display).not.toBe("none");

      // 5秒後にエラーメッセージが非表示になることを確認
      await new Promise((resolve) => setTimeout(resolve, 5100));
      expect(errorMessage!.style.display).toBe("none");
    }, 10000); // 10秒のタイムアウト
  });
});
