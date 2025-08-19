# Implementation Plan

## Phase 1: UI Foundation

- [x] 1. プロジェクトセットアップと TypeScript 環境構築

  - Vite プロジェクトの初期化と TypeScript 設定
  - 必要な依存関係のインストール（TypeScript、Vite、テストライブラリ）
  - プロジェクト構造の作成（src/models, src/services, src/repositories, src/controllers）
  - _Requirements: 全要件の基盤_

- [x] 2. 基本 HTML マークアップの作成

  - index.html の完全な構造作成（セマンティック HTML）
  - タスク入力フィールドとボタンの実装
  - タスクリスト表示エリアの実装（サンプルデータ含む）
  - フィルターボタン（すべて/未完了/完了済み）の実装
  - 統計情報表示エリアの実装
  - アクセシビリティ対応（ARIA 属性、ラベル）
  - _Requirements: 1.1, 5.1, 6.1_

- [x] 3. 基本 CSS スタイリングの実装
  - レスポンシブレイアウトの基本 CSS 作成
  - タスクアイテムのスタイリング（チェックボックス、テキスト、削除ボタン）
  - 完了タスクの取り消し線スタイル実装
  - フィルターボタンのアクティブ状態スタイル
  - エラーメッセージ表示のスタイリング
  - モバイルファーストデザイン
  - _Requirements: 2.2, 2.3_

## Phase 2: 実装済み機能の単体テスト追加

- [x] 4. TaskModel 単体テスト実装

  - TaskModel コンストラクタのテスト
  - デフォルト値（completed: false, createdAt: new Date()）のテスト
  - _Requirements: 1.1_

- [x] 5. idGenerator ユーティリティ単体テスト実装

  - generateUniqueId() の一意性テスト
  - generateTaskId() のフォーマットテスト
  - _Requirements: 1.1_

- [x] 6. TaskService 単体テスト実装

  - addTask() メソッドのテスト（正常系・異常系）
  - validateTaskText() のバリデーションテスト
  - updateTask(), deleteTask(), toggleTask() メソッドのテスト
  - getFilteredTasks() フィルタリングロジックのテスト
  - getTaskStats() 統計計算のテスト
  - _Requirements: 1.1, 1.2, 2.1, 3.1, 5.1, 6.1, 6.2, 6.3_

- [x] 7. LocalStorageTaskRepository 単体テスト実装
  - addTask(), updateTask(), deleteTask(), getTasks() メソッドのテスト
  - serializeTask(), deserializeTask() のテスト
  - エラーハンドリングのテスト
  - localStorage モックを使用したテスト
  - _Requirements: 1.1, 2.1, 3.1_

## Phase 3: シナリオ 1 - タスク追加機能 (1 テストケースずつ TDD)

- [x] 8. テストケース 1: 「新しいタスクを入力して追加ボタンを押すとタスクが追加される」

  - 8.1 E2E テスト作成（RED）
  - 8.2 Task インターフェースの最小実装（GREEN）
  - 8.3 リファクタリング（REFACTOR）
  - _Requirements: 1.1_

- [x] 9. テストケース 2: 「Enter キーでタスクが追加される」

  - 9.1 E2E テスト作成（RED）
  - 9.2 Enter キーイベントハンドリング実装（GREEN）
  - 9.3 リファクタリング（REFACTOR）
  - _Requirements: 1.1_

- [x] 10. テストケース 3: 「空文字では追加されない」

  - 10.1 E2E テスト作成（RED）
  - 10.2 バリデーション機能実装（GREEN）
  - 10.3 リファクタリング（REFACTOR）
  - _Requirements: 1.2_

- [x] 11. テストケース 4: 「追加されたタスクがリストに表示される」

  - 11.1 E2E テスト作成（RED）
  - 11.2 TaskRepository と LocalStorage 実装（GREEN）
  - 11.3 リファクタリング（REFACTOR）
  - _Requirements: 1.1_

- [x] 12. テストケース 5: 「入力フィールドが追加後にクリアされる」
  - 12.1 E2E テスト作成（RED）
  - 12.2 入力フィールドクリア機能実装（GREEN）
  - 12.3 リファクタリング（REFACTOR）
  - _Requirements: 1.3_

## Phase 4: シナリオ 2 - タスク完了切り替え機能 (1 テストケースずつ TDD)

- [x] 13. テストケース 6: 「チェックボックスをクリックするとタスクの完了状態が切り替わる」

  - 13.1 Integration Test 作成（RED）- E2E レベルでの完了状態切り替え
  - 13.2 Integration Test を通過する最小実装（GREEN）- UIController での基本的な切り替え処理
  - 13.3 リファクタリング（REFACTOR）- コードの整理
  - 13.4 Unit Test 作成（RED）- TaskService.toggleTask() の詳細テスト
  - 13.5 Unit Test を通過する最小実装（GREEN）- toggleTask メソッドの実装
  - 13.6 リファクタリング（REFACTOR）- 最終的な改善
  - _Requirements: 2.1_

- [x] 14. テストケース 7: 「完了タスクに取り消し線が表示される」

  - 14.1 Integration Test 作成（RED）- E2E レベルでの UI 表示確認
  - 14.2 Integration Test を通過する最小実装（GREEN）- CSS クラス切り替えの基本実装
  - 14.3 リファクタリング（REFACTOR）- コードの整理
  - 14.4 Unit Test 作成（RED）- CSS クラス切り替えロジックの詳細テスト
  - 14.5 Unit Test を通過する最小実装（GREEN）- クラス管理メソッドの実装
  - 14.6 リファクタリング（REFACTOR）- 最終的な改善
  - _Requirements: 2.2_

- [x] 15. テストケース 8: 「完了状態の変更が LocalStorage に保存される」

  - 15.1 Integration Test 作成（RED）- E2E レベルでの永続化確認
  - 15.2 Integration Test を通過する最小実装（GREEN）- 基本的な保存処理
  - 15.3 リファクタリング（REFACTOR）- コードの整理
  - 15.4 Unit Test 作成（RED）- LocalStorageTaskRepository.updateTask() の詳細テスト
  - 15.5 Unit Test を通過する最小実装（GREEN）- updateTask メソッドの実装
  - 15.6 リファクタリング（REFACTOR）- 最終的な改善
  - _Requirements: 2.1_

- [ ] 16. テストケース 9: 「統計情報（完了数/総数）が更新される」
  - 16.1 Integration Test 作成（RED）- E2E レベルでの統計表示確認
  - 16.2 Integration Test を通過する最小実装（GREEN）- 基本的な統計表示処理
  - 16.3 リファクタリング（REFACTOR）- コードの整理
  - 16.4 Unit Test 作成（RED）- TaskService.getTaskStats() の詳細テスト
  - 16.5 Unit Test を通過する最小実装（GREEN）- 統計計算メソッドの実装
  - 16.6 リファクタリング（REFACTOR）- 最終的な改善
  - _Requirements: 5.1, 5.2, 5.3_

## Phase 5: シナリオ 3 - タスク削除機能 (1 テストケースずつ TDD)

- [ ] 17. テストケース 10: 「削除ボタンをクリックするとタスクが削除される」

  - 17.1 Integration Test 作成（RED）- E2E レベルでの削除動作確認
  - 17.2 Integration Test を通過する最小実装（GREEN）- UIController での基本的な削除処理
  - 17.3 リファクタリング（REFACTOR）- コードの整理
  - 17.4 Unit Test 作成（RED）- TaskService.deleteTask() の詳細テスト
  - 17.5 Unit Test を通過する最小実装（GREEN）- deleteTask メソッドの実装
  - 17.6 リファクタリング（REFACTOR）- 最終的な改善
  - _Requirements: 3.1_

- [ ] 18. テストケース 11: 「削除後に統計情報が更新される」

  - 18.1 Integration Test 作成（RED）- E2E レベルでの削除後統計更新確認
  - 18.2 Integration Test を通過する最小実装（GREEN）- 基本的な統計更新処理
  - 18.3 リファクタリング（REFACTOR）- コードの整理
  - 18.4 Unit Test 作成（RED）- 削除後の統計計算ロジックの詳細テスト
  - 18.5 Unit Test を通過する最小実装（GREEN）- 統計更新メソッドの実装
  - 18.6 リファクタリング（REFACTOR）- 最終的な改善
  - _Requirements: 3.2, 5.3_

- [ ] 19. テストケース 12: 「削除が LocalStorage に反映される」
  - 19.1 Integration Test 作成（RED）- E2E レベルでの永続化削除確認
  - 19.2 Integration Test を通過する最小実装（GREEN）- 基本的な削除保存処理
  - 19.3 リファクタリング（REFACTOR）- コードの整理
  - 19.4 Unit Test 作成（RED）- LocalStorageTaskRepository.deleteTask() の詳細テスト
  - 19.5 Unit Test を通過する最小実装（GREEN）- deleteTask メソッドの実装
  - 19.6 リファクタリング（REFACTOR）- 最終的な改善
  - _Requirements: 3.1_

