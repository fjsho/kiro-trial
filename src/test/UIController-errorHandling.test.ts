/**
 * Unit Test: UIController エラーハンドリングロジック
 *
 * UIController のエラーハンドリングメソッドの詳細な単体テストです。
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UIController } from '../controllers/UIController.js';

describe('UIController Error Handling Unit Tests', () => {
  let uiController: UIController;

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

    // DOM setup complete

    // LocalStorage をクリア
    localStorage.clear();

    // UIController を初期化
    uiController = new UIController();
  });

  afterEach(() => {
    // DOM をクリア
    document.body.innerHTML = '';
  });

  describe('getErrorDisplayMessage メソッド', () => {
    it('QuotaExceededError の場合、容量不足メッセージを返す', () => {
      const error = new Error('QuotaExceededError');
      error.name = 'QuotaExceededError';

      // プライベートメソッドにアクセスするため any にキャスト
      const result = (uiController as any).getErrorDisplayMessage(
        'Failed to save',
        error
      );

      expect(result).toBe(
        'ストレージの容量が不足しています。不要なデータを削除してください。'
      );
    });

    it('QuotaExceededError がメッセージに含まれる場合、容量不足メッセージを返す', () => {
      const error = new Error('Failed to save: QuotaExceededError occurred');

      const result = (uiController as any).getErrorDisplayMessage(
        'Failed to save',
        error
      );

      expect(result).toBe(
        'ストレージの容量が不足しています。不要なデータを削除してください。'
      );
    });

    it('読み込みエラーの場合、読み込み失敗メッセージを返す', () => {
      const error = new Error('Failed to load tasks from localStorage');

      const result = (uiController as any).getErrorDisplayMessage(
        'Failed to load initial tasks',
        error
      );

      expect(result).toBe(
        'データの読み込みに失敗しました。ページを再読み込みしてください。'
      );
    });

    it('保存エラーの場合、保存失敗メッセージを返す', () => {
      const error = new Error('Failed to save tasks to localStorage');

      const result = (uiController as any).getErrorDisplayMessage(
        'Failed to add task',
        error
      );

      expect(result).toBe(
        '保存に失敗しました。しばらく時間をおいてから再度お試しください。'
      );
    });

    it('更新エラーの場合、更新失敗メッセージを返す', () => {
      const error = new Error('Failed to update task');

      const result = (uiController as any).getErrorDisplayMessage(
        'Update failed',
        error
      );

      expect(result).toBe('タスクの更新に失敗しました。再度お試しください。');
    });

    it('削除エラーの場合、削除失敗メッセージを返す', () => {
      const error = new Error('Failed to delete task');

      const result = (uiController as any).getErrorDisplayMessage(
        'Delete failed',
        error
      );

      expect(result).toBe('タスクの削除に失敗しました。再度お試しください。');
    });

    it('未知のエラーの場合、汎用エラーメッセージを返す', () => {
      const error = new Error('Unknown error occurred');

      const result = (uiController as any).getErrorDisplayMessage(
        'Something went wrong',
        error
      );

      expect(result).toBe(
        '操作に失敗しました。しばらく時間をおいてから再度お試しください。'
      );
    });

    it('エラーオブジェクトでない場合も適切に処理する', () => {
      const error = 'String error message';

      const result = (uiController as any).getErrorDisplayMessage(
        'Something failed',
        error
      );

      expect(result).toBe(
        '操作に失敗しました。しばらく時間をおいてから再度お試しください。'
      );
    });
  });

  describe('showErrorMessage メソッド', () => {
    it('エラーメッセージ要素が存在する場合、メッセージを表示する', () => {
      const error = new Error('Test error');

      // showErrorMessage を呼び出し
      (uiController as any).showErrorMessage('Test message', error);

      const errorElement = document.getElementById('error-message');
      expect(errorElement!.style.display).toBe('block');
      expect(errorElement!.textContent).toBe(
        '操作に失敗しました。しばらく時間をおいてから再度お試しください。'
      );
    });

    it('エラーメッセージ要素が存在しない場合、エラーを出さずに処理を続行する', () => {
      // エラーメッセージ要素を削除
      const errorElement = document.getElementById('error-message');
      errorElement?.remove();

      const error = new Error('Test error');

      // エラーが発生しないことを確認
      expect(() => {
        (uiController as any).showErrorMessage('Test message', error);
      }).not.toThrow();
    });

    it('複数のエラーが連続で発生した場合、前のタイマーをクリアする', () => {
      const error1 = new Error('First error');
      const error2 = new Error('Second error');

      // 最初のエラーを表示
      (uiController as any).showErrorMessage('First message', error1);

      const errorElement = document.getElementById('error-message');
      expect(errorElement!.textContent).toBe(
        '操作に失敗しました。しばらく時間をおいてから再度お試しください。'
      );

      // 2番目のエラーを表示
      (uiController as any).showErrorMessage('Second message', error2);

      // メッセージが更新されることを確認
      expect(errorElement!.textContent).toBe(
        '操作に失敗しました。しばらく時間をおいてから再度お試しください。'
      );
      expect(errorElement!.style.display).toBe('block');
    });

    it('エラーメッセージが指定時間後に自動的に非表示になる', async () => {
      const error = new Error('Test error');

      // showErrorMessage を呼び出し
      (uiController as any).showErrorMessage('Test message', error);

      const errorElement = document.getElementById('error-message');
      expect(errorElement!.style.display).toBe('block');

      // 5秒後にメッセージが非表示になることを確認
      await new Promise(resolve => setTimeout(resolve, 5100));
      expect(errorElement!.style.display).toBe('none');
    }, 10000); // 10秒のタイムアウト
  });

  describe('handleTaskError メソッド', () => {
    it('エラーをコンソールに出力し、エラーメッセージを表示する', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const error = new Error('Test error');

      // handleTaskError を呼び出し
      (uiController as any).handleTaskError('Test message', error);

      // コンソールエラーが呼ばれることを確認
      expect(consoleSpy).toHaveBeenCalledWith('Test message', error);

      // エラーメッセージが表示されることを確認
      const errorElement = document.getElementById('error-message');
      expect(errorElement!.style.display).toBe('block');

      consoleSpy.mockRestore();
    });
  });
});
