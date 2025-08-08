import os
import html
import requests
from flask import Blueprint, request, jsonify

claude_bp = Blueprint("claude", __name__)

@claude_bp.route("/claude", methods=["POST"])
def claude():
    print('claude()関数')
    data = request.get_json()

    claude_api_key = data.get('claude_api_key')
    claude_model = data.get('claude_model')
    prompt = data.get("prompt", "")
    print("使用モデル:", claude_model)

    try:
        # Claude APIのエンドポイント
        url = "https://api.anthropic.com/v1/messages"
        
        headers = {
            "Content-Type": "application/json",
            "x-api-key": claude_api_key,
            "anthropic-version": "2023-06-01"
        }
        
        payload = {
            "model": claude_model,
            "max_tokens": 4000,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        }
        
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code == 200:
            result_data = response.json()
            result = result_data["content"][0]["text"]
            return jsonify({"result": html.unescape(result)})
        else:
            error_msg = f"Claude API エラー: {response.status_code} - {response.text}"
            print(error_msg)
            return jsonify({"result": error_msg}), 500
            
    except Exception as e:
        print("Claude APIエラー:", e)
        return jsonify({"result": f"Claude APIエラー: {str(e)}"}), 500