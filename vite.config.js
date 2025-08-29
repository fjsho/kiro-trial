import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages用の設定
  // リポジトリ名がURLに含まれる場合は '/repository-name/' に変更
  // カスタムドメインや username.github.io の場合は './' のまま
  base: 'kito-trial/',

  build: {
    // 出力ディレクトリ
    outDir: 'dist',

    // アセットのインライン化の閾値（4KB未満のファイルはbase64でインライン化）
    assetsInlineLimit: 4096,

    // ソースマップを生成（デバッグ用）
    sourcemap: false,

    // minify設定
    minify: 'esbuild',

    // チャンクサイズ警告の閾値
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        // アセットファイル名の設定
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },

  // 開発サーバー設定
  server: {
    port: 3000,
    open: true,
  },

  // プレビューサーバー設定
  preview: {
    port: 4173,
    open: true,
  },
});
