import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import PageHeader from '../../components/PageHeader';
import ChatMessage, { Message, MessageAttachment } from '../../components/chatbot/ChatMessage';
import ChatInputBar from '../../components/chatbot/ChatInputBar';
import AIButtonGenerateOverview from '../../components/chatbot/AIButtonGenerateOverview';
import QuickQuestions from '../../components/chatbot/QuickQuestions';
import NotebookMode from '../../components/chatbot/NotebookMode';
import VoiceMode from '../../components/chatbot/VoiceMode';
import ThinkingIndicator from '../../components/chatbot/ThinkingIndicator';
import InteractiveAvatar from '../../components/chatbot/InteractiveAvatar';
import { BookOpen, Trash2, StopCircle, WifiOff, Sparkles, AlertTriangle, Command, Bot, Zap, Image as ImageIcon } from 'lucide-react';
import SmartLoader from '../../components/loaders/SmartLoader';
import { useLoading } from '../../context/LoadingContext';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';

// --- Helper: Sanitize History ---
const cleanHistory = (msgs: Message[]) => {
    const history: { role: 'user' | 'model', parts: { text: string }[] }[] = [];
    let expectingUser = true;
    
    for (const m of msgs) {
        if (m.id.startsWith('admin') || !m.content || m.attachments?.some(a => a.type === 'image')) continue;
        
        if (expectingUser && m.role === 'user') {
            history.push({ role: 'user', parts: [{ text: m.content }] });
            expectingUser = false;
        } else if (!expectingUser && m.role === 'ai') {
            history.push({ role: 'model', parts: [{ text: m.content }] });
            expectingUser = true;
        }
    }
    
    if (history.length > 0 && history[history.length - 1].role === 'user') {
        history.pop();
    }
    
    return history;
};

