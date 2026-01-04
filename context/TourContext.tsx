
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface TourStep {
  targetId: string;
  title: string;
  content: string;
  aiExplanation: string; // Detailed AI explanation
}

interface TourContextType {
  runTour: boolean;
  setRunTour: (run: boolean) => void;
  showWelcome: boolean;
  setShowWelcome: (show: boolean) => void;
  currentStepIndex: number;
  setCurrentStepIndex: (index: number) => void;
  steps: TourStep[];
  startTour: () => void;
  endTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'nav-home',
    title: 'Your Feed',
    content: 'This is your personalized home feed with the latest updates.',
    aiExplanation: 'The Home Feed uses an algorithm to curate stories based on your reading history (stored locally) and global trends. It balances breaking news with your personal interests.'
  },
  {
    targetId: 'nav-all-news',
    title: 'All News',
    content: 'Swipe through news stories in a modern, immersive format.',
    aiExplanation: 'Previously known as Reels, this section aggregates multimedia stories from all categories into a swipeable vertical feed, perfect for quick consumption.'
  },
  {
    targetId: 'nav-map',
    title: 'Live Map',
    content: 'Explore news and weather events geographically.',
    aiExplanation: 'The Map view visualizes data points on a global scale. It allows you to see clusters of events, weather patterns, and regional updates in real-time.'
  },
  {
    targetId: 'nav-ai-chat',
    title: 'AI Assistant',
    content: 'Ask our AI anything about current events.',
    aiExplanation: 'Our AI agent has access to Google Search grounding. You can ask it to summarize complex topics, compare news sources, or even generate a podcast about specific topics.'
  }
];

export const TourProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [runTour, setRunTour] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Check if user has seen the tour
    const hasSeenTour = localStorage.getItem('has_seen_app_tour_v2');
    if (!hasSeenTour) {
      setShowWelcome(true);
    }
  }, []);

  const startTour = () => {
    setShowWelcome(false);
    setRunTour(true);
    setCurrentStepIndex(0);
  };

  const endTour = () => {
    setRunTour(false);
    localStorage.setItem('has_seen_app_tour_v2', 'true');
  };

  return (
    <TourContext.Provider value={{ 
      runTour, 
      setRunTour, 
      showWelcome, 
      setShowWelcome,
      currentStepIndex, 
      setCurrentStepIndex,
      steps: TOUR_STEPS,
      startTour,
      endTour
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
