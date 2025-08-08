import sqlite3
import os
from datetime import datetime
from typing import List, Dict, Optional

# データベースファイルのパス
DB_PATH = "a2a_chat.db"

def get_connection():
    """データベース接続を取得"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # 辞書形式で結果を取得
    return conn

def init_database():
    """データベースを初期化（テーブル作成のみ）"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # テーブル作成
        create_tables(cursor)
        # インデックス作成
        create_indexes(cursor)
        
        conn.commit()
        print("✅ データベースが正常に初期化されました！")
    except Exception as e:
        conn.rollback()
        print(f"❌ データベース初期化エラー: {e}")
    finally:
        conn.close()

def create_tables(cursor):
    """全テーブルを作成"""
    
    # 1. チャットグループテーブル
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            rules TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT 1
        )
    ''')
    
    # 2. プレイヤーテーブル
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id INTEGER NOT NULL,
            name VARCHAR(100) NOT NULL,
            type VARCHAR(20) NOT NULL,
            ai_provider VARCHAR(50),
            ai_model VARCHAR(100),
            persona TEXT,
            display_order INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (group_id) REFERENCES chat_groups(id) ON DELETE CASCADE
        )
    ''')
    
    # 3. メッセージテーブル
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id INTEGER NOT NULL,
            player_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            message_type VARCHAR(20) DEFAULT 'normal',
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            response_time_ms INTEGER,
            tokens_used INTEGER,
            is_edited BOOLEAN DEFAULT 0,
            parent_message_id INTEGER,
            FOREIGN KEY (group_id) REFERENCES chat_groups(id) ON DELETE CASCADE,
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
        )
    ''')
    
    # 4. 会話設定テーブル
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS conversation_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id INTEGER NOT NULL,
            max_messages INTEGER DEFAULT 100,
            auto_save BOOLEAN DEFAULT 1,
            context_length INTEGER DEFAULT 10,
            turn_timeout_seconds INTEGER DEFAULT 30,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (group_id) REFERENCES chat_groups(id) ON DELETE CASCADE
        )
    ''')
    
    # 5. APIキー管理テーブル
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS api_keys (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            provider VARCHAR(50) NOT NULL UNIQUE,
            encrypted_key TEXT NOT NULL,
            is_active BOOLEAN DEFAULT 1,
            last_used DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

def create_indexes(cursor):
    """パフォーマンス向上用インデックスを作成"""
    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_chat_groups_active ON chat_groups(is_active, created_at)",
        "CREATE INDEX IF NOT EXISTS idx_players_group ON players(group_id, display_order)",
        "CREATE INDEX IF NOT EXISTS idx_players_type ON players(type, ai_provider)",
        "CREATE INDEX IF NOT EXISTS idx_messages_group_time ON messages(group_id, timestamp)",
        "CREATE INDEX IF NOT EXISTS idx_messages_player ON messages(player_id, timestamp)",
        "CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type)",
        "CREATE INDEX IF NOT EXISTS idx_conversation_settings_group ON conversation_settings(group_id)"
    ]
    
    for index_sql in indexes:
        cursor.execute(index_sql)

# ===================================
# CRUD操作関数
# ===================================

def get_chat_groups() -> List[Dict]:
    """全チャットグループを取得"""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, name, description, created_at, 
               (SELECT COUNT(*) FROM messages WHERE group_id = cg.id) as message_count,
               (SELECT MAX(timestamp) FROM messages WHERE group_id = cg.id) as last_activity
        FROM chat_groups cg 
        WHERE is_active = 1 
        ORDER BY last_activity DESC NULLS LAST
    ''')
    
    groups = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return groups

def create_chat_group(name: str, description: str = "") -> int:
    """新しいチャットグループを作成"""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO chat_groups (name, description) VALUES (?, ?)
    ''', (name, description))
    
    group_id = cursor.lastrowid
    
    # デフォルト設定を作成
    cursor.execute('''
        INSERT INTO conversation_settings (group_id) VALUES (?)
    ''', (group_id,))
    
    conn.commit()
    conn.close()
    return group_id

def get_players(group_id: int) -> List[Dict]:
    """指定グループのプレイヤー一覧を取得"""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, name, type, ai_provider, ai_model, persona, display_order
        FROM players 
        WHERE group_id = ? AND is_active = 1
        ORDER BY display_order, id
    ''', (group_id,))
    
    players = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return players

def add_player(group_id: int, name: str, player_type: str, 
               ai_provider: str = None, ai_model: str = None, 
               persona: str = None) -> int:
    """プレイヤーを追加"""
    conn = get_connection()
    cursor = conn.cursor()
    
    # 表示順序を決定（最後に追加）
    cursor.execute('''
        SELECT COALESCE(MAX(display_order), 0) + 1 
        FROM players WHERE group_id = ?
    ''', (group_id,))
    display_order = cursor.fetchone()[0]
    
    cursor.execute('''
        INSERT INTO players (group_id, name, type, ai_provider, ai_model, persona, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (group_id, name, player_type, ai_provider, ai_model, persona, display_order))
    
    player_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return player_id

def get_messages(group_id: int, limit: int = 50) -> List[Dict]:
    """グループの会話履歴を取得"""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT 
            m.id,
            m.content,
            m.timestamp,
            m.message_type,
            p.name as speaker_name,
            p.type as speaker_type,
            p.ai_provider
        FROM messages m
        JOIN players p ON m.player_id = p.id
        WHERE m.group_id = ?
        ORDER BY m.timestamp DESC
        LIMIT ?
    ''', (group_id, limit))
    
    messages = [dict(row) for row in cursor.fetchall()]
    messages.reverse()  # 時系列順に並び替え
    conn.close()
    return messages

def add_message(group_id: int, player_id: int, content: str, 
                response_time_ms: int = None, tokens_used: int = None) -> int:
    """新しいメッセージを追加"""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO messages (group_id, player_id, content, response_time_ms, tokens_used)
        VALUES (?, ?, ?, ?, ?)
    ''', (group_id, player_id, content, response_time_ms, tokens_used))
    
    message_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return message_id

def delete_chat_group(group_id: int):
    """チャットグループを削除（論理削除）"""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE chat_groups SET is_active = 0 WHERE id = ?
    ''', (group_id,))
    
    conn.commit()
    conn.close()

# ===================================
# ユーティリティ関数
# ===================================

def database_exists() -> bool:
    """データベースファイルが存在するかチェック"""
    return os.path.exists(DB_PATH)

def get_database_info() -> Dict:
    """データベースの基本情報を取得"""
    if not database_exists():
        return {"exists": False}
    
    conn = get_connection()
    cursor = conn.cursor()
    
    # 各テーブルの件数を取得
    cursor.execute("SELECT COUNT(*) FROM chat_groups WHERE is_active = 1")
    groups_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM players WHERE is_active = 1")
    players_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM messages")
    messages_count = cursor.fetchone()[0]
    
    conn.close()
    
    return {
        "exists": True,
        "groups_count": groups_count,
        "players_count": players_count,
        "messages_count": messages_count,
        "db_path": DB_PATH
    }

if __name__ == "__main__":
    # 直接実行時はデータベースを初期化
    print("🚀 a2a データベースを初期化しています...")
    init_database()
    
    # データベース情報を表示
    info = get_database_info()
    print(f"📊 データベース情報: {info}")