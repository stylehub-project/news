import React, { useEffect, useState } from 'react';
import { Check, Circle, Loader2 } from 'lucide-react';

interface Step {
  id: string;
  label: string;
}

interface MultiStepLoaderProps {
  steps: Step[];
  currentStepId: string;
  onComplete?: () => void;
  className?: string;
}

const MultiStepLoader: React.FC<MultiStepLoaderProps> = ({ 
  steps, 
  currentStepId, 
  className = '' 
}) => {
  const currentIndex = steps.findIndex(s => s.id === currentStepId);

  return (
    <div className={`w-full max-w-xs mx-auto ${className}`}>
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div key={step.id} className="flex items-center gap-3">
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 ${
                  isCompleted ? 'bg-green-500 border-green-500' :
                  isCurrent ? 'border-blue-600' :
                  'border-gray-200'
                }`}
              >
                {isCompleted && <Check size={14} className="text-white" />}
                {isCurrent && <Loader2 size={14} className="text-blue-600 animate-spin" />}
                {isPending && <Circle size={8} className="text-gray-200 fill-gray-200" />}
              </div>
              
              <span className={`text-sm font-medium transition-colors ${
                isCompleted ? 'text-gray-400 line-through' :
                isCurrent ? 'text-gray-900 font-bold' :
                'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MultiStepLoader;