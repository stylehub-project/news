import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Pause, Download, Save, RefreshCw, FileText, Mic, Clock, Zap, Filter, List, Volume2, Radio, Eye, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { uploadToCloudinary, fetchSavedNews, saveBroadcastToDB } from '../../utils/cloudinaryService';

// --- Audio Helpers ---
function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function floatTo16BitPCM(output: DataView, offset: number, input: Float32Array) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function encodeWAV(samples: Float32Array, sampleRate: number) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);
  floatTo16BitPCM(view, 44, samples);

  return view;
}

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeRawPCM(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  let alignedData = data;
  if (data.byteLength % 2 !== 0) {
      alignedData = data.slice(0, data.byteLength - 1);
  }

  const dataInt16 = new Int16Array(alignedData.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const AudioVisualizer = ({ isPlaying, audioData }: { isPlaying: boolean, audioData: Uint8Array }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        const draw = () => {
            if (!isPlaying) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.beginPath();
                ctx.moveTo(0, canvas.height / 2);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'; 
                ctx.lineWidth = 2;
                for (let i = 0; i < canvas.width; i++) {
                    ctx.lineTo(i, canvas.height / 2);
                }
                ctx.stroke();
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const width = canvas.width;
            const height = canvas.height;
            const barWidth = (width / audioData.length) * 2.5;
            let x = 0;

            for (let i = 0; i < audioData.length; i++) {
                const barHeight = (audioData[i] / 255) * height;
                
                const gradient = ctx.createLinearGradient(0, height, 0, 0);
                gradient.addColorStop(0, '#60a5fa');
                gradient.addColorStop(1, '#c084fc');
                
                ctx.fillStyle = gradient;
                // Center bars vertically for a premium look
                ctx.fillRect(x, (height - barHeight) / 2, barWidth, barHeight);
                x += barWidth + 1;
            }
            animationId = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(animationId);
    }, [isPlaying, audioData]);

    return <canvas ref={canvasRef} width={300} height={60} className="w-full h-16 rounded-2xl bg-black/40 border border-white/5 shadow-inner" />;
};

const SipsDashboard: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('English');
  const [tone, setTone] = useState('Professional');
  const [duration, setDuration] = useState('Medium');
  
  const [step, setStep] = useState<'config' | 'generating' | 'playing'>('config');
  const [loadingText, setLoadingText] = useState('');
  const [script, setScript] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [visualData, setVisualData] = useState<Uint8Array>(new Uint8Array(0));
  const [playbackTime, setPlaybackTime] = useState(0);
  const startTimeRef = useRef(0);
  
  const [savedNews, setSavedNews] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'saved'>('create');
  const [isReaderMode, setIsReaderMode] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSavedNews();
  }, []);

  // Pre-process script for character-based synchronization
  const linesData = useMemo(() => {
      if (!script) return [];
      const rawLines = script.split('\n').filter(l => l.trim());
      let totalChars = 0;
      return rawLines.map(line => {
          const isJoe = line.startsWith('Joe:');
          const isJane = line.startsWith('Jane:');
          const text = line.replace(/^(Joe|Jane):\s*/, '');
          const startChar = totalChars;
          totalChars += text.length;
          const endChar = totalChars;
          return { text, isJoe, isJane, startChar, endChar, length: text.length, original: line };
      });
  }, [script]);

  const totalChars = linesData.length > 0 ? linesData[linesData.length - 1].endChar : 1;

  // Smooth Auto-scroll to active line
  useEffect(() => {
      if (isPlaying && transcriptRef.current) {
          const activeEl = transcriptRef.current.querySelector('.active-line');
          if (activeEl) {
              const container = transcriptRef.current.parentElement;
              if (container) {
                  const containerHeight = container.clientHeight;
                  const elementOffset = (activeEl as HTMLElement).offsetTop;
                  const elementHeight = (activeEl as HTMLElement).clientHeight;
                  
                  const scrollPosition = elementOffset - (containerHeight / 2) + (elementHeight / 2);
                  
                  container.scrollTo({
                      top: scrollPosition,
                      behavior: 'smooth'
                  });
              }
          }
      }
  }, [playbackTime, isPlaying]);

  const loadSavedNews = async () => {
    setIsLoadingSaved(true);
    try {
      const news = await fetchSavedNews();
      setSavedNews(news);
    } catch (e) {
      console.error('Failed to load saved news', e);
    } finally {
      setIsLoadingSaved(false);
    }
  };

  const generateAudioWithSettings = async () => {
      if (!topic.trim()) {
          alert("Please enter a topic.");
          return;
      }
      setStep('generating');
      setLoadingText('Connecting to SIPS Newsroom...');

      try {
          const apiKey = (window as any).process?.env?.API_KEY || (import.meta as any).env?.VITE_API_KEY;
          if (!apiKey) throw new Error("API Key Missing");
          const ai = new GoogleGenAI({ apiKey });

          // 1. Script Generation
          const durationConstraint = duration === 'Short' 
            ? "Keep it very concise, under 100 words. Focus only on the most critical facts." 
            : duration === 'Long' ? "Provide a detailed discussion, around 500 words. Explore nuances and context."
            : "Provide a balanced discussion, around 250 words.";

          const scriptPrompt = `
            Create a spoken news dialogue between Joe (Male) and Jane (Female) about: "${topic}".
            Language: ${language}.
            Tone: ${tone}. 
            Constraint: ${durationConstraint}
            Structure lines strictly as "Joe: ..." and "Jane: ...".
            Make it engaging and educational.
          `;

          const scriptResponse = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: scriptPrompt
          });
          
          const generatedScript = scriptResponse.text || "Script generation failed.";
          setScript(generatedScript);
          setLoadingText('Synthesizing broadcast...');

          // 2. TTS Generation
          const ttsResponse = await ai.models.generateContent({
              model: 'gemini-2.5-flash-preview-tts',
              contents: [{ parts: [{ text: generatedScript }] }],
              config: {
                  responseModalities: ['AUDIO'],
                  speechConfig: {
                      multiSpeakerVoiceConfig: {
                          speakerVoiceConfigs: [
                              { speaker: 'Joe', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }, 
                              { speaker: 'Jane', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }
                          ]
                      }
                  }
              }
          });

          const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          if (!base64Audio) throw new Error("No audio generated");

          // Convert Base64 to Bytes
          const bytes = decodeBase64(base64Audio);

          // Setup Audio Context
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioContextClass({ sampleRate: 24000 });
          audioContextRef.current = ctx;

          // Decode Raw PCM Manually
          const audioBuffer = await decodeRawPCM(bytes, ctx, 24000, 1);
          audioBufferRef.current = audioBuffer;

          // Prepare WAV for download
          const wavView = encodeWAV(audioBuffer.getChannelData(0), audioBuffer.sampleRate);
          setAudioBlob(new Blob([wavView], { type: 'audio/wav' }));

          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          analyserRef.current = analyser;

          setStep('playing');

      } catch (error) {
          console.error("Generation Error", error);
          alert(`Failed to generate audio. ${error}`);
          setStep('config');
      }
  };

  const togglePlay = () => {
      if (!audioContextRef.current || !audioBufferRef.current) return;

      if (isPlaying) {
          if (sourceRef.current) {
              sourceRef.current.stop();
              sourceRef.current = null;
          }
          setIsPlaying(false);
      } else {
          const source = audioContextRef.current.createBufferSource();
          source.buffer = audioBufferRef.current;
          
          if (analyserRef.current) {
              source.connect(analyserRef.current);
              analyserRef.current.connect(audioContextRef.current.destination);
          } else {
              source.connect(audioContextRef.current.destination);
          }

          source.start(0, playbackTime);
          startTimeRef.current = audioContextRef.current.currentTime - playbackTime;
          sourceRef.current = source;
          setIsPlaying(true);

          source.onended = () => {
              setIsPlaying(false);
              setPlaybackTime(0);
          };
          animateVisualizer();
      }
  };

  const animateVisualizer = () => {
      if (!analyserRef.current) return;
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      const loop = () => {
          if (!sourceRef.current) return;
          analyserRef.current!.getByteFrequencyData(dataArray);
          setVisualData(new Uint8Array(dataArray));
          
          if (audioContextRef.current) {
              setPlaybackTime(audioContextRef.current.currentTime - startTimeRef.current);
          }
          
          requestAnimationFrame(loop);
      };
      loop();
  };

  const downloadAudio = () => {
      if (!audioBlob) return;
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sips-news-${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  const saveToLibrary = async () => {
      if (!audioBlob || !script) return;
      setIsSaving(true);
      try {
          const metadata = {
              title: topic,
              script: script,
              language,
              tone
          };
          
          await saveBroadcastToDB(metadata, audioBlob);
          
          alert('Successfully saved to Library!');
          loadSavedNews();
      } catch (e: any) {
          console.error(e);
          alert('Failed to save: ' + e.message);
      } finally {
          setIsSaving(false);
      }
  };

  const playSavedNews = async (newsItem: any) => {
      setTopic(newsItem.title);
      setScript(newsItem.script);
      setStep('generating');
      setLoadingText('Loading saved broadcast...');
      
      try {
          const res = await fetch(newsItem.audioUrl);
          const arrayBuffer = await res.arrayBuffer();
          
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioContextClass({ sampleRate: 24000 });
          audioContextRef.current = ctx;
          
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
          audioBufferRef.current = audioBuffer;
          
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          analyserRef.current = analyser;
          
          const wavView = encodeWAV(audioBuffer.getChannelData(0), audioBuffer.sampleRate);
          setAudioBlob(new Blob([wavView], { type: 'audio/wav' }));
          
          setActiveTab('create');
          setStep('playing');
      } catch (e) {
          console.error(e);
          alert('Failed to load audio');
          setStep('config');
      }
  };

  // Premium Smart Panel Highlighting Logic
  const renderScript = () => {
      if (!script || linesData.length === 0) return null;
      
      const totalDuration = audioBufferRef.current?.duration || 1;
      const progress = playbackTime / totalDuration;
      const currentChar = progress * totalChars;
      
      const activeLineIndex = linesData.findIndex(l => currentChar >= l.startChar && currentChar <= l.endChar);
      const currentLine = activeLineIndex !== -1 ? activeLineIndex : (progress >= 1 ? linesData.length - 1 : 0);

      return (
          <div className="space-y-6 md:space-y-8 pb-[50vh]" ref={transcriptRef}>
              {linesData.map((line, idx) => {
                  const isActive = idx === currentLine && isPlaying;
                  const isPassed = idx < currentLine || (progress >= 1 && !isPlaying);
                  
                  // Word level progress calculation
                  let lineProgress = 0;
                  if (isActive) {
                      lineProgress = (currentChar - line.startChar) / Math.max(1, line.length);
                  } else if (isPassed) {
                      lineProgress = 1;
                  }

                  const words = line.text.split(' ');
                  
                  return (
                      <motion.div 
                          key={idx}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ 
                              opacity: isActive ? 1 : (isPassed ? 0.5 : 0.2),
                              scale: isActive ? (isReaderMode ? 1.05 : 1.02) : 0.98,
                              filter: isActive ? 'blur(0px)' : 'blur(1px)'
                          }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className={`p-6 md:p-8 rounded-3xl transition-all duration-500 ${
                              isActive 
                              ? 'bg-white/10 border border-white/20 shadow-[0_8px_32px_rgba(255,255,255,0.1)] backdrop-blur-xl active-line' 
                              : 'bg-transparent border border-transparent'
                          } ${isReaderMode ? 'text-center' : 'text-left'}`}
                      >
                          {!isReaderMode && (
                              <div className={`text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${line.isJoe ? 'text-blue-400' : 'text-purple-400'}`}>
                                  <div className={`w-2 h-2 rounded-full ${line.isJoe ? 'bg-blue-400' : 'bg-purple-400'} ${isActive ? 'animate-pulse' : ''}`} />
                                  {line.isJoe ? 'Joe' : 'Jane'}
                              </div>
                          )}
                          
                          <div className={`flex flex-wrap gap-x-2 gap-y-2 ${isReaderMode ? 'justify-center text-3xl md:text-5xl leading-tight font-semibold tracking-tight' : 'text-xl md:text-2xl leading-relaxed font-medium'}`}>
                              {words.map((word, wIdx) => {
                                  const wordStartRatio = wIdx / words.length;
                                  const isWordActive = lineProgress >= wordStartRatio;
                                  
                                  return (
                                      <span 
                                          key={wIdx} 
                                          className={`transition-colors duration-300 ${
                                              isWordActive 
                                              ? 'text-white drop-shadow-[0_0_16px_rgba(255,255,255,0.8)]' 
                                              : 'text-white/30'
                                          }`}
                                      >
                                          {word}
                                      </span>
                                  );
                              })}
                          </div>
                      </motion.div>
                  );
              })}
          </div>
      );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#050505] to-[#050505] pb-24 lg:pb-8 selection:bg-purple-500/30">
      <div className="max-w-[1600px] mx-auto p-4 md:p-8">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 flex items-center gap-3">
                    <Volume2 className="w-8 h-8 md:w-10 md:h-10 text-blue-400" />
                    SIPS News Reader
                </h1>
                <p className="text-gray-400 mt-2 text-sm md:text-base">Generate, listen, and save live news broadcasts.</p>
            </div>
            
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-full md:w-auto backdrop-blur-md">
                <button 
                    onClick={() => setActiveTab('create')}
                    className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'create' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' : 'text-gray-400 hover:text-white'}`}
                >
                    Create News
                </button>
                <button 
                    onClick={() => setActiveTab('saved')}
                    className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'saved' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' : 'text-gray-400 hover:text-white'}`}
                >
                    <List className="w-4 h-4" />
                    Saved Library
                </button>
            </div>
        </div>

        {activeTab === 'create' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
              {/* Left Column: Config & Controls (Sticky on Desktop) */}
              <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8 h-fit">
                
                {step === 'config' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 backdrop-blur-2xl shadow-2xl"
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">News Topic or URL</label>
                            <Input 
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g., Latest AI breakthroughs..."
                                className="w-full bg-black/40 border-white/10 text-white rounded-xl"
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                                <select 
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                >
                                    <option>English</option>
                                    <option>Hindi</option>
                                    <option>Hinglish</option>
                                    <option>Spanish</option>
                                    <option>French</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Tone</label>
                                <select 
                                    value={tone}
                                    onChange={(e) => setTone(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                >
                                    <option>Professional</option>
                                    <option>Casual</option>
                                    <option>Dramatic</option>
                                    <option>Educational</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
                            <div className="flex gap-2">
                                {['Short', 'Medium', 'Long'].map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setDuration(d)}
                                        className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${duration === d ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-inner' : 'bg-black/20 border-white/10 text-gray-400 hover:bg-white/5'}`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button 
                            onClick={generateAudioWithSettings}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]"
                        >
                            <Zap className="w-5 h-5" />
                            Generate Broadcast
                        </Button>
                    </motion.div>
                )}

                {step === 'generating' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/[0.02] border border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-6 backdrop-blur-2xl shadow-2xl"
                    >
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Mic className="w-8 h-8 text-blue-400 animate-pulse" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">{loadingText}</h3>
                            <p className="text-gray-400 text-sm">This may take a minute depending on duration.</p>
                        </div>
                    </motion.div>
                )}

                {step === 'playing' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-8 space-y-8 backdrop-blur-2xl shadow-2xl"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Radio className="w-5 h-5 text-blue-400" />
                                Live Broadcast
                            </h3>
                            <button 
                                onClick={() => setStep('config')}
                                className="text-gray-400 hover:text-white text-sm flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" /> New
                            </button>
                        </div>

                        <AudioVisualizer isPlaying={isPlaying} audioData={visualData} />

                        <div className="flex items-center justify-center gap-6">
                            <button 
                                onClick={togglePlay}
                                className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all hover:scale-105 active:scale-95"
                            >
                                {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                            <Button 
                                variant="outline" 
                                onClick={downloadAudio}
                                className="w-full flex items-center justify-center gap-2 border-white/10 hover:bg-white/10 text-gray-300 rounded-xl py-3"
                            >
                                <Download className="w-4 h-4" /> Download
                            </Button>
                            <Button 
                                onClick={saveToLibrary}
                                disabled={isSaving}
                                className="w-full flex items-center justify-center gap-2 bg-purple-600/80 hover:bg-purple-500 text-white rounded-xl py-3 shadow-lg shadow-purple-500/20"
                            >
                                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {isSaving ? 'Saving...' : 'Save to Library'}
                            </Button>
                        </div>
                    </motion.div>
                )}
              </div>

              {/* Right Column: Premium Smart Panel Transcript */}
              <div className="lg:col-span-8 h-[600px] lg:h-[800px]">
                <div className="bg-white/[0.02] border border-white/10 rounded-3xl backdrop-blur-2xl flex flex-col shadow-2xl overflow-hidden h-full relative">
                    
                    {/* Floating Header */}
                    <div className="absolute top-0 left-0 w-full p-4 md:p-6 flex items-center justify-between z-10 bg-gradient-to-b from-[#050505] via-[#050505]/80 to-transparent">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-500/30">
                                <Sparkles className="w-5 h-5 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white tracking-tight hidden sm:block">Smart Transcript</h3>
                        </div>
                        <button 
                            onClick={() => setIsReaderMode(!isReaderMode)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 shadow-lg ${isReaderMode ? 'bg-purple-500 text-white shadow-purple-500/25 scale-105' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                        >
                            <Eye className="w-4 h-4" />
                            Reader Mode
                        </button>
                    </div>
                    
                    {/* Scrollable Area */}
                    <div className="flex-1 overflow-y-auto pt-24 px-4 md:px-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full relative z-0">
                        {script ? renderScript() : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <FileText className="w-10 h-10 opacity-40" />
                                </div>
                                <p className="text-xl font-medium text-gray-400">Transcript will appear here.</p>
                                <p className="text-sm text-gray-600">Generate a broadcast to start reading.</p>
                            </div>
                        )}
                    </div>
                </div>
              </div>
            </div>
        ) : (
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl min-h-[600px]">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-500/30">
                            <Save className="w-6 h-6 text-purple-400" />
                        </div>
                        Cloudinary Library
                    </h2>
                    <button onClick={loadSavedNews} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 transition-colors border border-white/5">
                        <RefreshCw className={`w-5 h-5 ${isLoadingSaved ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {isLoadingSaved ? (
                    <div className="flex justify-center py-32">
                        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                    </div>
                ) : savedNews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {savedNews.map((news) => (
                            <div key={news.id} className="bg-black/40 border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:-translate-y-1 group">
                                <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 leading-snug">{news.title || 'Untitled Broadcast'}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                                    <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg"><Clock className="w-3.5 h-3.5" /> {new Date(news.createdAt).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg"><Filter className="w-3.5 h-3.5" /> {news.language || 'English'}</span>
                                </div>
                                <Button 
                                    onClick={() => playSavedNews(news)}
                                    className="w-full bg-white/5 hover:bg-purple-600 text-white flex items-center justify-center gap-2 transition-all rounded-xl py-3 border border-white/10 hover:border-transparent"
                                >
                                    <Play className="w-4 h-4" /> Play Broadcast
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-gray-500">
                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                            <List className="w-10 h-10 opacity-40" />
                        </div>
                        <p className="text-xl font-medium text-gray-400">No saved broadcasts found.</p>
                        <p className="text-sm mt-2 text-gray-600">Generate and save a broadcast to see it here.</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default SipsDashboard;
