import React, { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, Download, Sparkles, RefreshCw, Music, Settings2, FileText } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Button from '../ui/Button';
import Input from '../ui/Input';
import Toast from '../ui/Toast';

// --- Audio Encoding Helpers ---
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

// --- Visualizer ---
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
                // Idle State
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.beginPath();
                ctx.moveTo(0, canvas.height / 2);
                ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
                ctx.lineWidth = 2;
                for (let i = 0; i < canvas.width; i++) {
                    ctx.lineTo(i, canvas.height / 2);
                }
                ctx.stroke();
                return;
            }

            const width = canvas.width;
            const height = canvas.height;
            ctx.clearRect(0, 0, width, height);

            const barWidth = (width / audioData.length) * 2.5;
            let x = 0;

            // Create gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, '#818cf8'); // Indigo 400
            gradient.addColorStop(1, '#c084fc'); // Purple 400

            for (let i = 0; i < audioData.length; i++) {
                const barHeight = (audioData[i] / 255) * height;
                
                ctx.fillStyle = gradient;
                // Mirror effect
                ctx.fillRect(x, height / 2 - barHeight / 2, barWidth, barHeight);

                x += barWidth + 1;
            }

            animationId = requestAnimationFrame(draw);
        };

        draw();
        return () => cancelAnimationFrame(animationId);
    }, [isPlaying, audioData]);

    return <canvas ref={canvasRef} width={300} height={100} className="w-full h-24 rounded-xl" />;
};

interface AudioGeneratorProps {
  onClose: () => void;
}

const AudioGenerator: React.FC<AudioGeneratorProps> = ({ onClose }) => {
  const [step, setStep] = useState<'config' | 'generating' | 'playing'>('config');
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('Hinglish');
  const [tone, setTone] = useState('Casual');
  const [mode, setMode] = useState('Summary');
  
  const [script, setScript] = useState('');
  const [loadingText, setLoadingText] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const [visualData, setVisualData] = useState<Uint8Array>(new Uint8Array(0));
  const [playbackTime, setPlaybackTime] = useState(0);
  const startTimeRef = useRef(0);

  const getApiKey = () => {
      // @ts-ignore
      return (typeof window !== 'undefined' && window.process?.env?.API_KEY) || (import.meta as any).env.VITE_API_KEY || '';
  };

  const handleGenerate = async () => {
      if (!topic.trim()) return;
      setStep('generating');
      setLoadingText('Drafting conversation script...');

      try {
          const apiKey = getApiKey();
          if (!apiKey) throw new Error("API Key Missing");
          const ai = new GoogleGenAI({ apiKey });

          // 1. Generate Script
          const scriptPrompt = `
            Create a spoken podcast dialogue between two hosts, Joe (Male) and Jane (Female), about: "${topic}".
            Language: ${language}.
            Tone: ${tone}.
            Mode: ${mode} (If summary, keep it short. If Deep Dive, make it detailed).
            Format:
            Joe: [text]
            Jane: [text]
            ...
            Make it sound natural, engaging, and conversational. Avoid formatting symbols like ** or *.
          `;

          const scriptResponse = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: scriptPrompt
          });
          
          const generatedScript = scriptResponse.text || "Sorry, could not generate script.";
          setScript(generatedScript);
          setLoadingText('Synthesizing high-fidelity audio...');

          // 2. Generate Audio
          const ttsResponse = await ai.models.generateContent({
              model: 'gemini-2.5-flash-preview-tts',
              contents: [{ parts: [{ text: generatedScript }] }],
              config: {
                  responseModalities: ['AUDIO'],
                  speechConfig: {
                      multiSpeakerVoiceConfig: {
                          speakerVoiceConfigs: [
                              { speaker: 'Joe', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }, // Male
                              { speaker: 'Jane', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }  // Female
                          ]
                      }
                  }
              }
          });

          const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          if (!base64Audio) throw new Error("No audio generated");

          // Decode Base64 to ArrayBuffer
          const binaryString = atob(base64Audio);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
          }

          // Decode Audio Data for Playback
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          audioContextRef.current = ctx;
          
          const audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0)); // Clone buffer for decode
          audioBufferRef.current = audioBuffer;

          // Prepare Blob for Download (WAV)
          const wavView = encodeWAV(audioBuffer.getChannelData(0), audioBuffer.sampleRate);
          const wavBlob = new Blob([wavView], { type: 'audio/wav' });
          setAudioBlob(wavBlob);

          // Setup Visualizer
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          analyserRef.current = analyser;

          setStep('playing');

      } catch (error) {
          console.error("Generation Error", error);
          alert("Failed to generate audio. Please try again.");
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
          // Pause logic simplified: stop and reset for MVP, or track time
      } else {
          const source = audioContextRef.current.createBufferSource();
          source.buffer = audioBufferRef.current;
          
          if (analyserRef.current) {
              source.connect(analyserRef.current);
              analyserRef.current.connect(audioContextRef.current.destination);
          } else {
              source.connect(audioContextRef.current.destination);
          }

          source.start(0, playbackTime); // Start from saved time
          startTimeRef.current = audioContextRef.current.currentTime - playbackTime;
          sourceRef.current = source;
          setIsPlaying(true);

          source.onended = () => {
              setIsPlaying(false);
              setPlaybackTime(0);
          };

          // Visualizer Loop
          const updateVisuals = () => {
              if (analyserRef.current && isPlaying) { // Check isPlaying in loop not perfectly reliable due to closure, relies on source state
                  const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
                  analyserRef.current.getByteFrequencyData(dataArray);
                  setVisualData(dataArray);
                  requestAnimationFrame(updateVisuals);
              }
          };
          // Start the loop external to this toggle to fix closure scope, or use ref
          animateVisualizer();
      }
  };

  const animateVisualizer = () => {
      if (!analyserRef.current) return;
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const loop = () => {
          if (!sourceRef.current) return; // Stop if paused
          analyserRef.current!.getByteFrequencyData(dataArray);
          setVisualData(new Uint8Array(dataArray));
          requestAnimationFrame(loop);
      };
      loop();
  };

  const downloadAudio = () => {
      if (!audioBlob) return;
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `news-club-podcast-${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  // --- Render Steps ---

  // 1. Config
  if (step === 'config') {
      return (
          <div className="fixed inset-0 z-[60] bg-gray-50 dark:bg-gray-900 flex flex-col animate-in slide-in-from-bottom-4 duration-300">
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Settings2 className="text-indigo-500" /> Generator Config
                  </h2>
                  <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500">
                      <X size={20} />
                  </button>
              </div>

              <div className="flex-1 p-6 overflow-y-auto max-w-md mx-auto w-full space-y-6">
                  <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Topic / Headline</label>
                      <textarea 
                          className="w-full p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white h-32 resize-none shadow-sm"
                          placeholder="What should they talk about? e.g. 'The future of space travel'..."
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                      />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Language</label>
                          <select 
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white outline-none"
                          >
                              <option value="Hinglish">Hinglish (Default)</option>
                              <option value="English">English</option>
                              <option value="Hindi">Hindi</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Tone</label>
                          <select 
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white outline-none"
                          >
                              <option value="Casual">Casual</option>
                              <option value="Professional">Professional</option>
                              <option value="Dramatic">Dramatic</option>
                              <option value="Funny">Funny</option>
                          </select>
                      </div>
                  </div>

                  <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Mode</label>
                      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                          {['Summary', 'Deep Dive', 'Debate'].map(m => (
                              <button 
                                key={m}
                                onClick={() => setMode(m)}
                                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${mode === m ? 'bg-white dark:bg-gray-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}
                              >
                                  {m}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                  <Button 
                    fullWidth 
                    onClick={handleGenerate}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    size="lg"
                    rightIcon={<Sparkles size={18} className="fill-yellow-300 text-yellow-300" />}
                  >
                      Generate Podcast
                  </Button>
              </div>
          </div>
      );
  }

  // 2. Generating Loader
  if (step === 'generating') {
      return (
          <div className="fixed inset-0 z-[60] bg-gray-900 text-white flex flex-col items-center justify-center p-6 text-center">
              <div className="relative mb-8">
                  <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-40 animate-pulse"></div>
                  <div className="relative bg-gray-800 p-6 rounded-full border border-gray-700 shadow-2xl">
                      <RefreshCw size={48} className="text-indigo-400 animate-spin" />
                  </div>
              </div>
              <h3 className="text-2xl font-black mb-2 tracking-tight">AI at Work</h3>
              <p className="text-gray-400 max-w-xs mx-auto animate-pulse">{loadingText}</p>
          </div>
      );
  }

  // 3. Player
  return (
      <div className="fixed inset-0 z-[60] bg-gradient-to-b from-gray-900 to-black text-white flex flex-col">
          {/* Header */}
          <div className="p-4 flex justify-between items-center bg-transparent relative z-10">
              <button onClick={() => setStep('config')} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-bold">
                  <Settings2 size={16} /> New Config
              </button>
              <button onClick={onClose} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                  <X size={20} />
              </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
              {/* Album Art / Visualizer Container */}
              <div className="w-full max-w-sm aspect-square bg-gray-800/50 rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col items-center justify-center relative mb-8">
                  {/* Background Glow */}
                  <div className={`absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 transition-opacity duration-1000 ${isPlaying ? 'opacity-100' : 'opacity-30'}`}></div>
                  
                  {/* Visualizer Canvas */}
                  <div className="absolute bottom-0 w-full px-4 pb-4 z-10 opacity-80">
                      <AudioVisualizer isPlaying={isPlaying} audioData={visualData} />
                  </div>

                  <div className="relative z-20 text-center p-4">
                      <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/40">
                          <Music size={40} className="text-white" />
                      </div>
                      <h2 className="text-xl font-bold leading-tight line-clamp-2">{topic}</h2>
                      <p className="text-sm text-indigo-300 mt-2 font-medium">{mode} • {tone} • {language}</p>
                  </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-8 mb-8">
                  <button 
                    onClick={downloadAudio} 
                    className="p-3 bg-white/10 rounded-full hover:bg-white/20 text-gray-300 transition-all active:scale-95"
                    title="Download WAV"
                  >
                      <Download size={24} />
                  </button>

                  <button 
                    onClick={togglePlay}
                    className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all"
                  >
                      {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                  </button>

                  <button 
                    onClick={() => {
                        const blob = new Blob([script], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        window.open(url, '_blank');
                    }}
                    className="p-3 bg-white/10 rounded-full hover:bg-white/20 text-gray-300 transition-all active:scale-95"
                    title="View Script"
                  >
                      <FileText size={24} />
                  </button>
              </div>
          </div>
      </div>
  );
};

export default AudioGenerator;