// --- Helper: Secure API Key Access ---
const getApiKey = () => {
  let apiKey = '';
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      // @ts-ignore
      apiKey = (import.meta as any).env.VITE_API_KEY || (import.meta as any).env.API_KEY;
    }
  } catch (e) {}

  if (!apiKey && typeof process !== 'undefined' && process.env) {
    try {
      apiKey = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY || process.env.REACT_APP_API_KEY;
    } catch (e) {}
  }

  if (!apiKey && typeof window !== 'undefined') {
      // @ts-ignore
      const winEnv = window.process?.env;
      if (winEnv && winEnv.API_KEY && winEnv.API_KEY !== 'undefined') {
          apiKey = winEnv.API_KEY;
      }
  }

  return apiKey;
};

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoaded, markAsLoaded } = useLoading();
  
  // --- Session Storage & State ---
  const [messages, setMessages] = useState<Message[]>(() => {
      try {
          const saved = sessionStorage.getItem('news_club_chat_session');
          return saved ? JSON.parse(saved) : [];
      } catch (e) {
          return [];
      }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [avatarState, setAvatarState] = useState<'idle' | 'thinking' | 'speaking' | 'error'>('idle');
  const [isInitializing, setIsInitializing] = useState(!isLoaded('chat') && messages.length === 0);
  const [isNotebookMode, setIsNotebookMode] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(searchParams.get('mode') === 'voice');
  const [notebookTopic, setNotebookTopic] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [hasInteracted, setHasInteracted] = useState(messages.length > 0);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<Chat | null>(null);
  const processedContextRef = useRef<string | null>(null);

  // --- Chat Initialization ---
  useEffect(() => {
    const initChat = async () => {
        try {
            const apiKey = getApiKey();
            if (!apiKey) return;

            const ai = new GoogleGenAI({ apiKey });
            const history = cleanHistory(messages);

            chatSessionRef.current = ai.chats.create({
                model: 'gemini-2.5-flash', 
                history: history,
                config: {
                    systemInstruction: "You are a helpful, professional, and concise News Assistant for the 'News Club' app. FORMATTING RULES: 1. Use **bold** for key terms. 2. Use [[brackets]] around entities. 3. Start summaries with '> '.",
                    tools: [{ googleSearch: {} }],
                },
            });
        } catch (error) {
            console.error("Failed to initialize chat:", error);
            setAvatarState('error');
        }
    };

    if (!chatSessionRef.current) {
        initChat();
    }
  }, [messages.length]); 

  // --- Context Logic ---
  useEffect(() => {
      const context = searchParams.get('context');
      const headline = searchParams.get('headline');
      const topic = searchParams.get('topic');
      const contextKey = `${context}-${headline || topic}`;

      if (context && processedContextRef.current !== contextKey) {
          processedContextRef.current = contextKey;
          let initialPrompt = "";
          
          switch(context) {
              case 'article': initialPrompt = `Explain "${headline}" simply.`; break;
              case 'reel': initialPrompt = `Tell me more about "${headline}".`; break;
              case 'newspaper': initialPrompt = `Headline ideas for "${topic}".`; break;
          }

          if (initialPrompt) setTimeout(() => handleSend(initialPrompt), 600);
      }
  }, [searchParams]);

  useEffect(() => {
      if (isInitializing) {
          const timer = setTimeout(() => {
              setIsInitializing(false);
              markAsLoaded('chat');
          }, 1000);
          return () => clearTimeout(timer);
      }
  }, [isInitializing, markAsLoaded]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading, isStreaming]); 

  useEffect(() => {
      if (messages.length > 0) sessionStorage.setItem('news_club_chat_session', JSON.stringify(messages));
  }, [messages]);

  const handleClearChat = () => {
      if (window.confirm("Start new conversation?")) {
          setMessages([]);
          setHasInteracted(false);
          sessionStorage.removeItem('news_club_chat_session');
          chatSessionRef.current = null; 
      }
  };

  const handleStopGeneration = () => {
      setIsLoading(false);
      setIsStreaming(false);
      setAvatarState('idle');
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    setHasInteracted(true);
    const apiKey = getApiKey();
    if (!apiKey) {
        setToastMessage("API Key missing.");
        setShowToast(true);
        return;
    }

    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: 'Just now' };
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);
    setAvatarState('thinking');

    // --- Image Generation Logic ---
    const lowerText = text.toLowerCase();
    const isImageRequest = lowerText.startsWith('draw') || 
                           lowerText.includes('generate image') || 
                           lowerText.includes('create image') ||
                           lowerText.startsWith('image of');

    if (isImageRequest) {
        const aiMsgId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', content: 'Generating visual...', isStreaming: true, timestamp: 'Just now' }]);

        try {
            const ai = new GoogleGenAI({ apiKey });
            
            // Using older model as requested for free tier compatibility
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image', 
                contents: {
                    parts: [{ text: text }]
                },
                config: {
                    imageConfig: { aspectRatio: "1:1" }
                }
            });

            let imageUrl = '';
            let caption = '';

            if (response.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
                    } else if (part.text) {
                        caption = part.text;
                    }
                }
            }

            setMessages(prev => prev.map(m => m.id === aiMsgId ? { 
                ...m, 
                content: caption || "I've generated an image based on your description.", 
                isStreaming: false,
                attachments: imageUrl ? [{ type: 'image', url: imageUrl, title: text }] : undefined
            } : m));

            setIsLoading(false);
            setAvatarState('idle');
            return;

        } catch (error) {
            console.error("Image Gen Error", error);
            setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: "I encountered an issue generating that image. Please try a different prompt.", isStreaming: false } : m));
            setIsLoading(false);
            setAvatarState('error');
            return;
        }
    }

    // --- Standard Text Chat ---
    const aiMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', content: '', isStreaming: true, timestamp: 'Just now' }]);

    try {
        if (!chatSessionRef.current) {
             const ai = new GoogleGenAI({ apiKey });
             const history = cleanHistory(messages);
             chatSessionRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                history: history,
                config: {
                    systemInstruction: "You are a helpful, professional, and concise News Assistant.",
                    tools: [{ googleSearch: {} }],
                },
             });
        }

        const result = await chatSessionRef.current.sendMessageStream({ message: text });
        
        setIsLoading(false);
        setIsStreaming(true);
        setAvatarState('speaking');

        let accumulatedText = "";
        let sources: { name: string; url: string }[] = [];

        for await (const chunk of result) {
            const chunkText = chunk.text;
            if (chunkText) {
                accumulatedText += chunkText;
                setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: accumulatedText } : m));
            }
            if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
                chunk.candidates[0].groundingMetadata.groundingChunks.forEach((c: any) => {
                    if (c.web?.uri && c.web?.title) {
                        if (!sources.find(s => s.url === c.web.uri)) sources.push({ name: c.web.title, url: c.web.uri });
                    }
                });
            }
        }

        setMessages(prev => prev.map(m => m.id === aiMsgId ? { 
            ...m, content: accumulatedText, isStreaming: false, sources: sources.length > 0 ? sources : undefined
        } : m));

        setIsStreaming(false);
        setAvatarState('idle');

    } catch (error: any) {
        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: "Connection interrupted. Please try again.", isStreaming: false } : m));
        setIsLoading(false);
        setIsStreaming(false);
        setAvatarState('error');
        chatSessionRef.current = null;
    }
  };

  const handleReportMessage = (id: string) => {
      setToastMessage("Feedback sent.");
      setShowToast(true);
  };

  if (isInitializing) return <SmartLoader type="chat" />;

  return (
    <div className="flex flex-col h-full relative transition-colors duration-300 overflow-hidden bg-gray-900">
      
      {/* Background Wallpaper */}
      <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#0f172a] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-900/30 to-transparent pointer-events-none"></div>
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-[#0f172a] to-transparent pointer-events-none"></div>
      </div>

      {showToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60]">
              <Toast type="info" message={toastMessage} onClose={() => setShowToast(false)} />
          </div>
      )}

      {isNotebookMode && <NotebookMode topic={notebookTopic} onClose={() => setIsNotebookMode(false)} />}
      {isVoiceMode && <VoiceMode onClose={() => setIsVoiceMode(false)} />}

      {/* Premium Header */}
      <div className="shrink-0 bg-white/5 backdrop-blur-xl border-b border-white/5 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 rounded-full blur-lg opacity-40"></div>
                    <InteractiveAvatar 
                        state={avatarState} 
                        size={38} 
                        onClick={() => {
                            setAvatarState('speaking');
                            setTimeout(() => setAvatarState('idle'), 1500);
                        }} 
                    />
                </div>
                <div>
                    <h1 className="font-bold text-white leading-none tracking-tight">News Gemini</h1>
                    <span className="text-[10px] text-indigo-300 font-medium flex items-center gap-1 mt-1 uppercase tracking-wider">
                        {!navigator.onLine ? <><WifiOff size={8} className="text-red-500"/> Offline</> : 
                         isLoading ? 'Processing...' : 
                         isStreaming ? 'Streaming...' : 
                         'System Online'}
                    </span>
                </div>
            </div>
            
            <div className="flex gap-2">
                <button onClick={handleClearChat} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400 transition-colors">
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar relative z-10" ref={scrollRef}>
        <div className="max-w-4xl mx-auto w-full pb-4">
            
            {/* Premium Intro Screen */}
            {!hasInteracted && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[65vh] text-center p-6 animate-in zoom-in-95 duration-700">
                    <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(79,70,229,0.3)] mb-8 relative group">
                        <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <Bot size={48} className="text-white drop-shadow-lg" />
                        <div className="absolute -bottom-2 -right-2 bg-white text-indigo-600 text-xs font-black px-2 py-1 rounded-lg shadow-sm">AI</div>
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400 mb-4 tracking-tight">
                        News Intelligence Hub
                    </h2>
                    
                    <p className="text-slate-400 max-w-sm mb-10 text-sm leading-relaxed font-medium">
                        I am your advanced AI assistant. I can analyze complex market trends, visualize data, generate images from text, and provide real-time news summaries.
                    </p>

                    <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                        <button onClick={() => handleSend("Analyze today's top headlines")} className="bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-2xl text-left transition-all group hover:border-indigo-500/50">
                            <Zap size={20} className="text-yellow-400 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold text-slate-200 block">Brief Me</span>
                            <span className="text-[10px] text-slate-500">Global summary</span>
                        </button>
                        <button onClick={() => handleSend("Draw a futuristic smart city")} className="bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-2xl text-left transition-all group hover:border-purple-500/50">
                            <ImageIcon size={20} className="text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold text-slate-200 block">Generate Art</span>
                            <span className="text-[10px] text-slate-500">Create visual</span>
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-6 pt-4 px-1">
                {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} onActionClick={handleSend} onReport={handleReportMessage} />
                ))}
                {isLoading && <ThinkingIndicator />}
                {(isLoading || isStreaming) && (
                    <div className="flex justify-center mt-4 animate-in fade-in slide-in-from-bottom-2">
                        <Button variant="secondary" size="sm" className="bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10" onClick={handleStopGeneration} leftIcon={<StopCircle size={14} />}>
                            Stop
                        </Button>
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className="shrink-0 max-w-4xl mx-auto w-full z-10 pt-2 relative">
         {!hasInteracted && !isLoading && !isStreaming && messages.length > 0 && <QuickQuestions onSelect={handleSend} />}
         <ChatInputBar onSend={handleSend} isLoading={isLoading || isStreaming} onVoiceClick={() => setIsVoiceMode(true)} />
      </div>
    </div>
  );
};

export default ChatPage;