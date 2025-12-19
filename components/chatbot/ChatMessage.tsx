import React, { useState } from 'react';
import { User, ExternalLink, ArrowRight, Flag, Info, CheckCircle2, Wand2 } from 'lucide-react';
import HighlightReadingMode from '../HighlightReadingMode';
import StoryboardAttachment, { StoryboardData } from './StoryboardAttachment';
import ImageAttachment from './ImageAttachment';
import SmartTextRenderer from './SmartTextRenderer';
import InteractiveAvatar from './InteractiveAvatar';

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
  const [aiState, setAiState] = useState<'idle' | 'speaking'>('idle');

  const handleReport = () => {
      setIsReported(true);
      onReport?.(message.id);
  };

  const handleAvatarClick = () => {
      setAiState('speaking');
      setTimeout(() => setAiState('idle'), 1500);
  };

  return (
    <div className="w-full mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300 group clearfix">
        {/* Bubble Container */}
        <div className={`relative w-full rounded-2xl p-4 transition-all duration-300 ${
            isUser 
            ? 'bg-indigo-100 dark:bg-indigo-600/10 border border-indigo-200 dark:border-indigo-500/30' 
            : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-lg backdrop-blur-sm'
        }`}>
            
            {/* Floated Avatar */}
            {/* Using block flow so text wraps naturally under it */}
            <div className={`mb-1 ${isUser ? 'float-right ml-3' : 'float-left mr-3'}`}>
                {isUser ? (
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg text-xs font-bold border border-white/20">
                        ME
                    </div>
                ) : (
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500 blur-md opacity-30 rounded-full"></div>
                        <InteractiveAvatar 
                            state={message.isStreaming ? 'speaking' : aiState} 
                            size={40} 
                            onClick={handleAvatarClick}
                        />
                    </div>
                )}
            </div>

            {/* Text Content - No overflow hidden, allowing wrap around float */}
            <div className={`text-sm leading-relaxed tracking-wide ${
                isUser 
                ? 'text-indigo-900 dark:text-indigo-100 font-medium text-right' 
                : 'text-gray-800 dark:text-slate-200 text-left'
            }`}>
                {/* Wrapper to ensure formatting context is inline-block like or block */}
                <div className="inline">
                    {isUser ? (
                        <span className="whitespace-pre-wrap">{message.content}</span>
                    ) : (
                        <div className="relative min-h-[20px]">
                            <SmartTextRenderer content={message.content} />
                            {message.isStreaming && (
                                <span className="inline-block w-1.5 h-4 bg-indigo-400 ml-1 align-middle animate-pulse rounded-sm"></span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Clear Float */}
            <div className="clear-both"></div>

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
                <div className={`mt-4 space-y-3 w-full max-w-md ${isUser ? 'ml-auto' : ''}`}>
                {message.attachments.map((att, idx) => (
                    <div key={idx} className="animate-in fade-in zoom-in-95 duration-500">
                        {att.type === 'storyboard' && att.data && <StoryboardAttachment data={att.data as StoryboardData} />}
                        {att.type === 'image' && att.url && <ImageAttachment url={att.url} title={att.title} />}
                        {att.type === 'reading' && (
                            <div className="bg-gray-100 dark:bg-black/20 p-3 rounded-xl border border-gray-200 dark:border-white/10">
                                <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Read Aloud</div>
                                <HighlightReadingMode text={att.content || "Content unavailable."} theme="dark" />
                            </div>
                        )}
                    </div>
                ))}
                </div>
            )}

            {/* Footer Sources & Metadata (Only for AI) */}
            {!isUser && !message.isStreaming && (
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 flex flex-col gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    {message.sources && message.sources.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-1">
                            {message.sources.map((src, i) => (
                                <a 
                                    key={i} 
                                    href={src.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 bg-gray-100 dark:bg-black/20 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 px-2 py-1 rounded text-[10px] text-gray-600 dark:text-slate-300 font-medium transition-colors"
                                >
                                    <ExternalLink size={10} />
                                    <span className="truncate max-w-[120px]">{src.name}</span>
                                </a>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 font-mono">
                            Generated by Gemini • {message.timestamp || 'Just now'}
                        </span>
                        <div className="flex gap-2">
                            {isReported ? (
                                <span className="text-[10px] text-green-500 flex items-center gap-1"><CheckCircle2 size={10}/> Feedback Sent</span>
                            ) : (
                                <button 
                                    onClick={handleReport}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 rounded transition-colors" 
                                >
                                    <Flag size={10} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
        
        {/* Suggested Actions Chips (Outside bubble) */}
        {!isUser && !message.isStreaming && message.suggestedActions && (
            <div className="flex flex-wrap gap-2 mt-2 ml-4">
                {message.suggestedActions.map((action, i) => (
                    <button
                        key={i}
                        onClick={() => onActionClick?.(action)}
                        className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-indigo-600 dark:text-indigo-300 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-gray-50 dark:hover:bg-white/10 transition-colors shadow-sm flex items-center gap-1 backdrop-blur-sm"
                    >
                        {action} <ArrowRight size={12} />
                    </button>
                ))}
            </div>
        )}
    </div>
  );
};

export default ChatMessage;