## Phase 6: シナリオ 4 - フィルタリング機能 (1 テストケースずつ TDD)

- [ ] 20. テストケース 13: 「すべてフィルターですべてのタスクが表示される」

  - 20.1 Integration Test 作成（RED）- E2E レベルでのフィルタリング動作確認
  - 20.2 Integration Test を通過する最小実装（GREEN）- UIController での基本的なフィルタリング処理
  - 20.3 リファクタリング（REFACTOR）- コードの整理
  - 20.4 Unit Test 作成（RED）- TaskService.getFilteredTasks("all") の詳細テスト
  - 20.5 Unit Test を通過する最小実装（GREEN）- フィルタリングメソッドの実装
  - 20.6 リファクタリング（REFACTOR）- 最終的な改善
  - _Requirements: 6.1_

- [ ] 21. テストケース 14: 「未完了フィルターで未完了タスクのみ表示される」

  - 21.1 Integration Test 作成（RED）- E2E レベルでの未完了フィルタリング確認
  - 21.2 Integration Test を通過する最小実装（GREEN）- 基本的な未完了フィルター処理
  - 21.3 リファクタリング（REFACTOR）- コードの整理
  - 21.4 Unit Test 作成（RED）- TaskService.getFilteredTasks("active") の詳細テスト
  - 21.5 Unit Test を通過する最小実装（GREEN）- 未完了フィルターメソッドの実装
  - 21.6 リファクタリング（REFACTOR）- 最終的な改善
  - _Requirements: 6.2_

- [ ] 22. テストケース 15: 「完了済みフィルターで完了タスクのみ表示される」

  - 22.1 Integration Test 作成（RED）- E2E レベルでの完了済みフィルタリング確認
  - 22.2 Integration Test を通過する最小実装（GREEN）- 基本的な完了済みフィルター処理
  - 22.3 リファクタリング（REFACTOR）- コードの整理
  - 22.4 Unit Test 作成（RED）- TaskService.getFilteredTasks("completed") の詳細テスト
  - 22.5 Unit Test を通過する最小実装（GREEN）- 完了済みフィルターメソッドの実装
  - 22.6 リファクタリング（REFACTOR）- 最終的な改善
  - _Requirements: 6.3_

- [ ] 23. テストケース 16: 「フィルターボタンのアクティブ状態が切り替わる」
  - 23.1 Integration Test 作成（RED）- E2E レベルでのフィルターボタン状態確認
  - 23.2 Integration Test を通過する最小実装（GREEN）- 基本的なボタン状態切り替え処理
  - 23.3 リファクタリング（REFACTOR）- コードの整理
  - 23.4 Unit Test 作成（RED）- フィルター状態管理ロジックの詳細テスト
  - 23.5 Unit Test を通過する最小実装（GREEN）- 状態管理メソッドの実装
  - 23.6 リファクタリング（REFACTOR）- 最終的な改善
  - _Requirements: 6.1, 6.2, 6.3_

## Phase 7: シナリオ 5 - タスク編集機能 (1 テストケースずつ TDD)

- [ ] 24. テストケース 17: 「ダブルクリックで編集モードになる」

  - 24.1 Integration Test 作成（RED）- E2E レベルでの編集モード切り替え確認
  - 24.2 Integration Test を通過する最小実装（GREEN）- UIController での基本的な編集モード処理
  - 24.3 リファクタリング（REFACTOR）- コードの整理
  - 24.4 Unit Test 作成（RED）- 編集モード状態管理ロジックの詳細テスト
  - 24.5 Unit Test を通過する最小実装（GREEN）- 編集モード管理メソッドの実装
  - 24.6 リファクタリング（REFACTOR）- 最終的な改善
  - _Requirements: 4.1_

- [ ] 25. テストケース 18: 「Enter キーで編集内容が保存される」

  - 25.1 Integration Test 作成（RED）- E2E レベルでの編集保存確認
  - 25.2 Integration Test を通過する最小実装（GREEN）- 基本的な編集保存処理
  - 25.3 リファクタリング（REFACTOR）- コードの整理
  - 25.4 Unit Test 作成（RED）- TaskService.updateTask() 編集用バリデーションの詳細テスト
  - 25.5 Unit Test を通過する最小実装（GREEN）- 編集保存メソッドの実装
  - 25.6 リファクタリング（REFACTOR）- 最終的な改善
  - _Requirements: 4.2_

