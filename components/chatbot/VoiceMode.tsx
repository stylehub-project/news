import React, { useState, useEffect, useRef, memo } from 'react';
import { X, Mic, MicOff, Volume2, Captions, Loader2, StopCircle, Download } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

interface VoiceModeProps {
  onClose: () => void;
}

// --- Audio Helpers (WAV Encoding) ---
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

// Basic Decoding Helpers
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

// --- Visualizer Component ---
const LiveVisualizer = memo(({ isSpeaking, volume }: { isSpeaking: boolean, volume: number }) => {
    // Volume is 0-100 roughly
    const scale = 1 + (volume / 50); 
    
    return (
        <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Ambient Rings */}
            <div className={`absolute inset-0 border-2 border-indigo-500/30 rounded-full transition-all duration-1000 ${isSpeaking ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}`}></div>
            <div className={`absolute inset-0 border-2 border-blue-500/30 rounded-full transition-all duration-1000 delay-100 ${isSpeaking ? 'scale-125 opacity-0' : 'scale-90 opacity-100'}`}></div>
            
            {/* Core Orb */}
            <div 
                className={`w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 shadow-[0_0_50px_rgba(79,70,229,0.5)] flex items-center justify-center transition-all duration-75`}
                style={{ transform: `scale(${isSpeaking ? scale : 1})` }}
            >
                {isSpeaking ? (
                    <Volume2 size={48} className="text-white animate-pulse" />
                ) : (
                    <Mic size={48} className="text-white" />
                )}
            </div>

            {/* Dynamic Waveform */}
            {isSpeaking && (
                <div className="absolute inset-0 flex items-center justify-center gap-1 pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                        <div 
                            key={i} 
                            className="w-1.5 bg-white/50 rounded-full animate-[wave_0.5s_ease-in-out_infinite]"
                            style={{ 
                                height: `${Math.min(100, Math.max(20, volume * Math.random() * 2))}%`,
                                animationDelay: `${i * 0.05}s`
                            }}
                        ></div>
                    ))}
                </div>
            )}
        </div>
    );
});

