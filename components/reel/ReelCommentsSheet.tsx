import React, { useState } from 'react';
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
  comments: initialComments = [
    { id: '1', user: 'AlexM', text: 'This is huge news for the industry!', time: '2m', likes: 12 },
    { id: '2', user: 'Sarah_J', text: 'Waiting for the full report.', time: '5m', likes: 4 },
    { id: '3', user: 'TechGuru', text: 'AI is moving too fast 🤯', time: '10m', likes: 45 },
  ]
}) => {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');

  const handlePost = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      user: 'You', // Guest or Logged in user
      text: newComment,
      time: 'Just now',
      likes: 0
    };
    
    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handlePost();
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title={`Comments (${comments.length})`}>
      <div className="flex flex-col h-full max-h-[60vh]">
        {/* Comments List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 animate-in slide-in-from-bottom-2 fade-in duration-300">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                {comment.user === 'You' ? (
                    <div className="bg-blue-600 w-full h-full flex items-center justify-center text-white text-xs font-bold">ME</div>
                ) : (
                    <User size={14} className="text-gray-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold text-gray-900">{comment.user}</span>
                  <span className="text-[10px] text-gray-400">{comment.time}</span>
                </div>
                <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">{comment.text}</p>
                <div className="flex gap-4 mt-1">
                    <button className="text-[10px] text-gray-500 font-medium hover:text-gray-800">Reply</button>
                    <button className="text-[10px] text-gray-500 font-medium hover:text-gray-800">Translated</button>
                </div>
              </div>
              <div className="flex flex-col items-center gap-0.5 pt-1">
                <button className="text-gray-400 hover:text-red-500 transition-colors">
                    <span className="text-xs">♡</span>
                </button>
                <span className="text-[10px] text-gray-400">{comment.likes}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center gap-2 bg-white sticky bottom-0">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 text-xs font-bold">
            ME
          </div>
          <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all border border-transparent focus-within:border-blue-200">
            <input 
              type="text" 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a comment..." 
              className="bg-transparent w-full outline-none text-sm placeholder:text-gray-500"
            />
          </div>
          <button 
            onClick={handlePost}
            disabled={!newComment.trim()}
            className={`p-2 rounded-full transition-colors ${newComment.trim() ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-300'}`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </Sheet>
  );
};

export default ReelCommentsSheet;