
import React, { useState, useEffect, useRef } from 'react';
import { useTour } from '../../context/TourContext';
import { X, ChevronRight, Sparkles, Check, ArrowRight, BrainCircuit, Play, Volume2, VolumeX, ShieldCheck } from 'lucide-react';
import Button from '../ui/Button';

const AppTour: React.FC = () => {
  const { runTour, activeTourId, currentStepIndex, setCurrentStepIndex, steps, startTour, endTour, hasSeenTour } = useTour();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [showAIGuide, setShowAIGuide] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  
  // Voice State
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Check for Welcome Modal condition
  useEffect(() => {
      const hasSeenMain = hasSeenTour('main_v3');
      if (!hasSeenMain) {
          const timer = setTimeout(() => setShowWelcomeModal(true), 3500); // Wait for splash
          return () => clearTimeout(timer);
      }
  }, []);

  // Update target position
  useEffect(() => {
    if (runTour && steps[currentStepIndex]) {
      const step = steps[currentStepIndex];
      const element = document.getElementById(step.targetId);
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Delay to allow scroll to finish
        setTimeout(() => {
            const rect = element.getBoundingClientRect();
            setTargetRect(rect);
            
            // Voice Logic
            if (isVoiceEnabled) {
                speakText(step.content);
            }
        }, 500);
      } else {
        // Skip if element missing
        handleNext();
      }
    } else {
        setTargetRect(null);
    }
  }, [runTour, currentStepIndex, steps, isVoiceEnabled]);

  const speakText = (text: string) => {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.1;
      window.speechSynthesis.speak(u);
  };

  const handleNext = () => {
    window.speechSynthesis.cancel();
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      endTour();
    }
  };

  const handleSkip = () => {
      window.speechSynthesis.cancel();
      endTour();
      setShowWelcomeModal(false);
  };

  const handleStartMainTour = () => {
      setShowWelcomeModal(false);
      startTour('main_v3');
  };

  // --- WELCOME MODAL ---
  if (showWelcomeModal && !runTour) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-500">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden border border-white/20">
          
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-500/20 to-transparent pointer-events-none"></div>
          <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-bounce">
                <span className="text-4xl font-black text-white">N</span>
              </div>
              
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Welcome to<br/>News Club</h2>
              <p className="text-gray-500 dark:text-gray-300 mb-6 text-lg font-medium leading-relaxed">
                Your AI-powered news universe.<br/>Smart, personalized, and live.
              </p>

              {/* Privacy Trust Badge */}
              <div className="mb-8 flex items-center justify-center gap-2 text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 py-1.5 px-3 rounded-full border border-green-200 dark:border-green-800">
                  <ShieldCheck size={14} />
                  <span>No login required. Your data stays on your device.</span>
              </div>
              
              <div className="space-y-3">
                <Button 
                    fullWidth 
                    onClick={handleStartMainTour} 
                    size="lg" 
                    className="bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 rounded-xl py-4 font-bold text-base"
                    rightIcon={<Play size={18} fill="currentColor" />}
                >
                  Start Guided Tour
                </Button>
                <button 
                    onClick={handleSkip} 
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-bold py-2 transition-colors"
                >
                  Skip for now
                </button>
              </div>
          </div>
        </div>
      </div>
    );
  }

  // --- TOUR OVERLAY ---
  if (!runTour || !targetRect || !steps[currentStepIndex]) return null;

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const isBottomHalf = targetRect.top > window.innerHeight / 2;
  const padding = 16;
  
  const tooltipStyle: React.CSSProperties = isBottomHalf 
    ? { bottom: window.innerHeight - targetRect.top + padding, left: 16, right: 16 }
    : { top: targetRect.bottom + padding, left: 16, right: 16 };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-auto overflow-hidden">
      {/* Dimmed Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] transition-opacity duration-500"></div>

      {/* Target Spotlight */}
      <div 
        className="absolute border-[3px] border-yellow-400 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] transition-all duration-500 ease-[cubic-bezier(0.25,0.4,0.25,1)] pointer-events-none"
        style={{
          top: targetRect.top - 4,
          left: targetRect.left - 4,
          width: targetRect.width + 8,
          height: targetRect.height + 8,
        }}
      >
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-yellow-400 rounded-full border border-white"></div>
      </div>

      {/* Tooltip Card - Glassmorphism */}
      <div 
        className="absolute bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-5 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-sm mx-auto border border-white/20 dark:border-gray-700"
        style={tooltipStyle}
      >
        <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
                <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {activeTourId === 'main_v3' ? `Step ${currentStepIndex + 1}/${steps.length}` : 'Quick Tip'}
                </span>
            </div>
            <div className="flex items-center gap-1">
                {/* Voice Toggle */}
                <button 
                    onClick={() => {
                        setIsVoiceEnabled(!isVoiceEnabled);
                        if(!isVoiceEnabled) speakText(currentStep.content);
                        else window.speechSynthesis.cancel();
                    }}
                    className={`p-1.5 rounded-full transition-colors ${isVoiceEnabled ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    {isVoiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                
                <button onClick={() => { window.speechSynthesis.cancel(); endTour(); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                    <X size={18} />
                </button>
            </div>
        </div>

        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">{currentStep.title}</h3>
        
        {showAIGuide ? (
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-500/30 mb-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase">
                    <BrainCircuit size={14} /> AI Context
                </div>
                <p className="text-sm text-indigo-900 dark:text-indigo-100 leading-relaxed font-medium">
                    {currentStep.aiGuide}
                </p>
            </div>
        ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 leading-relaxed font-medium">
                {currentStep.content}
            </p>
        )}

        <div className="flex gap-3 mt-4">
            <button 
                onClick={() => setShowAIGuide(!showAIGuide)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${showAIGuide ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20' : 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
            >
                <Sparkles size={14} className={showAIGuide ? "text-yellow-300" : "text-indigo-500"} />
                {showAIGuide ? 'Close AI' : 'Why use this?'}
            </button>
            <Button 
                onClick={handleNext} 
                size="sm" 
                className="flex-1 rounded-xl"
                rightIcon={isLastStep ? <Check size={14} /> : <ArrowRight size={14} />}
            >
                {isLastStep ? "Got it" : "Next"}
            </Button>
        </div>
      </div>
    </div>
  );
};

export default AppTour;