- [ ] 26. テストケース 19: 「Escape キーで編集がキャンセルされる」

  - 26.1 Integration Test 作成（RED）- E2E レベルでの編集キャンセル確認
  - 26.2 Integration Test を通過する最小実装（GREEN）- 基本的な編集キャンセル処理
  - 26.3 リファクタリング（REFACTOR）- コードの整理
  - 26.4 Unit Test 作成（RED）- 編集キャンセルロジックの詳細テスト
  - 26.5 Unit Test を通過する最小実装（GREEN）- キャンセル処理メソッドの実装
  - 26.6 リファクタリング（REFACTOR）- 最終的な改善
  - _Requirements: 4.3_

- [ ] 27. テストケース 20: 「空文字で保存すると変更が破棄される」

  - 27.1 Integration Test 作成（RED）- E2E レベルでの空文字バリデーション確認
  - 27.2 Integration Test を通過する最小実装（GREEN）- 基本的な空文字処理
  - 27.3 リファクタリング（REFACTOR）- コードの整理
  - 27.4 Unit Test 作成（RED）- 編集時の空文字バリデーションの詳細テスト
  - 27.5 Unit Test を通過する最小実装（GREEN）- 空文字バリデーションメソッドの実装
  - 27.6 リファクタリング（REFACTOR）- 最終的な改善
  - _Requirements: 4.4_

- [ ] 28. テストケース 21: 「編集内容が LocalStorage に保存される」
  - 28.1 Integration Test 作成（RED）- E2E レベルでの編集内容永続化確認
  - 28.2 Integration Test を通過する最小実装（GREEN）- 基本的な編集内容保存処理
  - 28.3 リファクタリング（REFACTOR）- コードの整理
  - 28.4 Unit Test 作成（RED）- LocalStorageTaskRepository.updateTask() 編集対応の詳細テスト
  - 28.5 Unit Test を通過する最小実装（GREEN）- 編集対応 updateTask メソッドの実装
  - 28.6 リファクタリング（REFACTOR）- 最終的な改善
  - _Requirements: 4.1, 4.2_

## Phase 8: データ永続化の検証 (1 テストケースずつ TDD)

- [ ] 29. テストケース 22: 「ページリロード後もタスクが保持される」

  - 29.1 Integration Test 作成（RED）- E2E レベルでのページリロード後データ保持確認
  - 29.2 Integration Test を通過する最小実装（GREEN）- 基本的な初期化時データ読み込み処理
  - 29.3 リファクタリング（REFACTOR）- コードの整理
  - 29.4 Unit Test 作成（RED）- LocalStorageTaskRepository.getTasks() 初期化の詳細テスト
  - 29.5 Unit Test を通過する最小実装（GREEN）- 初期化処理メソッドの実装
  - 29.6 リファクタリング（REFACTOR）- 最終的な改善
  - _Requirements: 全要件_

- [ ] 30. テストケース 23: 「LocalStorage エラー時にエラーメッセージが表示される」
  - 30.1 Integration Test 作成（RED）- E2E レベルでのエラー表示確認
  - 30.2 Integration Test を通過する最小実装（GREEN）- 基本的なエラー表示処理
  - 30.3 リファクタリング（REFACTOR）- コードの整理
  - 30.4 Unit Test 作成（RED）- エラーハンドリングロジックの詳細テスト
  - 30.5 Unit Test を通過する最小実装（GREEN）- エラーハンドリングメソッドの実装
  - 30.6 リファクタリング（REFACTOR）- 最終的な改善
  - _Requirements: 全要件_

## Phase 9: 最終統合とポリッシュ

- [ ] 31. アプリケーション初期化とエントリーポイント

  - 31.1 Integration Test 作成（RED）- E2E レベルでのアプリケーション初期化確認
  - 31.2 Integration Test を通過する最小実装（GREEN）- 基本的な初期化処理
  - 31.3 リファクタリング（REFACTOR）- コードの整理
  - 31.4 Unit Test 作成（RED）- アプリケーション初期化ロジックの詳細テスト
  - 31.5 Unit Test を通過する最小実装（GREEN）- 初期化メソッドの実装
  - 31.6 リファクタリング（REFACTOR）- 最終的な改善
  - 31.7 main.ts ファイルの作成と依存関係の組み立て
  - _Requirements: 全要件_

- [ ] 32. 最終品質向上
  - 32.1 単体テストカバレッジの確認と補完
  - 32.2 Integration テストカバレッジの確認と補完
  - 32.3 アクセシビリティの最終確認
  - 32.4 パフォーマンス最適化
  - 32.5 ユーザビリティの向上
  - _Requirements: 全要件の品質保証_
