
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type HistoryStatus = 'read' | 'partial' | 'glanced' | 'revisited';

export interface HistoryItem {
  id: string;
  type: 'article' | 'reel';
  title: string;
  category?: string;
  timestamp: number;
  progress: number;
  scrollPosition?: number;
  audioProgress?: number;
  meta?: any; 
  isUpdated?: boolean;
  visitCount: number;
  status: HistoryStatus;
}

interface Recommendation {
    type: 'deep-dive' | 'follow-up' | 'counter-point';
    label: string;
    topic: string;
}

interface HistoryContextType {
  history: HistoryItem[];
  isPaused: boolean;
  trackProgress: (id: string, type: 'article' | 'reel', title: string, progress: number, scrollPos?: number, meta?: any, audioProgress?: number, category?: string) => void;
  getHistoryItem: (id: string) => HistoryItem | undefined;
  getLastActive: () => HistoryItem | null;
  clearHistory: () => void;
  deleteHistoryItem: (id: string) => void;
  togglePause: () => void;
  getGroupedHistory: () => Record<string, HistoryItem[]>;
  checkReadStatus: (id: string) => { seen: boolean; progress: number; isUpdated: boolean; status: HistoryStatus; visitCount: number; hasExplained: boolean };
  getRecommendations: () => Recommendation | null;
  getTimeContext: () => { mode: 'audio' | 'text'; message: string; icon: string };
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('nc_reading_history');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [isPaused, setIsPaused] = useState<boolean>(() => {
      return localStorage.getItem('nc_history_paused') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('nc_reading_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
      localStorage.setItem('nc_history_paused', String(isPaused));
  }, [isPaused]);

  const togglePause = () => setIsPaused(prev => !prev);

  const trackProgress = useCallback((
    id: string, 
    type: 'article' | 'reel', 
    title: string, 
    progress: number, 
    scrollPosition?: number, 
    meta?: any,
    audioProgress?: number,
    category?: string
  ) => {
    if (isPaused) return;

    setHistory(prev => {
      const existing = prev.find(h => h.id === id);
      
      const visitCount = existing ? existing.visitCount + 1 : 1;
      let status: HistoryStatus = 'glanced';
      if (progress > 90) status = 'read';
      else if (progress > 10) status = 'partial';
      if (visitCount > 2) status = 'revisited';

      let isUpdated = existing?.isUpdated || false;
      
      // Merge meta (preserve 'hasExplained' etc)
      const mergedMeta = { ...(existing?.meta || {}), ...(meta || {}) };

      const filtered = prev.filter(h => h.id !== id);
      const newItem: HistoryItem = {
        id,
        type,
        title,
        category: category || existing?.category,
        timestamp: Date.now(),
        progress,
        scrollPosition: scrollPosition !== undefined ? scrollPosition : existing?.scrollPosition,
        audioProgress: audioProgress !== undefined ? audioProgress : existing?.audioProgress,
        meta: mergedMeta,
        isUpdated,
        visitCount,
        status
      };
      
      return [newItem, ...filtered].slice(0, 100);
    });
  }, [isPaused]);

  const getHistoryItem = useCallback((id: string) => {
    return history.find(h => h.id === id);
  }, [history]);

  const getLastActive = useCallback(() => {
    if (isPaused) return null;
    return history.find(h => h.progress > 5 && h.progress < 90) || null;
  }, [history, isPaused]);

  const getGroupedHistory = useCallback(() => {
      const groups: Record<string, HistoryItem[]> = {
          'Today': [],
          'Yesterday': [],
          'This Week': [],
          'Older': []
      };

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const yesterdayStart = todayStart - 86400000;
      const weekStart = todayStart - (86400000 * 6);

      history.forEach(item => {
          if (item.timestamp >= todayStart) groups['Today'].push(item);
          else if (item.timestamp >= yesterdayStart) groups['Yesterday'].push(item);
          else if (item.timestamp >= weekStart) groups['This Week'].push(item);
          else groups['Older'].push(item);
      });

      return groups;
  }, [history]);

  const checkReadStatus = useCallback((id: string) => {
      const item = history.find(h => h.id === id);
      if (!item) return { seen: false, progress: 0, isUpdated: false, status: 'glanced' as HistoryStatus, visitCount: 0, hasExplained: false };
      return { 
          seen: true, 
          progress: item.progress, 
          isUpdated: item.isUpdated || false,
          status: item.status,
          visitCount: item.visitCount,
          hasExplained: item.meta?.hasExplained || false
      };
  }, [history]);

  const getRecommendations = useCallback((): Recommendation | null => {
      if (history.length === 0 || isPaused) return null;
      const lastRead = history.find(h => h.category && h.progress > 20);
      if (!lastRead || !lastRead.category) return null;

      const seed = Date.now() % 3;
      if (seed === 0) return { type: 'deep-dive', label: 'Deep Dive', topic: lastRead.category };
      if (seed === 1) return { type: 'follow-up', label: 'Developing Story', topic: lastRead.category };
      return { type: 'counter-point', label: 'Another View', topic: lastRead.category };
  }, [history, isPaused]);

  const getTimeContext = useCallback(() => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 10) return { mode: 'audio' as const, message: "Start your day with a briefing", icon: 'sun' };
      else if (hour >= 10 && hour < 18) return { mode: 'text' as const, message: "Headlines for your break", icon: 'coffee' };
      else if (hour >= 18 && hour < 22) return { mode: 'text' as const, message: "Unwind with deep dives", icon: 'moon' };
      else return { mode: 'audio' as const, message: "Late night recap", icon: 'stars' };
  }, []);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('nc_reading_history');
  };

  const deleteHistoryItem = (id: string) => {
      setHistory(prev => prev.filter(h => h.id !== id));
  };

  return (
    <HistoryContext.Provider value={{ 
        history, 
        isPaused,
        trackProgress, 
        getHistoryItem, 
        getLastActive, 
        clearHistory,
        deleteHistoryItem,
        togglePause,
        getGroupedHistory,
        checkReadStatus,
        getRecommendations,
        getTimeContext
    }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
