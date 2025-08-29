# Simple TODO App

KIROで試しに作成した、シンプルで使いやすいTODOアプリケーションです。TypeScriptとVanilla JSで構築され、モダンなWeb開発のベストプラクティスを採用しています。

## 🚀 特徴

- **シンプルなUI**: 直感的で使いやすいインターフェース
- **レスポンシブデザイン**: モバイルからデスクトップまで対応
- **アクセシビリティ対応**: スクリーンリーダーやキーボード操作に配慮
- **データ永続化**: ローカルストレージを使用してタスクを保存
- **フィルタリング機能**: すべて/未完了/完了済みでタスクを絞り込み
- **リアルタイム統計**: 完了率をリアルタイムで表示

## 🛠️ 使用技術

### フロントエンド

- **TypeScript** - 型安全性とコード品質の向上
- **Vite** - 高速な開発サーバーとビルドツール
- **Vanilla JavaScript** - フレームワークに依存しない軽量な実装
- **CSS3** - モダンなスタイリングとレスポンシブデザイン

### 開発・品質管理

- **Vitest** - 高速なユニットテスト
- **ESLint** - コード品質とスタイルの統一
- **Prettier** - コードフォーマッター
- **TypeScript Compiler** - 型チェック

### CI/CD・インフラ

- **GitHub Actions** - 自動化されたCI/CDパイプライン
- **AWS S3** - 静的ウェブサイトホスティング
- **AWS CloudFront** - CDNによる高速配信
- **AWS IAM** - セキュアなアクセス管理

## 📋 前提条件

- Node.js 18.x 以上
- npm または yarn

## 🏃‍♂️ ローカルでの起動方法

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd simple-todo-app
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` にアクセスしてアプリケーションを確認できます。

### 4. その他の便利なコマンド

```bash
# プロダクションビルド
npm run build

# ビルド結果のプレビュー
npm run preview

# テスト実行
npm run test

# テストのウォッチモード
npm run test:ui

# コード品質チェック
npm run lint

# コードフォーマット
npm run format

# 型チェック
npm run type-check

# 全品質チェック実行
npm run quality:check
```

## 🏗️ プロジェクト構造

```
simple-todo-app/
├── src/                    # ソースコード
│   ├── controllers/        # UIコントローラー
│   ├── models/            # データモデル
│   ├── repositories/      # データアクセス層
│   ├── services/          # ビジネスロジック
│   ├── utils/             # ユーティリティ関数
│   ├── test/              # テストファイル
│   ├── main.ts            # アプリケーションエントリーポイント
│   └── style.css          # スタイルシート
├── public/                # 静的ファイル
├── aws/                   # AWS インフラストラクチャ
│   ├── s3-bucket.yml      # S3バケット設定
│   ├── cloudfront-distribution.yml  # CloudFront設定
│   ├── iam-roles.yml      # IAMロール設定
│   └── deploy-*.sh        # デプロイスクリプト
├── .github/workflows/     # GitHub Actions CI/CD
├── dist/                  # ビルド出力
├── coverage/              # テストカバレッジレポート
├── index.html             # HTMLテンプレート
├── package.json           # プロジェクト設定
├── tsconfig.json          # TypeScript設定
├── vitest.config.ts       # テスト設定
└── eslint.config.js       # ESLint設定
```

## 🧪 テスト

このプロジェクトでは包括的なテストスイートを提供しています：

```bash
# 全テスト実行
npm run test:run

# ウォッチモードでテスト
npm run test

# テストUIでインタラクティブに実行
npm run test:ui

# カバレッジレポート生成
npm run test -- --coverage
```

### テストカバレッジ

- **モデル層**: Task クラスの全機能
- **リポジトリ層**: LocalStorage操作
- **サービス層**: ビジネスロジック
- **コントローラー層**: UI操作とイベント処理

## 🚀 デプロイメント

### ローカルビルド

```bash
npm run build
npm run preview
```

### AWS インフラストラクチャ

AWSへのデプロイについては、[aws/README.md](./aws/README.md) を参照してください。

#### クイックデプロイ

```bash
# AWS インフラストラクチャを一括デプロイ
./aws/deploy-all.sh production simple-todo-app your-username/simple-todo-app
```

### CI/CD パイプライン

GitHub Actions を使用した自動化されたCI/CDパイプライン：

- **品質チェック**: 型チェック、リント、フォーマット、テスト
- **セキュリティスキャン**: 脆弱性チェック
- **自動デプロイ**: mainブランチへのマージ時にAWSへ自動デプロイ

## 🏛️ アーキテクチャ

このアプリケーションは**レイヤードアーキテクチャ**を採用しています：

### 1. プレゼンテーション層 (Controllers)

- `UIController`: DOM操作とユーザーインタラクション

### 2. ビジネスロジック層 (Services)

- `TaskService`: タスク管理のビジネスルール

### 3. データアクセス層 (Repositories)

- `LocalStorageTaskRepository`: ローカルストレージへのデータ永続化

### 4. モデル層 (Models)

- `Task`: タスクエンティティとバリデーション

### 5. ユーティリティ層 (Utils)

- `idGenerator`: 一意ID生成

## 🔧 開発ガイドライン

### コード品質

- **TypeScript**: 厳密な型チェックを有効化
- **ESLint**: コード品質とスタイルの統一
- **Prettier**: 一貫したコードフォーマット
- **Vitest**: 包括的なユニットテスト

### コミット前チェック

```bash
# 全品質チェックを実行
npm run quality:check
```

このコマンドで以下が実行されます：

- 型チェック
- リント
- フォーマットチェック
- テスト実行
- セキュリティ監査

### 開発時の注意点

- コミット前に `npm run quality:check` を実行
- テストカバレッジを維持
- アクセシビリティガイドラインに準拠
- TypeScriptの型安全性を保持

## 🆘 トラブルシューティング

### よくある問題

**Q: `npm run dev` でエラーが発生する**

```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

**Q: テストが失敗する**

```bash
# キャッシュをクリアしてテスト実行
npm run test -- --run --reporter=verbose
```

**Q: ビルドエラーが発生する**

```bash
# 型チェックを実行してエラーを確認
npm run type-check
```

### サポート

問題が発生した場合は、以下を確認してください：

1. Node.js バージョンが18.x以上であること
2. 依存関係が正しくインストールされていること
3. ブラウザの開発者ツールでエラーを確認
4. GitHub Issues で既知の問題を検索

---

**Happy Coding! 🎉**
