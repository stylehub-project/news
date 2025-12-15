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
import { BookOpen, Trash2, StopCircle, WifiOff, Sparkles } from 'lucide-react';
import SmartLoader from '../../components/loaders/SmartLoader';
import { useLoading } from '../../context/LoadingContext';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';

// --- 7.14 Future-Ready Hooks ---

// Mock Analytics Service
const useAnalytics = () => {
    const logInteraction = (type: 'user_sent' | 'ai_response' | 'error', data: any) => {
        // In production, this would send data to Firebase/Mixpanel
        console.log(`[Analytics] ${type}:`, data);
    };
    return { logInteraction };
};

// Mock Admin Broadcast Service
const useAdminBroadcast = (onReceive: (msg: Message) => void) => {
    useEffect(() => {
        // Simulate receiving a broadcast after a delay (e.g., Breaking News)
        const timer = setTimeout(() => {
            if (Math.random() > 0.95) { // Very Low probability to not annoy
                const broadcastMsg: Message = {
                    id: `admin-${Date.now()}`,
                    role: 'ai',
                    content: "> **BREAKING**: System maintenance scheduled for 3:00 AM UTC. No downtime expected.",
                    timestamp: 'System',
                    suggestedActions: ['Dismiss']
                };
                onReceive(broadcastMsg);
            }
        }, 60000);
        return () => clearTimeout(timer);
    }, [onReceive]);
};

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { isLoaded, markAsLoaded } = useLoading();
  const { logInteraction } = useAnalytics();
  
  // --- 7.9 Session Intelligence: Load from SessionStorage ---
  const [messages, setMessages] = useState<Message[]>(() => {
      try {
          const saved = sessionStorage.getItem('news_club_chat_session');
          return saved ? JSON.parse(saved) : [
            {
              id: 'welcome',
              role: 'ai',
              content: "Hello! I'm your **News Assistant**. I can help you analyze stories, check facts, and summarize global events. \n\nTry asking: **\"What's the latest on Space?\"**",
              timestamp: 'Just now',
              suggestedActions: ['Generate daily overview', 'Visualize Mars mission']
            }
          ];
      } catch (e) {
          return []; // Fallback
      }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [avatarState, setAvatarState] = useState<'idle' | 'thinking' | 'speaking' | 'error'>('idle');
  
  // Only show full page loader if we haven't loaded chat before AND we don't have a restored session
  const [isInitializing, setIsInitializing] = useState(!isLoaded('chat') && messages.length <= 1);
  
  const [isNotebookMode, setIsNotebookMode] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(searchParams.get('mode') === 'voice');
  const [notebookTopic, setNotebookTopic] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  // --- 7.11 Engineering Refs ---
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<Chat | null>(null);
  const lastSentTime = useRef<number>(0);
  const processedContextRef = useRef<string | null>(null);

  // --- Initialize Gemini Chat ---
  useEffect(() => {
    const initChat = async () => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Filter out system/admin messages from history sent to model
            const history = messages
                .filter(m => m.role !== 'system' && !m.id.startsWith('admin') && m.content)
                .map(m => ({
                    role: m.role === 'user' ? 'user' : 'model',
                    parts: [{ text: m.content }]
                }));

            chatSessionRef.current = ai.chats.create({
                model: 'gemini-2.5-flash', // Using stable flash model for browser
                history: history,
                config: {
                    systemInstruction: "You are a helpful, professional, and concise News Assistant for the 'News Club' app. \n\nFORMATTING RULES:\n1. Use **bold** for key terms and headlines.\n2. Use [[brackets]] around specific entities like people, companies, or countries (e.g., [[Elon Musk]], [[SpaceX]]).\n3. Start important summaries or quotes with '> ' to create a callout box.\n4. Keep responses digestible for mobile users.\n5. If asked about real-time news, use the googleSearch tool implicitly.",
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
  }, [messages]);

  // --- 7.13 Cross-App Integration Logic ---
  useEffect(() => {
      const context = searchParams.get('context');
      const headline = searchParams.get('headline');
      const topic = searchParams.get('topic');
      
      const contextKey = `${context}-${headline || topic}`;

      if (context && processedContextRef.current !== contextKey) {
          processedContextRef.current = contextKey;
          
          let initialPrompt = "";
          
          switch(context) {
              case 'article':
                  initialPrompt = `Can you explain the article "${headline}" simply?`;
                  break;
              case 'reel':
                  initialPrompt = `I just watched a reel about "${headline}". Tell me more details.`;
                  break;
              case 'newspaper':
                  initialPrompt = `I'm creating a newspaper about "${topic || 'General News'}". Suggest 3 catchy headlines.`;
                  break;
              default:
                  break;
          }

          if (initialPrompt) {
              setTimeout(() => handleSend(initialPrompt), 600);
          }
      }
  }, [searchParams]);

  // --- Initial Load Logic ---
  useEffect(() => {
      if (isInitializing) {
          const timer = setTimeout(() => {
              setIsInitializing(false);
              markAsLoaded('chat');
          }, 1500);
          return () => clearTimeout(timer);
      }
  }, [isInitializing, markAsLoaded]);

  // --- Auto Scroll ---
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isStreaming]); 

  // --- Persist Session ---
  useEffect(() => {
      if (messages.length > 0) {
          sessionStorage.setItem('news_club_chat_session', JSON.stringify(messages));
      }
  }, [messages]);

  // --- Admin Broadcast Hook ---
  useAdminBroadcast((msg) => {
      setMessages(prev => [...prev, msg]);
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
  });

  // --- Handlers ---
  const handleClearChat = () => {
      if (window.confirm("Clear conversation history?")) {
          const resetMsg: Message[] = [{
              id: Date.now().toString(),
              role: 'ai',
              content: "Chat cleared. What news topic are you interested in?",
              timestamp: 'Just now'
          }];
          setMessages(resetMsg);
          sessionStorage.removeItem('news_club_chat_session');
          // Re-init chat
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          chatSessionRef.current = ai.chats.create({
              model: 'gemini-2.5-flash',
              config: { tools: [{ googleSearch: {} }] }
          });
      }
  };

  const handleStopGeneration = () => {
      setIsLoading(false);
      setIsStreaming(false);
      setAvatarState('idle');
      
      setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last.role === 'ai') {
              return [...prev.slice(0, -1), { ...last, isStreaming: false, content: last.content + " ...[stopped]" }];
          }
          return prev;
      });
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    if (!navigator.onLine) {
        setToastMessage("You are offline.");
        setShowToast(true);
        return;
    }

    // Rate Limit (1s)
    const now = Date.now();
    if (now - lastSentTime.current < 1000) return;
    lastSentTime.current = now;

    logInteraction('user_sent', { text, timestamp: now });

    // Notebook Mode Shortcut
    if (text.toLowerCase().includes('notebook')) {
        setNotebookTopic(text);
        setIsNotebookMode(true);
        return;
    }

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: 'Just now'
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);
    setAvatarState('thinking');

    // AI Placeholder
    const aiMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
        id: aiMsgId,
        role: 'ai',
        content: '', 
        isStreaming: true,
        timestamp: 'Just now'
    }]);

    try {
        if (!chatSessionRef.current) throw new Error("Chat not ready");

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
                setMessages(prev => prev.map(m => 
                    m.id === aiMsgId ? { ...m, content: accumulatedText } : m
                ));
            }
            
            // Grounding check
            if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
                chunk.candidates[0].groundingMetadata.groundingChunks.forEach((c: any) => {
                    if (c.web?.uri && c.web?.title) {
                        if (!sources.find(s => s.url === c.web.uri)) {
                            sources.push({ name: c.web.title, url: c.web.uri });
                        }
                    }
                });
            }
        }

        setMessages(prev => prev.map(m => 
            m.id === aiMsgId ? { 
                ...m, 
                content: accumulatedText, 
                isStreaming: false,
                sources: sources.length > 0 ? sources : undefined
            } : m
        ));

        setIsStreaming(false);
        setAvatarState('idle');
        logInteraction('ai_response', { id: aiMsgId, length: accumulatedText.length });

    } catch (error) {
        console.error("Gemini Error:", error);
        setMessages(prev => prev.map(m => 
            m.id === aiMsgId ? { 
                ...m, 
                content: "I'm having trouble reaching the news servers right now. Please try again in a moment.", 
                isStreaming: false 
            } : m
        ));
        setIsLoading(false);
        setIsStreaming(false);
        setAvatarState('error');
    }
  };

  const handleReportMessage = (id: string) => {
      setToastMessage("Feedback sent. Thank you.");
      setShowToast(true);
      logInteraction('error', { type: 'report', msgId: id });
  };

  if (isInitializing) {
      return <SmartLoader type="chat" />;
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 pb-[70px] relative transition-colors duration-300">
      
      {showToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60]">
              <Toast type="info" message={toastMessage} onClose={() => setShowToast(false)} />
          </div>
      )}

      {isNotebookMode && <NotebookMode topic={notebookTopic} onClose={() => setIsNotebookMode(false)} />}
      {isVoiceMode && <VoiceMode onClose={() => setIsVoiceMode(false)} />}

      {/* Header */}
      <div className="shrink-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-10 transition-colors duration-300">
        <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <InteractiveAvatar 
                    state={avatarState} 
                    size={42} 
                    onClick={() => {
                        // Interactive Reaction
                        setAvatarState('speaking');
                        setTimeout(() => setAvatarState(isLoading ? 'thinking' : 'idle'), 1500);
                    }} 
                />
                
                <div>
                    <h1 className="font-bold text-gray-900 dark:text-white leading-none">News Club AI</h1>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                        {!navigator.onLine ? (
                            <><WifiOff size={10} className="text-red-500"/> Offline</>
                        ) : isLoading ? (
                            <>Thinking<span className="animate-pulse">...</span></>
                        ) : isStreaming ? (
                            <>Typing<span className="animate-pulse">...</span></>
                        ) : (
                            <>Online <Sparkles size={10} className="text-emerald-500" /></>
                        )}
                    </span>
                </div>
            </div>
            
            <div className="flex gap-2">
                <button 
                    onClick={handleClearChat}
                    className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 text-gray-600 dark:text-gray-400 transition-colors"
                    title="Clear Context"
                >
                    <Trash2 size={18} />
                </button>
                <button 
                    onClick={() => setIsNotebookMode(!isNotebookMode)} 
                    className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                    title="Notebook Mode"
                >
                    <BookOpen size={20} />
                </button>
            </div>
        </div>
      </div>
      
      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50 dark:bg-gray-900 transition-colors duration-300" ref={scrollRef}>
        <div className="max-w-3xl mx-auto w-full">
            {!searchParams.get('context') && messages.length < 2 && (
                <div className="mb-6 px-1 animate-in fade-in slide-in-from-top-4">
                    <AIButtonGenerateOverview onClick={() => handleSend("Generate today's news overview")} isLoading={isLoading || isStreaming} />
                </div>
            )}

            <div className="space-y-2 pb-4">
                {messages.map((msg) => (
                    <ChatMessage 
                        key={msg.id} 
                        message={msg} 
                        onActionClick={handleSend}
                        onReport={handleReportMessage}
                    />
                ))}
                
                {isLoading && <ThinkingIndicator />}

                {(isLoading || isStreaming) && (
                    <div className="flex justify-center mt-4 animate-in fade-in slide-in-from-bottom-2">
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm border-red-100 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={handleStopGeneration}
                            leftIcon={<StopCircle size={14} />}
                        >
                            Stop Generating
                        </Button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="shrink-0 max-w-3xl mx-auto w-full z-10 bg-gray-50 dark:bg-gray-900 pt-2 transition-colors duration-300">
         {!isLoading && !isStreaming && <QuickQuestions onSelect={handleSend} />}
         <ChatInputBar 
            onSend={handleSend} 
            isLoading={isLoading || isStreaming} 
            onVoiceClick={() => setIsVoiceMode(true)}
         />
      </div>
    </div>
  );
};

export default ChatPage;