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
            if (Math.random() > 0.9) { // Low probability
                const broadcastMsg: Message = {
                    id: `admin-${Date.now()}`,
                    role: 'ai', // System acting as AI
                    content: "> **SYSTEM ALERT**: Server maintenance scheduled for 3:00 AM UTC. \n\nNo downtime expected.",
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
              content: "Hello! I'm your **News Assistant**. I can access real-time data via Google Search and analyze current events for you. Try asking to **\"Visualize the Mars mission\"**.",
              timestamp: 'Just now',
              suggestedActions: ['Generate today\'s overview', 'Visualize the Mars mission']
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
  const lastSentTime = useRef<number>(0); // Rate limiting
  const processedContextRef = useRef<string | null>(null); // Prevent double firing on strict mode

  // --- Initialize Gemini Chat ---
  useEffect(() => {
    const initChat = async () => {
        try {
            // Using the new SDK
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Map existing messages to history format
            // Exclude the very first welcome message if it's purely UI based (id='welcome')
            const history = messages
                .filter(m => m.id !== 'welcome' && !m.id.startsWith('admin'))
                .map(m => ({
                    role: m.role === 'user' ? 'user' : 'model',
                    parts: [{ text: m.content }]
                }));

            chatSessionRef.current = ai.chats.create({
                model: 'gemini-3-pro-preview', // Using the latest model as requested
                history: history,
                config: {
                    systemInstruction: "You are a friendly, expert News Assistant for the 'News Club' app. You provide accurate summaries, analyze complex topics, and maintain a helpful tone. You can use markdown for formatting.",
                    tools: [{ googleSearch: {} }], // Enable Search Grounding
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
                  initialPrompt = `Explain the article "${headline}" in simple terms.`;
                  break;
              case 'reel':
                  initialPrompt = `Tell me more about the story: "${headline}". What are the implications?`;
                  break;
              case 'newspaper':
                  initialPrompt = `I need creative headline ideas for a newspaper about "${topic || 'Technology'}".`;
                  break;
              case 'profile':
                  initialPrompt = `Analyze my reading interests in ${topic} and suggest new topics.`;
                  break;
              default:
                  break;
          }

          if (initialPrompt) {
              // Add a slight delay to feel natural after navigation
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

  // --- 7.9 Session Intelligence: Persist to SessionStorage ---
  useEffect(() => {
      if (messages.length > 0) {
          sessionStorage.setItem('news_club_chat_session', JSON.stringify(messages));
      }
  }, [messages]);

  // --- Auto Scroll ---
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isStreaming]); 

  // --- 7.14 Admin Broadcast Hook ---
  useAdminBroadcast((msg) => {
      setMessages(prev => [...prev, msg]);
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
  });

  // --- Handlers ---
  const handleClearChat = () => {
      if (window.confirm("Start a new conversation? This will clear current context.")) {
          const resetMsg: Message[] = [{
              id: Date.now().toString(),
              role: 'ai',
              content: "Context cleared. How can I help you with the latest news?",
              timestamp: 'Just now'
          }];
          setMessages(resetMsg);
          sessionStorage.removeItem('news_club_chat_session');
          // Re-init chat session
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          chatSessionRef.current = ai.chats.create({
              model: 'gemini-3-pro-preview',
              config: { tools: [{ googleSearch: {} }] }
          });
      }
  };

  const handleStopGeneration = () => {
      // Note: The SDK doesn't natively expose an abort controller for the stream easily in this setup,
      // but we can stop processing the visual stream.
      setIsLoading(false);
      setIsStreaming(false);
      setAvatarState('idle');
      
      // Update last message to remove loading state visuals if needed
      setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last.role === 'ai') {
              return [...prev.slice(0, -1), { ...last, isStreaming: false, content: last.content + " [Stopped]" }];
          }
          return prev;
      });
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    // 7.11 Offline Check
    if (!navigator.onLine) {
        setToastMessage("You are offline. Please check connection.");
        setShowToast(true);
        setAvatarState('error');
        return;
    }

    // 7.11 Rate Limit (1 second)
    const now = Date.now();
    if (now - lastSentTime.current < 1000) return;
    lastSentTime.current = now;

    logInteraction('user_sent', { text, timestamp: now });

    // Notebook Mode Check
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

    // Initialize AI message placeholder
    const aiMsgId = (Date.now() + 1).toString();
    const initialAiMsg: Message = {
        id: aiMsgId,
        role: 'ai',
        content: '', 
        isStreaming: true,
        timestamp: 'Just now'
    };
    setMessages(prev => [...prev, initialAiMsg]);

    try {
        if (!chatSessionRef.current) {
             throw new Error("Chat session not initialized");
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
                
                // Real-time update
                setMessages(prev => prev.map(m => 
                    m.id === aiMsgId ? { ...m, content: accumulatedText } : m
                ));
            }
            
            // Capture Grounding Metadata if available
            if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
                const chunks = chunk.candidates[0].groundingMetadata.groundingChunks;
                chunks.forEach((c: any) => {
                    if (c.web?.uri && c.web?.title) {
                        if (!sources.find(s => s.url === c.web.uri)) {
                            sources.push({ name: c.web.title, url: c.web.uri });
                        }
                    }
                });
            }
        }

        // Finalize message
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
                content: "I'm having trouble connecting to the network right now. Please try again.", 
                isStreaming: false 
            } : m
        ));
        setIsLoading(false);
        setIsStreaming(false);
        setAvatarState('error');
    }
  };

  const handleReportMessage = (id: string) => {
      setToastMessage("Report received. We will review this answer.");
      setShowToast(true);
      logInteraction('error', { type: 'report', msgId: id });
  };

  if (isInitializing) {
      return <SmartLoader type="chat" />;
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 pb-[70px] relative transition-colors duration-300">
      
      {/* Toast */}
      {showToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60]">
              <Toast type="info" message={toastMessage} onClose={() => setShowToast(false)} />
          </div>
      )}

      {/* Overlays */}
      {isNotebookMode && <NotebookMode topic={notebookTopic} onClose={() => setIsNotebookMode(false)} />}
      {isVoiceMode && <VoiceMode onClose={() => setIsVoiceMode(false)} />}

      {/* 7.2 Custom Header with Interactive Avatar */}
      <div className="shrink-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-10 transition-colors duration-300">
        <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
                {/* Interactive Avatar */}
                <InteractiveAvatar 
                    state={avatarState} 
                    size={42} 
                    onClick={() => setAvatarState('speaking')} 
                />
                
                <div>
                    <h1 className="font-bold text-gray-900 dark:text-white leading-none">News Club AI</h1>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                        {!navigator.onLine ? (
                            <><WifiOff size={10} className="text-red-500"/> Offline</>
                        ) : isLoading ? (
                            <>Thinking<span className="animate-pulse">...</span></>
                        ) : isStreaming ? (
                            <>Typing<span className="animate-pulse">...</span></>
                        ) : (
                            <>Online <Sparkles size={10} className="text-indigo-500" /></>
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
                <div className="mb-6 px-1">
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
                
                {/* 7.8 Zero-Boredom Loading */}
                {isLoading && <ThinkingIndicator />}

                {/* 7.11 Abort Control UI */}
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