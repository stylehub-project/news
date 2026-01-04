
import React, { useState, useEffect, useRef } from 'react';
import { useTour } from '../../context/TourContext';
import { X, ChevronRight, Sparkles, Check, ArrowRight, BrainCircuit } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const AppTour: React.FC = () => {
  const { runTour, showWelcome, setShowWelcome, currentStepIndex, setCurrentStepIndex, steps, startTour, endTour } = useTour();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [showAIExplanation, setShowAIExplanation] = useState(false);

  // Update target position when step changes
  useEffect(() => {
    if (runTour) {
      const step = steps[currentStepIndex];
      const element = document.getElementById(step.targetId);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
        setShowAIExplanation(false); // Reset AI view on step change
      } else {
        // Skip if element not found (e.g. mobile/desktop view diff)
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        } else {
            endTour();
        }
      }
    }
  }, [runTour, currentStepIndex, steps]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      endTour();
    }
  };

  if (showWelcome) {
    return (
      <Modal isOpen={true} onClose={() => setShowWelcome(false)} title="Welcome to News Club">
        <div className="text-center p-4">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl shadow-indigo-500/30">
            <span className="text-4xl font-black text-white">N</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Your Personalized<br/>News Experience</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            Discover a smarter way to stay informed with AI-powered summaries, live maps, and immersive stories.
          </p>
          <div className="space-y-3">
            <Button fullWidth onClick={startTour} size="lg" className="bg-indigo-600 hover:bg-indigo-700 shadow-lg">
              Start Tour
            </Button>
            <Button fullWidth variant="ghost" onClick={() => setShowWelcome(false)} className="text-gray-400">
              Skip
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  if (!runTour || !targetRect) return null;

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  // Calculate tooltip position (above or below target)
  const isBottomHalf = targetRect.top > window.innerHeight / 2;
  const tooltipStyle: React.CSSProperties = isBottomHalf 
    ? { bottom: window.innerHeight - targetRect.top + 20, left: 16, right: 16 }
    : { top: targetRect.bottom + 20, left: 16, right: 16 };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-auto">
      {/* Dark Overlay with cutout */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-all duration-500">
        {/* Cutout Highlight using clip-path could be complex, simple absolute div over target is easier for React */}
      </div>

      {/* Highlight Box */}
      <div 
        className="absolute border-4 border-yellow-400 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] transition-all duration-500 ease-in-out pointer-events-none"
        style={{
          top: targetRect.top - 8,
          left: targetRect.left - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
        }}
      >
          <div className="absolute -top-3 -right-3 bg-yellow-400 rounded-full p-1 shadow-lg animate-bounce">
              <Sparkles size={16} className="text-black fill-black" />
          </div>
      </div>

      {/* Tooltip Card */}
      <div 
        className="absolute bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-300 max-w-sm mx-auto"
        style={tooltipStyle}
      >
        <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Step {currentStepIndex + 1} of {steps.length}
            </span>
            <button onClick={endTour} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={16} />
            </button>
        </div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{currentStep.title}</h3>
        
        {showAIExplanation ? (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800 mb-4 animate-in fade-in">
                <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase">
                    <BrainCircuit size={14} /> AI Detailed Guide
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {currentStep.aiExplanation}
                </p>
            </div>
        ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                {currentStep.content}
            </p>
        )}

        <div className="flex gap-2 mt-4">
            <button 
                onClick={() => setShowAIExplanation(!showAIExplanation)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${showAIExplanation ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100'}`}
            >
                {showAIExplanation ? 'Hide AI Guide' : 'AI Guide'}
            </button>
            <Button 
                onClick={handleNext} 
                size="sm" 
                className="flex-1"
                rightIcon={isLastStep ? <Check size={14} /> : <ArrowRight size={14} />}
            >
                {isLastStep ? "Finish" : "Next"}
            </Button>
        </div>
      </div>
    </div>
  );
};

export default AppTour;
