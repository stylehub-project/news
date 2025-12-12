import React from 'react';
import Sheet from '../ui/Sheet';
import { Send, User } from 'lucide-react';

interface Comment {
  id: string;
  user: string;
  text: string;
  time: string;
  likes: number;
}

interface ReelCommentsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  comments?: Comment[];
}

const ReelCommentsSheet: React.FC<ReelCommentsSheetProps> = ({
  isOpen,
  onClose,
  comments = [
    { id: '1', user: 'AlexM', text: 'This is huge news for the industry!', time: '2m', likes: 12 },
    { id: '2', user: 'Sarah_J', text: 'Waiting for the full report.', time: '5m', likes: 4 },
    { id: '3', user: 'TechGuru', text: 'AI is moving too fast 🤯', time: '10m', likes: 45 },
  ]
}) => {
  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Comments (342)">
      <div className="flex flex-col h-full max-h-[60vh]">
        {/* Comments List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                <User size={14} className="text-gray-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold text-gray-900">{comment.user}</span>
                  <span className="text-[10px] text-gray-400">{comment.time}</span>
                </div>
                <p className="text-sm text-gray-700 mt-0.5">{comment.text}</p>
                <button className="text-[10px] text-gray-500 font-medium mt-1 hover:text-gray-800">
                  Reply
                </button>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <button className="text-gray-400 hover:text-red-500 text-xs">♡</button>
                <span className="text-[10px] text-gray-400">{comment.likes}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 text-xs font-bold">
            ME
          </div>
          <div className="flex-1 bg-gray-100 rounded-full px-4 py-2">
            <input 
              type="text" 
              placeholder="Add a comment..." 
              className="bg-transparent w-full outline-none text-sm placeholder:text-gray-500"
            />
          </div>
          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full">
            <Send size={18} />
          </button>
        </div>
      </div>
    </Sheet>
  );
};

export default ReelCommentsSheet;