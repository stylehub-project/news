
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Bookmark, Share2, MessageSquare, ExternalLink, Zap, ShieldCheck, Clock, MapPin, AudioWaveform } from 'lucide-react';
import { modifyText } from '../../utils/aiService';

interface ReelSlideProps {
    data: any;
    isActive: boolean;
    onAction: (action: string, id: string) => void;
}

const ReelSlide: React.FC<ReelSlideProps> = ({ data, isActive, onAction }) => {
    // Content State
    const [headline, setHeadline] = useState(data.title);
    const [paragraphs, setParagraphs] = useState<string[]>([]);
    
    // Audio State
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0); 
    const [duration, setDuration] = useState(45); 
    
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const progressInterval = useRef<any>(null);

    // Prepare Text Content
    useEffect(() => {
        const rawText = data.description || data.summary || "";
        // Clean paragraphs for display
        const split = rawText.split('. ').filter((s: string) => s.length > 5).map((s: string) => s + '.');
        setParagraphs(split.length > 0 ? split : [rawText]);
        
        // Estimate Audio Duration (avg speaking rate ~150 wpm)
        const wordCount = rawText.split(' ').length;
        setDuration(Math.ceil((wordCount / 140) * 60));
    }, [data]);

    // Handle Active State
    useEffect(() => {
        if (!isActive) {
            stopAudio();
        }
    }, [isActive]);

    // Audio Logic
    const toggleAudio = () => {
        if (isPlaying) {
            stopAudio();
        } else {
            playAudio();
        }
    };

    const playAudio = () => {
        if (!window.speechSynthesis) return;
        
        synthRef.current = window.speechSynthesis;
        const text = `${headline}. ${paragraphs.join(' ')}`;
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1;
        
        const voices = synthRef.current.getVoices();
        const preferred = voices.find(v => v.name.includes("Google US") || v.name.includes("Samantha")) || voices[0];
        if (preferred) utterance.voice = preferred;

        utterance.onend = () => {
            setIsPlaying(false);
            setProgress(100);
            clearInterval(progressInterval.current);
        };

        utteranceRef.current = utterance;
        synthRef.current.cancel(); 
        synthRef.current.speak(utterance);
        setIsPlaying(true);

        // Progress Simulation
        const step = 100 / (duration * 10); 
        let currentP = 0;
        clearInterval(progressInterval.current);
        progressInterval.current = setInterval(() => {
            currentP += step;
            if (currentP >= 100) currentP = 100;
            setProgress(currentP);
        }, 100);
    };

    const stopAudio = () => {
        if (synthRef.current) synthRef.current.cancel();
        setIsPlaying(false);
        clearInterval(progressInterval.current);
        setProgress(0);
    };

    const handlePerspective = async () => {
        stopAudio();
        setHeadline("AI Re-imagining...");
        try {
            const newText = await modifyText(data.description, "Rewrite this news story from a futuristic, optimistic perspective.");
            setParagraphs(newText.split('. ').map(s => s + '.'));
            setHeadline(`Future Outlook: ${data.title}`);
        } catch (e) {
            setHeadline(data.title);
        }
    };

    return (
        <div className="reel-slide relative w-full h-full overflow-hidden bg-black">
            {/* 1. Cinematic Background Layer */}
            <div className="absolute inset-0 z-0">
                <img 
                    src={data.imageUrl} 
                    alt="Background" 
                    className="w-full h-full object-cover opacity-60 animate-[panImage_20s_infinite_alternate]"
                />
                {/* Heavy gradient for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent"></div>
            </div>

            {/* 2. Top Context Strip */}
            <div className="absolute top-20 left-0 w-full px-5 z-20 flex justify-between items-start animate-in slide-in-from-top-4 duration-700">
                <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        <MapPin size={10} /> {data.location || 'Global'}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                        <Clock size={10} /> {data.timeAgo || 'Just now'}
                    </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                        <ShieldCheck size={10} /> {data.trustScore}% Trust
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold">{data.source}</span>
                </div>
            </div>

            {/* 3. Main Content Area */}
            <div className="absolute bottom-0 left-0 w-full z-20 px-5 pb-28 flex flex-col justify-end h-[70%]">
                {/* Category Tag */}
                <div className="mb-3">
                    <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-blue-900/50">
                        {data.category || 'News'}
                    </span>
                </div>

                {/* Headline */}
                <h1 className={`text-3xl md:text-4xl font-black text-white leading-[1.1] mb-4 drop-shadow-lg transition-all duration-700 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                    {headline}
                </h1>

                {/* Dynamic Paragraphs */}
                <div className="space-y-3 mb-6 mask-fade-bottom">
                    {paragraphs.slice(0, 3).map((p, i) => (
                        <p 
                            key={i} 
                            className={`text-base md:text-lg font-medium text-gray-200 leading-relaxed transition-all duration-700 delay-${i * 200} ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                            style={{ transitionDelay: `${i * 150}ms` }}
                        >
                            {p}
                        </p>
                    ))}
                </div>

                {/* Audio Player */}
                <div className={`flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 p-2 rounded-2xl transition-all duration-500 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                    <button 
                        onClick={(e) => { e.stopPropagation(); toggleAudio(); }}
                        className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-transform"
                    >
                        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                    </button>
                    <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-indigo-400 transition-all duration-100 ease-linear"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="px-2 text-[10px] font-bold text-gray-300 tabular-nums">
                        {isPlaying ? 'Listening...' : `${duration}s`}
                    </div>
                </div>
            </div>

            {/* 4. Right Action Dock */}
            <div className={`absolute right-4 bottom-28 z-30 flex flex-col gap-4 items-center transition-all duration-500 delay-300 ${isActive ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}>
                <ActionButton icon={<MessageSquare size={24} />} label="AI Chat" onClick={() => onAction('explain', data.id)} />
                <ActionButton icon={<Bookmark size={24} />} label="Save" onClick={() => onAction('save', data.id)} />
                <ActionButton icon={<Share2 size={24} />} label="Share" onClick={() => onAction('share', data.id)} />
                <ActionButton icon={<ExternalLink size={24} />} label="Full" onClick={() => onAction('read', data.id)} />
                <ActionButton icon={<Zap size={24} />} label="Shift" onClick={handlePerspective} active />
            </div>

            {/* 5. Progress Indicators */}
            <div className="absolute top-0 left-0 w-full h-1 bg-white/10 z-30">
                {isActive && <div className="h-full bg-white animate-progress-linear"></div>}
            </div>
        </div>
    );
};

// Subcomponent for cleaner action buttons
const ActionButton = ({ icon, label, onClick, active }: any) => (
    <button 
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className="group flex flex-col items-center gap-1"
    >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-200 active:scale-90 ${active ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-black/30 border-white/20 text-white hover:bg-black/50'}`}>
            {icon}
        </div>
        <span className="text-[10px] font-bold text-white shadow-black drop-shadow-md opacity-80 group-hover:opacity-100">{label}</span>
    </button>
);

export default ReelSlide;
