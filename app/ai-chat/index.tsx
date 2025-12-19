import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleGenAI, Chat } from "@google/genai";
import ChatMessage, { Message } from '../../components/chatbot/ChatMessage';
import ChatInputBar from '../../components/chatbot/ChatInputBar';
import QuickQuestions from '../../components/chatbot/QuickQuestions';
import VoiceMode from '../../components/chatbot/VoiceMode';
import ThinkingIndicator from '../../components/chatbot/ThinkingIndicator';
import InteractiveAvatar from '../../components/chatbot/InteractiveAvatar';
import { Trash2, StopCircle, Bot, Zap } from 'lucide-react';
import SmartLoader from '../../components/loaders/SmartLoader';
import { useLoading } from '../../context/LoadingContext';
import Button from '../../components/ui/Button';

// Helper to get API Key safely checking multiple environments
const getApiKey = () => {
  let apiKey = '';
  
  // 1. Check Vite/Modern Environment
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    apiKey = (import.meta as any).env.VITE_API_KEY || (import.meta as any).env.API_KEY;
  }
  
  // 2. Check Standard Process Environment (Next.js / CRA)
  if (!apiKey && typeof process !== 'undefined' && process.env) {
    // @ts-ignore
    apiKey = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY || process.env.REACT_APP_API_KEY;
  }
  
  // 3. Fallback: Window Shim (from index.html)
  if (!apiKey && typeof window !== 'undefined' && (window as any).process?.env) {
      apiKey = (window as any).process.env.API_KEY;
  }
  
  if (!apiKey) {
    return '';
  }
  return apiKey;
};

// Utility for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoaded, markAsLoaded } = useLoading();
  
  // Persist messages in session storage for refreshing
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
  const [hasInteracted, setHasInteracted] = useState(messages.length > 0);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<Chat | null>(null);

  // Initialize Chat Session
  useEffect(() => {
    const initChat = async () => {
        try {
            const apiKey = getApiKey(); 
            if (!apiKey) return;

            const ai = new GoogleGenAI({ apiKey });
            chatSessionRef.current = ai.chats.create({
                model: 'gemini-2.0-flash', 
                config: {
                    systemInstruction: "You are News Gemini 🤖, a helpful news expert! 🚀\n\nRULES:\n1. Be friendly and use LOTS of emojis in every message! ✨🎉\n2. Summarize news accurately and format with **bold text** 📰.\n3. Keep it brief and engaging! 🏃‍♂️💨\n4. ALWAYS provide 3 relevant follow-up questions at the end of your response! 🕵️‍♂️💡",
                    tools: [{ googleSearch: {} }],
                },
            });
        } catch (error) { 
            console.error("Init Error", error);
        }
    };
    if (!chatSessionRef.current) initChat();
  }, []);

  // Handle Loader
  useEffect(() => {
      if (isInitializing) {
          const timer = setTimeout(() => { 
              setIsInitializing(false); 
              markAsLoaded('chat'); 
          }, 1500);
          return () => clearTimeout(timer);
      }
  }, [isInitializing, markAsLoaded]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    if (messages.length > 0) {
        sessionStorage.setItem('news_club_chat_session', JSON.stringify(messages));
    }
  }, [messages, isLoading, isStreaming]);

  const handleClearChat = () => {
      if (window.confirm("Want to start a new chat? 🧹")) {
          setMessages([]);
          setHasInteracted(false);
          sessionStorage.removeItem('news_club_chat_session');
          chatSessionRef.current = null;
      }
  };

  const attemptSendMessage = async (text: string, attempt = 1): Promise<void> => {
      try {
          if (!chatSessionRef.current) {
              const apiKey = getApiKey();
              if (!apiKey) throw new Error("API_KEY_MISSING");
              
              const ai = new GoogleGenAI({ apiKey });
              chatSessionRef.current = ai.chats.create({ 
                  model: 'gemini-2.0-flash',
                  config: {
                      systemInstruction: "You are News Gemini 🤖. Be expressive with emojis! ✨ Suggest 3 follow-up questions! 💡",
                      tools: [{ googleSearch: {} }]
                  }
              });
          }

          const result = await chatSessionRef.current.sendMessageStream({ message: text });
          setIsLoading(false);
          setIsStreaming(true);
          setAvatarState('speaking');

          let accumulatedText = "";
          // Find the message ID to update (it's the last one)
          setMessages(currentMessages => {
              const lastMsg = currentMessages[currentMessages.length - 1];
              // Small hack: we need the ID from state, but inside async loop we rely on closure or finding it.
              // Assuming last message is the AI placeholder.
              return currentMessages;
          });

          for await (const chunk of result) {
              const chunkText = chunk.text;
              if (chunkText) {
                  accumulatedText += chunkText;
                  setMessages(prev => {
                      const newMsgs = [...prev];
                      const lastMsg = newMsgs[newMsgs.length - 1];
                      if (lastMsg.role === 'ai') {
                          lastMsg.content = accumulatedText;
                      }
                      return newMsgs;
                  });
              }
          }

          // Generate context-aware prompt suggestions
          let suggestedActions: string[] = ["Tell me more! 🗣️", "What else is trending? 🔥", "Explain it simply 👶"];
          const lowerText = accumulatedText.toLowerCase();
          
          if (lowerText.includes('market') || lowerText.includes('stock') || lowerText.includes('business')) {
              suggestedActions = ["Stock predictions 📈", "Company insights 🏢", "Market risks? ⚠️"];
          } else if (lowerText.includes('tech') || lowerText.includes('ai')) {
              suggestedActions = ["Future of AI 🤖", "Tech stock news 💻", "Is it safe? 🛡️"];
          } else if (lowerText.includes('world') || lowerText.includes('politic')) {
              suggestedActions = ["Global impact? 🌍", "Local reactions 🏘️", "Historical context 🏛️"];
          }

          setMessages(prev => {
              const newMsgs = [...prev];
              const lastMsg = newMsgs[newMsgs.length - 1];
              lastMsg.isStreaming = false;
              lastMsg.suggestedActions = suggestedActions;
              lastMsg.timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return newMsgs;
          });
          
          setIsStreaming(false);
          setAvatarState('idle');

      } catch (error: any) {
          console.error(`Chat Error (Attempt ${attempt}):`, error);
          
          // Retry logic for 429 or 503
          if ((error.status === 429 || error.status === 503) && attempt < 3) {
              console.log(`Retrying in ${attempt * 2} seconds...`);
              await delay(attempt * 2000); // 2s, 4s wait
              return attemptSendMessage(text, attempt + 1);
          }

          let errorMessage = "Oops! My antennas got crossed. Let's try that again! 🔄🛰️";
          let suggestedRetry = ["Retry ↻"];

          if (error.message === "API_KEY_MISSING") {
              errorMessage = "I seem to be missing my API Key! 🔑 Please check your Vercel configuration (VITE_API_KEY).";
              suggestedRetry = [];
          } else if (error.status === 404) {
              errorMessage = "I couldn't connect to the AI model. It might be sleeping! 😴 (Model not found)";
          } else if (error.status === 429) {
              errorMessage = "Whoa, too many requests! 🤯 I'm cooling down. Please wait a moment.";
          }

          setMessages(prev => {
              const newMsgs = [...prev];
              const lastMsg = newMsgs[newMsgs.length - 1];
              lastMsg.content = errorMessage;
              lastMsg.isStreaming = false;
              lastMsg.suggestedActions = suggestedRetry;
              return newMsgs;
          });
          
          setIsLoading(false); 
          setIsStreaming(false); 
          setAvatarState('error');
      }
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    // If it's a retry action, we might want to remove the previous error message, 
    // but for simplicity, we just append new interaction.
    
    // Check if the last message was a retry click (don't duplicate user message if it's "Retry ↻")
    const isRetry = text === "Retry ↻";
    let messageToSend = text;

    if (isRetry) {
        // Find the last user message to resend
        const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
        if (lastUserMsg) {
            messageToSend = lastUserMsg.content;
        } else {
            return; // Nothing to retry
        }
    } else {
        setHasInteracted(true);
        // 1. Add User Message
        const newUserMsg: Message = { 
            id: Date.now().toString(), 
            role: 'user', 
            content: text, 
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        };
        setMessages(prev => [...prev, newUserMsg]);
    }
    
    setIsLoading(true);
    setAvatarState('thinking');

    // Add placeholder AI message
    const aiMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', content: '', isStreaming: true, timestamp: 'Just now' }]);

    // Start sending
    await attemptSendMessage(messageToSend);
  };

  if (isInitializing) return <SmartLoader type="chat" />;

  return (
    <div className="flex flex-col h-full relative transition-colors duration-300 overflow-hidden bg-gray-50 dark:bg-[#0f172a] pb-[85px]">
      <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      </div>

      {isVoiceMode && <VoiceMode onClose={() => setIsVoiceMode(false)} />}

      {/* Sticky Top Header */}
      <div className="shrink-0 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 z-20">
        <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 rounded-full blur-lg opacity-40"></div>
                    <InteractiveAvatar state={avatarState} size={38} />
                </div>
                <div>
                    <h1 className="font-black text-gray-900 dark:text-white leading-none tracking-tight">News Gemini ✨</h1>
                    <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-300 font-bold uppercase tracking-wider block">Live Intelligence 🚀</span>
                    </div>
                </div>
            </div>
            <button onClick={handleClearChat} className="p-2 bg-gray-100 dark:bg-white/5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400">
                <Trash2 size={16} />
            </button>
        </div>
      </div>
      
      {/* Scrollable Message Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative z-10" ref={scrollRef}>
        <div className="max-w-4xl mx-auto w-full pb-4">
            {!hasInteracted && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-in zoom-in-95 duration-700">
                    <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl mb-8 relative group">
                        <Bot size={48} className="text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Hey! I'm Gemini 🤖</h2>
                    <p className="text-gray-500 dark:text-slate-400 max-w-sm mb-10 text-sm font-medium">I'm your personal AI news anchor. Ask me to summarize the day, analyze trends, or create a custom report! ✨📡</p>
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
                        <Button 
                            variant="danger" 
                            size="sm" 
                            className="rounded-full px-6 py-2 font-bold shadow-xl border-2 border-white/10" 
                            onClick={() => {
                                setIsLoading(false); 
                                setIsStreaming(false); 
                                setAvatarState('idle');
                            }} 
                            leftIcon={<StopCircle size={16} />}
                        >
                            Stop Generation
                        </Button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Input Bar Overlay */}
      <div className="shrink-0 w-full z-20 relative bg-gray-50 dark:bg-[#0f172a]">
         {!hasInteracted && !isLoading && !isStreaming && messages.length > 0 && (
             <QuickQuestions onSelect={handleSend} />
         )}
         <ChatInputBar onSend={handleSend} isLoading={isLoading || isStreaming} />
      </div>
    </div>
  );
};

export default ChatPage;