const VoiceMode: React.FC<VoiceModeProps> = ({ onClose }) => {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [transcripts, setTranscripts] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState<{ role: 'user' | 'ai', text: string } | null>(null);
  const [volume, setVolume] = useState(0);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionEnded, setSessionEnded] = useState(false);

  // Refs for audio handling
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  // Audio Recording (Accumulator)
  const recordedChunksRef = useRef<Float32Array[]>([]);

  // --- Session Setup ---
  useEffect(() => {
    let active = true;

    const startSession = async () => {
        try {
            // Get API Key
            // @ts-ignore
            let apiKey = (typeof window !== 'undefined' && window.process?.env?.API_KEY) || process.env.API_KEY;
            
            // Fallback for demo/dev
            if (!apiKey) {
               // @ts-ignore
               if (import.meta && import.meta.env && import.meta.env.VITE_API_KEY) {
                   // @ts-ignore
                   apiKey = import.meta.env.VITE_API_KEY;
               }
            }

            if (!apiKey) throw new Error("API Key not found");

            const ai = new GoogleGenAI({ apiKey });

            // 1. Setup Audio Contexts
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const inputCtx = new AudioContextClass({ sampleRate: 16000 });
            const outputCtx = new AudioContextClass({ sampleRate: 24000 });
            
            inputAudioContextRef.current = inputCtx;
            audioContextRef.current = outputCtx;

            // 2. Setup Analyser for Visualizer
            const analyser = outputCtx.createAnalyser();
            analyser.fftSize = 256;
            analyserRef.current = analyser;

            // 3. Connect to Gemini Live
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                    },
                    inputAudioTranscription: {}, 
                    outputAudioTranscription: {},
                    systemInstruction: "You are a concise, professional, and friendly news anchor assistant.",
                },
                callbacks: {
                    onopen: async () => {
                        if (!active) return;
                        setIsConnected(true);
                        console.log("Live Session Connected");

                        // Start Microphone Stream
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
                                
                                // Accumulate user audio for recording? 
                                // (Ideally we record only output or both, let's record Output for "Session Download" as the AI's part is most valuable, or mix. For simplicity, we record only AI output chunks here.)
                                
                                // Calculate volume for visualizer (Input)
                                let sum = 0;
                                for (let i = 0; i < inputData.length; i++) {
                                    sum += inputData[i] * inputData[i];
                                }
                                const rms = Math.sqrt(sum / inputData.length);
                                const vol = Math.min(100, rms * 500); 
                                
                                // Send to model
                                const pcmBlob = createBlob(inputData);
                                sessionPromise.then(session => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            };
                        } catch (err) {
                            console.error("Mic Error:", err);
                            setError("Microphone access denied");
                        }
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        if (!active) return;

                        // 1. Audio Playback
                        const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (audioData) {
                            setIsAiSpeaking(true);
                            const ctx = audioContextRef.current;
                            if (ctx) {
                                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                                
                                // Decode for playback
                                const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
                                
                                // Store raw PCM for recording (Mono 24kHz)
                                const channelData = buffer.getChannelData(0);
                                recordedChunksRef.current.push(new Float32Array(channelData)); // Clone

                                const source = ctx.createBufferSource();
                                source.buffer = buffer;
                                source.connect(analyser); 
                                analyser.connect(ctx.destination);
                                
                                source.start(nextStartTimeRef.current);
                                nextStartTimeRef.current += buffer.duration;
                                
                                source.onended = () => {
                                    setIsAiSpeaking(false);
                                };
                            }
                        }

                        // 2. Transcription
                        const outTrans = msg.serverContent?.outputTranscription;
                        const inTrans = msg.serverContent?.inputTranscription;

                        if (outTrans?.text) {
                            setCurrentTranscript({ role: 'ai', text: outTrans.text });
                        } else if (inTrans?.text) {
                            setCurrentTranscript({ role: 'user', text: inTrans.text });
                        }

                        if (msg.serverContent?.turnComplete) {
                            setCurrentTranscript(prev => {
                                if (prev) setTranscripts(h => [...h, prev]);
                                return null;
                            });
                            setIsAiSpeaking(false);
                        }
                    },
                    onclose: () => {
                        console.log("Live Session Closed");
                        setIsConnected(false);
                        setSessionEnded(true);
                    },
                    onerror: (err) => {
                        console.error("Live Session Error:", err);
                        setError("Connection error");
                    }
                }
            });
            
            sessionRef.current = sessionPromise;

        } catch (e: any) {
            console.error("Setup Error", e);
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
      // Combine all chunks
      const totalLength = recordedChunksRef.current.reduce((acc, chunk) => acc + chunk.length, 0);
      const combined = new Float32Array(totalLength);
      let offset = 0;
      for (const chunk of recordedChunksRef.current) {
          combined.set(chunk, offset);
          offset += chunk.length;
      }

      // Encode WAV (24kHz Mono as received from model)
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
    <div className="fixed inset-0 z-[60] bg-gray-900 text-white flex flex-col animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="flex justify-between items-center p-6 bg-gradient-to-b from-gray-900 to-transparent">
        <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="text-white font-bold text-sm tracking-widest uppercase">
                {isConnected ? 'Gemini Live' : 'Connecting...'}
            </span>
        </div>
        <div className="flex gap-4">
            {recordedChunksRef.current.length > 0 && (
                <button 
                    onClick={handleDownload} 
                    className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors"
                    title="Download Session Audio"
                >
                    <Download size={20} />
                </button>
            )}
            <button 
                onClick={onClose}
                className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
            >
                <X size={24} />
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {error ? (
            <div className="text-center p-8 bg-red-900/20 rounded-xl border border-red-500/50">
                <p className="text-red-400 font-bold mb-2">Connection Error</p>
                <p className="text-sm text-red-200">{error}</p>
                <button onClick={onClose} className="mt-4 px-4 py-2 bg-red-600 rounded-lg text-sm font-bold">Close</button>
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

      {/* Subtitles Area */}
      {showSubtitles && (
          <div className="px-6 py-4 min-h-[120px] max-h-[120px] overflow-hidden flex flex-col justify-end bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent">
              <div className="text-center space-y-2">
                  {currentTranscript && (
                      <p className={`text-lg font-medium leading-relaxed animate-in slide-in-from-bottom-2 fade-in ${currentTranscript.role === 'ai' ? 'text-white' : 'text-gray-400 italic'}`}>
                          {currentTranscript.text}
                      </p>
                  )}
                  {!currentTranscript && transcripts.length > 0 && (
                      <p className="text-sm text-gray-500">{transcripts[transcripts.length - 1].text}</p>
                  )}
              </div>
          </div>
      )}

      {/* Controls */}
      <div className="p-8 pb-12 flex justify-center items-center gap-6 bg-gray-900">
         <button 
            onClick={() => setShowSubtitles(!showSubtitles)}
            className={`p-4 rounded-full transition-colors ${showSubtitles ? 'bg-gray-800 text-white' : 'bg-gray-800/50 text-gray-500'}`}
            title="Toggle Subtitles"
         >
            <Captions size={24} />
         </button>
         
         <button 
            onClick={toggleMic}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 ${isMicOn ? 'bg-white text-black' : 'bg-red-500 text-white'}`}
         >
            {isMicOn ? <Mic size={32} /> : <MicOff size={32} />}
         </button>

         <button 
            onClick={onClose}
            className="p-4 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
            title="End Session"
         >
            <StopCircle size={24} />
         </button>
      </div>

      <style>{`
        @keyframes wave {
            0%, 100% { height: 20%; opacity: 0.5; }
            50% { height: 100%; opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default VoiceMode;