import React from 'react';
import { User, Bot, BarChart2, GitMerge, Image as ImageIcon, FileText, BookOpen } from 'lucide-react';
import HighlightReadingMode from '../HighlightReadingMode';

export interface MessageAttachment {
  type: 'image' | 'chart' | 'flowchart' | 'storyboard' | 'reading';
  title?: string;
  url?: string;
  content?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  attachments?: MessageAttachment[];
  timestamp?: string;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white ${isUser ? 'bg-gray-200 text-gray-600' : 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white'}`}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* Message Bubble */}
      <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div 
          className={`p-3.5 shadow-sm relative overflow-hidden ${
            isUser 
              ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none' 
              : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-none'
          }`}
        >
          {/* Text Content */}
          <p className="text-sm leading-relaxed whitespace-pre-wrap mb-2">{message.content}</p>

          {/* Attachments / Rich Content */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-3 w-full min-w-[240px]">
              {message.attachments.map((att, idx) => (
                <div key={idx} className={`rounded-xl overflow-hidden border ${isUser ? 'border-white/20 bg-white/10' : 'border-gray-100 bg-gray-50'}`}>
                  
                  {/* Reading Mode */}
                  {att.type === 'reading' && (
                     <div className="bg-white p-1">
                        <HighlightReadingMode text={att.content || "Content unavailable."} />
                     </div>
                  )}

                  {/* Image Attachment */}
                  {att.type === 'image' && (
                    <div className="relative aspect-video bg-gray-200">
                      {att.url ? (
                        <img src={att.url} alt="Attachment" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                          <ImageIcon size={24} className="mb-1" />
                          <span className="text-[10px] uppercase font-bold">Generated Image</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Chart Placeholder */}
                  {att.type === 'chart' && (
                    <div className="p-3 bg-white">
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
                    <div className="p-3 bg-white">
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

                  {/* Storyboard Layout */}
                  {att.type === 'storyboard' && (
                    <div className="p-3 bg-white">
                       <div className="flex items-center gap-2 mb-2 opacity-70">
                        <FileText size={14} />
                        <span className="text-xs font-bold uppercase">{att.title || 'Gemini Storyboard'}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="aspect-square bg-gray-100 rounded-lg animate-pulse flex items-center justify-center text-xs text-gray-400">Scene 1</div>
                        <div className="aspect-square bg-gray-100 rounded-lg animate-pulse flex items-center justify-center text-xs text-gray-400">Scene 2</div>
                        <div className="col-span-2 p-2 bg-gray-50 rounded-lg text-[10px] text-gray-500">
                            Sequence generated by Gemini...
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        {message.timestamp && (
          <span className="text-[10px] text-gray-400 mt-1 px-1">
            {message.timestamp}
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;