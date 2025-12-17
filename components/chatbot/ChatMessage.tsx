import React, { useState } from 'react';
import { User, Bot, ExternalLink, ArrowRight, Flag, Info, CheckCircle2 } from 'lucide-react';
import HighlightReadingMode from '../HighlightReadingMode';
import StoryboardAttachment, { StoryboardData } from './StoryboardAttachment';
import ImageAttachment from './ImageAttachment';
import SmartTextRenderer from './SmartTextRenderer';

export interface MessageAttachment {
  type: 'image' | 'chart' | 'flowchart' | 'storyboard' | 'reading';
  title?: string;
  url?: string;
  content?: string;
  data?: any; 
}

export interface Message {
  id: string;
  role: 'user' | 'ai' | 'model';
  content: string;
  attachments?: MessageAttachment[];
  timestamp?: string;
  sources?: Array<{ name: string; url: string }>;
  suggestedActions?: string[];
  isStreaming?: boolean;
}

interface ChatMessageProps {
  message: Message;
  onActionClick?: (action: string) => void;
  onReport?: (id: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onActionClick, onReport }) => {
  const isUser = message.role === 'user';
  const [isReported, setIsReported] = useState(false);

  const handleReport = () => {
      setIsReported(true);
      onReport?.(message.id);
  };

  return (
    <div className={`flex flex-col mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`flex gap-3 max-w-[95%] md:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white dark:border-gray-800 mt-1 relative overflow-hidden ${isUser ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300' : 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white'}`}>
                {isUser ? <User size={16} /> : <Bot size={16} className={message.isStreaming ? 'animate-pulse' : ''} />}
                
                {/* Streaming Glow */}
                {!isUser && message.isStreaming && (
                    <div className="absolute inset-0 bg-white/20 animate-ping rounded-full"></div>
                )}
            </div>

            {/* Message Bubble */}
            <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} min-w-0 flex-1`}>
                <div 
                className={`p-4 shadow-sm relative overflow-hidden text-sm leading-relaxed w-full group transition-colors duration-300 ${
                    isUser 
                    ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none' 
                    : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-none'
                }`}
                >
                {/* Content */}
                {isUser ? (
                    <p className="whitespace-pre-wrap font-medium">{message.content}</p>
                ) : (
                    <div className="relative min-h-[20px]">
                        <SmartTextRenderer content={message.content} />
                        {message.isStreaming && (
                            <span className="inline-block w-2 h-4 bg-indigo-500 dark:bg-indigo-400 ml-1 align-middle animate-pulse rounded-sm"></span>
                        )}
                    </div>
                )}

                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-3 space-y-3 w-full min-w-[260px]">
                    {message.attachments.map((att, idx) => (
                        <div key={idx} className="animate-in fade-in zoom-in-95 duration-500">
                            {att.type === 'storyboard' && att.data && <StoryboardAttachment data={att.data as StoryboardData} />}
                            {att.type === 'image' && att.url && <ImageAttachment url={att.url} title={att.title} />}
                            {att.type === 'reading' && (
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-600">
                                    <div className="text-xs font-bold text-gray-400 dark:text-gray-300 mb-2 uppercase tracking-wider">AI Read Aloud</div>
                                    <HighlightReadingMode text={att.content || "Content unavailable."} theme="dark" />
                                </div>
                            )}
                        </div>
                    ))}
                    </div>
                )}

                {/* Sources & Footer */}
                {!isUser && !message.isStreaming && (
                    <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-700 flex flex-col gap-2 opacity-80 hover:opacity-100 transition-opacity">
                        
                        {/* Sources Grid */}
                        {message.sources && message.sources.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-1">
                                {message.sources.map((src, i) => (
                                    <a 
                                        key={i} 
                                        href={src.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border border-gray-200 dark:border-gray-600 px-2 py-1 rounded-md text-[10px] text-gray-600 dark:text-gray-300 font-medium transition-colors"
                                    >
                                        <ExternalLink size={10} />
                                        <span className="truncate max-w-[100px]">{src.name}</span>
                                    </a>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-gray-500">
                                <Info size={10} />
                                <span>AI-generated. Verify details.</span>
                            </div>
                            <div className="flex gap-2">
                                {isReported ? (
                                    <span className="text-[10px] text-green-600 flex items-center gap-1"><CheckCircle2 size={10}/> Reported</span>
                                ) : (
                                    <button 
                                        onClick={handleReport}
                                        className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 rounded transition-colors" 
                                        title="Report inaccurate answer"
                                    >
                                        <Flag size={10} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                </div>
                
                {/* Timestamp */}
                <div className="flex items-center gap-2 mt-1 px-1 flex-wrap">
                    {message.timestamp && (
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                            {message.timestamp}
                        </span>
                    )}
                </div>
                
                {/* Suggested Actions */}
                {!isUser && !message.isStreaming && message.suggestedActions && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {message.suggestedActions.map((action, i) => (
                            <button
                                key={i}
                                onClick={() => onActionClick?.(action)}
                                className="bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors shadow-sm flex items-center gap-1"
                            >
                                {action} <ArrowRight size={12} />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default ChatMessage;