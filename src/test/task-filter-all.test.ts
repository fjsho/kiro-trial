import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

describe('Task Filter - All Filter Integration Test', () => {
  let dom: JSDOM;
  let document: Document;
  let window: Window & typeof globalThis;

  beforeEach(() => {
    // Create a new DOM for each test
    dom = new JSDOM(
      `
      <!DOCTYPE html>
      <html>
        <body>
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
                  <!-- Tasks will be dynamically added here -->
                </ul>
                <div id="empty-state" class="empty-state" style="display: none;">
                  <p>タスクがありません。新しいタスクを追加してください。</p>
                </div>
              </section>
            </main>
          </div>
        </body>
      </html>
    `,
      { url: 'http://localhost' }
    );

    document = dom.window.document;
    window = dom.window as Window & typeof globalThis;

    // Set up global DOM
    global.document = document;
    global.window = window;
    global.HTMLElement = window.HTMLElement;
    global.HTMLButtonElement = window.HTMLButtonElement;
    global.HTMLUListElement = window.HTMLUListElement;
    global.HTMLLIElement = window.HTMLLIElement;
    global.HTMLInputElement = window.HTMLInputElement;
    global.HTMLFormElement = window.HTMLFormElement;
    global.Event = window.Event;
    global.MouseEvent = window.MouseEvent;
    global.KeyboardEvent = window.KeyboardEvent;

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    global.localStorage = localStorageMock as any;
  });

  it('should display all tasks when "all" filter is clicked', async () => {
    // Import modules after DOM setup
    const { TaskModel } = await import('../models/Task');

    // Setup test data - mix of completed and active tasks
    const testTasks = [
      new TaskModel('1', 'Active Task 1', false, new Date()),
      new TaskModel('2', 'Completed Task 1', true, new Date()),
      new TaskModel('3', 'Active Task 2', false, new Date()),
      new TaskModel('4', 'Completed Task 2', true, new Date()),
    ];

    // Mock localStorage to return test tasks
    const mockGetItem = vi.fn().mockReturnValue(
      JSON.stringify(
        testTasks.map(task => ({
          id: task.id,
          text: task.text,
          completed: task.completed,
          createdAt: task.createdAt.toISOString(),
        }))
      )
    );
    global.localStorage.getItem = mockGetItem;

    // Initialize UIController which should handle filter functionality
    const { UIController } = await import('../controllers/UIController');
    const uiController = new UIController();

    // Get the "all" filter button
    const allFilterButton = document.getElementById(
      'filter-all'
    ) as HTMLButtonElement;
    expect(allFilterButton).toBeTruthy();

    // This should fail because UIController doesn't have filter functionality yet
    // Check if the method exists - this should fail
    expect((uiController as any).handleFilterChange).toBeDefined();
  });
});
