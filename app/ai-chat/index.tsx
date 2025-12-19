import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleGenAI, Chat } from "@google/genai";
import ChatMessage, { Message } from '../../components/chatbot/ChatMessage';
import ChatInputBar from '../../components/chatbot/ChatInputBar';
import QuickQuestions from '../../components/chatbot/QuickQuestions';
import VoiceMode from '../../components/chatbot/VoiceMode';
import ThinkingIndicator from '../../components/chatbot/ThinkingIndicator';
import InteractiveAvatar from '../../components/chatbot/InteractiveAvatar';
import { Trash2, StopCircle, WifiOff, Bot, Zap } from 'lucide-react';
import SmartLoader from '../../components/loaders/SmartLoader';
import { useLoading } from '../../context/LoadingContext';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';

const getApiKey = () => {
  // @ts-ignore
  return window.process?.env?.API_KEY || process.env.API_KEY || '';
};

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoaded, markAsLoaded } = useLoading();
  
  const [messages, setMessages] = useState<Message[]>(() => {
      try {
          const saved = sessionStorage.getItem('news_club_chat_session');
          return saved ? JSON.parse(saved) : [];
      } catch (e) { return []; }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [avatarState, setAvatarState] = useState<'idle' | 'thinking' | 'speaking' | 'error'>('idle');
  const [isInitializing, setIsInitializing] = useState(!isLoaded('chat') && messages.length === 0);
  const [isVoiceMode, setIsVoiceMode] = useState(searchParams.get('mode') === 'voice');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [hasInteracted, setHasInteracted] = useState(messages.length > 0);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<Chat | null>(null);

  useEffect(() => {
    const initChat = async () => {
        try {
            const apiKey = getApiKey();
            if (!apiKey) return;
            const ai = new GoogleGenAI({ apiKey });
            chatSessionRef.current = ai.chats.create({
                model: 'gemini-3-flash-preview', 
                config: {
                    systemInstruction: "You are News Gemini 🤖, a super-smart news companion! 🚀\n\nSTYLE GUIDE:\n1. Use LOTS of emojis to be expressive and friendly! ✨🎉\n2. Summarize news clearly and use **bold text** for key facts 📰.\n3. Be concise—people are on the go 🏃‍♂️💨.\n4. ALWAYS provide 3 relevant follow-up questions at the end of your response to keep the conversation going! 🕵️‍♂️💡",
                    tools: [{ googleSearch: {} }],
                },
            });
        } catch (error) { setAvatarState('error'); }
    };
    if (!chatSessionRef.current) initChat();
  }, []);

  useEffect(() => {
      if (isInitializing) {
          const timer = setTimeout(() => { setIsInitializing(false); markAsLoaded('chat'); }, 1000);
          return () => clearTimeout(timer);
      }
  }, [isInitializing, markAsLoaded]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    // Persist session
    if (messages.length > 0) {
        sessionStorage.setItem('news_club_chat_session', JSON.stringify(messages));
    }
  }, [messages, isLoading, isStreaming]);

  const handleClearChat = () => {
      if (window.confirm("Do you want to start a fresh conversation? 🧹")) {
          setMessages([]);
          setHasInteracted(false);
          sessionStorage.removeItem('news_club_chat_session');
          chatSessionRef.current = null;
      }
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    setHasInteracted(true);
    const apiKey = getApiKey();
    if (!apiKey) { setToastMessage("API Key missing. Please check your config! 🔑"); setShowToast(true); return; }

    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: 'Just now' };
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);
    setAvatarState('thinking');

    const aiMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', content: '', isStreaming: true, timestamp: 'Just now' }]);

    try {
        if (!chatSessionRef.current) {
             const ai = new GoogleGenAI({ apiKey });
             chatSessionRef.current = ai.chats.create({ 
                 model: 'gemini-3-flash-preview', 
                 config: {
                    systemInstruction: "You are News Gemini 🤖. Use emojis! ✨ Provide follow-up questions! 💡",
                    tools: [{googleSearch: {}}] 
                 }
             });
        }

        const result = await chatSessionRef.current.sendMessageStream({ message: text });
        setIsLoading(false);
        setIsStreaming(true);
        setAvatarState('speaking');

        let accumulatedText = "";
        for await (const chunk of result) {
            const chunkText = chunk.text;
            if (chunkText) {
                accumulatedText += chunkText;
                setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: accumulatedText } : m));
            }
        }

        // Logic to suggest related prompts based on the conversation context
        let suggestedActions: string[] = ["Tell me more! 🗣️", "What else is trending? 🔥", "Explain it simply 👶"];
        const lowerText = accumulatedText.toLowerCase();
        
        if (lowerText.includes('tech') || lowerText.includes('ai')) {
            suggestedActions = ["Latest stock news 📈", "Future predictions? 🔮", "Top tech gadgets 📱"];
        } else if (lowerText.includes('world') || lowerText.includes('politics')) {
            suggestedActions = ["Global impact? 🌍", "Local reactions? 🏘️", "Historical context 🏛️"];
        } else if (lowerText.includes('sport')) {
            suggestedActions = ["Next big match? ⚽", "Player rankings 🏆", "Season highlights 📺"];
        }

        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: accumulatedText, isStreaming: false, suggestedActions } : m));
        setIsStreaming(false);
        setAvatarState('idle');
    } catch (error: any) {
        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: "Oops! I hit a snag. Let's try that again? 🔄🌀", isStreaming: false } : m));
        setIsLoading(false); setIsStreaming(false); setAvatarState('error');
    }
  };

  if (isInitializing) return <SmartLoader type="chat" />;

  return (
    <div className="flex flex-col h-full relative transition-colors duration-300 overflow-hidden bg-gray-50 dark:bg-[#0f172a] pb-[85px]">
      <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 dark:opacity-5"></div>
      </div>

      {showToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60]">
              <Toast type="info" message={toastMessage} onClose={() => setShowToast(false)} />
          </div>
      )}

      {isVoiceMode && <VoiceMode onClose={() => setIsVoiceMode(false)} />}

      <div className="shrink-0 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 z-20">
        <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 rounded-full blur-lg opacity-40"></div>
                    <InteractiveAvatar state={avatarState} size={38} />
                </div>
                <div>
                    <h1 className="font-bold text-gray-900 dark:text-white leading-none tracking-tight">News Gemini ✨</h1>
                    <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-300 font-bold uppercase tracking-wider block">Live Intel Hub 🚀</span>
                    </div>
                </div>
            </div>
            <button onClick={handleClearChat} className="p-2 bg-gray-100 dark:bg-white/5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400">
                <Trash2 size={16} />
            </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative z-10" ref={scrollRef}>
        <div className="max-w-4xl mx-auto w-full pb-4">
            {!hasInteracted && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-in zoom-in-95 duration-700">
                    <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl mb-8 relative group">
                        <Bot size={48} className="text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Hey there! 👋</h2>
                    <p className="text-gray-500 dark:text-slate-400 max-w-sm mb-10 text-sm font-medium">I'm your AI news partner. Ask me to summarize the day, analyze a trend, or just chat about what's happening! ✨🤖</p>
                    <button onClick={() => handleSend("Give me a morning briefing ☀️")} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2 hover:scale-105 active:scale-95">
                        <Zap size={18} className="fill-yellow-300" /> Start Daily Briefing
                    </button>
                </div>
            )}

            <div className="space-y-6">
                {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} onActionClick={handleSend} />
                ))}
                {isLoading && <ThinkingIndicator />}
                {(isLoading || isStreaming) && (
                    <div className="flex justify-center mt-4 sticky bottom-4 z-30">
                        <Button variant="danger" size="sm" className="rounded-full px-6 py-2 font-bold shadow-xl" onClick={() => {setIsLoading(false); setIsStreaming(false); setAvatarState('idle');}} leftIcon={<StopCircle size={16} />}>
                            Stop AI Generation
                        </Button>
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className="shrink-0 w-full z-20 relative bg-gray-50 dark:bg-[#0f172a]">
         {!hasInteracted && !isLoading && !isStreaming && messages.length > 0 && <QuickQuestions onSelect={handleSend} />}
         <ChatInputBar onSend={handleSend} isLoading={isLoading || isStreaming} />
      </div>
    </div>
  );
};

export default ChatPage;