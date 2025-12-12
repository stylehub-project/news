import React from 'react';
import { Send, Image as ImageIcon, BarChart2, Mic } from 'lucide-react';
import ComingSoonBanner from '../../components/ComingSoonBanner';

const ChatPage: React.FC = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-gray-50">
      
      {/* Chat Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Bot Message */}
        <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">AI</div>
             <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[80%]">
                <p className="text-sm text-gray-700">Hello! I'm your News Assistant. I can summarize today's headlines, create charts, or explain complex topics.</p>
             </div>
        </div>

        {/* User Message */}
        <div className="flex gap-3 flex-row-reverse">
             <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-bold">ME</div>
             <div className="bg-blue-600 p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[80%] text-white">
                <p className="text-sm">Give me an overview of the tech market today.</p>
             </div>
        </div>

        {/* Bot Gemini Storyboard Placeholder */}
        <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">AI</div>
             <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm max-w-[90%] w-full border border-indigo-100">
                <div className="mb-2 text-xs font-bold text-indigo-500 uppercase">Gemini Overview</div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="h-20 bg-indigo-50 rounded animate-pulse"></div>
                    <div className="h-20 bg-indigo-50 rounded animate-pulse"></div>
                </div>
                <div className="h-4 bg-gray-100 rounded w-full mb-1"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
             </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2 mb-3">
            <button className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100 hover:bg-indigo-100 flex items-center gap-1">
                <BarChart2 size={12} /> Generate Graph
            </button>
             <button className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100 hover:bg-indigo-100">
                Summary
            </button>
        </div>
        <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-indigo-600"><ImageIcon size={20} /></button>
            <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center">
                <input type="text" placeholder="Ask about the news..." className="bg-transparent w-full outline-none text-sm" />
            </div>
            <button className="p-2 text-gray-400 hover:text-indigo-600"><Mic size={20} /></button>
            <button className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"><Send size={18} /></button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;