from flask import Flask, jsonify
from flask_cors import CORS

# 既存のBlueprint
from routes.ai_gemini import gemini_bp
from routes.ai_chatGPT import chatgpt_bp
# from routes.ai_claude import claude_bp  # Claudeは保留

# 新しいa2a Blueprint
from routes.a2a_chat import a2a_bp

# データベース初期化
from database import init_database, database_exists

app = Flask(__name__)
CORS(app)

# データベース初期化（アプリケーション作成時に実行）
if not database_exists():
    print("🚀 データベースを初期化しています...")
    init_database()
else:
    print("✅ データベースが既に存在します")

# Blueprintを登録
app.register_blueprint(gemini_bp)
app.register_blueprint(chatgpt_bp)
# app.register_blueprint(claude_bp)  # Claudeは保留

# a2a機能を追加
app.register_blueprint(a2a_bp, url_prefix="/a2a")

@app.route("/")
def index():
    return jsonify({
        "message": "AI NEXUS Backend API",
        "version": "2.0",
        "features": [
            "Multi-AI Chat (Gemini, ChatGPT)",
            "AI to AI Conversations", 
            "Local Database Storage",
            "Group Chat Management"
        ],
        "endpoints": {
            "ai_chat": ["/gemini", "/chatgpt"],
            "a2a_system": [
                "/a2a/groups",
                "/a2a/groups/{id}/players", 
                "/a2a/groups/{id}/messages",
                "/a2a/groups/{id}/ai-speak",
                "/a2a/status"
            ]
        }
    })

if __name__ == "__main__":
    print("🔥 AI NEXUS Backend Server Starting...")
    print("🌐 Frontend URL: http://localhost:5173")
    print("🔧 Backend URL: http://127.0.0.1:5000")
    print("📊 API Documentation: http://127.0.0.1:5000")
    
    app.run(debug=True, host="127.0.0.1", port=5000)