import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Loader2 } from 'lucide-react';
import Button from '../ui/Button';

interface ChatInputBarProps {
  onSend: (text: string) => void;
  onVoiceClick?: () => void;
  isLoading?: boolean;
}

const ChatInputBar: React.FC<ChatInputBarProps> = ({ onSend, onVoiceClick, isLoading }) => {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
      if (!isLoading && inputRef.current) {
          inputRef.current.focus();
      }
  }, [isLoading]);

  // --- Voice Input Implementation ---
  useEffect(() => {
    // Browser Shim for Web Speech API
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Stop after one sentence for quick queries
      recognition.interimResults = true; // Show results as they speak
      recognition.lang = 'en-US';

      recognition.onstart = () => {
          setIsListening(true);
      };

      recognition.onend = () => {
          setIsListening(false);
      };

      recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
          alert("Voice input error: " + event.error);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
             setText(prev => {
                 const spacer = prev && !prev.endsWith(' ') ? ' ' : '';
                 return prev + spacer + finalTranscript;
             });
        }
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
        alert("Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.");
        return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
          recognitionRef.current.start();
      } catch(e) {
          console.error("Mic start error", e);
      }
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (text.trim() && !isLoading) {
      setIsSending(true);
      onSend(text);
      setText('');
      // Reset sending state after animation
      setTimeout(() => setIsSending(false), 500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full p-3 bg-gray-50 dark:bg-[#0f172a] border-t border-gray-200 dark:border-white/10 transition-colors duration-300">
      <div className="flex items-center gap-2 max-w-4xl mx-auto">
        
        {/* Input Field Container */}
        <div className={`flex-1 bg-white dark:bg-gray-800/80 border rounded-3xl px-4 py-3 flex items-center transition-all shadow-sm ${isListening ? 'border-red-500 ring-2 ring-red-500/20' : 'border-gray-300 dark:border-gray-700 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50'}`}>
            <input 
              ref={inputRef}
              type="text" 
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening... Speak now" : "Ask a question..."}
              className="bg-transparent w-full outline-none text-sm placeholder:text-gray-400 disabled:opacity-50 text-gray-900 dark:text-white font-medium min-w-0"
              disabled={isLoading}
              autoComplete="off"
            />
            {isListening && (
                <div className="flex gap-1 ml-2 items-center">
                    <span className="text-xs font-bold text-red-500 animate-pulse uppercase tracking-wider hidden sm:block mr-1">Rec</span>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-200"></div>
                </div>
            )}
        </div>

        {/* Voice Dictation Trigger */}
        <button 
            onClick={toggleVoice}
            className={`p-3 rounded-full transition-all active:scale-90 shrink-0 border ${isListening ? 'bg-red-500 border-red-600 text-white shadow-lg shadow-red-500/30 animate-pulse' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
            title="Voice Dictation"
        >
            {isListening ? <MicOff size={22} /> : <Mic size={22} />}
        </button>

        {/* Send Button */}
        <Button 
            variant="primary" 
            size="md"
            className={`rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300 shadow-lg shrink-0 overflow-hidden relative ${text.trim() ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-slate-500 shadow-none'}`}
            onClick={() => handleSubmit()}
            disabled={!text.trim() || isLoading}
            isLoading={isLoading}
        >
            <div className={`transition-all duration-500 absolute inset-0 flex items-center justify-center ${isSending ? 'translate-x-10 -translate-y-10 opacity-0 rotate-45' : 'translate-x-0 translate-y-0 opacity-100 rotate-0'}`}>
                <Send size={24} className={text.trim() ? 'ml-0.5' : ''} />
            </div>
            
            {/* Reset Icon Hidden State */}
            {isSending && (
                <div className="absolute inset-0 flex items-center justify-center animate-in fade-in duration-300">
                    <Send size={24} className="ml-0.5 opacity-0" />
                </div>
            )}
        </Button>
      </div>
    </div>
  );
};

export default ChatInputBar;