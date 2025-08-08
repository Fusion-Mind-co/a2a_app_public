import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// アイコン画像をインポート
import geminiIcon from "/src/assets/icon/gemini.png";
import gptIcon from "/src/assets/icon/gpt.png";
import claudeIcon from "/src/assets/icon/claude.png";

const API_BASE = "http://127.0.0.1:5000";

function App() {
  // State管理
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [players, setPlayers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);

  // 自動スクロール用のref
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // API設定
  const [apiKeys, setApiKeys] = useState({
    gemini: "",
    chatGPT: "",
    claude: "",
  });

  // プロバイダー設定
  const providers = {
    gemini: {
      name: "Gemini",
      icon: geminiIcon,
      color: "from-blue-500 to-cyan-500",
      models: [
        {
          value: "gemini-2.0-flash",
          label: "Gemini 2.0 Flash",
          description: "バランス型",
        },
        {
          value: "gemini-1.5-pro",
          label: "Gemini 1.5 Pro",
          description: "高性能",
        },
        {
          value: "gemini-1.5-flash",
          label: "Gemini 1.5 Flash",
          description: "高速",
        },
      ],
    },
    chatGPT: {
      name: "ChatGPT",
      icon: gptIcon,
      color: "from-green-500 to-emerald-500",
      models: [
        { value: "gpt-4o", label: "GPT-4o", description: "マルチモーダル" },
        {
          value: "gpt-4o-mini",
          label: "GPT-4o Mini",
          description: "高速・低コスト",
        },
      ],
    },
    claude: {
      name: "Claude",
      icon: claudeIcon,
      color: "from-purple-500 to-pink-500",
      models: [
        {
          value: "claude-3-sonnet-20240229",
          label: "Claude 3 Sonnet",
          description: "バランス型",
        },
        {
          value: "claude-3-haiku-20240307",
          label: "Claude 3 Haiku",
          description: "高速",
        },
      ],
    },
  };

  // フォーム用State
  const [groupForm, setGroupForm] = useState({ name: "", description: "" });
  const [groupRules, setGroupRules] = useState("");
  const [playerForm, setPlayerForm] = useState({
    name: "",
    type: "human",
    ai_provider: "",
    ai_model: "",
    persona: "",
  });

  // APIキー管理
  useEffect(() => {
    const savedKeys = localStorage.getItem("ai_nexus_api_keys");
    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys);
        const decryptedKeys = {
          gemini: parsed.gemini ? atob(parsed.gemini) : "",
          chatGPT: parsed.chatGPT ? atob(parsed.chatGPT) : "",
          claude: parsed.claude ? atob(parsed.claude) : "",
        };
        setApiKeys(decryptedKeys);
      } catch (e) {
        console.error("APIキー読み込みエラー");
      }
    }
  }, []);

  // APIキー保存
  const saveApiKeys = () => {
    try {
      const encryptedKeys = {
        gemini: apiKeys.gemini ? btoa(apiKeys.gemini) : "",
        chatGPT: apiKeys.chatGPT ? btoa(apiKeys.chatGPT) : "",
        claude: apiKeys.claude ? btoa(apiKeys.claude) : "",
      };
      localStorage.setItem("ai_nexus_api_keys", JSON.stringify(encryptedKeys));
      setShowApiSettings(false);
      alert("APIキーが保存されました！");
    } catch (e) {
      console.error("APIキー保存エラー:", e);
      alert("APIキー保存でエラーが発生しました");
    }
  };

  // データ取得
  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${API_BASE}/a2a/groups`);
      setGroups(response.data.groups);
    } catch (error) {
      console.error("グループ取得エラー:", error);
    }
  };

  const fetchPlayers = async (groupId) => {
    try {
      const response = await axios.get(
        `${API_BASE}/a2a/groups/${groupId}/players`
      );
      setPlayers(response.data.players);
    } catch (error) {
      console.error("プレイヤー取得エラー:", error);
    }
  };

  const fetchMessages = async (groupId) => {
    try {
      const response = await axios.get(
        `${API_BASE}/a2a/groups/${groupId}/messages`
      );
      setMessages(response.data.messages);
    } catch (error) {
      console.error("メッセージ取得エラー:", error);
    }
  };

  const fetchGroupRules = async (groupId) => {
    try {
      const response = await axios.get(
        `${API_BASE}/a2a/groups/${groupId}/info`
      );
      setGroupRules(response.data.group.rules || "");
    } catch (error) {
      console.error("グループルール取得エラー:", error);
    }
  };

  // 初期化
  useEffect(() => {
    fetchGroups();
  }, []);

  // グループ選択時の処理
  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    fetchPlayers(group.id);
    fetchMessages(group.id);
    fetchGroupRules(group.id);
  };

  // グループ作成
  const createGroup = async () => {
    try {
      await axios.post(`${API_BASE}/a2a/groups`, groupForm);
      setGroupForm({ name: "", description: "" });
      setShowGroupModal(false);
      fetchGroups();
    } catch (error) {
      console.error("グループ作成エラー:", error);
    }
  };

  // プレイヤー追加
  const addPlayer = async () => {
    try {
      await axios.post(
        `${API_BASE}/a2a/groups/${selectedGroup.id}/players`,
        playerForm
      );
      setPlayerForm({
        name: "",
        type: "human",
        ai_provider: "",
        ai_model: "",
        persona: "",
      });
      setShowPlayerModal(false);
      setEditingPlayer(null);
      fetchPlayers(selectedGroup.id);
    } catch (error) {
      console.error("プレイヤー追加エラー:", error);
    }
  };

  // プレイヤー編集
  const updatePlayer = async () => {
    try {
      await axios.put(
        `${API_BASE}/a2a/players/${editingPlayer.id}`,
        playerForm
      );
      setPlayerForm({
        name: "",
        type: "human",
        ai_provider: "",
        ai_model: "",
        persona: "",
      });
      setShowPlayerModal(false);
      setEditingPlayer(null);
      fetchPlayers(selectedGroup.id);
    } catch (error) {
      console.error("プレイヤー更新エラー:", error);
    }
  };

  // プレイヤー削除
  const deletePlayer = async (playerId) => {
    if (!confirm("このプレイヤーを削除しますか？")) return;

    try {
      await axios.delete(`${API_BASE}/a2a/players/${playerId}`);
      fetchPlayers(selectedGroup.id);
    } catch (error) {
      console.error("プレイヤー削除エラー:", error);
    }
  };

  // プレイヤー編集開始
  const startEditPlayer = (player) => {
    setEditingPlayer(player);
    setPlayerForm({
      name: player.name,
      type: player.type,
      ai_provider: player.ai_provider || "",
      ai_model: player.ai_model || "",
      persona: player.persona || "",
    });
    setShowPlayerModal(true);
  };

  // プレイヤー追加開始
  const startAddPlayer = () => {
    setEditingPlayer(null);
    setPlayerForm({
      name: "",
      type: "human",
      ai_provider: "",
      ai_model: "",
      persona: "",
    });
    setShowPlayerModal(true);
  };

  // フォームバリデーション
  const isPlayerFormValid = () => {
    if (!playerForm.name.trim()) return false;
    if (!playerForm.type) return false;

    // AIプレイヤーの場合は追加チェック
    if (playerForm.type === "ai") {
      if (!playerForm.ai_provider) return false;
      if (!playerForm.ai_model) return false;
    }

    return true;
  };

  // 人間の発言
  const sendUserMessage = async () => {
    if (!userInput.trim() || !selectedGroup) return;

    try {
      const humanPlayer = players.find((p) => p.type === "human");
      if (!humanPlayer) {
        alert("人間のプレイヤーが見つかりません");
        return;
      }

      await axios.post(`${API_BASE}/a2a/groups/${selectedGroup.id}/messages`, {
        player_id: humanPlayer.id,
        content: userInput,
      });

      setUserInput("");
      fetchMessages(selectedGroup.id);

      // 送信後は強制的に最下部へスクロール
      setTimeout(() => scrollToBottom(true), 100);
    } catch (error) {
      console.error("メッセージ送信エラー:", error);
    }
  };

  // Enterキーでの送信（Shift+Enterは改行）
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendUserMessage();
    }
  };

  // 自動スクロール機能
  const scrollToBottom = (force = false) => {
    if (messagesEndRef.current && (!isUserScrolling || force)) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  // メッセージが更新されたときに自動スクロール
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ユーザーのスクロール状態を監視
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    const isAtBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      10;

    setIsUserScrolling(!isAtBottom);
  };

  // スクロール監視を設定
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [selectedGroup]);

  // **テキスト** を太字に変換する関数
  const formatMessage = (text) => {
    // **text** を <strong>text</strong> に変換
    return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  };

  // グループルール更新
  const updateGroupRules = async () => {
    try {
      await axios.put(`${API_BASE}/a2a/groups/${selectedGroup.id}/rules`, {
        rules: groupRules,
      });
      setShowRulesModal(false);
      alert("グループルールが更新されました！");
    } catch (error) {
      console.error("グループルール更新エラー:", error);
      alert("ルール更新でエラーが発生しました");
    }
  };

  // ルールテンプレート
  const ruleTemplates = {
    natural_conversation: {
      name: "🗣️ 自然な会話",
      description: "AI同士の自然な対話を促進",
      rules: `
      ・この会話には複数のAI(LLM)や人間が参加しています
      ・説明や解説は一切せず、友達同士の自然な会話のみ
