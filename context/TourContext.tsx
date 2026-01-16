
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface TourStep {
  targetId: string;
  title: string;
  content: string;
  aiGuide: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export type TourLanguage = 'en' | 'hi' | 'es' | 'fr';

interface TourContextType {
  runTour: boolean;
  activeTourId: string | null;
  startTour: (tourId: string, customSteps?: TourStep[]) => void;
  endTour: () => void;
  markTourSeen: (tourId: string) => void;
  currentStepIndex: number;
  setCurrentStepIndex: (index: number) => void;
  steps: TourStep[];
  hasSeenTour: (tourId: string) => boolean;
  resetAllTours: () => void;
  tourLanguage: TourLanguage;
  setTourLanguage: (lang: TourLanguage) => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

// Multilingual Tour Data
const TOUR_DATA: Record<TourLanguage, TourStep[]> = {
  en: [
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
  ],
  hi: [
    {
      targetId: 'nav-home',
      title: 'आपकी फ़ीड',
      content: 'यह आपका व्यक्तिगत होम फ़ीड है जहाँ नवीनतम अपडेट उपलब्ध हैं।',
      aiGuide: 'हमारा AI आपकी रुचियों और वैश्विक महत्व के बीच संतुलन बनाने के लिए प्रति मिनट 10,000 से अधिक स्रोतों का विश्लेषण करता है।'
    },
    {
      targetId: 'nav-all-news',
      title: 'सभी समाचार',
      content: 'एक आधुनिक, इमर्सिव प्रारूप में समाचार कहानियों को स्वाइप करें।',
      aiGuide: 'जटिल लेखों को छोटे, दृश्य कार्डों में सारांशित करने के लिए जेनरेटिव AI का उपयोग करता है।'
    },
    {
      targetId: 'nav-map',
      title: 'लाइव मैप',
      content: 'भौगोलिक रूप से समाचार और मौसम की घटनाओं का अन्वेषण करें।',
      aiGuide: 'घटनाओं के समूहों की कल्पना करने के लिए भू-स्थानिक निर्देशांक के साथ समाचार मेटाडेटा को जोड़ता है।'
    },
    {
      targetId: 'nav-ai-chat',
      title: 'AI सहायक',
      content: 'हमारी AI से वर्तमान घटनाओं के बारे में कुछ भी पूछें या ऑडियो ब्रीफ उत्पन्न करें।',
      aiGuide: 'Google खोज ग्राउंडिंग के साथ जेमिनी मॉडल द्वारा संचालित।'
    },
    {
      targetId: 'floating-feedback-btn',
      title: 'प्रतिक्रिया',
      content: 'News Club को बेहतर बनाने में हमारी मदद करें। बग रिपोर्ट करें या सुविधाओं का सुझाव दें।',
      aiGuide: 'आपकी प्रतिक्रिया सीधे हमारे मॉडल को प्रशिक्षित करती है।'
    }
  ],
  es: [
    {
      targetId: 'nav-home',
      title: 'Tu Feed',
      content: 'Este es tu feed de inicio personalizado con las últimas actualizaciones.',
      aiGuide: 'Nuestra IA analiza más de 10,000 fuentes por minuto para curar un feed equilibrado entre tus intereses y la importancia global.'
    },
    {
      targetId: 'nav-all-news',
      title: 'Todas las Noticias',
      content: 'Desliza a través de historias de noticias en un formato moderno e inmersivo.',
      aiGuide: 'Utiliza IA generativa para resumir artículos complejos en tarjetas visuales de tamaño reducido.'
    },
    {
      targetId: 'nav-map',
      title: 'Mapa en Vivo',
      content: 'Explora noticias y eventos meteorológicos geográficamente.',
      aiGuide: 'Correlaciona metadatos de noticias con coordenadas geoespaciales para visualizar grupos de eventos.'
    },
    {
      targetId: 'nav-ai-chat',
      title: 'Asistente IA',
      content: 'Pregunta a nuestra IA cualquier cosa sobre eventos actuales o genera resúmenes de audio.',
      aiGuide: 'Impulsado por modelos Gemini con base en la Búsqueda de Google.'
    },
    {
      targetId: 'floating-feedback-btn',
      title: 'Comentarios',
      content: 'Ayúdanos a mejorar News Club. Reporta errores o sugiere características.',
      aiGuide: 'Tus comentarios entrenan directamente nuestros modelos.'
    }
  ],
  fr: [
    {
      targetId: 'nav-home',
      title: 'Votre Fil',
      content: 'Ceci est votre fil d\'accueil personnalisé avec les dernières mises à jour.',
      aiGuide: 'Notre IA analyse plus de 10 000 sources par minute pour organiser un fil équilibré entre vos intérêts et l\'importance mondiale.'
    },
    {
      targetId: 'nav-all-news',
      title: 'Toutes les Nouvelles',
      content: 'Faites glisser les actualités dans un format moderne et immersif.',
      aiGuide: 'Utilise l\'IA générative pour résumer des articles complexes en cartes visuelles.'
    },
    {
      targetId: 'nav-map',
      title: 'Carte en Direct',
      content: 'Explorez les nouvelles et les événements météorologiques géographiquement.',
      aiGuide: 'Corrèle les métadonnées des nouvelles avec les coordonnées géospatiales pour visualiser les groupes d\'événements.'
    },
    {
      targetId: 'nav-ai-chat',
      title: 'Assistant IA',
      content: 'Demandez n\'importe quoi à notre IA sur l\'actualité ou générez des résumés audio.',
      aiGuide: 'Propulsé par les modèles Gemini avec la recherche Google.'
    },
    {
      targetId: 'floating-feedback-btn',
      title: 'Retour',
      content: 'Aidez-nous à améliorer News Club. Signalez des bugs ou suggérez des fonctionnalités.',
      aiGuide: 'Vos commentaires entraînent directement nos modèles.'
    }
  ]
};

export const TourProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [runTour, setRunTour] = useState(false);
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [tourLanguage, setTourLanguage] = useState<TourLanguage>('en');
  const [customTourSteps, setCustomTourSteps] = useState<TourStep[] | null>(null);
  
  const [completedTours, setCompletedTours] = useState<string[]>(() => {
      try {
          return JSON.parse(localStorage.getItem('nc_completed_tours') || '[]');
      } catch { return []; }
  });

  useEffect(() => {
      localStorage.setItem('nc_completed_tours', JSON.stringify(completedTours));
  }, [completedTours]);

  const markTourSeen = useCallback((tourId: string) => {
      setCompletedTours(prev => {
          if (!prev.includes(tourId)) return [...prev, tourId];
          return prev;
      });
  }, []);

  const startTour = useCallback((tourId: string, customSteps?: TourStep[]) => {
    setActiveTourId(tourId);
    if (customSteps) {
        setCustomTourSteps(customSteps);
    } else {
        setCustomTourSteps(null); // Use default multi-lingual steps
    }
    setCurrentStepIndex(0);
    setRunTour(true);
  }, []);

  const endTour = useCallback(() => {
    setRunTour(false);
    if (activeTourId) {
        markTourSeen(activeTourId);
    }
    setActiveTourId(null);
  }, [activeTourId, markTourSeen]);

  const hasSeenTour = useCallback((tourId: string) => {
      return completedTours.includes(tourId);
  }, [completedTours]);

  const resetAllTours = useCallback(() => {
      setCompletedTours([]);
      localStorage.removeItem('nc_completed_tours');
      startTour('main_v3');
  }, [startTour]);

  // Resolve steps based on active mode
  const steps = customTourSteps || TOUR_DATA[tourLanguage];

  return (
    <TourContext.Provider value={{ 
      runTour, 
      activeTourId,
      startTour, 
      endTour,
      markTourSeen,
      currentStepIndex, 
      setCurrentStepIndex,
      steps,
      hasSeenTour,
      resetAllTours,
      tourLanguage,
      setTourLanguage
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
