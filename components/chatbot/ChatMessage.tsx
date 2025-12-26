
import React, { useState, useEffect, useRef } from 'react';
import { User, ExternalLink, ArrowRight, Flag, Info, CheckCircle2, Wand2, Volume2, StopCircle, Copy, Share2, Check } from 'lucide-react';
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
  
  // Action States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Ref to track if speech was manually stopped
  const speechStoppedRef = useRef(false);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);

  const handleReport = () => {
      setIsReported(true);
      onReport?.(message.id);
  };

  const handleAvatarClick = () => {
      setAiState('speaking');
      setTimeout(() => setAiState('idle'), 1500);
  };

  // --- Reporting & Explaining Voice Engine ---

  const getReporterVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      // Priority: Professional News Broadcasting Voices
      return voices.find(v => v.name === "Google US English") || 
             voices.find(v => v.name === "Microsoft Zira - English (United States)") ||
             voices.find(v => v.name.includes("Samantha")) ||
             voices.find(v => v.lang === 'en-US') || 
             voices[0];
  };

  const handleReadAloud = (e: React.MouseEvent) => {
      e.stopPropagation();
      
      // Toggle Off
      if (isSpeaking) {
          speechStoppedRef.current = true;
          window.speechSynthesis.cancel();
          setIsSpeaking(false);
          setAiState('idle');
          return;
      }

      speechStoppedRef.current = false;
      setIsSpeaking(true);
      setAiState('speaking');

      // --- Parsing Content for Tone ---
      // We break the text into segments to apply different tones.
      // Headline: Authoritative, slightly slower.
      // Body: Explanatory, clear, measured pace.
      // Bold: Emphatic.
      
      const segments: { text: string; tone: 'normal' | 'bold' | 'heading' }[] = [];
      const lines = message.content.split('\n');

      lines.forEach(line => {
          const trimmed = line.trim();
          if (!trimmed) return;

          // 1. Headings (Markdown #)
          if (/^#+\s/.test(trimmed)) {
              const clean = trimmed.replace(/^#+\s/, '') + '.'; // Add pause
              segments.push({ text: clean, tone: 'heading' });
          } 
          // 2. Normal Lines (Check for Bold inside)
          else {
              // Remove list markers for cleaner reading
              const cleanLine = trimmed.replace(/^(\*|-|\d+\.)\s/, '');
              
              // Split by Bold markdown (**text**)
              const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
              
              parts.forEach(part => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                      // Bold Text found
                      const text = part.replace(/\*\*/g, '');
                      if (text.trim()) segments.push({ text: text, tone: 'bold' });
                  } else if (part.trim()) {
                      // Normal Text
                      segments.push({ text: part, tone: 'normal' });
                  }
              });
          }
      });

      // --- Sequential Speaking Queue ---
      let currentIndex = 0;
      const reporterVoice = getReporterVoice();

      const speakNext = () => {
          if (speechStoppedRef.current || currentIndex >= segments.length) {
              setIsSpeaking(false);
              setAiState('idle');
              return;
          }

          const segment = segments[currentIndex];
          const u = new SpeechSynthesisUtterance(segment.text);
          u.voice = reporterVoice;

          // Apply Tonal Emotions for "Reporting & Explaining"
          switch (segment.tone) {
              case 'heading':
                  u.pitch = 0.95; // Slightly lower, authoritative
                  u.rate = 0.9;   // Slower, deliberate headline reading
                  break;
              case 'bold':
                  u.pitch = 1.05; // Slightly higher for emphasis
                  u.rate = 0.9;   // Slow down for key terms
                  break;
              case 'normal':
              default:
                  u.pitch = 1.0;  // Neutral
                  u.rate = 0.95;  // Measured pace (Explaining style)
                  break;
          }
          u.volume = 1.0;

          u.onend = () => {
              currentIndex++;
              speakNext();
          };

          u.onerror = (err) => {
              console.error("Speech Error", err);
              setIsSpeaking(false);
              setAiState('idle');
          };

          window.speechSynthesis.speak(u);
      };

      // Start Queue
      window.speechSynthesis.cancel(); // Clear anything pending
      speakNext();
  };

  const handleCopy = (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (navigator.share) {
          try {
              await navigator.share({
                  title: 'AI Insight from News Club',
                  text: message.content,
              });
          } catch (err) {
              handleCopy(e);
          }
      } else {
          handleCopy(e);
      }
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
            <div className={`mb-1 ${isUser ? 'float-right ml-3' : 'float-left mr-3'}`}>
                {isUser ? (
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg text-xs font-bold border border-white/20">
                        ME
                    </div>
                ) : (
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500 blur-md opacity-30 rounded-full"></div>
                        <InteractiveAvatar 
                            state={message.isStreaming || isSpeaking ? 'speaking' : aiState} 
                            size={40} 
                            onClick={handleAvatarClick}
                        />
                    </div>
                )}
            </div>

            {/* Text Content */}
            <div className={`text-sm leading-relaxed tracking-wide ${
                isUser 
                ? 'text-indigo-900 dark:text-indigo-100 font-medium text-right' 
                : 'text-gray-800 dark:text-slate-200 text-left'
            }`}>
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

            {/* Footer Actions, Sources & Metadata (Only for AI) */}
            {!isUser && !message.isStreaming && (
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 flex flex-col gap-2 transition-opacity">
                    
                    {/* Source Links */}
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
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={handleReadAloud} 
                                className={`p-1.5 rounded-full transition-colors flex items-center gap-1 ${isSpeaking ? 'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400 shadow-sm' : 'text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:text-slate-500 dark:hover:text-indigo-300 dark:hover:bg-white/10'}`} 
                                title={isSpeaking ? "Stop Report" : "Listen to Report"}
                            >
                                {isSpeaking ? <StopCircle size={14} className="animate-pulse" /> : <Volume2 size={14} />}
                                {isSpeaking && <span className="text-[10px] font-bold">Stop</span>}
                            </button>

                            <button 
                                onClick={handleCopy} 
                                className={`p-1.5 rounded-full transition-colors ${isCopied ? 'text-green-500 bg-green-50 dark:bg-green-900/30' : 'text-gray-400 hover:text-green-500 hover:bg-green-50 dark:text-slate-500 dark:hover:text-green-300 dark:hover:bg-white/10'}`} 
                                title="Copy Text"
                            >
                                {isCopied ? <Check size={14} /> : <Copy size={14} />}
                            </button>

                            <button 
                                onClick={handleShare} 
                                className="p-1.5 rounded-full transition-colors text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:text-slate-500 dark:hover:text-blue-300 dark:hover:bg-white/10" 
                                title="Share"
                            >
                                <Share2 size={14} />
                            </button>

                            {/* Separator */}
                            <div className="w-px h-3 bg-gray-200 dark:bg-gray-700 mx-1"></div>

                            {/* Report Flag */}
                            {isReported ? (
                                <span className="text-[10px] text-green-500 flex items-center gap-1"><CheckCircle2 size={10}/></span>
                            ) : (
                                <button 
                                    onClick={handleReport}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-300 dark:text-slate-600 hover:text-gray-600 dark:hover:text-slate-300 rounded transition-colors" 
                                    title="Report Issue"
                                >
                                    <Flag size={10} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
        
        {/* Suggested Actions Chips */}
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
