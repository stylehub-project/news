import React, { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, Globe, Zap, Search, PenTool } from 'lucide-react';

const STEPS = [
    { text: "Analyzing your request...", icon: BrainCircuit },
    { text: "Scanning global headlines...", icon: Globe },
    { text: "Fact-checking sources...", icon: Search },
    { text: "Generating insights...", icon: Sparkles },
    { text: "Formatting response...", icon: PenTool },
];

const TRIVIA = [
    "Did you know? The first newspaper was printed in 1605.",
    "AI reads 1000x faster than the average human.",
    "90% of the world's data was created in the last 2 years.",
    "Trending Now: #MarsMission, #AI_Safety, #ClimateSummit",
    "Fun Fact: 'News' is an acronym for North, East, West, South (Urban Legend).",
    "Processing over 1 million articles per second...",
    "Connecting to real-time satellite feeds..."
];

const ThinkingIndicator: React.FC = () => {
    const [step, setStep] = useState(0);
    const [info, setInfo] = useState(TRIVIA[0]);

    useEffect(() => {
        // Rotate process steps rapidly
        const stepInterval = setInterval(() => {
            setStep(s => (s + 1) % STEPS.length);
        }, 1200);

        // Rotate trivia/facts slowly
        const infoInterval = setInterval(() => {
            setInfo(TRIVIA[Math.floor(Math.random() * TRIVIA.length)]);
        }, 3500);

        return () => {
            clearInterval(stepInterval);
            clearInterval(infoInterval);
        }
    }, []);

    const CurrentIcon = STEPS[step].icon;

    return (
        <div className="flex flex-col gap-2 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-500 my-4">
            {/* Main Status Bubble */}
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl rounded-tl-none shadow-sm w-fit transition-all duration-300">
                <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-indigo-500 rounded-full blur animate-pulse opacity-40"></div>
                    <div className="relative bg-indigo-50 dark:bg-indigo-900/50 p-2 rounded-full text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                        <CurrentIcon size={16} className="animate-[spin_3s_linear_infinite]" />
                    </div>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-100 leading-tight">
                        {STEPS[step].text}
                    </span>
                    <div className="h-1 w-24 bg-gray-100 dark:bg-gray-700 rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full animate-[shimmer_1.5s_infinite] w-1/2"></div>
                    </div>
                </div>
            </div>

            {/* Micro Fact / Context */}
            <div className="ml-1 flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-500 font-medium pl-1">
                <Zap size={10} className="text-yellow-500 fill-yellow-500 shrink-0" />
                <span className="animate-pulse line-clamp-1">{info}</span>
            </div>
        </div>
    );
};

export default ThinkingIndicator;