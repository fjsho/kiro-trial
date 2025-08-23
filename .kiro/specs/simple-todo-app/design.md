# Design Document

## Overview

シンプルな TODO アプリケーションは、クライアントサイドのみで動作する Single Page Application (SPA)として設計します。HTML、CSS、JavaScript を使用し、LocalStorage でデータを永続化することで、サーバーを必要とせずに完全に機能するアプリケーションを実現します。

## Architecture

### アーキテクチャパターン

- **Repository Pattern**: データアクセス層の抽象化により、将来的な API 連携への変更を容易にする
- **Service Layer**: ビジネスロジックを分離し、データアクセス方法に依存しない設計
- **MVC (Model-View-Controller)**: プレゼンテーション層の構造化
- **Dependency Injection**: コンポーネント間の疎結合を実現

### レイヤー構造

```
┌─────────────────────────────────┐
│        Presentation Layer       │
│    (App Controller, UI)         │
├─────────────────────────────────┤
│        Service Layer            │
│      (TaskService)              │
├─────────────────────────────────┤
│      Repository Layer           │
│  (TaskRepository Interface)     │
├─────────────────────────────────┤
│       Data Layer                │
│ (LocalStorage / Future API)     │
└─────────────────────────────────┘
```

### 技術スタック

- **HTML5**: セマンティックなマークアップ
- **CSS3**: モダンなスタイリング、Flexbox/Grid レイアウト
- **TypeScript**: 型安全性を確保した JavaScript 開発
- **LocalStorage**: 初期実装でのクライアントサイドデータ永続化（将来的には Backend API + DB）
- **Vite**: 高速な開発サーバーとビルドツール

## Components and Interfaces

### 1. Task Model (`Task`)

```typescript
interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

class TaskModel implements Task {
  constructor(
    public id: string,
    public text: string,
    public completed: boolean = false,
    public createdAt: Date = new Date()
  ) {}
}
```

**責務:**

- タスクデータの構造定義
- タスクの基本プロパティ管理

### 2. Task Repository Interface (`TaskRepository`)

```typescript
// 抽象インターフェース（将来的なAPI連携に対応）
interface TaskRepository {
  addTask(task: Task): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  getTasks(): Promise<Task[]>;
}

// LocalStorage実装（初期版）
class LocalStorageTaskRepository implements TaskRepository {
  async addTask(task: Task): Promise<Task> {
    /* LocalStorage実装 */
  }
  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    /* LocalStorage実装 */
  }
  async deleteTask(id: string): Promise<void> {
    /* LocalStorage実装 */
  }
  async getTasks(): Promise<Task[]> {
    /* LocalStorage実装 */
  }
}

// 将来的なAPI実装
class ApiTaskRepository implements TaskRepository {
  async addTask(task: Task): Promise<Task> {
    /* API呼び出し */
  }
  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    /* API呼び出し */
  }
  async deleteTask(id: string): Promise<void> {
    /* API呼び出し */
  }
  async getTasks(): Promise<Task[]> {
    /* API呼び出し */
  }
}
```

### 3. Task Service (`TaskService`)

```typescript
type FilterType = 'all' | 'active' | 'completed';

class TaskService {
  constructor(private repository: TaskRepository) {}

  // ビジネスロジック
  async addTask(text: string): Promise<Task>;
  async updateTask(id: string, updates: Partial<Task>): Promise<Task>;
  async deleteTask(id: string): Promise<void>;
  async toggleTask(id: string): Promise<Task>;
  async getTasks(): Promise<Task[]>;
  async getFilteredTasks(filter: FilterType): Promise<Task[]>;
}
```

**責務:**

- ビジネスロジックの実装
- Repository パターンによるデータアクセス抽象化
- フィルタリングロジック

### 4. UI Controller (`UIController`)

