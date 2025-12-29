
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ImportanceLevel = 'High' | 'Medium' | 'Low';

export interface BookmarkItem {
  id: string;
  title: string;
  description?: string;
  source: string;
  category?: string;
  imageUrl?: string;
  timeAgo?: string;
  savedAt: string;
  isRead: boolean;
  progress: number; // 0 to 100
  importance: ImportanceLevel;
}

interface BookmarkContextType {
  bookmarks: BookmarkItem[];
  addBookmark: (item: Omit<BookmarkItem, 'savedAt' | 'isRead' | 'progress' | 'importance'>) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (item: Omit<BookmarkItem, 'savedAt' | 'isRead' | 'progress' | 'importance'>) => void;
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  clearAll: () => void;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const BookmarkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    try {
      const saved = localStorage.getItem('news_club_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load bookmarks", e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('news_club_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const addBookmark = (item: Omit<BookmarkItem, 'savedAt' | 'isRead' | 'progress' | 'importance'>) => {
    setBookmarks(prev => {
      if (prev.some(b => b.id === item.id)) return prev;
      
      // Simulate AI Importance assignment based on category or random
      let imp: ImportanceLevel = 'Medium';
      if (['Politics', 'World', 'Finance'].includes(item.category || '')) imp = 'High';
      if (['Entertainment', 'Sports'].includes(item.category || '')) imp = 'Low';

      const newItem: BookmarkItem = {
        ...item,
        savedAt: new Date().toLocaleDateString(),
        isRead: false,
        progress: 0,
        importance: imp
      };
      return [newItem, ...prev];
    });
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
  };

  const removeBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
  };

  const isBookmarked = (id: string) => {
    return bookmarks.some(b => b.id === id);
  };

  const toggleBookmark = (item: Omit<BookmarkItem, 'savedAt' | 'isRead' | 'progress' | 'importance'>) => {
    if (isBookmarked(item.id)) {
      removeBookmark(item.id);
    } else {
      addBookmark(item);
    }
  };

  const markAsRead = (id: string) => {
      setBookmarks(prev => prev.map(b => b.id === id ? { ...b, isRead: true, progress: 100 } : b));
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([10, 10]); 
  };

  const markAsUnread = (id: string) => {
      setBookmarks(prev => prev.map(b => b.id === id ? { ...b, isRead: false, progress: 0 } : b));
  };

  const clearAll = () => {
      setBookmarks([]);
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
  };

  return (
    <BookmarkContext.Provider value={{ 
        bookmarks, 
        addBookmark, 
        removeBookmark, 
        isBookmarked, 
        toggleBookmark,
        markAsRead,
        markAsUnread,
        clearAll
    }}>
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmark = () => {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error('useBookmark must be used within a BookmarkProvider');
  }
  return context;
};
