import os
import html
from flask import Blueprint, request, jsonify

# gemini ライブラリのインポート
import google.generativeai as genai


gemini_bp = Blueprint("gemini", __name__)

@gemini_bp.route("/gemini", methods=["POST"])
def gemini():
    print('gemini()関数')
    # frontendからdata取得
    data = request.get_json()

    # api key　取得
    gemini_api_key = data.get('gemini_api_key')
    # api keyを設定
    genai.configure(api_key=gemini_api_key)

    # model　取得
    gemini_model = data.get('gemini_model')
    # モデルを設定
    model = genai.GenerativeModel(gemini_model)


    # プロンプト(ユーザーが投げかける文章)
    prompt = data.get("prompt", "")
    # geminiにpromptを送信し結果をresponseに返す
    response = model.generate_content(prompt)
    

    # frontendに結果を返す
    return jsonify({"result": html.unescape(response.text)})