・相手の発言に感想やリアクションを必ず示す
・積極的に質問や新しい話題を提供する
・「です・ます」ではなく、親しみやすい話し方で
・1-2文で簡潔に、長い説明は避ける
・相手の名前を呼んで親近感を演出する`,
    },

    shiritori_game: {
      name: "🎮 しりとり",
      description: "楽しいしりとり専用ルール",
      rules: `
・みんなでしりとりをしましょう
・回答が「ん」で終わったら負け
・楽しく盛り上がりながらプレイする`,
    },

    debate_style: {
      name: "🤔 討論・議論",
      description: "建設的な議論を促進",
      rules: `・相手の意見を尊重し、「なるほど」「面白い視点ですね」などから始める
・必ず根拠や具体例を1つ提示する
・反対意見も建設的に表現する
・感情的にならず、冷静に議論する
・議論を深める質問を積極的にする`,
    },

    creative_story: {
      name: "📚 創作・ストーリー",
      description: "協力してストーリーを作成",
      rules: `・前の人の話を必ず受け継いで続ける
・新しいキャラクターや展開を積極的に追加する
・「そして」「でも突然」などで繋げる
・想像力を重視し、現実的でなくてもOK
・他の人のアイデアを否定しない`,
    },

    casual_chat: {
      name: "☕ 雑談・日常会話",
      description: "気軽な雑談を楽しむ",
      rules: `・「今日さ〜」「そういえば」など自然な切り出し
