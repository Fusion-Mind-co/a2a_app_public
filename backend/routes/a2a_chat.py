from flask import Blueprint, request, jsonify
import sys
import os

# database.pyをインポートするためのパス追加
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import *

# Blueprint作成
a2a_bp = Blueprint("a2a", __name__)

# ===================================
# チャットグループ関連API
# ===================================

@a2a_bp.route("/groups", methods=["GET"])
def get_groups():
    """全チャットグループ一覧を取得"""
    try:
        groups = get_chat_groups()
        return jsonify({"success": True, "groups": groups})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@a2a_bp.route("/groups", methods=["POST"])
def create_group():
    """新しいチャットグループを作成"""
    try:
        data = request.get_json()
        name = data.get("name", "").strip()
        description = data.get("description", "").strip()
        
        if not name:
            return jsonify({"success": False, "error": "グループ名は必須です"}), 400
        
        group_id = create_chat_group(name, description)
        return jsonify({"success": True, "group_id": group_id, "message": "グループが作成されました"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@a2a_bp.route("/groups/<int:group_id>", methods=["DELETE"])
def delete_group(group_id):
    """チャットグループを削除"""
    try:
        delete_chat_group(group_id)
        return jsonify({"success": True, "message": "グループが削除されました"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ===================================
# プレイヤー関連API
# ===================================

@a2a_bp.route("/groups/<int:group_id>/players", methods=["GET"])
def get_group_players(group_id):
    """指定グループのプレイヤー一覧を取得"""
    try:
        players = get_players(group_id)
        return jsonify({"success": True, "players": players})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@a2a_bp.route("/groups/<int:group_id>/players", methods=["POST"])
def add_group_player(group_id):
    """グループにプレイヤーを追加"""
    try:
        data = request.get_json()
        name = data.get("name", "").strip()
        player_type = data.get("type", "").strip()
        ai_provider = data.get("ai_provider")
        ai_model = data.get("ai_model")
        persona = data.get("persona", "").strip()
        
        if not name:
            return jsonify({"success": False, "error": "プレイヤー名は必須です"}), 400
        
        if not player_type or player_type not in ["human", "ai"]:
            return jsonify({"success": False, "error": "無効なプレイヤータイプです"}), 400
        
        if player_type == "ai" and not ai_provider:
            return jsonify({"success": False, "error": "AIプレイヤーにはプロバイダーが必須です"}), 400
        
        player_id = add_player(group_id, name, player_type, ai_provider, ai_model, persona)
        return jsonify({"success": True, "player_id": player_id, "message": "プレイヤーが追加されました"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@a2a_bp.route("/players/<int:player_id>", methods=["PUT"])
def update_player(player_id):
    """プレイヤー情報を更新"""
    try:
        data = request.get_json()
        name = data.get("name", "").strip()
        player_type = data.get("type", "").strip()
        ai_provider = data.get("ai_provider")
        ai_model = data.get("ai_model")
        persona = data.get("persona", "").strip()
        
        if not name:
            return jsonify({"success": False, "error": "プレイヤー名は必須です"}), 400
        
        if not player_type or player_type not in ["human", "ai"]:
            return jsonify({"success": False, "error": "無効なプレイヤータイプです"}), 400
        
        if player_type == "ai" and not ai_provider:
            return jsonify({"success": False, "error": "AIプレイヤーにはプロバイダーが必須です"}), 400
        
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE players 
            SET name = ?, type = ?, ai_provider = ?, ai_model = ?, persona = ?
            WHERE id = ? AND is_active = 1
        ''', (name, player_type, ai_provider, ai_model, persona, player_id))
        
        if cursor.rowcount == 0:
            return jsonify({"success": False, "error": "プレイヤーが見つかりません"}), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({"success": True, "message": "プレイヤーが更新されました"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@a2a_bp.route("/players/<int:player_id>", methods=["DELETE"])
def delete_player(player_id):
    """プレイヤーを削除"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("UPDATE players SET is_active = 0 WHERE id = ?", (player_id,))
        conn.commit()
        conn.close()
        
        return jsonify({"success": True, "message": "プレイヤーが削除されました"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ===================================
# メッセージ関連API
# ===================================

@a2a_bp.route("/groups/<int:group_id>/messages", methods=["GET"])
def get_group_messages(group_id):
    """指定グループの会話履歴を取得"""
    try:
        limit = request.args.get("limit", 50, type=int)
        messages = get_messages(group_id, limit)
        return jsonify({"success": True, "messages": messages})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@a2a_bp.route("/groups/<int:group_id>/messages", methods=["POST"])
def add_group_message(group_id):
    """グループにメッセージを追加"""
    try:
        data = request.get_json()
        player_id = data.get("player_id")
        content = data.get("content", "").strip()
        response_time_ms = data.get("response_time_ms")
        tokens_used = data.get("tokens_used")
        
        if not player_id:
            return jsonify({"success": False, "error": "プレイヤーIDは必須です"}), 400
        
        if not content:
            return jsonify({"success": False, "error": "メッセージ内容は必須です"}), 400
        
        message_id = add_message(group_id, player_id, content, response_time_ms, tokens_used)
        return jsonify({"success": True, "message_id": message_id, "message": "メッセージが追加されました"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ===================================
# AI会話機能
# ===================================

@a2a_bp.route("/groups/<int:group_id>/ai-speak", methods=["POST"])
def ai_speak(group_id):
    """指定のAIプレイヤーに発言させる"""
    try:
        data = request.get_json()
        player_id = data.get("player_id")
        additional_prompt = data.get("additional_prompt", "")
        
        if not player_id:
            return jsonify({"success": False, "error": "プレイヤーIDは必須です"}), 400
        
        # プレイヤー情報を取得
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT name, type, ai_provider, ai_model, persona 
            FROM players WHERE id = ? AND is_active = 1
        ''', (player_id,))
        
        player = cursor.fetchone()
        if not player:
            return jsonify({"success": False, "error": "プレイヤーが見つかりません"}), 404
        
        if player["type"] != "ai":
            return jsonify({"success": False, "error": "このプレイヤーはAIではありません"}), 400
        
        # 会話履歴を取得（コンテキスト用）
        recent_messages = get_messages(group_id, 10)
        
        # コンテキストを構築
        context = "これまでの会話:\n"
        for msg in recent_messages:
            context += f"{msg['speaker_name']}: {msg['content']}\n"
        
        # グループルールを取得
        cursor.execute('SELECT rules FROM chat_groups WHERE id = ?', (group_id,))
        group_rules_row = cursor.fetchone()
        group_rules = group_rules_row['rules'] if group_rules_row and group_rules_row['rules'] else ""
        
        # ペルソナとコンテキストを組み合わせたプロンプトを作成
        full_prompt = ""
        
        # グループルールを最優先で追加
        if group_rules:
            full_prompt += f"【重要】このグループの絶対ルール:\n{group_rules}\n\n"
        
        if player["persona"]:
            full_prompt += f"あなたの役割: {player['persona']}\n\n"
        
        full_prompt += context
        
        if additional_prompt:
            full_prompt += f"\n指示: {additional_prompt}"
        
        full_prompt += f"\n\n{player['name']}として返答してください:"
        
        # AI APIを呼び出し（既存のAPIを活用）
        import requests
        import time
        
        start_time = time.time()
        
        # プロバイダーに応じてAPI呼び出し
        api_url = "http://127.0.0.1:5000"
        
        if player["ai_provider"] == "gemini":
            # APIキーを取得（実際の実装では暗号化されたキーを取得）
            # ここでは簡単のため、フロントエンドから渡されると仮定
            api_key = data.get("api_key")
            if not api_key:
                return jsonify({"success": False, "error": "APIキーが必要です"}), 400
            
            response = requests.post(f"{api_url}/gemini", json={
                "gemini_api_key": api_key,
                "prompt": full_prompt,
                "gemini_model": player["ai_model"]
            })
        
        elif player["ai_provider"] == "chatGPT":
            api_key = data.get("api_key")
            if not api_key:
                return jsonify({"success": False, "error": "APIキーが必要です"}), 400
            
            response = requests.post(f"{api_url}/chatgpt", json={
                "chatgpt_api_key": api_key,
                "prompt": full_prompt,
                "chatgpt_model": player["ai_model"]
            })
        
        else:
            return jsonify({"success": False, "error": "未対応のAIプロバイダーです"}), 400
        
        end_time = time.time()
        response_time_ms = int((end_time - start_time) * 1000)
        
        if response.status_code == 200:
            ai_response = response.json()["result"]
            
            # メッセージをデータベースに保存
            message_id = add_message(group_id, player_id, ai_response, response_time_ms)
            
            conn.close()
            
            return jsonify({
                "success": True, 
                "message_id": message_id,
                "content": ai_response,
                "response_time_ms": response_time_ms,
                "speaker_name": player["name"]
            })
        else:
            conn.close()
            return jsonify({"success": False, "error": "AI API呼び出しエラー"}), 500
            
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ===================================
# システム情報API
# ===================================

@a2a_bp.route("/status", methods=["GET"])
def get_system_status():
    """システムの状態を取得"""
    try:
        db_info = get_database_info()
        return jsonify({"success": True, "database": db_info})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@a2a_bp.route("/groups/<int:group_id>/rules", methods=["PUT"])
def update_group_rules(group_id):
    """グループのルールを更新"""
    try:
        data = request.get_json()
        rules = data.get("rules", "").strip()
        
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE chat_groups 
            SET rules = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND is_active = 1
        ''', (rules, group_id))
        
        if cursor.rowcount == 0:
            return jsonify({"success": False, "error": "グループが見つかりません"}), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({"success": True, "message": "グループルールが更新されました"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@a2a_bp.route("/groups/<int:group_id>/info", methods=["GET"])
def get_group_info(group_id):
    """グループの詳細情報を取得"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # グループ基本情報
        cursor.execute('''
            SELECT id, name, description, rules, created_at 
            FROM chat_groups 
            WHERE id = ? AND is_active = 1
        ''', (group_id,))
        
        group = cursor.fetchone()
        if not group:
            return jsonify({"success": False, "error": "グループが見つかりません"}), 404
        
        # プレイヤー数とメッセージ数を取得
        cursor.execute("SELECT COUNT(*) FROM players WHERE group_id = ? AND is_active = 1", (group_id,))
        player_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM messages WHERE group_id = ?", (group_id,))
        message_count = cursor.fetchone()[0]
        
        # 最新メッセージ
        cursor.execute('''
            SELECT m.content, m.timestamp, p.name as speaker_name
            FROM messages m
            JOIN players p ON m.player_id = p.id
            WHERE m.group_id = ?
            ORDER BY m.timestamp DESC
            LIMIT 1
        ''', (group_id,))
        
        last_message = cursor.fetchone()
        
        conn.close()
        
        group_info = dict(group)
        group_info.update({
            "player_count": player_count,
            "message_count": message_count,
            "last_message": dict(last_message) if last_message else None
        })
        
        return jsonify({"success": True, "group": group_info})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500