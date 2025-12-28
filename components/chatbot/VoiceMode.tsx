
import React, { useState, useEffect, useRef, memo } from 'react';
import { X, Mic, MicOff, Volume2, Captions, Loader2, StopCircle, Download, Globe, Signal } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

interface VoiceModeProps {
  onClose: () => void;
}

// ... (Audio Helpers remain the same)
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
  view.setUint16(20, 1, true); 
  view.setUint16(22, 1, true); 
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);
  floatTo16BitPCM(view, 44, samples);

  return view;
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
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

function createBlob(data: Float32Array): { data: string, mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// Enhanced Visualizer with Mobile-Friendly Sizing and Rings
const LiveVisualizer = memo(({ isSpeaking, volume }: { isSpeaking: boolean, volume: number }) => {
    // Smoothed volume for scale
    const normVol = Math.min(100, Math.max(0, volume));
    const pulseScale = 1 + (normVol / 120); 
    
    return (
        <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
            {/* 1. Dynamic Background Glow */}
            <div 
                className={`absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-full blur-[60px] transition-all duration-300 ${isSpeaking ? 'opacity-100 scale-110' : 'opacity-30 scale-90'}`}
            ></div>

            {/* 2. Expanding Ripple Rings */}
            {[...Array(3)].map((_, i) => (
                <div
                    key={i}
                    className={`absolute rounded-full border border-indigo-400/30 transition-all duration-[2000ms] ease-out ${isSpeaking ? 'animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]' : ''}`}
                    style={{
                        width: `${60 + (i * 20)}%`,
                        height: `${60 + (i * 20)}%`,
                        animationDelay: `${i * 0.6}s`,
                        opacity: isSpeaking ? 0.6 : 0.1
                    }}
                ></div>
            ))}

            {/* 3. Core Orb */}
            <div 
                className="relative z-10 w-40 h-40 sm:w-56 sm:h-56 bg-black rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(79,70,229,0.4)] border-4 border-gray-800 transition-transform duration-100 overflow-hidden"
                style={{ transform: `scale(${pulseScale})` }}
            >
                {/* Inner Gradient Mesh */}
                <div className={`absolute inset-0 bg-gradient-to-br from-indigo-900 via-black to-blue-900 transition-opacity duration-300 ${isSpeaking ? 'opacity-100' : 'opacity-80'}`}></div>
                
                {isSpeaking ? (
                    /* 4. Active Plasma Animation */
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[80%] h-[80%] bg-indigo-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                        <div className="w-[40%] h-[40%] bg-white rounded-full blur-md opacity-80 mix-blend-overlay"></div>
                        
                        {/* Audio Bars */}
                        <div className="absolute inset-0 flex items-center justify-center gap-1.5 sm:gap-2">
                             {[...Array(5)].map((_, i) => (
                                 <div 
                                    key={i}
                                    className="w-1.5 sm:w-2 bg-cyan-400 rounded-full shadow-[0_0_10px_cyan]"
                                    style={{ 
                                        height: `${20 + Math.random() * normVol}%`, 
                                        transition: 'height 0.1s ease',
                                        opacity: 0.8
                                    }}
                                 ></div>
                             ))}
                        </div>
                    </div>
                ) : (
                    /* 5. Idle Mic State */
                    <div className="relative z-20 flex flex-col items-center">
                        <Mic size={40} className="text-gray-500 drop-shadow-md mb-2" />
                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Listening</span>
                    </div>
                )}
            </div>
        </div>
    );
});

const VoiceMode: React.FC<VoiceModeProps> = ({ onClose }) => {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [currentTranscript, setCurrentTranscript] = useState<{ role: 'user' | 'ai', text: string } | null>(null);
  const [volume, setVolume] = useState(0);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  const recordedChunksRef = useRef<Float32Array[]>([]);

  useEffect(() => {
    let active = true;

    const startSession = async () => {
        try {
            const apiKey = (window as any).process?.env?.API_KEY || (import.meta as any).env?.VITE_API_KEY;
            if (!apiKey) throw new Error("API Key not configured");

            const ai = new GoogleGenAI({ apiKey });

            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const inputCtx = new AudioContextClass({ sampleRate: 16000 });
            const outputCtx = new AudioContextClass({ sampleRate: 24000 });
            
            inputAudioContextRef.current = inputCtx;
            audioContextRef.current = outputCtx;

            const analyser = outputCtx.createAnalyser();
            analyser.fftSize = 256;
            analyserRef.current = analyser;

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }, // 'Kore' is usually calm/neutral
                    },
                    tools: [{ googleSearch: {} }], // Enable Search for News
                    inputAudioTranscription: {}, 
                    outputAudioTranscription: {},
                    systemInstruction: `
                        You are a professional, warm, and authoritative News Anchor. 
                        Your primary job is to deliver the latest, most current news headlines to the user.
                        You have access to Google Search to find real-time information. 
                        Use Google Search immediately when asked about current events or "what's happening".
                        Keep responses concise, spoken clearly, and structured like a news broadcast.
                    `,
                },
                callbacks: {
                    onopen: async () => {
                        if (!active) return;
                        setIsConnected(true);
                        
                        try {
                            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                            const source = inputCtx.createMediaStreamSource(stream);
                            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
                            
                            source.connect(processor);
                            processor.connect(inputCtx.destination);
                            
                            sourceNodeRef.current = source;
                            processorRef.current = processor;

                            processor.onaudioprocess = (e) => {
                                if (!active) return;
                                const inputData = e.inputBuffer.getChannelData(0);
                                
                                let sum = 0;
                                for (let i = 0; i < inputData.length; i++) {
                                    sum += inputData[i] * inputData[i];
                                }
                                const rms = Math.sqrt(sum / inputData.length);
                                const vol = Math.min(100, rms * 500); 
                                
                                const pcmBlob = createBlob(inputData);
                                sessionPromise.then(session => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            };
                        } catch (err) {
                            setError("Microphone access denied");
                        }
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        if (!active) return;

                        const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (audioData) {
                            setIsAiSpeaking(true);
                            const ctx = audioContextRef.current;
                            if (ctx) {
                                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                                const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
                                
                                const channelData = buffer.getChannelData(0);
                                recordedChunksRef.current.push(new Float32Array(channelData));

                                const source = ctx.createBufferSource();
                                source.buffer = buffer;
                                source.connect(analyser); 
                                analyser.connect(ctx.destination);
                                
                                source.start(nextStartTimeRef.current);
                                nextStartTimeRef.current += buffer.duration;
                                
                                source.onended = () => {
                                    // Slight delay before visual off
                                    setTimeout(() => setIsAiSpeaking(false), 200);
                                };
                            }
                        }

                        const outTrans = msg.serverContent?.outputTranscription;
                        const inTrans = msg.serverContent?.inputTranscription;

                        if (outTrans?.text) {
                            setCurrentTranscript({ role: 'ai', text: outTrans.text });
                        } else if (inTrans?.text) {
                            setCurrentTranscript({ role: 'user', text: inTrans.text });
                        }

                        if (msg.serverContent?.turnComplete) {
                            setIsAiSpeaking(false);
                        }
                    },
                    onclose: () => {
                        setIsConnected(false);
                    },
                    onerror: (err) => {
                        console.error(err);
                        setError("Connection error");
                    }
                }
            });
            
            sessionRef.current = sessionPromise;

        } catch (e: any) {
            setError(e.message || "Failed to start session");
        }
    };

    startSession();

    const vizInterval = setInterval(() => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for(let i=0; i<dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length;
        setVolume(avg); 
    }, 50);

    return () => {
        active = false;
        clearInterval(vizInterval);
        if (sessionRef.current) {
            sessionRef.current.then((s: any) => s.close());
        }
        inputAudioContextRef.current?.close();
        audioContextRef.current?.close();
    };
  }, []);

  const toggleMic = () => {
      if (sourceNodeRef.current) {
          if (isMicOn) {
              sourceNodeRef.current.disconnect();
          } else {
              if (inputAudioContextRef.current && processorRef.current) {
                  sourceNodeRef.current.connect(processorRef.current);
                  processorRef.current.connect(inputAudioContextRef.current.destination);
              }
          }
          setIsMicOn(!isMicOn);
      }
  };

  const handleDownload = () => {
      const totalLength = recordedChunksRef.current.reduce((acc, chunk) => acc + chunk.length, 0);
      const combined = new Float32Array(totalLength);
      let offset = 0;
      for (const chunk of recordedChunksRef.current) {
          combined.set(chunk, offset);
          offset += chunk.length;
      }
      const wavView = encodeWAV(combined, 24000);
      const blob = new Blob([wavView], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `news-live-session-${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-gray-900 text-white flex flex-col h-[100dvh] animate-in fade-in zoom-in-95 duration-300">
      {/* Top Header */}
      <div className="flex justify-between items-center p-4 sm:p-6 bg-gradient-to-b from-gray-900 to-transparent shrink-0">
        <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="text-white font-bold text-xs sm:text-sm tracking-widest uppercase flex items-center gap-2">
                {isConnected ? 'Live Connected' : 'Connecting...'}
                {isConnected && <Signal size={14} className="text-green-500" />}
            </span>
        </div>
        <div className="flex gap-3">
            {recordedChunksRef.current.length > 0 && (
                <button onClick={handleDownload} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors">
                    <Download size={20} />
                </button>
            )}
            <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
                <X size={20} />
            </button>
        </div>
      </div>

      {/* Main Visualizer Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative p-4 min-h-0">
        {error ? (
            <div className="text-center p-8 bg-red-900/20 rounded-xl border border-red-500/50 max-w-xs mx-auto">
                <p className="text-red-400 font-bold mb-2">Connection Error</p>
                <p className="text-sm text-red-200">{error}</p>
                <button onClick={onClose} className="mt-4 px-6 py-2 bg-red-600 rounded-lg text-sm font-bold shadow-lg">Close</button>
            </div>
        ) : (
            <LiveVisualizer isSpeaking={isAiSpeaking || (volume > 5)} volume={volume} />
        )}
        {!isConnected && !error && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Loader2 size={48} className="text-indigo-500 animate-spin opacity-50" />
            </div>
        )}
      </div>

      {/* Transcript Area */}
      {showSubtitles && (
          <div className="px-4 sm:px-6 py-2 min-h-[100px] max-h-[120px] shrink-0 overflow-hidden flex flex-col justify-end bg-gradient-to-t from-gray-900 via-gray-900/90 to-transparent">
              <div className="text-center space-y-2">
                  {currentTranscript && (
                      <p className={`text-base sm:text-lg font-medium leading-relaxed animate-in slide-in-from-bottom-2 fade-in ${currentTranscript.role === 'ai' ? 'text-white' : 'text-gray-400 italic'}`}>
                          {currentTranscript.text}
                      </p>
                  )}
              </div>
          </div>
      )}

      {/* Bottom Controls */}
      <div className="p-6 sm:p-8 pb-8 sm:pb-12 flex justify-center items-center gap-6 sm:gap-8 bg-gray-900 shrink-0">
         <button 
            onClick={() => setShowSubtitles(!showSubtitles)} 
            className={`p-4 rounded-full transition-colors ${showSubtitles ? 'bg-gray-800 text-white' : 'bg-gray-800/50 text-gray-500'}`}
            title="Toggle Subtitles"
         >
            <Captions size={24} />
         </button>
         
         <button 
            onClick={toggleMic} 
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 ${isMicOn ? 'bg-white text-black' : 'bg-red-500 text-white'}`}
         >
            {isMicOn ? <Mic size={28} /> : <MicOff size={28} />}
         </button>
         
         <button 
            onClick={onClose} 
            className="p-4 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
            title="End Session"
         >
            <StopCircle size={24} />
         </button>
      </div>
    </div>
  );
};

export default VoiceMode;
