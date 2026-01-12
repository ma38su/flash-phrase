# Flash Phrase - 英語学習アプリ

📚 CSVファイルから読み込んだ単語・フレーズを使った効率的な英語学習アプリです。

![Flash Phrase](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Vite](https://img.shields.io/badge/Vite-6-purple) ![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3-cyan)

## ✨ 主な機能

### 📖 学習モード
- **日→英モード**: 日本語を見て英語を思い浮かべる学習
- **英→日モード**: 英語を見て日本語の意味を確認する学習
- **一覧モード**: すべてのフレーズを一覧で確認・復習

### 🎵 音声機能
- Web Speech APIを使用した自然な英語音声読み上げ
- ワンクリックで発音確認が可能

### 📱 レスポンシブデザイン
- デスクトップ・スマートフォン両対応
- モバイルでは音声ボタンを適切な位置に配置
- スマートフォン表示時はアイコンのみのシンプルなボタン

### 🔄 便利な機能
- シャッフル機能で順序をランダム化
- 左右キーでの直感的なナビゲーション
- マウスクリックでの進む・戻る操作

### 🔗 URL状態管理
- ブラウザリロード時に学習状態を自動復元
- URLで学習進捗の共有・ブックマークが可能
- GitHub Pages対応のSPA（Single Page Application）

## 🛠 技術スタック

### フロントエンド
- **React 19**: 最新のReact Compilerを活用
- **TypeScript**: 型安全な開発
- **Vite**: 高速なビルドツール
- **Tailwind CSS**: ユーティリティファーストCSS

### ライブラリ
- **@tabler/icons-react**: 美しいアイコンセット
- **papaparse**: CSV解析ライブラリ

### ブラウザAPI
- **Web Speech API**: 英語音声合成
- **History API**: URL状態管理

## 🏗 アーキテクチャ

プロジェクトは保守しやすいコンポーネント設計を採用しています：

```
src/
├── App.tsx                    # メインアプリケーションロジック・URL状態管理
├── components/
│   ├── UnitSelect.tsx        # 学習モード選択コンポーネント
│   ├── PhraseCard.tsx        # フレーズ表示カード
│   ├── UnitList.tsx          # 一覧表示コンポーネント
│   └── UnitListHeader.tsx    # 一覧ヘッダー・ナビゲーション
└── assets/
public/
├── phrase.csv                # 学習データ（CSV形式）
└── 404.html                  # GitHub Pages SPA対応
```

## 🚀 セットアップ

### 必要な環境
- Node.js 18以上
- npm または yarn

### インストール
```bash
# リポジトリをクローン
git clone <repository-url>
cd flash-phrase

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

### ビルド
```bash
# プロダクション用ビルド
npm run build

# ビルドをプレビュー
npm run preview
```

## 📝 データ形式

`public/phrase.csv` ファイルは以下の形式で作成してください：

```csv
Unit,Japanese,English
1,こんにちは,Hello
1,ありがとう,Thank you
2,おはよう,Good morning
```

- **Unit**: 単元番号（数字）
- **Japanese**: 日本語のフレーズ
- **English**: 対応する英語のフレーズ

## 🌐 デプロイ

このアプリケーションはGitHub Pagesでの動作を前提に設計されています。

### GitHub Pagesへのデプロイ
1. `npm run build` でアプリケーションをビルド
2. `dist/` フォルダの内容をGitHub Pagesにアップロード
3. `404.html` によりSPAルーティングが自動的に動作

### SPA対応
- `public/404.html` がGitHub PagesでのSPA動作を保証
- URL直アクセス・リロード時も適切に動作

## 🎯 使い方

1. **学習モード選択**: 日→英、英→日、または一覧から選択
2. **ナビゲーション**: 
   - 左右矢印キーまたはボタンでフレーズ移動
   - シャッフルボタンで順序をランダム化
3. **音声確認**: スピーカーボタンで英語音声を再生
4. **状態保存**: URLが自動更新され、ブラウザリロード時に状態を復元

## 📱 モバイル最適化

- 文字サイズの自動調整
- タッチ操作に配慮したボタン配置
- アイコンのみの簡潔なインターフェース
- 音声ボタンをコンテンツ下部に配置

## 🤝 貢献

プルリクエスト・イシューの報告を歓迎します。

## 📄 ライセンス

MIT License
