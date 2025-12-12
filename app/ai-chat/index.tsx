import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import ChatMessage, { Message, MessageAttachment } from '../../components/chatbot/ChatMessage';
import ChatInputBar from '../../components/chatbot/ChatInputBar';
import AIButtonGenerateOverview from '../../components/chatbot/AIButtonGenerateOverview';
import QuickQuestions from '../../components/chatbot/QuickQuestions';
import NotebookMode from '../../components/chatbot/NotebookMode';
import { BookOpen } from 'lucide-react';
import TypingLoader from '../../components/loaders/TypingLoader';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ai',
      content: "Hello! I'm your News Assistant. I can summarize today's headlines, create charts, or explain complex topics.",
      timestamp: 'Just now'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNotebookMode, setIsNotebookMode] = useState(false);
  const [notebookTopic, setNotebookTopic] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]); // Added isLoading to scroll when loading starts

  const handleSend = (text: string) => {
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: 'Just now'
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    // Detect commands/intents
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('newspaper')) {
        setTimeout(() => {
            navigate('/newspaper');
        }, 1000);
        return;
    }

    if (lowerText.includes('notebook') || lowerText.includes('teach me')) {
        setTimeout(() => {
            setNotebookTopic(text.replace('Notebook Mode', '').replace('Teach me about', '').trim());
            setIsNotebookMode(true);
            setIsLoading(false);
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: "Opening Notebook Mode for deep learning...",
                timestamp: 'Just now'
            };
            setMessages(prev => [...prev, aiMsg]);
        }, 1000);
        return;
    }

    // Mock AI Response
    setTimeout(() => {
      let attachments: MessageAttachment[] = [];
      let content = `I've analyzed "${text}" for you.`;

      if (lowerText.includes('graph') || lowerText.includes('chart')) {
          attachments.push({ type: 'chart', title: 'Trend Analysis' });
          content += " Here is the visual data.";
      } else if (lowerText.includes('flowchart')) {
          attachments.push({ type: 'flowchart', title: 'Process Logic' });
          content += " Here is the process flow.";
      } else if (lowerText.includes('storyboard')) {
          attachments.push({ type: 'storyboard', title: 'Visual Sequence' });
      } else if (lowerText.includes('read') || lowerText.includes('explain')) {
          attachments.push({ 
            type: 'reading', 
            content: "Quantum computing harnesses the phenomena of quantum mechanics to deliver a huge leap forward in computation to solve certain problems. Unlike classical computers, which use bits..." 
          });
          content = "Here is an interactive reading of the topic.";
      } else {
          content += " Based on the latest reports, there is significant movement in this sector.";
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: content,
        attachments: attachments.length > 0 ? attachments : undefined,
        timestamp: 'Just now'
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleGenerateOverview = () => {
    handleSend("Generate today's news overview");
  };

  const handleNotebookToggle = () => {
    setIsNotebookMode(prev => !prev);
    setNotebookTopic("General Discussion");
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-[70px] relative"> {/* Full height + padding for bottom nav */}
      
      {/* Notebook Mode Overlay */}
      {isNotebookMode && (
        <NotebookMode topic={notebookTopic} onClose={() => setIsNotebookMode(false)} />
      )}

      <div className="shrink-0">
        <PageHeader 
            title="AI News Assistant" 
            action={
                <button 
                    onClick={handleNotebookToggle} 
                    className="text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    title="Toggle Notebook Mode"
                >
                    <BookOpen size={20} />
                </button>
            } 
        />
      </div>
      
      {/* Chat Area - Grows to fill space */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" ref={scrollRef}>
        <div className="max-w-3xl mx-auto w-full">
            <div className="mb-6 px-1">
                <AIButtonGenerateOverview onClick={handleGenerateOverview} isLoading={isLoading} />
            </div>

            <div className="space-y-2 pb-4">
                {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                ))}
                
                {isLoading && (
                    <div className="flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                         <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shrink-0 shadow-sm border border-white">
                            <span className="text-white text-xs font-bold">AI</span>
                         </div>
                         <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                            <TypingLoader text="Thinking..." />
                         </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Input Area - Pinned to bottom (above padding) */}
      <div className="shrink-0 max-w-3xl mx-auto w-full z-10 bg-gray-50 pt-2">
         <QuickQuestions onSelect={handleSend} />
         <ChatInputBar onSend={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatPage;