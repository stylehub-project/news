
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, Bookmark, Share2, MessageSquare, RotateCw, ExternalLink, Zap } from 'lucide-react';
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
    const [progress, setProgress] = useState(0); // 0 to 100
    const [duration, setDuration] = useState(45); // Estimated seconds
    const [speed, setSpeed] = useState(1);
    
    // Logic Refs
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const progressInterval = useRef<any>(null);
    const wordCountRef = useRef(0);

    // Initial Processing
    useEffect(() => {
        const rawText = data.description || data.summary || "";
        // Split into cleaner paragraphs
        const split = rawText.split('. ').filter((s: string) => s.length > 5).map((s: string) => s + '.');
        setParagraphs(split.length > 0 ? split : [rawText]);
        
        // Estimate Duration (avg speaking rate ~150 wpm)
        const wordCount = rawText.split(' ').length;
        wordCountRef.current = wordCount;
        setDuration(Math.ceil((wordCount / 130) * 60));
    }, [data]);

    // Reset when not active
    useEffect(() => {
        if (!isActive) {
            stopAudio();
        } else {
            // Auto-play option (can be toggled via user prefs in future)
            // setTimeout(playAudio, 500); 
        }
    }, [isActive]);

    // Audio Logic
    const playAudio = () => {
        if (!window.speechSynthesis) return;
        
        synthRef.current = window.speechSynthesis;
        const text = `${headline}. ${paragraphs.join(' ')}`;
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = speed;
        utterance.pitch = 1;
        
        // Pick best voice
        const voices = synthRef.current.getVoices();
        const preferred = voices.find(v => v.name.includes("Google US") || v.name.includes("Samantha")) || voices[0];
        if (preferred) utterance.voice = preferred;

        utterance.onend = () => {
            setIsPlaying(false);
            setProgress(100);
            clearInterval(progressInterval.current);
        };

        utteranceRef.current = utterance;
        synthRef.current.cancel(); // Clear queue
        synthRef.current.speak(utterance);
        setIsPlaying(true);

        // Simulate progress bar since SpeechSynthesis API doesn't provide time
        const step = 100 / (duration * 1000 / 100); // update every 100ms
        let currentP = 0;
        
        clearInterval(progressInterval.current);
        progressInterval.current = setInterval(() => {
            currentP += step;
            if (currentP >= 100) currentP = 100;
            setProgress(currentP);
        }, 100);
    };

    const stopAudio = () => {
        if (synthRef.current) {
            synthRef.current.cancel();
        }
        setIsPlaying(false);
        clearInterval(progressInterval.current);
    };

    const toggleAudio = () => {
        if (isPlaying) stopAudio();
        else playAudio();
    };

    const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSpeed = parseFloat(e.target.value);
        setSpeed(newSpeed);
        if (isPlaying) {
            stopAudio();
            setTimeout(playAudio, 100);
        }
    };

    // Actions
    const handlePerspective = async () => {
        stopAudio();
        setHeadline("Analyzing Perspective...");
        try {
            const newText = await modifyText(data.description, "Rewrite this news story from an optimistic, future-looking perspective.");
            setParagraphs(newText.split('. ').map(s => s + '.'));
            setHeadline(`Future View: ${data.title}`);
        } catch (e) {
            setHeadline(data.title);
        }
    };

    return (
        <div className="reel-slide">
            {/* Background */}
            <div className="bg-layer">
                <img src={data.imageUrl || "https://picsum.photos/800/1200"} alt="bg" />
            </div>
            <div className="bg-gradient"></div>

            {/* Context Strip */}
            <div className="context-strip">
                <span className="category-pill">{data.category || 'News'}</span>
                <span className="location">{data.source}</span>
                <span className="time">{data.timeAgo}</span>
                {data.trustScore && (
                    <span className="trust-badge">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1"></div> {data.trustScore}%
                    </span>
                )}
            </div>

            {/* Headline */}
            <div className="headline-zone">
                <h1 className={`headline ${isActive ? 'visible' : ''}`}>{headline}</h1>
            </div>

            {/* Reading Canvas */}
            <div className="reading-canvas">
                <div className="article-content">
                    {paragraphs.map((p, i) => (
                        <p 
                            key={i} 
                            className={`${isActive ? 'visible' : ''}`}
                            style={{ transitionDelay: `${i * 100}ms` }}
                        >
                            {/* Simple splitting for visual effect, not full word-sync due to TTS limitation */}
                            {p}
                        </p>
                    ))}
                    <div className="h-32"></div> {/* Spacer */}
                </div>
            </div>

            {/* Audio Player */}
            <div className="audio-player-inline">
                <button className="play-pause-btn" onClick={toggleAudio}>
                    {isPlaying ? <Pause fill="white" size={20} /> : <Play fill="white" size={20} className="ml-1" />}
                </button>
                <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="audio-controls">
                    <span className="audio-time">
                        {isPlaying ? 'Playing' : `${Math.floor(duration)}s`}
                    </span>
                    <select className="speed-control" value={speed} onChange={handleSpeedChange} onClick={e => e.stopPropagation()}>
                        <option value="0.75">0.75x</option>
                        <option value="1">1.0x</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                    </select>
                </div>
            </div>

            {/* Action Dock */}
            <div className="reel-action-dock">
                <button className="action-btn" onClick={() => onAction('explain', data.id)}>
                    <div className="icon"><MessageSquare size={22} /></div>
                    <span className="label">Explain</span>
                </button>
                <button className="action-btn" onClick={() => onAction('save', data.id)}>
                    <div className="icon"><Bookmark size={22} /></div>
                    <span className="label">Save</span>
                </button>
                <button className="action-btn" onClick={() => onAction('share', data.id)}>
                    <div className="icon"><Share2 size={22} /></div>
                    <span className="label">Share</span>
                </button>
                <button className="action-btn" onClick={() => onAction('read', data.id)}>
                    <div className="icon"><ExternalLink size={22} /></div>
                    <span className="label">Full</span>
                </button>
                <button className="action-btn" onClick={handlePerspective}>
                    <div className="icon"><Zap size={22} className="text-yellow-400" /></div>
                    <span className="label">Shift</span>
                </button>
            </div>

            {/* Side Indicator */}
            <div className="reading-flow-indicator">
                <div className="indicator-fill" style={{ height: `${progress}%` }}></div>
            </div>
        </div>
    );
};

export default ReelSlide;
