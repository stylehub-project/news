
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface TourStep {
  targetId: string;
  title: string;
  content: string;
  aiGuide: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface TourContextType {
  runTour: boolean;
  activeTourId: string | null;
  startTour: (tourId: string, customSteps?: TourStep[]) => void;
  endTour: () => void;
  currentStepIndex: number;
  setCurrentStepIndex: (index: number) => void;
  steps: TourStep[];
  hasSeenTour: (tourId: string) => boolean;
  resetAllTours: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

// Main App Tour
const MAIN_TOUR_STEPS: TourStep[] = [
  {
    targetId: 'nav-home',
    title: 'Your Feed',
    content: 'This is your personalized home feed with the latest updates.',
    aiGuide: 'Our AI analyzes over 10,000 sources per minute to curate a feed balanced between your interests and global importance.'
  },
  {
    targetId: 'nav-all-news',
    title: 'All News',
    content: 'Swipe through news stories in a modern, immersive format.',
    aiGuide: 'Uses generative AI to summarize complex articles into bite-sized, visual cards.'
  },
  {
    targetId: 'nav-map',
    title: 'Live Map',
    content: 'Explore news and weather events geographically.',
    aiGuide: 'Correlates news metadata with geospatial coordinates to visualize clusters of events.'
  },
  {
    targetId: 'nav-ai-chat',
    title: 'AI Assistant',
    content: 'Ask our AI anything about current events or generate audio briefs.',
    aiGuide: 'Powered by Gemini models with Google Search grounding.'
  },
  {
    targetId: 'floating-feedback-btn',
    title: 'Feedback',
    content: 'Help us improve News Club. Report bugs or suggest features.',
    aiGuide: 'Your feedback directly trains our models.'
  }
];

export const TourProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [runTour, setRunTour] = useState(false);
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<TourStep[]>(MAIN_TOUR_STEPS);
  const [completedTours, setCompletedTours] = useState<string[]>(() => {
      try {
          return JSON.parse(localStorage.getItem('nc_completed_tours') || '[]');
      } catch { return []; }
  });

  useEffect(() => {
      localStorage.setItem('nc_completed_tours', JSON.stringify(completedTours));
  }, [completedTours]);

  // Initial Welcome Tour Check
  useEffect(() => {
    // Small delay to ensure UI is mounted
    const timer = setTimeout(() => {
        if (!completedTours.includes('main_v3')) {
            // We don't auto-start here to avoid conflicts with Splash, 
            // relying on the Welcome Modal in AppTour to trigger startTour('main_v3')
        }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const startTour = (tourId: string, customSteps?: TourStep[]) => {
    // If it's a micro-tour and already seen, don't run it unless forced (e.g. from help menu)
    // For now, we assume calling startTour implies intent to run.
    setActiveTourId(tourId);
    if (customSteps) {
        setSteps(customSteps);
    } else if (tourId === 'main_v3') {
        setSteps(MAIN_TOUR_STEPS);
    }
    setCurrentStepIndex(0);
    setRunTour(true);
  };

  const endTour = () => {
    setRunTour(false);
    if (activeTourId) {
        setCompletedTours(prev => {
            if (!prev.includes(activeTourId)) return [...prev, activeTourId];
            return prev;
        });
    }
    setActiveTourId(null);
  };

  const hasSeenTour = (tourId: string) => completedTours.includes(tourId);

  const resetAllTours = () => {
      setCompletedTours([]);
      localStorage.removeItem('nc_completed_tours');
      // Optionally restart main tour immediately
      startTour('main_v3');
  };

  return (
    <TourContext.Provider value={{ 
      runTour, 
      activeTourId,
      startTour, 
      endTour,
      currentStepIndex, 
      setCurrentStepIndex,
      steps,
      hasSeenTour,
      resetAllTours
    }}>
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};
