
import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Filter, ChevronDown } from 'lucide-react';
import { Comment, CommentReply } from '../../types';
import CommentItem from './CommentItem';
import { useUser } from '../../context/UserContext';

interface CommentSectionProps {
  articleId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ articleId }) => {
  const { user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');

  // Load comments from localStorage (simulating a backend)
  useEffect(() => {
    const savedComments = localStorage.getItem(`nc_comments_${articleId}`);
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    } else {
      // Initial mock comments if none exist
      const mockComments: Comment[] = [
        {
          id: '1',
          articleId,
          userId: 'user1',
          userName: 'Sarah Jenkins',
          userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
          content: 'This is such an insightful piece. The implications for the local economy are huge.',
          timestamp: Date.now() - 3600000 * 2,
          likes: 12,
          replies: [
            {
              id: 'r1',
              userId: 'user2',
              userName: 'Mike Ross',
              content: 'Agreed! Especially the part about small businesses.',
              timestamp: Date.now() - 3600000,
              likes: 4
            }
          ]
        },
        {
          id: '2',
          articleId,
          userId: 'user3',
          userName: 'David Chen',
          userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
          content: 'I wonder if there will be any regulatory pushback on this.',
          timestamp: Date.now() - 3600000 * 5,
          likes: 8,
          replies: []
        }
      ];
      setComments(mockComments);
      localStorage.setItem(`nc_comments_${articleId}`, JSON.stringify(mockComments));
    }
  }, [articleId]);

  const saveComments = (updatedComments: Comment[]) => {
    setComments(updatedComments);
    localStorage.setItem(`nc_comments_${articleId}`, JSON.stringify(updatedComments));
  };

  const handlePostComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      articleId,
      userId: user.username,
      userName: user.name,
      userAvatar: user.avatar,
      content: newComment,
      timestamp: Date.now(),
      likes: 0,
      replies: []
    };

    saveComments([comment, ...comments]);
    setNewComment('');
  };

  const handleLikeComment = (commentId: string) => {
    const updated = comments.map(c => 
      c.id === commentId ? { ...c, likes: c.likes + 1 } : c
    );
    saveComments(updated);
  };

  const handleReplyComment = (commentId: string, content: string) => {
    const reply: CommentReply = {
      id: Date.now().toString(),
      userId: user.username,
      userName: user.name,
      userAvatar: user.avatar,
      content,
      timestamp: Date.now(),
      likes: 0
    };

    const updated = comments.map(c => 
      c.id === commentId ? { ...c, replies: [...c.replies, reply] } : c
    );
    saveComments(updated);
  };

  const handleLikeReply = (commentId: string, replyId: string) => {
    const updated = comments.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: c.replies.map(r => 
            r.id === replyId ? { ...r, likes: r.likes + 1 } : r
          )
        };
      }
      return c;
    });
    saveComments(updated);
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'newest') return b.timestamp - a.timestamp;
    return b.likes - a.likes;
  });

  return (
    <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageCircle className="text-blue-600" size={24} />
          <h3 className="text-xl font-black text-gray-900 dark:text-white">
            Comments <span className="text-gray-400 font-medium ml-1">({comments.length})</span>
          </h3>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 px-3 py-1.5 rounded-full">
          <Filter size={14} className="text-gray-500" />
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-xs font-bold text-gray-700 dark:text-gray-300 outline-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Post Comment Input */}
      <div className="mb-8 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="flex gap-3">
          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
          <div className="flex-1">
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts on this story..."
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
            />
            <div className="mt-3 flex justify-end">
              <button 
                onClick={handlePostComment}
                disabled={!newComment.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
              >
                Post Comment <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-2">
        {sortedComments.length > 0 ? (
          sortedComments.map(comment => (
            <CommentItem 
              key={comment.id}
              comment={comment}
              onLike={handleLikeComment}
              onReply={handleReplyComment}
              onLikeReply={handleLikeReply}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 font-medium">No comments yet. Be the first to join the conversation!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
