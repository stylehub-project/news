import React, { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, Globe, Zap, Search, PenTool } from 'lucide-react';

const STEPS = [
    { text: "Analyzing request...", icon: BrainCircuit },
    { text: "Scanning knowledge base...", icon: Globe },
    { text: "Verifying facts...", icon: Search },
    { text: "Drafting response...", icon: PenTool },
];

const ThinkingIndicator: React.FC = () => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const stepInterval = setInterval(() => {
            setStep(s => (s + 1) % STEPS.length);
        }, 1500);

        return () => clearInterval(stepInterval);
    }, []);

    const CurrentIcon = STEPS[step].icon;

    return (
        <div className="flex flex-col gap-2 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-500 my-4 ml-1">
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl rounded-tl-none shadow-sm w-fit transition-all duration-300">
                <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-indigo-500 rounded-full blur animate-pulse opacity-20"></div>
                    <div className="relative bg-indigo-50 dark:bg-indigo-900/50 p-2 rounded-full text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                        <CurrentIcon size={16} className="animate-[spin_3s_linear_infinite]" />
                    </div>
                </div>
                <div className="flex flex-col justify-center">
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-100 leading-tight mb-1">
                        {STEPS[step].text}
                    </span>
                    <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThinkingIndicator;