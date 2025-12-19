import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Mic } from 'lucide-react';
import Button from '../ui/Button';

interface ChatInputBarProps {
  onSend: (text: string) => void;
  onVoiceClick?: () => void;
  isLoading?: boolean;
}

const ChatInputBar: React.FC<ChatInputBarProps> = ({ onSend, onVoiceClick, isLoading }) => {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      if (!isLoading && inputRef.current) {
          inputRef.current.focus();
      }
  }, [isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (text.trim() && !isLoading) {
      onSend(text);
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full p-3 bg-[#0f172a] border-t border-white/10 pb-safe transition-colors duration-300">
      <div className="flex items-center gap-2 max-w-4xl mx-auto">
        {/* Attachments */}
        <button className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors shrink-0">
            <ImageIcon size={20} />
        </button>
        
        {/* Input Field Container */}
        <div className="flex-1 bg-gray-800/80 border border-gray-700 rounded-3xl px-4 py-3 flex items-center focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50 transition-all hover:bg-gray-800">
            <input 
              ref={inputRef}
              type="text" 
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question or type 'draw a cat'..." 
              className="bg-transparent w-full outline-none text-sm placeholder:text-gray-400 disabled:opacity-50 text-white font-medium min-w-0"
              disabled={isLoading}
              autoComplete="off"
            />
        </div>

        {/* Voice Mode Trigger */}
        <button 
            onClick={onVoiceClick}
            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-full transition-colors active:scale-90 shrink-0"
            title="Voice Conversation"
        >
            <Mic size={20} />
        </button>

        {/* Send Button */}
        <Button 
            variant="primary" 
            size="md"
            className={`rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 shadow-lg shrink-0 ${text.trim() ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-white/10 text-slate-500'}`}
            onClick={() => handleSubmit()}
            disabled={!text.trim() || isLoading}
            isLoading={isLoading}
        >
            <Send size={18} className={text.trim() ? 'ml-0.5' : ''} />
        </Button>
      </div>
    </div>
  );
};

export default ChatInputBar;