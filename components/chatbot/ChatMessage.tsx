import React, { useState } from 'react';
import { User, Bot, BarChart2, GitMerge, FileText, ExternalLink, ArrowRight, ShieldAlert, Flag, Info, CheckCircle2 } from 'lucide-react';
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
  role: 'user' | 'ai';
  content: string;
  attachments?: MessageAttachment[];
  timestamp?: string;
  sources?: Array<{ name: string; url: string }>;
  suggestedActions?: string[];
  isStreaming?: boolean; // 7.11 Streaming State
}

interface ChatMessageProps {
  message: Message;
  onActionClick?: (action: string) => void;
  onReport?: (id: string) => void; // 7.10 Reporting
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
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white mt-1 relative overflow-hidden ${isUser ? 'bg-gray-200 text-gray-600' : 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white'}`}>
                {isUser ? <User size={16} /> : <Bot size={16} className={message.isStreaming ? 'animate-pulse' : ''} />}
                
                {/* 7.12 Emotion-Aware / Activity Glow */}
                {!isUser && message.isStreaming && (
                    <div className="absolute inset-0 bg-white/20 animate-ping rounded-full"></div>
                )}
            </div>

            {/* Message Bubble & Content */}
            <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} min-w-0 flex-1`}>
                <div 
                className={`p-4 shadow-sm relative overflow-hidden text-sm leading-relaxed w-full group ${
                    isUser 
                    ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-none'
                }`}
                >
                {/* 7.7 Smart Text Rendering (Only for AI) */}
                {isUser ? (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                    <div className="relative">
                        <SmartTextRenderer content={message.content} />
                        {/* Cursor for Streaming Effect */}
                        {message.isStreaming && (
                            <span className="inline-block w-2 h-4 bg-indigo-500 ml-1 animate-pulse align-middle"></span>
                        )}
                    </div>
                )}

                {/* Attachments / Rich Content */}
                {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-3 space-y-3 w-full min-w-[260px]">
                    {message.attachments.map((att, idx) => (
                        <div key={idx} className="animate-in fade-in zoom-in-95 duration-500">
                            
                            {/* 7.5 Storyboard Attachment */}
                            {att.type === 'storyboard' && att.data && (
                                <StoryboardAttachment data={att.data as StoryboardData} />
                            )}

                            {/* 7.6 Image Attachment */}
                            {att.type === 'image' && att.url && (
                                <ImageAttachment url={att.url} title={att.title} />
                            )}

                            {/* Reading Mode */}
                            {att.type === 'reading' && (
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">AI Read Aloud</div>
                                    <HighlightReadingMode text={att.content || "Content unavailable."} />
                                </div>
                            )}

                            {/* Chart Placeholder */}
                            {att.type === 'chart' && (
                                <div className="p-3 bg-white rounded-xl border border-gray-200">
                                <div className="flex items-center gap-2 mb-2 opacity-70">
                                    <BarChart2 size={14} />
                                    <span className="text-xs font-bold uppercase">{att.title || 'Data Visualization'}</span>
                                </div>
                                <div className="flex items-end gap-1 h-24 justify-between px-2 pb-1 border-b border-l border-gray-200">
                                    {[40, 70, 30, 85, 50, 60].map((h, i) => (
                                    <div key={i} className="w-full bg-indigo-500 rounded-t-sm opacity-90 hover:opacity-100 transition-opacity" style={{ height: `${h}%` }}></div>
                                    ))}
                                </div>
                                </div>
                            )}

                            {/* Flowchart Placeholder */}
                            {att.type === 'flowchart' && (
                                <div className="p-3 bg-white rounded-xl border border-gray-200">
                                <div className="flex items-center gap-2 mb-2 opacity-70">
                                    <GitMerge size={14} />
                                    <span className="text-xs font-bold uppercase">{att.title || 'Process Flow'}</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 text-[10px] font-mono opacity-80 py-2">
                                    <div className="border-2 border-gray-800 px-3 py-1 rounded-lg bg-white shadow-sm">Start</div>
                                    <div className="h-4 w-0.5 bg-gray-300"></div>
                                    <div className="border-2 border-blue-500 text-blue-600 px-3 py-1 rounded-lg bg-blue-50 shadow-sm">AI Analysis</div>
                                    <div className="h-4 w-0.5 bg-gray-300"></div>
                                    <div className="border-2 border-gray-800 px-3 py-1 rounded-lg bg-white shadow-sm">Result</div>
                                </div>
                                </div>
                            )}
                        </div>
                    ))}
                    </div>
                )}

                {/* 7.10 Safety & Trust Footer (Only for AI, not during streaming) */}
                {!isUser && !message.isStreaming && (
                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between opacity-60 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                            <Info size={10} />
                            <span>AI-generated. Verify important info.</span>
                        </div>
                        <div className="flex gap-2">
                            {isReported ? (
                                <span className="text-[10px] text-green-600 flex items-center gap-1"><CheckCircle2 size={10}/> Reported</span>
                            ) : (
                                <button 
                                    onClick={handleReport}
                                    className="p-1 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded transition-colors" 
                                    title="Report inaccurate answer"
                                >
                                    <Flag size={10} />
                                </button>
                            )}
                        </div>
                    </div>
                )}
                </div>
                
                {/* Metadata Row: Time & Sources */}
                <div className="flex items-center gap-2 mt-1 px-1 flex-wrap">
                    {message.timestamp && (
                        <span className="text-[10px] text-gray-400 font-medium">
                            {message.timestamp}
                        </span>
                    )}
                    
                    {message.sources && message.sources.map((src, i) => (
                        <div key={i} className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full text-[10px] text-gray-500 border border-gray-200 hover:bg-gray-200 transition-colors cursor-pointer">
                            <ExternalLink size={8} />
                            {src.name}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* 7.4 Follow-Up Actions (Outside Bubble) */}
        {!isUser && !message.isStreaming && message.suggestedActions && message.suggestedActions.length > 0 && (
            <div className="ml-11 mt-2 flex flex-wrap gap-2 animate-in slide-in-from-top-1 duration-300">
                {message.suggestedActions.map((action, i) => (
                    <button 
                        key={i}
                        onClick={() => onActionClick?.(action)}
                        className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full hover:bg-indigo-100 hover:border-indigo-200 transition-all active:scale-95"
                    >
                        {action} <ArrowRight size={10} />
                    </button>
                ))}
            </div>
        )}
    </div>
  );
};

export default ChatMessage;