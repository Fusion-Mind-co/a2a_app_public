from .ai_gemini import gemini_bp
from .ai_chatGPT import chatgpt_bp
from .ai_claude import claude_bp
from .a2a_chat import a2a_bp

# Blueprint を集約しておく（複数BPを扱う場合に便利）

blueprints = [gemini_bp, chatgpt_bp, claude_bp ,a2a_bp]