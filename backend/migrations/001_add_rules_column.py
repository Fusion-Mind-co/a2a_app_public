import sqlite3
import os

def migrate_database():
    """既存のデータベースに新しいカラムを追加"""
    db_path = "a2a_chat.db"
    
    if not os.path.exists(db_path):
        print("❌ データベースファイルが見つかりません")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # chat_groupsテーブルにrulesカラムを追加
        cursor.execute("ALTER TABLE chat_groups ADD COLUMN rules TEXT")
        print("✅ rulesカラムを追加しました")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("✅ rulesカラムは既に存在します")
        else:
            print(f"❌ エラー: {e}")
            return
    
    # 既存のグループにデフォルトルールを設定（空文字）
    cursor.execute("UPDATE chat_groups SET rules = '' WHERE rules IS NULL")
    
    conn.commit()
    conn.close()
    
    print("🎉 データベースマイグレーション完了！")

if __name__ == "__main__":
    migrate_database()