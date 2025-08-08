import os
import html
import openai
from flask import Blueprint, request, jsonify
from openai import OpenAI  # v1系ではこのクラスを使う

chatgpt_bp = Blueprint("chatgpt", __name__)

@chatgpt_bp.route("/chatgpt", methods=["POST"])
def chatgpt():
    print('chatgpt()関数')
    data = request.get_json()

    chatgpt_api_key = data.get('chatgpt_api_key')
    chatgpt_model = data.get('chatgpt_model')
    prompt = data.get("prompt", "")
    print("使用モデル:", chatgpt_model)

    try:
        client = OpenAI(api_key=chatgpt_api_key)
        response = client.chat.completions.create(
            model=chatgpt_model,
            messages=[{"role": "user", "content": prompt}]
        )
        result = response.choices[0].message.content
        return jsonify({"result": html.unescape(result)})
    except Exception as e:
        print("OpenAI APIエラー:", e)
        return jsonify({"result": f"ChatGPT APIエラー: {str(e)}"}), 500
