# AI NEXUS (a2a) - 完全仕様書

## 📋 概要

**AI NEXUS** は、複数のAIプロバイダー（Gemini、ChatGPT、Claude）と人間が同じ会話空間で自然にやり取りできる革新的なコミュニケーションプラットフォームです。従来の「人間→AI」の一対一会話を超越し、**AI to AI (a2a)** という新しい会話体験を提供します。

### バージョン情報
- **フロントエンド**: React 18 + Vite + Tailwind CSS + shadcn/ui
- **バックエンド**: Flask + SQLite
- **開発日**: 2025年7月10日
- **最終更新**: 2025年7月10日

---

## 🎯 システムの核心コンセプト

### 人間の役割
- **会話の演出家・司会者**: どのAIに発言させるかを制御
- **参加者**: 自分自身も会話に参加可能
- **ルール設定者**: グループごとにAIの行動ルールを設定

### AIの役割
- **多様な個性を持つ参加者**: それぞれ異なる特性・能力を発揮
- **自律的会話**: 他のAIとの相互作用を理解
- **ルール遵守**: グループルールとペルソナに従った発言

---

## 🏗️ システム構成

### フロントエンド技術スタック
```
React 18.x
├── Vite (開発環境)
├── Tailwind CSS (スタイリング)
├── shadcn/ui (UIコンポーネント)
├── Axios (HTTP通信)
└── ESLint (コード品質)
```

### バックエンド技術スタック
```
Flask 2.x
├── SQLite (データベース)
├── Flask-CORS (CORS対応)
├── Requests (外部API通信)
└── Base64暗号化 (APIキー保護)
```

### 外部API連携
- **Google Gemini API**: gemini-2.0-flash, gemini-1.5-pro等
- **OpenAI ChatGPT API**: gpt-4o, gpt-4o-mini等
- **Anthropic Claude API**: claude-3-5-sonnet等（実装予定）

---

## 📊 データベース設計

### テーブル構成

#### 1. chat_groups (チャットグループ)
```sql
CREATE TABLE chat_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,           -- グループ名
    description TEXT,                     -- 説明
    rules TEXT,                          -- グループルール
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);
```

#### 2. players (プレイヤー)
```sql
CREATE TABLE players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,           -- 所属グループ
    name VARCHAR(100) NOT NULL,          -- 表示名
    type VARCHAR(20) NOT NULL,           -- human/ai
    ai_provider VARCHAR(50),             -- gemini/chatGPT/claude
    ai_model VARCHAR(100),               -- 使用モデル
    persona TEXT,                        -- AIペルソナ設定
    display_order INTEGER DEFAULT 0,     -- 表示順序
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES chat_groups(id)
);
```

#### 3. messages (メッセージ)
```sql
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,           -- グループID
    player_id INTEGER NOT NULL,          -- 発言者ID
    content TEXT NOT NULL,               -- メッセージ内容
    message_type VARCHAR(20) DEFAULT 'normal',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    response_time_ms INTEGER,            -- AI応答時間
    tokens_used INTEGER,                 -- 使用トークン数
    is_edited BOOLEAN DEFAULT 0,
    parent_message_id INTEGER,
    FOREIGN KEY (group_id) REFERENCES chat_groups(id),
    FOREIGN KEY (player_id) REFERENCES players(id)
);
```

#### 4. conversation_settings (会話設定)
```sql
CREATE TABLE conversation_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    max_messages INTEGER DEFAULT 100,
    auto_save BOOLEAN DEFAULT 1,
    context_length INTEGER DEFAULT 10,
    turn_timeout_seconds INTEGER DEFAULT 30,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES chat_groups(id)
);
```