・相手の話に「わかる！」「それあるある」で共感
・自分の体験談や感想を積極的に話す
・話題が途切れたら別の話題を振る
・絵文字や感嘆符で感情を表現する`,
    },

    roleplay: {
      name: "🎭 ロールプレイ",
      description: "キャラクターになりきり",
      rules: `・設定されたキャラクターになりきって話す
・そのキャラクターらしい言葉遣いや反応をする
・現実の知識ではなく、キャラクターの立場で発言
・他のキャラクターとの関係性を意識する
・演技として楽しみ、キャラを維持する`,
    },

    quick_response: {
      name: "⚡ スピード会話",
      description: "テンポの良い短い会話",
      rules: `・1文以内で簡潔に答える
・考え込まず、直感的に反応する
・「うん」「そうそう」「マジで？」など短い相槌
・話題をポンポン変えても良い
・テンポ重視で深く考えすぎない`,
    },
  };

  // テンプレート適用
  const applyRuleTemplate = (templateRules) => {
    setGroupRules(templateRules);
  };

  const speakAI = async (player) => {
    if (!apiKeys[player.ai_provider]) {
      alert(`${player.ai_provider}のAPIキーが設定されていません`);
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${API_BASE}/a2a/groups/${selectedGroup.id}/ai-speak`, {
        player_id: player.id,
        api_key: apiKeys[player.ai_provider],
      });

      fetchMessages(selectedGroup.id);
    } catch (error) {
      console.error("AI発言エラー:", error);
      alert("AI発言でエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-10">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-lg rounded-full border border-white/20">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <h1 className="text-5xl font-black bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-2">
                  AI to AI
                </h1>
              </div>
              <Button
                onClick={() => setShowApiSettings(true)}
                className="p-3 bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 transition-all"
                variant="outline"
              >
                <span className="text-xl">⚙️</span>
              </Button>
            </div>
          </div>

          {/* Main Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left Panel - Groups */}
            <div className="xl:col-span-3">
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg font-bold">
                      チャットグループ
                    </CardTitle>
                    <Button
                      onClick={() => setShowGroupModal(true)}
                      size="sm"
                      className="bg-cyan-500 hover:bg-cyan-600"
                    >
                      ＋
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 max-h-80 overflow-y-auto">
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      onClick={() => handleGroupSelect(group)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        selectedGroup?.id === group.id
                          ? "bg-cyan-500/30 border border-cyan-400"
                          : "bg-white/10 hover:bg-white/20"
                      }`}
                    >
                      <div className="text-white font-semibold text-sm">
                        {group.name}
                      </div>
                      <div className="text-white/60 text-xs">
                        {group.message_count}件のメッセージ
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Center Panel - Chat */}
            <div className="xl:col-span-6">
              {selectedGroup ? (
                <div className="space-y-4">
                  {/* Players Panel */}
                  <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-lg">
                          参加者
                        </CardTitle>
                        <Button
                          onClick={startAddPlayer}
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                        >
                          追加
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {players.map((player) => (
                          <div
                            key={player.id}
                            className={`group relative px-3 py-2 rounded-lg flex items-center gap-2 ${
                              player.type === "human"
                                ? "bg-blue-500/20 border border-blue-400/30"
                                : "bg-purple-500/20 border border-purple-400/30"
                            }`}
                          >
                            {player.type === "ai" && player.ai_provider && (
                              <img
                                src={providers[player.ai_provider]?.icon}
                                alt={player.ai_provider}
                                className="w-4 h-4 rounded"
                              />
                            )}
                            <span className="text-white text-sm font-medium">
                              {player.name}
                            </span>
                            <span className="text-white/60 text-xs">
                              {player.type === "human" ? "👤" : "🤖"}
                            </span>

                            {/* 編集・削除ボタン */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-2">
                              <button
                                onClick={() => startEditPlayer(player)}
                                className="w-5 h-5 bg-yellow-500 hover:bg-yellow-600 rounded text-white text-xs flex items-center justify-center"
                                title="編集"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => deletePlayer(player.id)}
                                className="w-5 h-5 bg-red-500 hover:bg-red-600 rounded text-white text-xs flex items-center justify-center"
                                title="削除"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Messages Panel */}
                  <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-lg">
                          {selectedGroup.name}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setShowRulesModal(true)}
                            size="sm"
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            📋 ルール
                          </Button>
                        </div>
                      </div>
                      {groupRules && (
                        <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
                          <div className="text-yellow-300 text-xs font-semibold mb-1">
                            📋 グループルール
                          </div>
                          <div className="text-white/80 text-sm">
                            {groupRules}
                          </div>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div
                        ref={messagesContainerRef}
                        className="space-y-3 h-96 overflow-y-auto mb-4 scroll-smooth"
                        onScroll={handleScroll}
                      >
                        {messages.map((message) => (
                          <div key={message.id} className="flex gap-3">
                            <div className="flex-shrink-0">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                  message.speaker_type === "human"
                                    ? "bg-blue-500 text-white"
                                    : "bg-purple-500 text-white"
                                }`}
                              >
                                {message.speaker_name.charAt(0)}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-white font-semibold text-sm">
                                  {message.speaker_name}
                                </span>
                                <span className="text-white/50 text-xs">
                                  {new Date(
                                    message.timestamp
                                  ).toLocaleTimeString()}
                                </span>
                              </div>
                              <div
                                className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap"
                                dangerouslySetInnerHTML={{
                                  __html: formatMessage(message.content),
                                }}
                              />
                            </div>
                          </div>
                        ))}
                        {/* 自動スクロール用の空要素 */}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* スクロール状態インジケーター */}
                      {isUserScrolling && (
                        <div className="flex justify-center mb-2">
                          <Button
                            onClick={() => scrollToBottom(true)}
                            size="sm"
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10 text-xs"
                          >
                            ↓ 最新メッセージへ
                          </Button>
                        </div>
                      )}

                      {/* Input Area */}
                      <div className="space-y-2">
                        <Textarea
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          onKeyDown={handleKeyPress}
                          placeholder="メッセージを入力...（Shift+Enterで改行、Enterで送信）"
                          className="min-h-[80px] max-h-[120px] bg-white/10 border-white/20 text-white placeholder:text-white/40 resize-none"
                          rows={3}
                        />
                        <div className="flex justify-between items-center">
                          <div className="text-white/50 text-xs">
                            💡 **テキスト** で太字になります
                          </div>
                          <Button
                            onClick={sendUserMessage}
                            disabled={!userInput.trim()}
                            className="bg-blue-500 hover:bg-blue-600"
                          >
                            送信
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 h-full">
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎭</div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        グループを選択
                      </h3>
                      <p className="text-white/60">
                        左側からチャットグループを選択するか、新しく作成してください
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Panel - AI Controls */}
            <div className="xl:col-span-3">
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white text-lg font-bold">
                    AI制御パネル
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    AIプレイヤーに発言させる
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {players
                    .filter((p) => p.type === "ai")
                    .map((player) => (
                      <Button
                        key={player.id}
                        onClick={() => speakAI(player)}
                        disabled={isLoading || !apiKeys[player.ai_provider]}
                        className={`w-full flex items-center gap-3 p-4 h-auto bg-gradient-to-r ${
                          providers[player.ai_provider]?.color ||
                          "from-gray-500 to-gray-600"
                        } hover:scale-105 transform transition-all`}
                      >
                        {player.ai_provider && (
                          <img
                            src={providers[player.ai_provider]?.icon}
                            alt={player.ai_provider}
                            className="w-6 h-6 rounded"
                          />
                        )}
                        <div className="text-left">
                          <div className="font-bold">{player.name}</div>
                          <div className="text-xs opacity-80">に発言させる</div>
                        </div>
                      </Button>
                    ))}

                  {players.filter((p) => p.type === "ai").length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">🤖</div>
                      <p className="text-white/60 text-sm">
                        AIプレイヤーを追加してください
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-slate-900/95 backdrop-blur-xl border-white/20 shadow-2xl max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-white">新しいグループを作成</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={groupForm.name}
                onChange={(e) =>
                  setGroupForm({ ...groupForm, name: e.target.value })
                }
                placeholder="グループ名"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
              <Input
                value={groupForm.description}
                onChange={(e) =>
                  setGroupForm({ ...groupForm, description: e.target.value })
                }
                placeholder="説明（任意）"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
              <div className="flex gap-3">
                <Button
                  onClick={createGroup}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  作成
                </Button>
                <Button
                  onClick={() => setShowGroupModal(false)}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  キャンセル
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showPlayerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-slate-900/95 backdrop-blur-xl border-white/20 shadow-2xl max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-white">
                {editingPlayer ? "プレイヤーを編集" : "プレイヤーを追加"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={playerForm.name}
                onChange={(e) =>
                  setPlayerForm({ ...playerForm, name: e.target.value })
                }
                placeholder="プレイヤー名"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />

              <Select
                value={playerForm.type}
                onValueChange={(value) =>
                  setPlayerForm({ ...playerForm, type: value })
                }
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="タイプを選択" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/20">
                  <SelectItem value="human" className="text-white">
                    👤 人間
                  </SelectItem>
                  <SelectItem value="ai" className="text-white">
                    🤖 AI
                  </SelectItem>
                </SelectContent>
              </Select>

              {playerForm.type === "ai" && (
                <>
                  <div>
                    <Select
                      value={playerForm.ai_provider}
                      onValueChange={(value) =>
                        setPlayerForm({
                          ...playerForm,
                          ai_provider: value,
                          ai_model: "",
                        })
                      }
                    >
                      <SelectTrigger
                        className={`bg-white/10 border-white/20 text-white ${
                          !playerForm.ai_provider ? "border-red-400/50" : ""
                        }`}
                      >
                        <SelectValue placeholder="AIプロバイダー（必須）" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/20">
                        {Object.entries(providers).map(([key, provider]) => (
                          <SelectItem
                            key={key}
                            value={key}
                            className="text-white"
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={provider.icon}
                                alt={provider.name}
                                className="w-4 h-4"
                              />
                              {provider.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!playerForm.ai_provider && (
                      <p className="text-red-400 text-xs mt-1">
                        AIプロバイダーを選択してください
                      </p>
                    )}
                  </div>

                  {playerForm.ai_provider && (
                    <div>
                      <Select
                        value={playerForm.ai_model}
                        onValueChange={(value) =>
                          setPlayerForm({ ...playerForm, ai_model: value })
                        }
                      >
                        <SelectTrigger
                          className={`bg-white/10 border-white/20 text-white ${
                            !playerForm.ai_model ? "border-red-400/50" : ""
                          }`}
                        >
                          <SelectValue placeholder="モデルを選択（必須）" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/20">
                          {providers[playerForm.ai_provider]?.models.map(
                            (model) => (
                              <SelectItem
                                key={model.value}
                                value={model.value}
                                className="text-white"
                              >
                                <div className="flex flex-col gap-1">
                                  <div className="font-semibold">
                                    {model.label}
                                  </div>
                                  <div className="text-xs text-white/60">
                                    {model.description}
                                  </div>
                                </div>
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      {!playerForm.ai_model && (
                        <p className="text-red-400 text-xs mt-1">
                          モデルを選択してください
                        </p>
                      )}
                    </div>
                  )}

                  <Input
                    value={playerForm.persona}
                    onChange={(e) =>
                      setPlayerForm({ ...playerForm, persona: e.target.value })
                    }
                    placeholder="ペルソナ（例：親切なアシスタント）"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                </>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={editingPlayer ? updatePlayer : addPlayer}
                  disabled={!isPlayerFormValid()}
                  className={`flex-1 ${
                    isPlayerFormValid()
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-gray-500 cursor-not-allowed"
                  }`}
                >
                  {editingPlayer ? "更新" : "追加"}
                </Button>
                <Button
                  onClick={() => {
                    setShowPlayerModal(false);
                    setEditingPlayer(null);
                    setPlayerForm({
                      name: "",
                      type: "human",
                      ai_provider: "",
                      ai_model: "",
                      persona: "",
                    });
                  }}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  キャンセル
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* API Settings Modal */}
      {showApiSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-slate-900/95 backdrop-blur-xl border-white/20 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                ⚙️ API設定
              </CardTitle>
              <CardDescription className="text-white/60">
                各AIプロバイダーのAPIキーを設定してください。
                <br />
                設定されたキーはブラウザに暗号化して保存されます。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(providers).map(([key, provider]) => (
                <div key={key} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={provider.icon}
                      alt={provider.name}
                      className="w-8 h-8 rounded"
                    />
                    <div>
                      <h3 className="text-white font-semibold text-lg">
                        {provider.name}
                      </h3>
                      <p className="text-white/60 text-sm">
                        {provider.name === "Gemini" && "Google AI Studio"}
                        {provider.name === "ChatGPT" && "OpenAI Platform"}
                        {provider.name === "Claude" && "Anthropic Console"}
                        でAPIキーを取得してください
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <Input
                      type="password"
                      value={apiKeys[key]}
                      onChange={(e) =>
                        setApiKeys({ ...apiKeys, [key]: e.target.value })
                      }
                      placeholder={`${provider.name} APIキーを入力...`}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 pr-20"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {apiKeys[key] ? (
                        <span className="text-green-400 text-sm">
                          ✓ 設定済み
                        </span>
                      ) : (
                        <span className="text-red-400 text-sm">未設定</span>
                      )}
                    </div>
                  </div>

                  {/* API取得リンク */}
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <p className="text-white/80 text-sm mb-2">
                      📝 APIキー取得方法:
                    </p>
                    <div className="text-white/60 text-xs space-y-1">
                      {provider.name === "Gemini" && (
                        <>
                          <div>
                            1. Google AI Studio (aistudio.google.com) にアクセス
                          </div>
                          <div>2. 「Get API key」をクリック</div>
                          <div>3. 新しいプロジェクトでAPIキーを作成</div>
                        </>
                      )}
                      {provider.name === "ChatGPT" && (
                        <>
                          <div>
                            1. OpenAI Platform (platform.openai.com) にアクセス
                          </div>
                          <div>2. API keys セクションから新しいキーを作成</div>
                          <div>3. 使用量に応じて課金されます</div>
                        </>
                      )}
                      {provider.name === "Claude" && (
                        <>
                          <div>
                            1. Anthropic Console (console.anthropic.com)
                            にアクセス
                          </div>
                          <div>2. API Keys セクションから新しいキーを作成</div>
                          <div>3. 使用量に応じて課金されます</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* セキュリティ注意事項 */}
              <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-4">
                <div className="text-yellow-300 font-semibold text-sm mb-2">
                  🔒 セキュリティについて
                </div>
                <div className="text-white/80 text-sm space-y-1">
                  <div>
                    •
                    APIキーはブラウザのローカルストレージに暗号化して保存されます
                  </div>
                  <div>
                    • サーバーには保存されず、この端末でのみ利用されます
                  </div>
                  <div>
                    •
                    APIキーは各プロバイダーのサービス利用料金が発生する可能性があります
                  </div>
                  <div>
                    •
                    不要になったら各プロバイダーのダッシュボードでキーを削除してください
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={saveApiKeys}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  💾 保存
                </Button>
                <Button
                  onClick={() => setShowApiSettings(false)}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  キャンセル
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Group Rules Modal */}
      {showRulesModal && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-slate-900/95 backdrop-blur-xl border-white/20 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white text-xl">
                📋 グループルール設定
              </CardTitle>
              <CardDescription className="text-white/60">
                「{selectedGroup.name}」のルールを設定してください。
                <br />
                このルールはAIが発言する際に常に意識されます。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">
                  ルール内容
                </label>
                <textarea
                  value={groupRules}
                  onChange={(e) => setGroupRules(e.target.value)}
                  placeholder="例：
・必ず関西弁で話してください
・20文字以内で簡潔に答えてください  
・動物の名前しか言ってはいけません
・常に明るく前向きな回答をしてください"
                  className="w-full h-32 p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 resize-none text-sm"
                />
                <p className="text-white/50 text-sm mt-2">
                  💡 ヒント:
                  具体的で分かりやすいルールを設定すると、AIがより一貫した行動を取ります
                </p>
              </div>

              {/* ルールテンプレート選択 */}
              <div>
                <label className="block text-white font-semibold mb-3">
                  📋 ルールテンプレート
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                  {Object.entries(ruleTemplates).map(([key, template]) => (
                    <button
                      key={key}
                      onClick={() => applyRuleTemplate(template.rules)}
                      className="p-3 bg-white/5 hover:bg-white/15 rounded-lg border border-white/10 text-left transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium text-sm">
                            {template.name}
                          </div>
                          <div className="text-white/60 text-xs mt-1">
                            {template.description}
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-cyan-400 text-xs">適用</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-white/50 text-xs mt-2">
                  💡
                  テンプレートをクリックして適用後、必要に応じて編集してください
                </p>
              </div>

              <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-lg p-4">
                <div className="text-cyan-300 font-semibold text-sm mb-2">
                  📌 ルール例
                </div>
                <div className="text-white/80 text-sm space-y-1">
                  <div>
                    • <strong>しりとりゲーム</strong>:
                    "必ず動物の名前のみ答えること。存在しない動物は禁止"
                  </div>
                  <div>
                    • <strong>討論会</strong>:
                    "反対意見も尊重し、建設的な議論を心がけること"
                  </div>
                  <div>
                    • <strong>創作活動</strong>:
                    "想像力を重視し、既存作品の真似は避けること"
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={updateGroupRules}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  ルールを保存
                </Button>
                <Button
                  onClick={() => setShowRulesModal(false)}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  キャンセル
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default App;
