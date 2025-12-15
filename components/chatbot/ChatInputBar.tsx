import React, { useState, useRef } from 'react';
import { Send, Image as ImageIcon, Mic, Paperclip } from 'lucide-react';
import Button from '../ui/Button';

interface ChatInputBarProps {
  onSend: (text: string) => void;
  onVoiceClick?: () => void;
  isLoading?: boolean;
}

const ChatInputBar: React.FC<ChatInputBarProps> = ({ onSend, onVoiceClick, isLoading }) => {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

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
    <div className="p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)] pb-safe">
      <div className="flex items-center gap-2">
        {/* Attachments */}
        <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors">
            <ImageIcon size={20} />
        </button>
        
        {/* Input Field */}
        <div className="flex-1 bg-gray-100 rounded-3xl px-4 py-2.5 flex items-center focus-within:ring-2 focus-within:ring-indigo-100 focus-within:bg-white transition-all">
            <input 
              ref={inputRef}
              type="text" 
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask AI about the news..." 
              className="bg-transparent w-full outline-none text-sm placeholder:text-gray-400 disabled:opacity-50"
              disabled={isLoading}
            />
        </div>

        {/* Voice Mode Trigger */}
        <button 
            onClick={onVoiceClick}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors active:scale-90"
            title="Voice Conversation"
        >
            <Mic size={20} />
        </button>

        {/* Send Button */}
        <Button 
            variant="primary" 
            size="icon-button"
            className={`rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 ${text.trim() ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-200 text-gray-400 hover:bg-gray-300'}`}
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