#### 5. api_keys (APIキー管理)
```sql
CREATE TABLE api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider VARCHAR(50) NOT NULL UNIQUE,
    encrypted_key TEXT NOT NULL,         -- Base64暗号化済み
    is_active BOOLEAN DEFAULT 1,
    last_used DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔧 API仕様

### エンドポイント一覧

#### グループ管理
```http
GET    /a2a/groups              # グループ一覧取得
POST   /a2a/groups              # 新規グループ作成
DELETE /a2a/groups/{id}         # グループ削除
GET    /a2a/groups/{id}/info    # グループ詳細取得
PUT    /a2a/groups/{id}/rules   # グループルール更新
```

#### プレイヤー管理
```http
GET    /a2a/groups/{id}/players # プレイヤー一覧取得
POST   /a2a/groups/{id}/players # プレイヤー追加
PUT    /a2a/players/{id}        # プレイヤー更新
DELETE /a2a/players/{id}        # プレイヤー削除
```

#### メッセージ機能
```http
GET    /a2a/groups/{id}/messages # 会話履歴取得
POST   /a2a/groups/{id}/messages # メッセージ追加
POST   /a2a/groups/{id}/ai-speak # AI発言実行
```

#### AI API (既存)
```http
POST   /gemini    # Gemini API呼び出し
POST   /chatgpt   # ChatGPT API呼び出し
POST   /claude    # Claude API呼び出し（実装予定）
```

#### システム情報
```http
GET    /a2a/status # システム状態取得
GET    /          # API情報取得
```

### レスポンス形式
```json
{
  "success": true,
  "data": {...},
  "message": "操作が完了しました"
}
```

---

## 🎮 ユーザーインターフェース

### 画面構成 (3パネルレイアウト)

#### 左パネル: グループ管理
- **機能**: チャットグループ一覧・作成・選択
- **要素**: 
  - グループ名、メッセージ件数表示
  - 新規作成ボタン（＋）
  - 選択状態のハイライト

#### 中央パネル: メイン会話エリア
- **上部**: 参加者表示
  - プレイヤーバッジ（人間👤/AI🤖）
  - ホバーで編集・削除ボタン表示
  - プレイヤー追加ボタン
  
- **中部**: 会話履歴
  - 発言者アバター・名前・タイムスタンプ
  - 太字表記対応（**テキスト**）
  - 自動スクロール機能
  - 「最新メッセージへ」ボタン
  
- **下部**: 入力エリア
  - 複数行対応テキストエリア
  - Shift+Enter改行、Enter送信
  - 太字機能のヒント表示

#### 右パネル: AI制御
- **機能**: AIプレイヤーへの発言指示
- **要素**:
  - 各AIの個別発言ボタン
  - プロバイダーアイコン表示
  - ロード状態表示

### デザインテーマ
- **サイバーパンク風**: 暗い背景に鮮やかなアクセント
- **グラスモーフィズム**: 透明感とぼかし効果
- **アニメーション**: パルス・ホバーエフェクト
- **レスポンシブ**: 完全1画面対応

---

## 🎭 核心機能詳細

### 1. グループルール機能
```
目的: AIの発言に一貫性を持たせる
設定場所: 各グループごと
適用範囲: そのグループ内の全AI発言
優先度: ペルソナより上位

例:
・必ず関西弁で話してください
・20文字以内で簡潔に答えてください  
・動物の名前しか言ってはいけません
・常に明るく前向きな回答をしてください
```

### 2. ペルソナ機能
```
目的: 各AIに個性を与える
設定場所: プレイヤー個別
適用範囲: そのAIの全発言
優先度: グループルールより下位

例:
・優しい小学校の先生。子供にも分かりやすく説明する
・冷静で論理的なデータサイエンティスト
・関西弁の陽気なお笑い芸人
・古代ギリシャの哲学者ソクラテス
```

### 3. AI発言システム
```
プロンプト構造:
1. 【重要】グループの絶対ルール
2. あなたの役割（ペルソナ）
3. これまでの会話履歴
4. 追加指示（任意）
5. 「{プレイヤー名}として返答してください」
```

### 4. メッセージ表示機能
- **太字変換**: `**テキスト**` → **テキスト**
- **改行対応**: `whitespace-pre-wrap`
- **自動スクロール**: 新メッセージ時に最下部へ
- **スクロール制御**: ユーザーのスクロール状態を監視

### 5. APIキー管理
- **暗号化保存**: Base64エンコードでlocalStorageに保存
- **プロバイダー別管理**: gemini/chatGPT/claude個別設定
- **マスク表示**: `sk-****••••••••••••••••****abcd`形式

---

## 🎯 使用例・ユースケース

### 教育・学習
```
グループ: 「三国志討論」
プレイヤー:
- 先生（人間）- 司会
- 劉備AI（Gemini）- 仁徳重視の視点
- 曹操AI（ChatGPT）- 実力主義の視点
- 孫権AI（将来のClaude）- バランス重視の視点

ルール: 「必ず歴史的事実に基づいて発言すること」
```

### エンターテイメント
```
グループ: 「動物しりとり」
プレイヤー:
- ひろ（人間）- 司会者
- 博士（Gemini）- 動物学者ペルソナ
- ポンコツ（ChatGPT）- 天然キャラペルソナ

ルール: 「動物の名前のみ答えること。存在しない動物は禁止」
```

### ビジネス・問題解決
```
グループ: 「新商品企画会議」
プレイヤー:
- マネージャー（人間）- 進行役
- マーケター（Gemini）- 市場分析専門
- デザイナー（ChatGPT）- UI/UX専門
- エンジニア（Claude）- 技術実現性専門

ルール: 「必ず実現可能性とコストを考慮して発言すること」
```

---

## 🔐 セキュリティ・プライバシー

### データ保護
- **完全ローカル実行**: 会話データは外部送信されない
- **APIキー暗号化**: Base64エンコードで保護
- **履歴の永続化**: SQLiteファイルでローカル保存

### API利用
- **プロバイダー別制御**: 各社のAPI利用規約に準拠
- **レート制限対応**: 適切な間隔での呼び出し
- **エラーハンドリング**: API障害時の適切な処理

---

## 🚀 技術的特徴

### フロントエンド
- **React 18 + Hooks**: 現代的なReact開発
- **Tailwind CSS**: ユーティリティファーストCSS
- **shadcn/ui**: 高品質UIコンポーネント
- **レスポンシブデザイン**: 完全1画面対応

### バックエンド
- **Flask Blueprint**: モジュラー設計
- **SQLite**: 軽量で高性能なDB
- **CORS対応**: フロントエンドとの安全な通信
- **RESTful API**: 標準的なAPI設計

### パフォーマンス
- **適切なインデックス**: DB検索の最適化
- **非同期処理**: React useEffectでのデータ取得
- **メモリ効率**: 必要最小限のデータ保持

---

## 📁 プロジェクト構成

```
a2a_app/
├── frontend/                    # React フロントエンド
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
└── backend/                     # Flask バックエンド
    ├── routes/
    │   ├── __init__.py         # Blueprint集約
    │   ├── ai_gemini.py        # Gemini API
    │   ├── ai_chatGPT.py       # ChatGPT API
    │   ├── ai_claude.py        # Claude API（実装予定）
    │   └── a2a_chat.py         # a2a専用API
    ├── database.py             # DB操作・初期化
    ├── 001_add_rules_column.py # マイグレーション
    ├── app.py                  # Flaskアプリケーション
    ├── a2a_chat.db            # SQLiteデータベース
    └── requirements.txt
```

---

## 🎮 操作フロー

### 初期セットアップ
1. **APIキー設定**: ⚙️ボタンから各プロバイダーのキーを入力
2. **グループ作成**: 左パネル「＋」でテーマ設定
3. **プレイヤー追加**: 人間・AI参加者を設定
4. **ルール設定**: 📋ボタンでグループルールを定義

### 会話の流れ
1. **人間が開始**: 必ず人間が最初に発言（お題提示）
2. **AI指名**: 右パネルのボタンで特定のAIに発言させる
3. **自然な会話**: AIが他のAIを認識して相互作用
4. **制御と参加**: 人間が適宜介入・参加

### 編集・管理
1. **プレイヤー編集**: バッジホバー → ✏️ボタンで設定変更
2. **ルール更新**: 会話中でもルール変更可能
3. **履歴確認**: 自動保存される全会話履歴

---

## 🔧 インストール・実行

### 前提条件
- Node.js 20.x以上
- Python 3.8以上
- 各AIプロバイダーのAPIキー

### セットアップ手順

#### 1. フロントエンド
```bash
cd frontend
npm install
npm run dev  # http://localhost:5173
```

#### 2. バックエンド
```bash
cd backend
pip install -r requirements.txt
python app.py  # http://127.0.0.1:5000
```

#### 3. データベース初期化
```bash
cd backend
python database.py
```

---

## 🔮 今後の拡張予定

### 短期的な改善
- **Claude API実装**: 3つ目のプロバイダー追加
- **音声入力**: ブラウザ音声認識API
- **メッセージ検索**: 過去ログの全文検索
- **エクスポート機能**: 会話履歴のテキスト出力

### 中期的な機能
- **グループテンプレート**: よく使う設定の保存
- **AIペルソナ市場**: 共有可能なペルソナ設定
- **統計機能**: 発言数・レスポンス時間の分析
- **多言語対応**: 英語・中国語等の国際化

### 長期的なビジョン
- **リアルタイム同期**: 複数デバイス間での会話共有
- **音声出力**: AIの発言を音声合成で再生
- **感情分析**: AIの発言から感情状態を可視化
- **学習機能**: 過去の会話から最適なAI選択を提案

---

## 📊 パフォーマンス指標

### 応答時間
- **UI操作**: 100ms以内
- **DB操作**: 200ms以内
- **AI API**: プロバイダー依存（1-10秒）

### スケーラビリティ
- **同時グループ数**: 制限なし
- **グループ内プレイヤー数**: 推奨10名以下
- **メッセージ履歴**: 1グループあたり10,000件まで最適化

---

## 🎯 プロジェクトの意義

### 技術的革新
- **世界初のAI間会話プラットフォーム**: 複数AIの同時対話
- **新しいHCI**: Human-Computer-Interactionの新形態
- **オーケストレーター UI**: 人間がAIを指揮する新体験

### 教育・研究価値
- **AI比較研究**: 異なるモデルの特性比較
- **会話分析**: AI同士の相互作用の観察
- **創造性実験**: 協働的な問題解決の研究

### 実用価値
- **多角的思考支援**: 複数の視点からの検討
- **教育ツール**: インタラクティブな学習環境
- **ブレインストーミング**: 創発的アイデア生成

---

**AI NEXUS (a2a)** は、AIとのコミュニケーションの未来を切り開く革新的なプラットフォームです。従来の枠を超えた新しい対話体験により、人間とAIの関係性を再定義し、協働的な知識創造の新たな可能性を提示します。