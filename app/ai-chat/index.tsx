import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import ChatMessage, { Message, MessageAttachment } from '../../components/chatbot/ChatMessage';
import ChatInputBar from '../../components/chatbot/ChatInputBar';
import AIButtonGenerateOverview from '../../components/chatbot/AIButtonGenerateOverview';
import QuickQuestions from '../../components/chatbot/QuickQuestions';
import NotebookMode from '../../components/chatbot/NotebookMode';
import VoiceMode from '../../components/chatbot/VoiceMode';
import ThinkingIndicator from '../../components/chatbot/ThinkingIndicator';
import { BookOpen, Bot, Sparkles, Trash2, StopCircle, WifiOff, Radio } from 'lucide-react';
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
            const broadcastMsg: Message = {
                id: `admin-${Date.now()}`,
                role: 'ai', // System acting as AI
                content: "> **SYSTEM ALERT**: Server maintenance scheduled for 3:00 AM UTC. \n\nNo downtime expected.",
                timestamp: 'System',
                suggestedActions: ['Dismiss']
            };
            // Only trigger if random chance met (to not annoy dev flow)
            if (Math.random() > 0.8) onReceive(broadcastMsg);
        }, 30000);
        return () => clearTimeout(timer);
    }, [onReceive]);
};

// Mock Plugin Registry
const PLUGIN_TOOLS = {
    'translate': (text: string, lang: string) => `Translating "${text}" to ${lang}...`,
    'factCheck': (claim: string) => `Verifying claim: "${claim}"...`,
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
              content: "Hello! I'm your **News Assistant**. I remember our conversation context during this visit. Try asking to **\"Visualize the Mars mission\"**.",
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
  // Only show full page loader if we haven't loaded chat before AND we don't have a restored session
  const [isInitializing, setIsInitializing] = useState(!isLoaded('chat') && messages.length <= 1);
  
  const [isNotebookMode, setIsNotebookMode] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(searchParams.get('mode') === 'voice');
  const [notebookTopic, setNotebookTopic] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  // --- 7.11 Engineering Refs ---
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null); // For aborting
  const responseCache = useRef<Map<string, Message>>(new Map()); // Simple memory cache
  const lastSentTime = useRef<number>(0); // Rate limiting
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const processedContextRef = useRef<string | null>(null); // Prevent double firing on strict mode

  // --- 7.13 Cross-App Integration Logic ---
  useEffect(() => {
      const context = searchParams.get('context');
      const headline = searchParams.get('headline');
      const topic = searchParams.get('topic');
      const content = searchParams.get('content'); // Snippet
      
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
          responseCache.current.clear();
      }
  };

  const handleStopGeneration = () => {
      if (streamIntervalRef.current) {
          clearInterval(streamIntervalRef.current);
          streamIntervalRef.current = null;
      }
      setIsLoading(false);
      setIsStreaming(false);
      
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
    // 7.11 Offline Check
    if (!navigator.onLine) {
        setToastMessage("You are offline. Please check connection.");
        setShowToast(true);
        return;
    }

    // 7.11 Rate Limit (1 second)
    const now = Date.now();
    if (now - lastSentTime.current < 1000) return;
    lastSentTime.current = now;

    logInteraction('user_sent', { text, timestamp: now });

    // 7.11 Cache Check
    const cachedResponse = responseCache.current.get(text.toLowerCase());
    
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: 'Just now'
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    if (cachedResponse) {
        // Simulate network delay for cache hit to feel natural
        setTimeout(() => {
            setMessages(prev => [...prev, { ...cachedResponse, id: Date.now().toString(), timestamp: 'Cached' }]);
            setIsLoading(false);
            logInteraction('ai_response', { cached: true, id: cachedResponse.id });
        }, 600);
        return;
    }

    // Mock API Call Setup
    abortControllerRef.current = new AbortController();
    
    // Simulate "Thinking" Phase
    setTimeout(() => {
        if (abortControllerRef.current?.signal.aborted) return;
        prepareAIResponse(text);
    }, 2500); 
  };

  const prepareAIResponse = (text: string) => {
      const lowerText = text.toLowerCase();
      let attachments: MessageAttachment[] = [];
      let finalContent = "";
      let sources = [
          { name: 'Reuters', url: '#' },
          { name: 'AP News', url: '#' }
      ];
      let actions: string[] = ['Show timeline', 'Explain deeper'];

      // --- Response Logic ---
      if (lowerText.includes("overview") || lowerText.includes("today's news")) {
          finalContent = "Here is your personalized daily briefing, curated based on your interest in **Technology** and **World Events**.\n\n> The EU AI Act has been finalized, setting a global standard for AI safety.";
          actions = ['Deep dive into Market', 'Show Politics section'];
          attachments.push({
              type: 'storyboard',
              data: {
                  headline: "Global Tech Rally & AI Safety",
                  summary: "Markets hit record highs today as the EU finalized the AI Safety Act. Tech giants have pledged compliance.",
                  audioDuration: "1:20",
                  highlights: ["NASDAQ up 2.4%", "EU AI Act Signed", "Clean Energy Bill proposed"],
                  graph: [{ label: 'Tech', value: 85 }, { label: 'Energy', value: 45 }, { label: 'Retail', value: 60 }],
                  timeline: [{ time: '09:00 AM', event: 'Markets Open' }, { time: '01:00 PM', event: 'Signing' }],
                  imageUrl: "https://picsum.photos/600/300?random=88"
              }
          });
      } else if (lowerText.includes('visualize') || lowerText.includes('image')) {
          finalContent = "I've generated a visual representation of **Starship's launch** based on the latest mission data.\n\n> This rendering shows the booster separation event at 120km altitude.";
          attachments.push({ type: 'image', title: "Starship Orbital Insertion", url: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=1000&auto=format&fit=crop' });
      } else if (lowerText.includes('notebook')) {
          setNotebookTopic(text);
          setIsNotebookMode(true);
          setIsLoading(false);
          return;
      } else if (lowerText.includes('newspaper')) {
          finalContent = "Here are 3 engaging headline options for your **Technology** edition:\n\n1. **Silicon Valley's Quantum Leap**\n2. **The AI Renaissance Begins**\n3. **Cyberpunk Reality: 2024 Tech Review**\n\n> Would you like me to draft the intro for option 2?";
          actions = ['Draft Intro', 'Generate Visuals'];
      } else if (lowerText.includes('explain')) {
          finalContent = `Here is a breakdown of **${text.replace('explain', '').trim() || 'the topic'}**.\n\n- Key drivers include **market demand** and policy shifts.\n- Experts predict a **20% growth** by Q4.\n\n> "This is a pivotal moment," says analysts.`;
      } else {
          finalContent = `I found a few articles regarding **"${text}"**. \n\n- The general consensus is [[positive]].\n- Most sources cite recent **breakthroughs** in the field.\n\n> "This is a pivotal moment for the industry," says Dr. Smith.`;
      }

      // --- 7.11 Streaming Simulation ---
      setIsLoading(false); // Stop "Thinking" spinner
      setIsStreaming(true);

      const aiMsgId = (Date.now() + 1).toString();
      
      // Initialize empty AI message
      const initialAiMsg: Message = {
          id: aiMsgId,
          role: 'ai',
          content: '', // Start empty
          isStreaming: true,
          timestamp: 'Just now'
      };
      setMessages(prev => [...prev, initialAiMsg]);

      // Stream text word by word
      const words = finalContent.split(' ');
      let currentWordIndex = 0;
      let accumulatedText = "";

      streamIntervalRef.current = setInterval(() => {
          if (currentWordIndex >= words.length) {
              // Finished
              clearInterval(streamIntervalRef.current!);
              setIsStreaming(false);
              
              // Update final message with attachments and actions
              setMessages(prev => prev.map(m => 
                  m.id === aiMsgId ? { 
                      ...m, 
                      content: accumulatedText, 
                      isStreaming: false,
                      attachments: attachments.length > 0 ? attachments : undefined,
                      sources: sources,
                      suggestedActions: actions
                  } : m
              ));

              // Cache the full response
              responseCache.current.set(lowerText, {
                  id: aiMsgId,
                  role: 'ai',
                  content: accumulatedText,
                  attachments: attachments.length > 0 ? attachments : undefined,
                  sources: sources,
                  suggestedActions: actions,
                  timestamp: 'Cached'
              });
              
              logInteraction('ai_response', { id: aiMsgId, length: accumulatedText.length });
              return;
          }

          // Append word (preserving spaces)
          accumulatedText += (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex];
          currentWordIndex++;

          // Update message state
          setMessages(prev => prev.map(m => 
              m.id === aiMsgId ? { ...m, content: accumulatedText } : m
          ));

      }, 40); // Speed of typing
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
    <div className="flex flex-col h-full bg-gray-50 pb-[70px] relative">
      
      {/* Toast */}
      {showToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60]">
              <Toast type="info" message={toastMessage} onClose={() => setShowToast(false)} />
          </div>
      )}

      {/* Overlays */}
      {isNotebookMode && <NotebookMode topic={notebookTopic} onClose={() => setIsNotebookMode(false)} />}
      {isVoiceMode && <VoiceMode onClose={() => setIsVoiceMode(false)} />}

      {/* 7.2 Custom Header */}
      <div className="shrink-0 bg-white/90 backdrop-blur-md border-b border-gray-100 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md relative">
                    <Bot size={20} />
                    {/* Status Dot */}
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
                </div>
                <div>
                    <h1 className="font-bold text-gray-900 leading-none">News Club AI</h1>
                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
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
                    className="p-2.5 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 text-gray-600 transition-colors"
                    title="Clear Context"
                >
                    <Trash2 size={18} />
                </button>
                <button 
                    onClick={() => setIsNotebookMode(!isNotebookMode)} 
                    className="p-2.5 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600 transition-colors"
                    title="Notebook Mode"
                >
                    <BookOpen size={20} />
                </button>
            </div>
        </div>
      </div>
      
      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" ref={scrollRef}>
        <div className="max-w-3xl mx-auto w-full">
            {!searchParams.get('context') && (
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
                            className="bg-white/80 backdrop-blur-md shadow-sm border-red-100 text-red-500 hover:bg-red-50"
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
      <div className="shrink-0 max-w-3xl mx-auto w-full z-10 bg-gray-50 pt-2">
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