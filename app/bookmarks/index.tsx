
import React, { useState, useMemo } from 'react';
import { Bookmark, Trash2, Filter, Search, Sparkles, Headphones, ShieldCheck, ListFilter } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import SwipeableBookmarkItem from '../../components/cards/SwipeableBookmarkItem';
import Button from '../../components/ui/Button';
import { useBookmark } from '../../context/BookmarkContext';
import { useNavigate } from 'react-router-dom';
import Toast from '../../components/ui/Toast';

const BookmarksPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookmarks, removeBookmark, markAsRead, clearAll } = useBookmark();
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Filter Logic
  const filteredBookmarks = useMemo(() => {
      let items = bookmarks;
      
      // Tab Filter
      if (activeTab === 'unread') items = items.filter(b => !b.isRead);
      if (activeTab === 'read') items = items.filter(b => b.isRead);

      // Search Filter
      if (searchQuery) {
          const q = searchQuery.toLowerCase();
          items = items.filter(b => 
              b.title.toLowerCase().includes(q) || 
              b.description?.toLowerCase().includes(q) || 
              b.source.toLowerCase().includes(q)
          );
      }

      return items;
  }, [bookmarks, activeTab, searchQuery]);

  const handleAIAnalysis = () => {
      if (bookmarks.length === 0) return;
      // Construct a context string of titles
      const context = bookmarks.slice(0, 5).map(b => b.title).join(". ");
      navigate(`/ai-chat?context=library&headline=${encodeURIComponent("Summarize my saved reading list: " + context)}`);
  };

  const handleAudioBrief = () => {
      navigate('/ai-chat?mode=generator');
  };

  const handleClearAll = () => {
      if (window.confirm("Clear all saved stories? This cannot be undone.")) {
          clearAll();
          setToastMsg("Library cleared");
          setShowToast(true);
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pb-24 transition-colors">
      <PageHeader 
        title="Saved for Later" 
        action={
            bookmarks.length > 0 && (
                <button onClick={handleClearAll} className="text-xs font-bold text-red-500 hover:text-red-600 px-2 py-1">
                    Clear All
                </button>
            )
        }
      />

      {showToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
              <Toast type="success" message={toastMsg} onClose={() => setShowToast(false)} />
          </div>
      )}

      {/* AI Actions */}
      <div className="p-4 pb-2 grid grid-cols-2 gap-3">
          <button 
            onClick={handleAIAnalysis}
            disabled={bookmarks.length === 0}
            className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl text-white shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
          >
              <Sparkles size={16} className="text-yellow-300" />
              <span className="text-xs font-bold">Summarize All</span>
          </button>
          <button 
            onClick={handleAudioBrief}
            className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-200 shadow-sm active:scale-95 transition-all"
          >
              <Headphones size={16} className="text-pink-500" />
              <span className="text-xs font-bold">Audio Brief</span>
          </button>
      </div>

      {/* Controls & Search */}
      <div className="sticky top-[57px] z-30 bg-gray-50/95 dark:bg-black/95 backdrop-blur-md px-4 py-2 space-y-3 transition-colors">
          {/* Search */}
          <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                  type="text" 
                  placeholder="Search saved stories..." 
                  className="w-full bg-white dark:bg-gray-800 pl-9 pr-4 py-2.5 rounded-xl border-none outline-none text-sm font-medium shadow-sm dark:text-white placeholder:text-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-lg">
              {['all', 'unread', 'read'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 py-1.5 text-xs font-bold capitalize rounded-md transition-all ${
                        activeTab === tab 
                        ? 'bg-white dark:bg-gray-600 text-black dark:text-white shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                      {tab} ({
                          tab === 'all' ? bookmarks.length : 
                          tab === 'unread' ? bookmarks.filter(b => !b.isRead).length : 
                          bookmarks.filter(b => b.isRead).length
                      })
                  </button>
              ))}
          </div>
      </div>

      {/* Content List */}
      <div className="p-4 space-y-3 min-h-[300px]">
        {filteredBookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 opacity-60">
                <Bookmark size={48} className="mb-4 stroke-1" />
                <p className="text-sm font-medium">No stories found.</p>
                {activeTab !== 'all' && (
                    <button onClick={() => setActiveTab('all')} className="mt-2 text-blue-500 text-xs font-bold">View All Saved</button>
                )}
            </div>
        ) : (
            filteredBookmarks.map(item => (
                <SwipeableBookmarkItem 
                    key={item.id}
                    data={item}
                    onRead={() => markAsRead(item.id)}
                    onDelete={() => removeBookmark(item.id)}
                    onClick={() => navigate(`/news/${item.id}`)}
                />
            ))
        )}
      </div>

      {/* Privacy Footer */}
      <div className="text-center pb-8 pt-4 opacity-40">
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 font-medium">
              <ShieldCheck size={12} />
              <span>Stored securely on this device</span>
          </div>
      </div>
    </div>
  );
};

export default BookmarksPage;
