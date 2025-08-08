# AI NEXUS 🚀

次世代AIプラットフォーム - 複数のAIプロバイダーを統合したインテリジェントツール

![AI NEXUS](https://img.shields.io/badge/AI-NEXUS-purple?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react)
![Flask](https://img.shields.io/badge/Flask-2.x-green?style=for-the-badge&logo=flask)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-cyan?style=for-the-badge&logo=tailwindcss)

## 📋 概要

AI NEXUSは、複数のAIプロバイダー（Gemini、ChatGPT、Claude）を統合したローカル実行可能なAIツールです。美しいUI/UXと強力な機能を提供し、各プロバイダーのモデルを自由に選択して利用できます。


### ✨ 主な特徴

- 🎨 **モダンなUI/UX**: サイバーパンク風デザイン、グラスモーフィズム効果
- 🔐 **セキュア**: APIキーはローカルに暗号化保存
- 🚀 **高性能**: React + Flask構成で高速レスポンス
- 🎯 **マルチプロバイダー**: 3つのAIプロバイダーに対応
- 📱 **レスポンシブ**: あらゆるデバイスサイズに対応

## 🛠️ 技術スタック

### フロントエンド
- **React 18** - ユーザーインターフェース
- **Vite** - 高速開発環境
- **Tailwind CSS** - スタイリング
- **shadcn/ui** - UIコンポーネント
- **Axios** - HTTP通信

### バックエンド
- **Flask** - Webアプリケーションフレームワーク
- **Flask-CORS** - CORS対応
- **Requests** - HTTP通信ライブラリ

## 📁 プロジェクト構成

```
a2a_app/
├── frontend/                    # フロントエンド
│   ├── src/
│   │   ├── assets/
│   │   │   └── icon/           # AIプロバイダーアイコン
│   │   │       ├── gemini.png
│   │   │       ├── gpt.png
│   │   │       └── claude.png
│   │   ├── components/
│   │   │   └── ui/             # shadcn/ui コンポーネント
│   │   ├── lib/
│   │   │   └── utils.js
│   │   ├── App.jsx             # メインアプリケーション
│   │   ├── index.css           # グローバルスタイル
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── jsconfig.json
└── backend/                     # バックエンド
    ├── routes/
    │   ├── __init__.py         # Blueprint集約
    │   ├── ai_gemini.py        # Gemini API
    │   ├── ai_chatGPT.py       # ChatGPT API
    │   └── ai_claude.py        # Claude API
    ├── app.py                  # Flaskアプリケーション
    └── requirements.txt
```

## 🚀 セットアップ

### 前提条件
- Node.js 20.x以上
- Python 3.8以上
- 各AIプロバイダーのAPIキー

### 1. プロジェクトクローン
```bash
git clone <repository-url>
cd a2a_app
```

### 2. フロントエンドセットアップ
```bash
cd frontend
npm install
```

### 3. バックエンドセットアップ
```bash
cd ../backend
pip install -r requirements.txt
```

### 4. 開発サーバー起動

#### バックエンド
```bash
cd backend
python app.py
# http://127.0.0.1:5000 で起動
```

#### フロントエンド
```bash
cd frontend
npm run dev
# http://localhost:5173 で起動
```

## 🎯 対応AIプロバイダー

### 🧠 Google Gemini
| モデル | 説明 |
|--------|------|
| gemini-2.5-pro | 最高性能モデル |
| gemini-2.5-flash | 高速・高性能 |
| gemini-2.0-flash | バランス型 |
| gemini-2.0-flash-lite | 軽量版 |
| gemini-1.5-flash | 安定版 |
| gemini-1.5-flash-8b | 高速処理 |
| gemini-1.5-pro | プロ仕様 |

### ⚡ OpenAI ChatGPT
| モデル | 説明 |
|--------|------|
| o3 | 最新推論モデル |
| o3-mini | 軽量推論モデル |
| o3-pro | プロ推論モデル |
| gpt-4o | マルチモーダル |
| gpt-4o-mini | 高速・低コスト |
| gpt-4.1 | 改良版 |
| gpt-4.1-mini | 軽量版 |

### 🎯 Anthropic Claude
| モデル | 説明 |
|--------|------|
| claude-3-5-sonnet-20241022 | 最新・最高性能 |
| claude-3-5-sonnet-20240620 | 安定版 |
| claude-3-5-haiku-20241022 | 高速・軽量 |
| claude-3-opus-20240229 | 最高品質 |
| claude-3-sonnet-20240229 | バランス型 |
| claude-3-haiku-20240307 | 高速処理 |

## 🔐 APIキー設定

### 取得方法

1. **Google Gemini**
   - [Google AI Studio](https://aistudio.google.com/app/apikey)でAPIキーを取得

2. **OpenAI ChatGPT**
   - [OpenAI Platform](https://platform.openai.com/api-keys)でAPIキーを取得

3. **Anthropic Claude**
   - [Anthropic Console](https://console.anthropic.com/)でAPIキーを取得

### 設定手順

1. AI NEXUSを起動
2. 右上の⚙️（設定）ボタンをクリック
3. 各プロバイダーのAPIキーを入力
4. 「保存」をクリック

> 🔒 **セキュリティ**: APIキーはBase64で暗号化され、ローカルのlocalStorageにのみ保存されます。

## 🎨 UI/UX特徴

### デザインコンセプト
- **サイバーパンク風**: 暗い背景に鮮やかなアクセント
- **グラスモーフィズム**: 透明感とぼかし効果
- **ネオンエフェクト**: 光る要素でSF感を演出

### インタラクション
- **ホバーエフェクト**: ボタンの拡大・縮小
- **パルスアニメーション**: 状態インジケーター
- **スムーズトランジション**: 全要素で滑らかな動作

### レスポンシブデザイン
- **デスクトップ**: 左右分割レイアウト
- **タブレット**: 縦積みレイアウト
- **モバイル**: コンパクト表示

## 📚 API仕様

### エンドポイント

#### Gemini API
```http
POST /gemini
Content-Type: application/json

{
  "gemini_api_key": "your-api-key",
  "prompt": "質問内容",
  "gemini_model": "gemini-2.0-flash"
}
```

#### ChatGPT API
```http
POST /chatgpt
Content-Type: application/json

{
  "chatgpt_api_key": "your-api-key",
  "prompt": "質問内容",
  "chatgpt_model": "gpt-4o"
}
```

#### Claude API
```http
POST /claude
Content-Type: application/json

{
  "claude_api_key": "your-api-key",
  "prompt": "質問内容",
  "claude_model": "claude-3-5-sonnet-20241022"
}
```

### レスポンス形式
```json
{
  "result": "AIからの回答テキスト"
}
```

## 🔧 カスタマイズ

### 新しいAIプロバイダーの追加

1. **バックエンド**: `routes/ai_newprovider.py`を作成
2. **フロントエンド**: `providers`オブジェクトに追加
3. **アイコン**: `src/assets/icon/`に画像を配置

### UIテーマの変更

Tailwind CSSクラスを編集してカスタマイズ可能：
- **背景グラデーション**: `bg-gradient-to-br from-* via-* to-*`
- **アクセントカラー**: プロバイダーごとの`color`プロパティ
- **透明度**: `bg-white/10`、`backdrop-blur-xl`

## 🐛 トラブルシューティング

### よくある問題

#### フロントエンドが起動しない
```bash
# Node.jsバージョン確認
node --version  # 20.x以上が必要

# 依存関係再インストール
rm -rf node_modules package-lock.json
npm install
```

#### APIエラーが発生する
1. APIキーが正しく設定されているか確認
2. バックエンドが起動しているか確認（http://127.0.0.1:5000）
3. CORS設定が正しいか確認

#### Tailwind CSSが効かない
```bash
# Tailwind CSS再インストール
npm uninstall tailwindcss
npm install -D tailwindcss@^3.4.0 postcss autoprefixer
```

## 🤝 コントリビューション

1. フォークしてブランチを作成
2. 変更を実装
3. テストを追加
4. プルリクエストを送信

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🙏 謝辞

- [React](https://react.dev/) - UIライブラリ
- [Flask](https://flask.palletsprojects.com/) - Webフレームワーク
- [Tailwind CSS](https://tailwindcss.com/) - CSSフレームワーク
- [shadcn/ui](https://ui.shadcn.com/) - UIコンポーネント
- [Vite](https://vitejs.dev/) - ビルドツール

---

**AI NEXUS** - Next Generation AI Platform 🚀