```typescript
interface TaskStats {
  total: number;
  completed: number;
  active: number;
}

class UIController {
  // DOM操作
  renderTasks(tasks: Task[]): void;
  renderStats(stats: TaskStats): void;
  showError(message: string): void;

  // イベントハンドリング
  bindAddTask(handler: (text: string) => void): void;
  bindDeleteTask(handler: (id: string) => void): void;
  bindToggleTask(handler: (id: string) => void): void;
  bindEditTask(handler: (id: string, newText: string) => void): void;
  bindFilterTasks(handler: (filter: FilterType) => void): void;
}
```

**責務:**

- DOM 要素の作成・更新・削除
- ユーザーイベントのバインディング
- UI 状態の管理

### 5. App Controller (`App`)

```typescript
class App {
  constructor(
    private taskService: TaskService,
    private uiController: UIController
  ) {}

  init(): void;
  handleAddTask(text: string): Promise<void>;
  handleDeleteTask(id: string): Promise<void>;
  handleToggleTask(id: string): Promise<void>;
  handleEditTask(id: string, newText: string): Promise<void>;
  handleFilterChange(filter: FilterType): Promise<void>;
}
```

**責務:**

- アプリケーション全体の初期化
- 依存性注入によるコンポーネント間の調整
- UI イベントとビジネスロジックの橋渡し

## Data Models

### Task Entity

```typescript
interface Task {
  id: string; // UUID v4
  text: string; // タスクの内容 (1-500文字)
  completed: boolean; // 完了状態
  createdAt: Date; // 作成日時
}
```

### Filter Types

```typescript
type FilterType = 'all' | 'active' | 'completed';

const FILTERS: Record<string, FilterType> = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed',
};
```

### LocalStorage Schema

```typescript
// Key: 'todoApp_tasks'
// Value: JSON.stringify(Task[])

interface StoredTask {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string; // ISO string format
}
```

## Error Handling

### 入力検証

- **空文字チェック**: タスクテキストが空の場合はエラー表示
- **文字数制限**: 500 文字を超える場合は警告
- **重複チェック**: 同一テキストの重複タスク防止（オプション）

### LocalStorage エラー

- **容量制限**: LocalStorage 容量不足時の警告
- **データ破損**: 不正な JSON データの復旧処理
- **ブラウザサポート**: LocalStorage 非対応時のフォールバック

### UI エラー

- **DOM 要素不存在**: 必要な要素が見つからない場合の処理
- **イベントバインディング失敗**: イベントリスナー登録失敗時の処理

## Testing Strategy

### Unit Testing

- **TaskManager**: CRUD 操作の単体テスト
- **Task Model**: データ検証とメソッドテスト
- **Utility Functions**: ヘルパー関数のテスト

### Integration Testing

- **LocalStorage 連携**: データ永続化の統合テスト
- **UI-Controller 連携**: DOM 操作とイベント処理のテスト

### E2E Testing

- **ユーザーフロー**: 要件書の受け入れ基準に基づくシナリオテスト
- **ブラウザ互換性**: 主要ブラウザでの動作確認

### テストツール

- **Jest**: JavaScript 単体テスト
- **Testing Library**: DOM 操作テスト
- **Cypress**: E2E テスト（オプション）

## UI/UX Design

### レイアウト構造

```
┌─────────────────────────────────┐
│           Header                │
│     (タイトル + 統計情報)        │
├─────────────────────────────────┤
│        Input Section            │
│    (新規タスク入力フィールド)    │
├─────────────────────────────────┤
│       Filter Section            │
│   (All / Active / Completed)   │
├─────────────────────────────────┤
│        Task List                │
│  ┌─────────────────────────┐   │
│  │ ☐ Task 1            ×  │   │
│  │ ☑ Task 2            ×  │   │
│  │ ☐ Task 3            ×  │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

### スタイリング方針

- **ミニマルデザイン**: 清潔で分かりやすい UI
- **レスポンシブ**: モバイル・デスクトップ対応
- **アクセシビリティ**: ARIA 属性、キーボードナビゲーション対応
- **ダークモード**: システム設定に応じた自動切り替え（オプション）

### インタラクション

- **スムーズアニメーション**: タスク追加・削除時のフェードイン/アウト
- **視覚的フィードバック**: ボタンホバー、フォーカス状態
- **ローディング状態**: データ保存時の視覚的インジケーター
