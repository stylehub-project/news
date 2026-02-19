
import React, { useState } from 'react';
import { ThumbsUp, MessageSquare, MoreVertical, CornerDownRight } from 'lucide-react';
import { Comment, CommentReply } from '../../types';

interface CommentItemProps {
  comment: Comment;
  onLike: (commentId: string) => void;
  onReply: (commentId: string, content: string) => void;
  onLikeReply: (commentId: string, replyId: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onLike, onReply, onLikeReply }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleReplySubmit = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent);
      setReplyContent('');
      setShowReplyInput(false);
      setIsExpanded(true);
    }
  };

  return (
    <div className="py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="flex gap-3">
        <img 
          src={comment.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userName)}&background=random`} 
          alt={comment.userName} 
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">{comment.userName}</h4>
            <span className="text-[10px] text-gray-500 font-medium">
              {new Date(comment.timestamp).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
            {comment.content}
          </p>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onLike(comment.id)}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors"
            >
              <ThumbsUp size={14} />
              {comment.likes > 0 && <span>{comment.likes}</span>}
              <span>Like</span>
            </button>
            <button 
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors"
            >
              <MessageSquare size={14} />
              <span>Reply</span>
            </button>
            {comment.replies.length > 0 && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs font-bold text-blue-600"
              >
                {isExpanded ? 'Hide Replies' : `View ${comment.replies.length} Replies`}
              </button>
            )}
          </div>

          {showReplyInput && (
            <div className="mt-3 flex gap-2">
              <input 
                type="text" 
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button 
                onClick={handleReplySubmit}
                disabled={!replyContent.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50"
              >
                Post
              </button>
            </div>
          )}

          {isExpanded && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-100 dark:border-gray-800">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="flex gap-3">
                  <img 
                    src={reply.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.userName)}&background=random`} 
                    alt={reply.userName} 
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="text-xs font-bold text-gray-900 dark:text-white">{reply.userName}</h5>
                      <span className="text-[9px] text-gray-500 font-medium">
                        {new Date(reply.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                      {reply.content}
                    </p>
                    <button 
                      onClick={() => onLikeReply(comment.id, reply.id)}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <ThumbsUp size={12} />
                      {reply.likes > 0 && <span>{reply.likes}</span>}
                      <span>Like</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
