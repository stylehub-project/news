
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useNetwork } from './NetworkContext';

export type NotificationType = 'breaking' | 'digest' | 'personalized' | 'ai' | 'saved' | 'system' | 'offline' | 'market' | 'sports' | 'weather';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
  isLowData?: boolean; // 14.9 Low Data Mode
  data?: {
      aiInsight?: string; // "Why this matters..."
      context?: string; // "Why you're seeing this..."
      digestItems?: string[]; // For Morning/Evening Briefs
      relatedIds?: string[];
  }; 
  actionLink?: string;
}

export interface NotificationPreferences {
  breaking: boolean;
  digest: boolean;
  personalized: boolean;
  ai: boolean;
  saved: boolean;
  system: boolean;
  offline: boolean;
  contextual: boolean; // Market, Sports, Weather
  // 14.5 Smart Timing
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:MM format (24h)
  quietHoursEnd: string;
  frequency: 'low' | 'medium' | 'high';
  pausedUntil: number; // 14.11 Pause Notifications
}

interface NotificationContextType {
  notifications: AppNotification[];
  preferences: NotificationPreferences;
  unreadCount: number;
  latestNotification: AppNotification | null;
  updatePreference: (key: keyof NotificationPreferences, value: any) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  dismissBanner: () => void;
  triggerTestNotification: (type?: NotificationType) => void;
  pauseNotifications: (minutes: number) => void;
  resumeNotifications: () => void;
  provideFeedback: (id: string, type: 'less' | 'more') => void;
  resetPersonalization: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const DEFAULT_PREFERENCES: NotificationPreferences = {
  breaking: true,
  digest: true,
  personalized: true,
  ai: true,
  saved: true,
  system: true,
  offline: true,
  contextual: true,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  frequency: 'medium',
  pausedUntil: 0
};

const MOCK_BREAKING_NEWS = [
    { title: "Global Market Rally", body: "Tech stocks surge 5% following AI summit agreement." },
    { title: "Climate Pact Signed", body: "150 nations agree to accelerated carbon neutral targets." },
    { title: "SpaceX Launch Success", body: "Starship reaches orbit, marking a new era in space travel." },
];

const AI_INSIGHT_TEMPLATES = [
    { 
        title: "RBI Monetary Policy Update", 
        body: "Central bank keeps repo rates unchanged at 6.5%.",
        aiInsight: "Why this matters: This directly impacts your home loan EMIs and fixed deposit returns. Stability suggests inflation is under control." 
    },
    { 
        title: "New EV Policy Announced", 
        body: "Subsidies extended for 2-wheeler electric vehicles.",
        aiInsight: "Why this matters: If you're planning to buy a scooter this year, prices might drop by up to 15%. Also boosts green energy stocks." 
    }
];

const DIGEST_TEMPLATES = [
    {
        title: "☕ Morning Briefing",
        body: "Here's what you need to know to start your day.",
        digestItems: [
            "Markets open higher on tech optimism",
            "New climate bill passes Senate",
            "Local sports team secures playoff spot"
        ]
    },
    {
        title: "🌙 Evening Wrap",
        body: "Catch up on today's top stories.",
        digestItems: [
            "Apple announces new VR headset",
            "Global oil prices stabilize",
            "Viral interview sparks debate"
        ]
    }
];

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isOnline, isLowData } = useNetwork();
  
  // State
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
      try {
          const saved = localStorage.getItem('nc_notifications');
          return saved ? JSON.parse(saved) : [];
      } catch { return []; }
  });

  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
      try {
          const saved = localStorage.getItem('nc_notification_prefs');
          return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
      } catch { return DEFAULT_PREFERENCES; }
  });

  const [latestNotification, setLatestNotification] = useState<AppNotification | null>(null);
  const wasOfflineRef = useRef(false);

  // Persistence
  useEffect(() => {
      localStorage.setItem('nc_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
      localStorage.setItem('nc_notification_prefs', JSON.stringify(preferences));
  }, [preferences]);

  // Offline Recovery Logic
  useEffect(() => {
      if (!isOnline) {
          wasOfflineRef.current = true;
      } else if (isOnline && wasOfflineRef.current) {
          wasOfflineRef.current = false;
          if (preferences.offline) {
              addNotification({
                  type: 'offline',
                  title: "While You Were Offline",
                  body: "3 major headlines and 5 personalized stories have been cached.",
                  actionLink: '/latest'
              });
          }
      }
  }, [isOnline, preferences.offline]);

  // Check Quiet Hours & Pause
  const isSilenced = () => {
      // 1. Check Pause
      if (preferences.pausedUntil > Date.now()) return true;

      // 2. Check Quiet Hours
      if (!preferences.quietHoursEnabled) return false;
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      const [startH, startM] = preferences.quietHoursStart.split(':').map(Number);
      const [endH, endM] = preferences.quietHoursEnd.split(':').map(Number);
      
      const startTotal = startH * 60 + startM;
      const endTotal = endH * 60 + endM;

      if (startTotal < endTotal) {
          return currentMinutes >= startTotal && currentMinutes < endTotal;
      } else {
          // Crosses midnight (e.g. 22:00 to 07:00)
          return currentMinutes >= startTotal || currentMinutes < endTotal;
      }
  };

  // Simulation Loop
  useEffect(() => {
      const intervalTime = preferences.frequency === 'high' ? 15000 : preferences.frequency === 'medium' ? 45000 : 90000;
      
      const interval = setInterval(() => {
          if (!isOnline) return;
          if (isSilenced()) return; // Skip simulation if silenced

          const rand = Math.random();
          
          // 1. Personalized Alert (Prompt 14.3)
          if (preferences.personalized && rand < 0.1) {
              addNotification({
                  type: 'personalized',
                  title: "Recommended for You",
                  body: "3 stories related to Technology in India you may like.",
                  data: { context: "Because you follow Tech and India" },
                  actionLink: '/categories/technology'
              });
          }
          // 2. AI Insight Alert (Prompt 14.4)
          else if (preferences.ai && rand > 0.1 && rand < 0.2) {
              const insight = AI_INSIGHT_TEMPLATES[Math.floor(Math.random() * AI_INSIGHT_TEMPLATES.length)];
              addNotification({
                  type: 'ai',
                  title: insight.title,
                  body: insight.body,
                  data: { aiInsight: insight.aiInsight },
                  actionLink: '/news/1'
              });
          }
          // 3. Breaking News
          else if (preferences.breaking && rand > 0.9) {
              const news = MOCK_BREAKING_NEWS[Math.floor(Math.random() * MOCK_BREAKING_NEWS.length)];
              const isRecent = notifications.slice(0, 5).some(n => n.title === news.title);
              if (!isRecent) {
                  addNotification({
                      type: 'breaking',
                      title: news.title,
                      body: news.body,
                      actionLink: '/top-stories'
                  });
              }
          }
          // 4. Contextual Alerts (14.8) - Market/Sports
          else if (preferences.contextual && rand > 0.4 && rand < 0.45) {
              const isMarket = Math.random() > 0.5;
              if (isMarket) {
                  addNotification({
                      type: 'market',
                      title: "Market Moving Alert",
                      body: "Sensex drops 500 points in early trade. Banking sector leads the decline.",
                      actionLink: '/categories/business'
                  });
              } else {
                  addNotification({
                      type: 'sports',
                      title: "Match Starting Soon",
                      body: "India vs Australia begins in 30 minutes at Wankhede Stadium.",
                      actionLink: '/categories/sports'
                  });
              }
          }

      }, intervalTime);
      
      return () => clearInterval(interval);
  }, [isOnline, preferences, notifications, isLowData]); // added isLowData dependency

  // Add Notification Logic with Quiet Hours & Low Data
  const addNotification = (input: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
      const newNote: AppNotification = {
          ...input,
          id: Date.now().toString(),
          timestamp: Date.now(),
          read: false,
          isLowData: isLowData // 14.9 Low Data Flag
      };
      
      setNotifications(prev => [newNote, ...prev]);

      const silenced = isSilenced();
      const isUrgent = input.type === 'breaking';

      // 14.5: Delay non-urgent notifications during quiet hours (Silent delivery)
      if (!silenced || isUrgent) {
          setLatestNotification(newNote); // Show Banner
          
          // Vibration
          if (isUrgent && typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate([100, 50, 100]);
          } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate(20);
          }
      } else {
          console.log(`Silent notification delivered: ${input.title} (Silenced)`);
      }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: any) => {
      setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const markAsRead = (id: string) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
      setNotifications([]);
  };

  const dismissBanner = () => {
      setLatestNotification(null);
  };

  // 14.11 Pause Feature
  const pauseNotifications = (minutes: number) => {
      const until = Date.now() + (minutes * 60 * 1000);
      updatePreference('pausedUntil', until);
  };

  const resumeNotifications = () => {
      updatePreference('pausedUntil', 0);
  };

  // 14.11 Reset Personalization
  const resetPersonalization = () => {
      setNotifications([]);
      setPreferences(DEFAULT_PREFERENCES);
      // In a real app, this would also clear backend user profile tags
  };

  // 14.12 Feedback
  const provideFeedback = (id: string, type: 'less' | 'more') => {
      console.log(`Feedback received for notification ${id}: ${type}`);
      // Simulate filtering
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (latestNotification?.id === id) dismissBanner();
  };

  const triggerTestNotification = (type: NotificationType = 'breaking') => {
      const templates = {
          breaking: { title: "Breaking: Market Update", body: "Dow Jones hits record high amidst tech rally." },
          ai: { 
              title: "RBI Policy Decision", 
              body: "Repo rates remain unchanged at 6.5%.", 
              data: { aiInsight: "Why this matters: Your home loan EMI will likely remain stable for the next quarter." }
          },
          saved: { title: "Saved Story Update", body: "New developments in the article you saved yesterday." },
          digest: { ...DIGEST_TEMPLATES[0] }, // Morning Brief
          personalized: { 
              title: "Technology in India", 
              body: "3 new stories you might like based on your history.",
              data: { context: "Because you follow Tech" }
          },
          system: { title: "App Update", body: "News Club v2.1 is now available." },
          offline: { title: "You're Back Online", body: "Syncing latest headlines..." },
          market: { title: "Market Alert", body: "Nifty 50 crosses 22,000 mark for the first time." },
          sports: { title: "Wicket!", body: "Kohli departs for 85. India 240/3." }
      };
      
      // @ts-ignore
      const t = templates[type] || templates.breaking;
      addNotification({ ...t, type, actionLink: '/news/1' });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      preferences,
      unreadCount,
      latestNotification,
      updatePreference,
      markAsRead,
      markAllAsRead,
      clearAll,
      dismissBanner,
      triggerTestNotification,
      pauseNotifications,
      resumeNotifications,
      provideFeedback,
      resetPersonalization
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
